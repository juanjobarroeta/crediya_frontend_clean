import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const sectionList = [
  {
    key: "creditos",
    icon: "💳",
    label: "Créditos",
    links: [
      { href: "/loan-quotes", label: "Cotizador" },
      { href: "/register-payment", label: "Registrar Pago" },
      { href: "/create-loan", label: "Crear Préstamo" },
      { href: "/admin/generate-contract", label: "Generar Contrato" },
      { href: "/admin/overdue-loans", label: "Pagos Vencidos" },
    ],
  },
  {
    key: "gastos",
    icon: "📑",
    label: "Gastos y Compras",
    links: [
      { href: "/admin/expenses", label: "Gastos" },
      { href: "/admin/inventory-request", label: "Solicitar Inventario" },
    ],
  },
  {
    key: "contabilidad",
    icon: "🧾",
    label: "Contabilidad",
    links: [
      { href: "/income-statement", label: "Estado de Resultados" },
      { href: "/balance-sheet", label: "Balance General" },
      { href: "/admin/profit", label: "Ganancias" },
      { href: "/admin/manual-entry", label: "Entrada Manual" },
      { href: "/admin/tesoreria", label: "Tesorería" },
      { href: "/accounting", label: "Asientos Contables" },
      { href: "/admin/account-balances", label: "Movimientos por Cuenta" },
      { href: "/admin/accounting", label: "Cierres Contables" },
    ],
  },
  {
    key: "clientes",
    icon: "🧍‍♂️",
    label: "Clientes",
    links: [
      { href: "/create-customer", label: "Crear Cliente" },
      { href: "/crm", label: "Directorio" },
      { href: "/customer/1", label: "Perfil Cliente" },
    ],
  },
  {
    key: "administracion",
    icon: "⚙️",
    label: "Administración",
    links: [
      { href: "/financial-products", label: "Productos Financieros" },
      { href: "/admin/loans", label: "Aprobaciones" },
      { href: "/admin/promotions", label: "Promociones" },
      { href: "/admin/aprobaciones", label: "Aprobaciones Internas" },
      { href: "/admin/reclassify-payment", label: "Reclasificar Pagos" },
      { href: "/admin/collections", label: "Cobranza" },
      { href: "/admin/create-user", label: "Crear Usuario" },
    ],
  },
  {
    key: "inventario",
    icon: "📦",
    label: "Inventario",
    links: [
      { href: "/admin/inventory", label: "Admin Inventario" },
      { href: "/warehouse/reception", label: "Recepción" },
      { href: "/admin/assign-imei", label: "Asignar IMEI" },
    ],
  },
  {
    key: "investigacion",
    icon: "🔍",
    label: "Investigación",
    links: [
      { href: "/investigation", label: "Formulario de Crédito", isLink: true },
      { href: "/admin/investigations", label: "Ver Investigaciones", isLink: true },
      { href: "/investigation-stepper", label: "Investigación (Móvil)", isLink: true },
    ],
  },
];

const defaultOpenSections = {
  creditos: true,
  gastos: false,
  contabilidad: false,
  clientes: false,
  administracion: false,
  inventario: false,
  investigacion: false,
};

const SIDEBAR_STATE_KEY = "sidebar-state";

const Sidebar = () => {
  const [openSections, setOpenSections] = useState(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
      if (saved) {
        return { ...defaultOpenSections, ...JSON.parse(saved) };
      }
      return defaultOpenSections;
    } catch {
      return defaultOpenSections;
    }
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(openSections));
  }, [openSections]);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <aside className="w-64 min-h-screen flex-shrink-0 bg-black text-black px-6 py-8 overflow-y-auto rounded-r-2xl ml-4">
      <div className="flex items-center justify-center py-4">
        <img src="/logo2.png" alt="CrediYa Logo" className="h-44 mx-auto" />
      </div>
      <div className="mb-8 text-center">
        <a href="/dashboard" className="block text-white hover:text-crediyaGreen font-sans text-lg font-bold uppercase flex items-center gap-2 ml-2">
          <span>🏠</span>
          <span>Dashboard</span>
        </a>
      </div>
      <nav className="space-y-8 text-sm text-center text-base">
        {sectionList.map((section) => (
          <details
            key={section.key}
            open={!!openSections[section.key]}
            onToggle={(e) => {
              const isOpen = e.target.open;
              setOpenSections((prev) => ({
                ...prev,
                [section.key]: isOpen,
              }));
            }}
          >
            <summary className="text-white hover:text-crediyaGreen font-heading text-lg uppercase tracking-wide mb-2 cursor-pointer flex items-center gap-2">
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </summary>
            <div className="space-y-1 ml-4">
              {section.links.map((link, idx) =>
                link.isLink ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block text-white hover:text-crediyaGreen font-sans"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block text-white hover:text-crediyaGreen font-sans"
                  >
                    {link.label}
                  </a>
                )
              )}
            </div>
          </details>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;