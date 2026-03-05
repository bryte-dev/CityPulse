'use client';

import { useEffect } from 'react';

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

  useEffect(() => {
    if (adsenseId && typeof window !== 'undefined') {
      try {
        // @ts-expect-error adsbygoogle is injected by script
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {}
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
