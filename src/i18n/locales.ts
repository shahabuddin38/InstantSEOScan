export const SUPPORTED_LOCALES = [
    "en", "hi", "es", "ru", "fr", "de", "it", "pt",
    "bn", "ja", "ko", "ms", "pl", "id", "ar", "bg", "tr", "sv"
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_META: Record<Locale, { name: string; native: string; flag: string; dir: "ltr" | "rtl" }> = {
    en: { name: "English", native: "English", flag: "🇬🇧", dir: "ltr" },
    hi: { name: "Hindi", native: "हिन्दी", flag: "🇮🇳", dir: "ltr" },
    es: { name: "Spanish", native: "Español", flag: "🇪🇸", dir: "ltr" },
    ru: { name: "Russian", native: "Русский", flag: "🇷🇺", dir: "ltr" },
    fr: { name: "French", native: "Français", flag: "🇫🇷", dir: "ltr" },
    de: { name: "German", native: "Deutsch", flag: "🇩🇪", dir: "ltr" },
    it: { name: "Italian", native: "Italiano", flag: "🇮🇹", dir: "ltr" },
    pt: { name: "Portuguese", native: "Português", flag: "🇧🇷", dir: "ltr" },
    bn: { name: "Bengali", native: "বাংলা", flag: "🇧🇩", dir: "ltr" },
    ja: { name: "Japanese", native: "日本語", flag: "🇯🇵", dir: "ltr" },
    ko: { name: "Korean", native: "한국어", flag: "🇰🇷", dir: "ltr" },
    ms: { name: "Malay", native: "Bahasa Melayu", flag: "🇲🇾", dir: "ltr" },
    pl: { name: "Polish", native: "Polski", flag: "🇵🇱", dir: "ltr" },
    id: { name: "Indonesian", native: "Bahasa Indonesia", flag: "🇮🇩", dir: "ltr" },
    ar: { name: "Arabic", native: "العربية", flag: "🇸🇦", dir: "rtl" },
    bg: { name: "Bulgarian", native: "Български", flag: "🇧🇬", dir: "ltr" },
    tr: { name: "Turkish", native: "Türkçe", flag: "🇹🇷", dir: "ltr" },
    sv: { name: "Swedish", native: "Svenska", flag: "🇸🇪", dir: "ltr" },
};

export function getLocaleFromPath(pathname: string): Locale {
    const firstSegment = pathname.split("/")[1];
    if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment as Locale) && firstSegment !== DEFAULT_LOCALE) {
        return firstSegment as Locale;
    }
    return DEFAULT_LOCALE;
}

export function localizedPath(path: string, locale: Locale): string {
    const clean = path.startsWith("/") ? path : `/${path}`;
    if (locale === DEFAULT_LOCALE) return clean;
    return `/${locale}${clean}`;
}

export function stripLocalePrefix(pathname: string): string {
    const firstSegment = pathname.split("/")[1];
    if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment as Locale) && firstSegment !== DEFAULT_LOCALE) {
        return pathname.slice(firstSegment.length + 1) || "/";
    }
    return pathname;
}

export function isRTL(locale: Locale): boolean {
    return LOCALE_META[locale].dir === "rtl";
}
