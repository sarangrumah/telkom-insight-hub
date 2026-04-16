import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { SecurityHeaders } from '../SecurityHeaders';

describe('SecurityHeaders', () => {
  beforeEach(() => {
    // Clear any existing meta tags
    document.head.innerHTML = '';
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('sets Content Security Policy meta tag', () => {
    render(<SecurityHeaders />);
    
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    expect(cspMeta).toBeInTheDocument();
    expect(cspMeta?.getAttribute('content')).toContain('default-src \'self\'');
  });

  it('sets X-Frame-Options meta tag', () => {
    render(<SecurityHeaders />);
    
    const frameOptionsMeta = document.querySelector('meta[name="x-frame-options"]');
    expect(frameOptionsMeta).toBeInTheDocument();
    expect(frameOptionsMeta?.getAttribute('content')).toBe('DENY');
  });

  it('sets X-Content-Type-Options meta tag', () => {
    render(<SecurityHeaders />);
    
    const contentTypeMeta = document.querySelector('meta[name="x-content-type-options"]');
    expect(contentTypeMeta).toBeInTheDocument();
    expect(contentTypeMeta?.getAttribute('content')).toBe('nosniff');
  });

  it('sets Referrer Policy meta tag', () => {
    render(<SecurityHeaders />);
    
    const referrerMeta = document.querySelector('meta[name="referrer"]');
    expect(referrerMeta).toBeInTheDocument();
    expect(referrerMeta?.getAttribute('content')).toBe('strict-origin-when-cross-origin');
  });

  it('sets Permissions Policy meta tag', () => {
    render(<SecurityHeaders />);
    
    const permissionsMeta = document.querySelector('meta[http-equiv="Permissions-Policy"]');
    expect(permissionsMeta).toBeInTheDocument();
    expect(permissionsMeta?.getAttribute('content')).toContain('geolocation=()');
  });

  it('does not duplicate meta tags on multiple renders', () => {
    const { rerender } = render(<SecurityHeaders />);
    rerender(<SecurityHeaders />);
    
    const cspMetas = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    expect(cspMetas).toHaveLength(1);
  });
});