import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  es: {
    translation: {
      quotes: "Presupuestos",
      newQuote: "Nuevo presupuesto",
      status: "Estado",
      customer: "Cliente",
      total: "Total",
      createdAt: "Creado",
      save: "Guardar",
      export: "Exportar",
    },
  },
  gl: {
    translation: {
      quotes: "Orzamentos",
      newQuote: "Novo orzamento",
      status: "Estado",
      customer: "Cliente",
      total: "Total",
      createdAt: "Creado",
      save: "Gardar",
      export: "Exportar",
    },
  },
  ca: {
    translation: {
      quotes: "Pressupostos",
      newQuote: "Nou pressupost",
      status: "Estat",
      customer: "Client",
      total: "Total",
      createdAt: "Creat",
      save: "Desar",
      export: "Exportar",
    },
  },
  en: {
    translation: {
      quotes: "Quotes",
      newQuote: "New quote",
      status: "Status",
      customer: "Customer",
      total: "Total",
      createdAt: "Created",
      save: "Save",
      export: "Export",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export default i18n;
