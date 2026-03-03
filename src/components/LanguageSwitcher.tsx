import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Globe } from "lucide-react";
import { SUPPORTED_LOCALES, LOCALE_META, localizedPath, stripLocalePrefix, type Locale } from "../i18n/locales";
import { useI18n } from "../i18n/I18nContext";

export default function LanguageSwitcher({ openUp = false }: { openUp?: boolean }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { locale: currentLocale } = useI18n();
    const location = useLocation();
    const currentPath = stripLocalePrefix(location.pathname);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors"
                aria-label="Change language"
            >
                <Globe size={16} />
                <span className="hidden sm:inline">{LOCALE_META[currentLocale].flag}</span>
            </button>

            {open && (
                <div className={`absolute right-0 ${openUp ? "bottom-full mb-2" : "top-full mt-2"} w-56 max-h-80 overflow-y-auto bg-white border border-neutral-200 rounded-xl shadow-xl p-1.5 z-50 grid grid-cols-2 gap-0.5`}>
                    {SUPPORTED_LOCALES.map((loc: Locale) => (
                        <Link
                            key={loc}
                            to={localizedPath(currentPath, loc)}
                            onClick={() => {
                                localStorage.setItem("preferredLocale", loc);
                                setOpen(false);
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${loc === currentLocale
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-emerald-600"
                                }`}
                        >
                            <span>{LOCALE_META[loc].flag}</span>
                            <span className="truncate">{LOCALE_META[loc].native}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
