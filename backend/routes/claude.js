// backend/routes/claude.js - Express.js example
// You can adapt this to your backend framework (Node.js/Express, Python/Flask, etc.)

const express = require('express');
const router = express.Router();

// Store your Claude API key in environment variables on the server
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY; // Server-side only!
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Middleware to validate request
const validateClaudeRequest = (req, res, next) => {
  const { prompt } = req.body;
  
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Invalid request', 
      message: 'Prompt is required and must be a non-empty string' 
    });
  }
  
  if (prompt.length > 10000) { // Prevent abuse
    return res.status(400).json({ 
      error: 'Prompt too long', 
      message: 'Prompt must be less than 10000 characters' 
    });
  }
  
  next();
};

// Claude API endpoint - POST /api/claude/generate
router.post('/generate', validateClaudeRequest, async (req, res) => {
  try {
    const { 
      prompt, 
      context = null, 
      messageType = 'general',
      options = {} 
    } = req.body;

    // Server-side rate limiting could be added here
    // Example: check user's request count, implement cooldowns, etc.

    const {
      model = 'claude-sonnet-4-20250514',
      max_tokens = 1024,
      temperature = 0.7,
      system = null
    } = options;

    const requestBody = {
      model,
      max_tokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: context ? `${prompt}\n\nContext: ${context}` : prompt,
        },
      ],
      ...(system && { system }),
    };

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY, // Only exists on server
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorCode = 'HTTP_ERROR';

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error.message || errorMessage;
          errorCode = errorData.error.type || errorCode;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }

      // Don't expose internal errors to client
      return res.status(500).json({
        error: 'AI service unavailable',
        message: 'Please try again later',
        code: errorCode
      });
    }

    const data = await response.json();

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      return res.status(500).json({
        error: 'Invalid AI response',
        message: 'Please try again'
      });
    }

    const textContent = data.content.find((item) => item.type === 'text');
    if (!textContent) {
      return res.status(500).json({
        error: 'No content generated',
        message: 'Please try again'
      });
    }

    // Return clean response
    res.json({
      content: textContent.text || '',
      usage: data.usage,
      messageType,
    });

  } catch (error) {
    console.error('Claude API Error:', error);
    
    // Don't expose internal errors
    res.status(500).json({
      error: 'Service temporarily unavailable',
      message: 'Please try again later'
    });
  }
});

// Conversation endpoint - POST /api/claude/conversation
router.post('/conversation', validateClaudeRequest, async (req, res) => {
  try {
    const { messages, options = {} } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Messages array is required'
      });
    }

    const {
      model = 'claude-sonnet-4-20250514',
      max_tokens = 1024,
      temperature = 0.7,
      system = null
    } = options;

    const requestBody = {
      model,
      max_tokens,
      temperature,
      messages,
      ...(system && { system }),
    };

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return res.status(500).json({
        error: 'AI service unavailable',
        message: 'Please try again later'
      });
    }

    const data = await response.json();
    const textContent = data.content.find((item) => item.type === 'text');
    
    if (!textContent) {
      return res.status(500).json({
        error: 'No content generated',
        message: 'Please try again'
      });
    }

    res.json({
      content: textContent.text || '',
      usage: data.usage,
    });

  } catch (error) {
    console.error('Claude Conversation Error:', error);
    res.status(500).json({
      error: 'Service temporarily unavailable',
      message: 'Please try again later'
    });
  }
});

module.exports = router;

// In your main app.js:
// const claudeRoutes = require('./routes/claude');
// app.use('/api/claude', claudeRoutes);