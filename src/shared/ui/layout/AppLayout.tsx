import { Link, NavLink, Outlet } from "react-router-dom";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "block rounded-md px-3 py-2 text-sm",
          isActive
            ? "bg-neutral-900 text-white"
            : "text-neutral-700 hover:bg-neutral-100",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white p-4">
          <Link to="/" className="block text-lg font-semibold">
            HausLook Backoffice
          </Link>

          <nav className="mt-6 space-y-1">
            <NavItem to="/quotes" label="Presupuestos" />
            <NavItem to="/products" label="Productos" />
            <NavItem to="/customers" label="Clientes" />
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
            <div className="flex h-14 items-center justify-between px-6">
              <div className="text-sm text-neutral-600">Backoffice</div>
              <div className="text-sm text-neutral-600">Demo</div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
