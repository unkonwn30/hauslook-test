import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sileo";

import { CustomersPage } from "./modules/customers/ui/pages/CustomersPage";
import { ProductsPage } from "./modules/products/ui/pages/ProductsPage";
import { QuoteEditorPage } from "./modules/quotes/ui/pages/QuoteEditor";
import { QuotesListPage } from "./modules/quotes/ui/pages/QuotesListPage";
import { AppLayout } from "./shared/ui/layout/AppLayout";

export default function App() {
  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/quotes" replace />} />
          <Route path="/quotes" element={<QuotesListPage />} />
          <Route path="/quotes/:id" element={<QuoteEditorPage />} />

          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Route>
      </Routes>
    </>
  );
}
