/**
 * Tests for normalize.ts
 * HTML->text conversion, whitespace collapse, token budget enforcement
 */

import { describe, it, expect } from 'vitest';
import {
  htmlToText,
  collapseWhitespace,
  truncateToTokenBudget,
  normalizeContent,
  markdownToText,
  decodeHTMLEntities,
} from './normalize';

describe('htmlToText', () => {
  it('strips HTML tags while preserving content', () => {
    const html = '<h1>Title</h1><p>Hello <b>world</b>!</p>';
    const text = htmlToText(html);
    expect(text).toContain('Title');
    expect(text).toContain('Hello world!');
    expect(text).not.toMatch(/<[^>]+>/);
  });

  it('converts block elements to newlines', () => {
    const html = '<div>Line1</div><div>Line2</div>';
    const text = htmlToText(html);
    expect(text).toMatch(/Line1\s+Line2/);
  });

  it('preserves list structure', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const text = htmlToText(html);
    expect(text).toMatch(/• Item 1/);
    expect(text).toMatch(/• Item 2/);
  });

  it('decodes HTML entities', () => {
    const html = '&lt;div&gt; &amp; &quot;test&quot;';
    const text = htmlToText(html);
    expect(text).toBe('<div> & "test"');
  });
});

describe('decodeHTMLEntities', () => {
  it('decodes common entities', () => {
    expect(decodeHTMLEntities('&amp;')).toBe('&');
    expect(decodeHTMLEntities('&lt;')).toBe('<');
    expect(decodeHTMLEntities('&gt;')).toBe('>');
    expect(decodeHTMLEntities('&quot;')).toBe('"');
    expect(decodeHTMLEntities('&#39;')).toBe("'");
    expect(decodeHTMLEntities('&nbsp;')).toBe(' ');
  });

  it('decodes numeric entities', () => {
    expect(decodeHTMLEntities('&#65;')).toBe('A'); // decimal
    expect(decodeHTMLEntities('&#x41;')).toBe('A'); // hex
  });

  it('handles mixed entities', () => {
    const input = 'A&amp;B &#65; &lt;test&gt;';
    const output = decodeHTMLEntities(input);
    expect(output).toBe('A&B A <test>');
  });
});

describe('collapseWhitespace', () => {
  it('reduces multiple spaces to single space', () => {
    const text = 'Hello    world';
    expect(collapseWhitespace(text)).toBe('Hello world');
  });

  it('reduces multiple newlines to double newline', () => {
    const text = 'Para1\n\n\n\nPara2';
    expect(collapseWhitespace(text)).toBe('Para1\n\nPara2');
  });

  it('trims lines', () => {
    const text = '  Line1  \n  Line2  ';
    const result = collapseWhitespace(text);
    expect(result).toBe('Line1\nLine2');
  });

  it('removes leading/trailing whitespace', () => {
    const text = '  \n  Hello  \n  ';
    expect(collapseWhitespace(text)).toBe('Hello');
  });
});

describe('truncateToTokenBudget', () => {
  it('preserves short text', () => {
    const text = 'Short text';
    expect(truncateToTokenBudget(text, 100)).toBe(text);
  });

  it('truncates long text to ~4 chars/token', () => {
    const text = 'x'.repeat(100000);
    const maxTokens = 1000;
    const result = truncateToTokenBudget(text, maxTokens);
    expect(result.length).toBeLessThanOrEqual(maxTokens * 4 + 50); // +50 for marker
  });

  it('tries to cut at sentence boundary', () => {
    const text = 'Sentence one. '.repeat(1000);
    const result = truncateToTokenBudget(text, 100);
    expect(result).toMatch(/\.\s*\[Content truncated\]$/);
  });

  it('adds truncation marker', () => {
    const text = 'x'.repeat(100000);
    const result = truncateToTokenBudget(text, 100);
    expect(result).toMatch(/\[(?:Content )?truncated\]/i);
  });
});

describe('normalizeContent', () => {
  it('full pipeline: HTML -> text, collapse, truncate', () => {
    const html = '<h1>Title</h1>\n<p>Hello   world</p>\n\n\n<p>Para2</p>';
    const result = normalizeContent(html, {
      fromHTML: true,
      collapseWhitespace: true,
      maxTokens: 1000,
    });

    expect(result.normalized).toContain('Title');
    expect(result.normalized).toContain('Hello world');
    expect(result.normalized).not.toMatch(/<[^>]+>/);
    expect(result.normalized).not.toMatch(/   /);
    expect(result.metadata.originalLength).toBeGreaterThan(0);
    expect(result.metadata.estimatedTokens).toBeGreaterThan(0);
  });

  it('respects fromHTML flag', () => {
    const plain = 'Just plain text';
    const result = normalizeContent(plain, { fromHTML: false });
    expect(result.normalized).toBe(plain);
  });

  it('enforces token budget', () => {
    const long = 'word '.repeat(100000);
    const maxTokens = 500;
    const result = normalizeContent(long, { maxTokens });
    expect(result.metadata.estimatedTokens).toBeLessThanOrEqual(maxTokens + 10);
    expect(result.metadata.truncated).toBe(true);
  });

  it('reports accurate metadata', () => {
    const text = 'Hello world';
    const result = normalizeContent(text, { fromHTML: false, maxTokens: 1000 });
    expect(result.metadata.originalLength).toBe(text.length);
    expect(result.metadata.normalizedLength).toBe(text.length);
    expect(result.metadata.truncated).toBe(false);
    expect(result.metadata.estimatedTokens).toBeGreaterThan(0);
  });
});

describe('markdownToText', () => {
  it('removes code blocks', () => {
    const md = '```js\nconst x = 1;\n```\nText';
    const text = markdownToText(md);
    expect(text).not.toContain('```');
    expect(text).toContain('Text');
  });

  it('removes inline code', () => {
    const md = 'Use `console.log()` here';
    const text = markdownToText(md);
    expect(text).not.toContain('`');
    expect(text).toContain('console.log()');
  });

  it('converts links to plain text', () => {
    const md = '[Google](https://google.com)';
    const text = markdownToText(md);
    expect(text).toBe('Google');
  });

  it('removes images but keeps alt text', () => {
    const md = '![Logo](logo.png)';
    const text = markdownToText(md);
    expect(text).toBe('Logo');
  });

  it('removes headers', () => {
    const md = '# Heading\n## Subheading\nText';
    const text = markdownToText(md);
    expect(text).toContain('Heading');
    expect(text).toContain('Subheading');
    expect(text).not.toMatch(/^#/m);
  });

  it('removes bold/italic', () => {
    const md = '**bold** and *italic* and ***both***';
    const text = markdownToText(md);
    expect(text).not.toMatch(/[*_]/);
    expect(text).toContain('bold');
    expect(text).toContain('italic');
  });

  it('converts list markers', () => {
    const md = '- Item 1\n* Item 2\n+ Item 3';
    const text = markdownToText(md);
    expect(text).toMatch(/• Item 1/);
    expect(text).toMatch(/• Item 2/);
    expect(text).toMatch(/• Item 3/);
  });

  it('handles mixed unicode correctly', () => {
    const md = 'Hello\u0000World\u2028\u2029';
    const text = markdownToText(md);
    expect(text).toMatch(/HelloWorld/);
  });
});
