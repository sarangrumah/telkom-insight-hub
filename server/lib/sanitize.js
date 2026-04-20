import sanitize from 'sanitize-html';

// =============================================================================
// Panel — HTML sanitization for rich-text input
// Ported from e-telekomunikasi-js (src/lib/sanitize-html.ts).
// =============================================================================

const SANITIZE_OPTIONS = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 's', 'u',
    'ul', 'ol', 'li',
    'a',
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

export function sanitizeHtmlContent(html) {
  if (!html || typeof html !== 'string' || html.trim().length === 0) return '';
  return sanitize(html, SANITIZE_OPTIONS);
}

export function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return sanitize(html, { allowedTags: [], allowedAttributes: {} });
}
