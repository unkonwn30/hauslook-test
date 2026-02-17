import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
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
};

const saved = localStorage.getItem("lang") as keyof typeof resources | null;

i18n.use(initReactI18next).init({
  resources,
  lng: saved ?? "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export function setLang(lang: keyof typeof resources) {
  localStorage.setItem("lang", lang);
  i18n.changeLanguage(lang);
}

export default i18n;
