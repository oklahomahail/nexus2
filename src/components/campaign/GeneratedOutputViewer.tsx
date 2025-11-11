/**
 * Generated Output Viewer
 *
 * Displays AI-generated campaign content with formatted sections
 * Handles blueprint, direct mail, and digital content
 */

import React from "react";

// ============================================================================
// TYPES
// ============================================================================

interface GeneratedOutputViewerProps {
  outputs: {
    blueprint_json?: any;
    blueprint_prose?: string;
    direct_mail_md?: string;
    digital_json?: {
      emails: Array<{
        id: number;
        subject: string;
        preheader: string;
        body: string;
        cta: string;
      }>;
      social: Array<{
        id: number;
        short: string;
        long: string;
        imagePrompt: string;
      }>;
    };
    digital_md?: string;
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GeneratedOutputViewer({ outputs }: GeneratedOutputViewerProps) {
  if (!outputs) return null;

  return (
    <div className="space-y-6">
      {/* Blueprint JSON */}
      {outputs.blueprint_json && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Campaign Blueprint
          </h3>
          <pre className="whitespace-pre-wrap text-xs rounded-xl border border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 overflow-auto font-mono text-gray-800 dark:text-gray-200">
            {JSON.stringify(outputs.blueprint_json, null, 2)}
          </pre>
          {outputs.blueprint_prose && (
            <p className="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
              {outputs.blueprint_prose}
            </p>
          )}
        </section>
      )}

      {/* Direct Mail */}
      {outputs.direct_mail_md && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Direct Mail
          </h3>
          <article
            className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300"
            dangerouslySetInnerHTML={{
              __html: markedToHtml(outputs.direct_mail_md),
            }}
          />
        </section>
      )}

      {/* Digital JSON */}
      {outputs.digital_json && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Digital Content (JSON)
          </h3>

          {/* Emails */}
          {outputs.digital_json.emails &&
            outputs.digital_json.emails.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Email Sequence ({outputs.digital_json.emails.length})
                </h4>
                <div className="space-y-3">
                  {outputs.digital_json.emails.slice(0, 3).map((email) => (
                    <div
                      key={email.id}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        Email {email.id}: {email.subject}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {email.preheader}
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                        {email.body}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                        CTA: {email.cta}
                      </div>
                    </div>
                  ))}
                  {outputs.digital_json.emails.length > 3 && (
                    <details className="text-sm text-gray-600 dark:text-gray-400">
                      <summary className="cursor-pointer hover:text-gray-900 dark:hover:text-white">
                        Show {outputs.digital_json.emails.length - 3} more
                        emails...
                      </summary>
                      <div className="space-y-3 mt-3">
                        {outputs.digital_json.emails.slice(3).map((email) => (
                          <div
                            key={email.id}
                            className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                          >
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              Email {email.id}: {email.subject}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {email.preheader}
                            </div>
                            <div className="text-xs text-gray-700 dark:text-gray-300 mt-2">
                              {email.body}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                              CTA: {email.cta}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            )}

          {/* Social Posts */}
          {outputs.digital_json.social &&
            outputs.digital_json.social.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Social Media Posts ({outputs.digital_json.social.length})
                </h4>
                <div className="space-y-3">
                  {outputs.digital_json.social.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        Post {post.id}
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 mt-2">
                        <strong>Short:</strong> {post.short}
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                        <strong>Long:</strong> {post.long}
                      </div>
                      {post.imagePrompt && (
                        <div className="text-xs text-purple-600 dark:text-purple-400 mt-2 italic">
                          Image: {post.imagePrompt}
                        </div>
                      )}
                    </div>
                  ))}
                  {outputs.digital_json.social.length > 3 && (
                    <details className="text-sm text-gray-600 dark:text-gray-400">
                      <summary className="cursor-pointer hover:text-gray-900 dark:hover:text-white">
                        Show {outputs.digital_json.social.length - 3} more
                        posts...
                      </summary>
                      <div className="space-y-3 mt-3">
                        {outputs.digital_json.social.slice(3).map((post) => (
                          <div
                            key={post.id}
                            className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                          >
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              Post {post.id}
                            </div>
                            <div className="text-xs text-gray-700 dark:text-gray-300 mt-2">
                              <strong>Short:</strong> {post.short}
                            </div>
                            <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                              <strong>Long:</strong> {post.long}
                            </div>
                            {post.imagePrompt && (
                              <div className="text-xs text-purple-600 dark:text-purple-400 mt-2 italic">
                                Image: {post.imagePrompt}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            )}
        </section>
      )}

      {/* Digital Markdown */}
      {outputs.digital_md && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Digital Content (Readable)
          </h3>
          <article
            className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300"
            dangerouslySetInnerHTML={{
              __html: markedToHtml(outputs.digital_md),
            }}
          />
        </section>
      )}
    </div>
  );
}

// ============================================================================
// MARKDOWN HELPER
// ============================================================================

/**
 * Minimal client-safe Markdown -> HTML converter
 * Replace with a library like 'marked' or 'react-markdown' if needed
 */
function markedToHtml(md: string): string {
  return md
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|p])/gm, "<p>")
    .replace(/(?![h|p]>)$/gm, "</p>");
}
