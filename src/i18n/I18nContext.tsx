import { createContext, useContext, useMemo, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getLocaleFromPath, LOCALE_META, DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./locales";

// Import all translation files
import en from "./translations/en.json";
import hi from "./translations/hi.json";
import es from "./translations/es.json";
import ru from "./translations/ru.json";
import fr from "./translations/fr.json";
import de from "./translations/de.json";
import it from "./translations/it.json";
import pt from "./translations/pt.json";
import bn from "./translations/bn.json";
import ja from "./translations/ja.json";
import ko from "./translations/ko.json";
import ms from "./translations/ms.json";
import pl from "./translations/pl.json";
import id from "./translations/id.json";
import ar from "./translations/ar.json";
import bg from "./translations/bg.json";
import tr from "./translations/tr.json";
import sv from "./translations/sv.json";

const translations: Record<Locale, any> = { en, hi, es, ru, fr, de, it, pt, bn, ja, ko, ms, pl, id, ar, bg, tr, sv };

function getNestedValue(obj: any, path: string): string {
    return path.split(".").reduce((current, key) => current?.[key], obj) ?? path;
}

interface I18nContextValue {
    locale: Locale;
    dir: "ltr" | "rtl";
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
    locale: DEFAULT_LOCALE,
    dir: "ltr",
    t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
    const location = useLocation();
    const localeFromPath = getLocaleFromPath(location.pathname);
    const firstSegment = location.pathname.split("/")[1];
    const hasExplicitLocalePrefix = Boolean(
        firstSegment && firstSegment === localeFromPath && firstSegment !== DEFAULT_LOCALE
    );
    const savedLocaleRaw = typeof window !== "undefined" ? localStorage.getItem("preferredLocale") : null;
    const savedLocale = savedLocaleRaw && SUPPORTED_LOCALES.includes(savedLocaleRaw as Locale)
        ? (savedLocaleRaw as Locale)
        : null;
    const locale = hasExplicitLocalePrefix ? localeFromPath : (savedLocale ?? DEFAULT_LOCALE);
    const dir = LOCALE_META[locale].dir;

    useEffect(() => {
        localStorage.setItem("preferredLocale", locale);
        document.documentElement.lang = locale;
        document.documentElement.dir = dir;
    }, [locale, dir]);

    const t = useMemo(() => {
        const localeData = translations[locale] || translations[DEFAULT_LOCALE];
        const fallbackData = translations[DEFAULT_LOCALE];
        return (key: string): string => {
            const val = getNestedValue(localeData, key);
            if (val !== key) return val;
            return getNestedValue(fallbackData, key);
        };
    }, [locale]);

    const value = useMemo(() => ({ locale, dir, t }), [locale, dir, t]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    return useContext(I18nContext);
}
