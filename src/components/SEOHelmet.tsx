import { useEffect } from 'react';

interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export function useSEO(metadata: SEOMetadata) {
  useEffect(() => {
    // Update title
    document.title = metadata.title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(name.includes(':') ? 'property' : 'name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMetaTag('description', metadata.description);
    if (metadata.keywords) {
      updateMetaTag('keywords', metadata.keywords);
    }
    if (metadata.ogTitle) {
      updateMetaTag('og:title', metadata.ogTitle);
    }
    if (metadata.ogDescription) {
      updateMetaTag('og:description', metadata.ogDescription);
    }
    if (metadata.ogImage) {
      updateMetaTag('og:image', metadata.ogImage);
    }

    // Update canonical URL
    if (metadata.canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', metadata.canonicalUrl);
    }
  }, [metadata]);
}

export default function SEOHelmet(props: SEOMetadata) {
  useSEO(props);
  return null;
}
