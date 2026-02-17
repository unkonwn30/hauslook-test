import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Separator } from "../separator";
import { LanguageSwitcher } from "./LanguageSwitcher";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
          isActive
            ? "bg-black/75 text-white shadow"
            : "text-neutral-700 hover:bg-neutral-100",
        ].join(" ")
      }
    >
      <span>{label}</span>
    </NavLink>
  );
}

export function AppLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-900">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r bg-white">
          <div className="p-5">
            <Link to="/" className="text-lg font-semibold tracking-tight">
              HausLook <span className="text-black/60">CRM</span>
            </Link>
            <div className="mt-1 text-xs text-neutral-500">Backoffice demo</div>
          </div>
          <Separator />
          <nav className="p-3 space-y-1">
            <NavItem to="/quotes" label={t("quotes")} />
            <NavItem to="/products" label={t("products")} />
            <NavItem to="/customers" label={t("customers")} />
          </nav>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
            <div className="flex h-14 items-center justify-between px-6">
              <div className="text-sm text-neutral-600">Backoffice</div>
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
              </div>
            </div>
          </header>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
