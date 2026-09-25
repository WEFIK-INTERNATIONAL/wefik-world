'use client';

import { useEffect, useState } from 'react';

export function TawkToChat() {
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    const propertyId = process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID;

    if (!propertyId) return;

    // Check existing consent
    const checkConsent = () => {
      try {
        const raw = localStorage.getItem('wefik_cookie_consent_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.functional) {
            setCanLoad(true);
            return;
          }
        }
      } catch {
        // ignore
      }
    };

    checkConsent();

    const handleConsentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.functional) {
        setCanLoad(true);
      }
    };

    window.addEventListener('wefik_cookie_consent_updated', handleConsentUpdate);
    return () => {
      window.removeEventListener('wefik_cookie_consent_updated', handleConsentUpdate);
    };
  }, []);

  useEffect(() => {
    if (!canLoad) return;
    const propertyId = process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID;
    const widgetId = process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID || 'default';
    if (!propertyId) return;

    if (document.getElementById('tawk-script')) return;

    const s1 = document.createElement('script');
    s1.id = 'tawk-script';
    s1.async = true;
    s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');

    document.head.appendChild(s1);
  }, [canLoad]);

  return null;
}
