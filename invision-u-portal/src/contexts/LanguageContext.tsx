import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type DictKey,
  type Locale,
  pick,
} from "@/i18n/dictionary";

type TFunction = (key: DictKey) => string;

type LanguageContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TFunction;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "invision-locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "ru";
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    return saved === "kz" ? "kz" : "ru";
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback<TFunction>(
    (key) => pick(key, locale),
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
