// =============================================================================
// Panel — HTML Sanitization
// Pattern from: e-telekomunikasi/src/lib/sanitize-html.ts
// =============================================================================

import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 's', 'u',
    'ul', 'ol', 'li', 'a',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'hr', 'code', 'pre', 'span',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    span: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  disallowedTagsMode: 'discard',
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        rel: 'noopener noreferrer nofollow',
        target: '_blank',
      },
    }),
  },
};

/**
 * Sanitize HTML input, stripping dangerous tags and attributes.
 * @param {string} html
 * @returns {string}
 */
export function sanitize(html) {
  if (typeof html !== 'string') return html;
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}
