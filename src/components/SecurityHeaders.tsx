import { useEffect } from 'react';

export function SecurityHeaders() {
  useEffect(() => {
    // Set security headers via meta tags for client-side security
    const setSecurityHeaders = () => {
      // Content Security Policy
      const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!csp) {
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = `
          default-src 'self';
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://jktaapzaskbebwhfswth.supabase.co;
          style-src 'self' 'unsafe-inline' https://api.mapbox.com;
          img-src 'self' data: https: blob: https://api.mapbox.com;
          font-src 'self' data: https://api.mapbox.com;
          connect-src 'self' https://jktaapzaskbebwhfswth.supabase.co wss://jktaapzaskbebwhfswth.supabase.co https://api.mapbox.com https://events.mapbox.com https://*.tiles.mapbox.com https://a.tiles.mapbox.com https://b.tiles.mapbox.com;
          media-src 'self';
          object-src 'none';
          child-src 'self';
          worker-src 'self' blob:;
          frame-ancestors 'none';
          form-action 'self';
          base-uri 'self';
        `.replace(/\s+/g, ' ').trim();
        document.head.appendChild(cspMeta);
      }

      // X-Frame-Options
      const frameOptions = document.querySelector('meta[name="x-frame-options"]');
      if (!frameOptions) {
        const frameOptionsMeta = document.createElement('meta');
        frameOptionsMeta.name = 'x-frame-options';
        frameOptionsMeta.content = 'DENY';
        document.head.appendChild(frameOptionsMeta);
      }

      // X-Content-Type-Options
      const contentType = document.querySelector('meta[name="x-content-type-options"]');
      if (!contentType) {
        const contentTypeMeta = document.createElement('meta');
        contentTypeMeta.name = 'x-content-type-options';
        contentTypeMeta.content = 'nosniff';
        document.head.appendChild(contentTypeMeta);
      }

      // Referrer Policy
      const referrer = document.querySelector('meta[name="referrer"]');
      if (!referrer) {
        const referrerMeta = document.createElement('meta');
        referrerMeta.name = 'referrer';
        referrerMeta.content = 'strict-origin-when-cross-origin';
        document.head.appendChild(referrerMeta);
      }

      // Permissions Policy
      const permissions = document.querySelector('meta[http-equiv="Permissions-Policy"]');
      if (!permissions) {
        const permissionsMeta = document.createElement('meta');
        permissionsMeta.httpEquiv = 'Permissions-Policy';
        permissionsMeta.content = 'geolocation=(), camera=(), microphone=(), payment=()';
        document.head.appendChild(permissionsMeta);
      }
    };

    setSecurityHeaders();
  }, []);

  return null;
}