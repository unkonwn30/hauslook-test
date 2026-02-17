import { Navigate, Route, Routes } from "react-router-dom";
import { QuoteEditorPage } from "./modules/quotes/ui/pages/QuoteEditor";
import { QuotesListPage } from "./modules/quotes/ui/pages/QuotesListPage";
import { AppLayout } from "./shared/ui/layout/AppLayout";

function CustomersPage() {
  return (
    <div className="rounded-md border bg-white p-4">Clientes (placeholder)</div>
  );
}

function ProductsPage() {
  return (
    <div className="rounded-md border bg-white p-4">
      Productos (placeholder)
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/quotes" replace />} />
        <Route path="/quotes" element={<QuotesListPage />} />
        <Route path="/quotes/:id" element={<QuoteEditorPage />} />

        {/* placeholders */}
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Route>
    </Routes>
  );
}
