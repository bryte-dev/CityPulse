'use client';

import { useEffect } from 'react';
import { getAds, recordAdImpression, recordAdClick } from '@/lib/db';
import { useState, useRef } from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'banner' | 'rectangle' | 'skyscraper';
  className?: string;
}

const formatDimensions = {
  banner: { width: 320, height: 100 },
  rectangle: { width: 300, height: 250 },
  skyscraper: { width: 160, height: 600 },
};

export function AdBanner({ slot, format = 'rectangle', className = '' }: AdBannerProps) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const { width, height } = formatDimensions[format];
  const [demoAds, setDemoAds] = useState<any[]>([]);
  const currentAdRef = useRef<string | null>(null);

  useEffect(() => {
    if (adsenseId && typeof window !== 'undefined') {
      try {
        // @ts-expect-error adsbygoogle is injected by script
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {}
    }
    // load demo ads when no adsense configured but demo mode enabled
    const demoMode = process.env.NEXT_PUBLIC_ADS_DEMO === 'true';
    if (!adsenseId && demoMode) {
      (async () => {
        try {
          const ads = await getAds();
          setDemoAds(ads);
        } catch (e) {
          // ignore
        }
      })();
    }
  }, [adsenseId]);

  if (adsenseId && slot) {
    return (
      <div className={`relative ${className}`}>
        <span className="absolute top-1 left-2 text-[10px] text-muted-foreground/60 z-10">Publicité</span>
        <ins
          className="adsbygoogle block"
          style={{ display: 'block', width, height }}
          data-ad-client={adsenseId}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }
  // Demo ad fallback: show first demo ad and track impressions/clicks
  if (demoAds.length > 0) {
    const ad = demoAds[0];
    if (currentAdRef.current !== ad.id) {
      // record impression once
      currentAdRef.current = ad.id;
      recordAdImpression(ad.id).catch(() => {});
    }
    return (
      <div className={`relative cursor-pointer overflow-hidden rounded-xl ${className}`} style={{ width, height }} onClick={() => { recordAdClick(ad.id).catch(() => {}); window.open(ad.link || '#', '_blank'); }}>
        <span className="absolute top-1 left-2 text-[10px] text-muted-foreground/60 z-10">Publicité</span>
        {ad.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ad.imageUrl} alt={ad.title || 'Publicité'} style={{ width, height, objectFit: 'cover' }} />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/30">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Annonce démo</p>
              <p className="text-xs text-muted-foreground/40">{ad.title || 'Sponsorisé'}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative bg-muted/40 border border-border/50 rounded-xl flex items-center justify-center ${className}`}
      style={{ width, height, minHeight: height }}
    >
      <div className="text-center">
        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Publicité</p>
        <p className="text-xs text-muted-foreground/40">Espace publicitaire</p>
      </div>
    </div>
  );
}
