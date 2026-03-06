import { useEffect } from "react";

type PageSEOProps = {
  title: string;
  description: string;
  canonicalPath?: string;
  schema?: Record<string, any> | Record<string, any>[];
};

const upsertMeta = (name: string, content: string, property = false) => {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    if (property) el.setAttribute("property", name);
    else el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

export default function PageSEO({ title, description, canonicalPath, schema }: PageSEOProps) {
  useEffect(() => {
    document.title = title;

    upsertMeta("description", description);
    upsertMeta("og:title", title, true);
    upsertMeta("og:description", description, true);
    upsertMeta("twitter:title", title);
    upsertMeta("twitter:description", description);

    const base = window.location.origin;
    const canonical = canonicalPath ? `${base}${canonicalPath}` : window.location.href;

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.rel = "canonical";
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = canonical;

    const id = "page-seo-jsonld";
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    if (schema) {
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      const created = document.getElementById(id);
      if (created) created.remove();
    };
  }, [title, description, canonicalPath, schema]);

  return null;
}
