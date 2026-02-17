import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const STORAGE_LANG_KEY = "lang";

export const resources = {
  es: {
    translation: {
      quotes: "Presupuestos",
      products: "Productos",
      customers: "Clientes",
      newQuote: "Nuevo presupuesto",
      export: "Exportar",
      save: "Guardar",
      status: "Estado",
    },
  },
  gl: {
    translation: {
      quotes: "Orzamentos",
      products: "Produtos",
      customers: "Clientes",
      newQuote: "Novo orzamento",
      export: "Exportar",
      save: "Gardar",
      status: "Estado",
    },
  },
  ca: {
    translation: {
      quotes: "Pressupostos",
      products: "Productes",
      customers: "Clients",
      newQuote: "Nou pressupost",
      export: "Exportar",
      save: "Desar",
      status: "Estat",
    },
  },
} as const;

export type Lang = keyof typeof resources;

function getInitialLang(): Lang {
  const saved = localStorage.getItem(STORAGE_LANG_KEY) as Lang | null;
  if (saved && saved in resources) return saved;
  return "es";
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLang(),
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export async function setLang(lang: Lang) {
  localStorage.setItem(STORAGE_LANG_KEY, lang);
  await i18n.changeLanguage(lang);
}

export default i18n;
