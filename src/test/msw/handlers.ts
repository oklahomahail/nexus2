/**
 * MSW Request Handlers
 *
 * Mock API responses for testing
 */

import { http, HttpResponse } from 'msw';

export const handlers = [
  // Notifications API
  http.get('/api/notifications', ({ request }) => {
    const url = new URL(request.url);
    const since = url.searchParams.get('since');

    // Return empty when polling with since parameter (no new notifications)
    if (since) {
      return HttpResponse.json([], { status: 200 });
    }

    // Initial fetch returns sample notifications
    return HttpResponse.json(
      [
        {
          id: 'n1',
          title: 'Welcome to Nexus',
          message: 'Your account has been set up successfully.',
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
        },
        {
          id: 'n2',
          title: 'Campaign Created',
          message: 'Your End-of-Year campaign is ready for review.',
          type: 'success',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
        },
      ],
      { status: 200 }
    );
  }),

  // Brand profile API
  http.get('/api/brand/:brandId', ({ params }) => {
    const { brandId } = params;

    if (brandId === 'not-found') {
      return HttpResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return HttpResponse.json({
      id: brandId,
      name: 'Test Organization',
      tagline: 'Making a difference',
      mission: 'Help communities thrive',
      colors: {
        primary: '#3B36F4',
        secondary: '#14C9C9',
      },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });
  }),

  // AI completion (simulated)
  http.post('/api/ai/complete', async ({ request }) => {
    const body = (await request.json()) as { prompt: string };

    // Simulate rate limiting on every 3rd request
    const url = new URL(request.url);
    const hit = url.searchParams.get('hit') ?? '0';
    if (Number(hit) % 3 === 0) {
      return HttpResponse.json(
        { error: 'Too Many Requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60',
          },
        }
      );
    }

    // Simulate successful completion
    return HttpResponse.json({
      completion: `Generated response for: ${body.prompt.substring(0, 50)}...`,
      tokens: 150,
    });
  }),

  // Campaign designer
  http.post('/api/campaigns/generate', async ({ request }) => {
    const body = (await request.json()) as { brief: string; channels: string[] };

    return HttpResponse.json({
      campaign: {
        name: 'Generated Campaign',
        channels: body.channels,
        content: {
          directMail: 'Sample direct mail content...',
          email: 'Sample email content...',
          social: 'Sample social media content...',
        },
      },
    });
  }),

  // Donor analytics
  http.post('/api/analytics/donors', async ({ request }) => {
    const body = (await request.json()) as { clientId: string; metric: string };

    return HttpResponse.json({
      metric: body.metric,
      data: [
        { label: '2023', value: 1200 },
        { label: '2024', value: 1450 },
        { label: '2025', value: 1680 },
      ],
      privacyEnforced: false,
      n: 150,
    });
  }),
];
