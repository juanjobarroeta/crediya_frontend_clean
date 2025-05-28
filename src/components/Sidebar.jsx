import { Link } from "react-router-dom";
const Sidebar = () => {
    return (
      <aside className="w-64 h-screen flex-shrink-0 bg-black text-black px-6 py-8 overflow-y-auto rounded-r-2xl ml-4">
        <div className="flex items-center justify-center py-4">
          <img src="/logo2.png" alt="CrediYa Logo" className="h-44 mx-auto" />
        </div>
        <nav className="space-y-8 text-sm text-center text-base">
          <div>
            <h2 className="text-white hover:text-crediyaGreen font-heading text-lg uppercase tracking-wide mb-4 text-center">Créditos</h2>
            <div className="space-y-1">
              <a href="/loan-quotes" className="block text-white hover:text-crediyaGreen font-sans">Cotizador</a>
              <a href="/register-payment" className="block text-white hover:text-crediyaGreen font-sans">Registrar Pago</a>
              <a href="/create-loan" className="block text-white hover:text-crediyaGreen font-sans">Crear Préstamo</a>
              <a href="/admin/generate-contract" className="block text-white hover:text-crediyaGreen font-sans">Generar Contrato</a>
            </div>
          </div>
  
          <div>
            <h2 className="text-white hover:text-crediyaGreen font-heading text-lg uppercase tracking-wide mb-4 text-center">Gastos y Compras</h2>
            <div className="space-y-1">
              <a href="/admin/expenses" className="block text-white hover:text-crediyaGreen font-sans">Gastos</a>
              <a href="/admin/inventory-request" className="block text-white hover:text-crediyaGreen font-sans">Solicitar Inventario</a>
            </div>
          </div>
  
          <div>
            <h2 className="text-white hover:text-crediyaGreen font-heading text-lg uppercase tracking-wide mb-4 text-center">Contabilidad</h2>
            <div className="space-y-1">
              <a href="/income-statement" className="block text-white hover:text-crediyaGreen font-sans">Estado de Resultados</a>
              <a href="/balance-sheet" className="block text-white hover:text-crediyaGreen font-sans">Balance General</a>
              <a href="/admin/profit" className="block text-white hover:text-crediyaGreen font-sans">Ganancias</a>
              <a href="/admin/manual-entry" className="block text-white hover:text-crediyaGreen font-sans">Entrada Manual</a>
              <a href="/admin/tesoreria" className="block text-white hover:text-crediyaGreen font-sans">Tesorería</a>
              <a href="/accounting" className="block text-white hover:text-crediyaGreen font-sans">Asientos Contables</a>
              <a href="/admin/account-balances" className="block text-white hover:text-crediyaGreen font-sans">Movimientos por Cuenta</a>
            </div>
          </div>
  
          <div>
            <h2 className="text-white hover:text-crediyaGreen font-heading text-lg uppercase tracking-wide mb-4 text-center">Clientes</h2>
            <div className="space-y-1">
              <a href="/create-customer" className="block text-white hover:text-crediyaGreen font-sans">Crear Cliente</a>
              <a href="/crm" className="block text-white hover:text-crediyaGreen font-sans">Directorio</a>
              <a href="/customer/1" className="block text-white hover:text-crediyaGreen font-sans">Perfil Cliente</a>
            </div>
          </div>
  
          <div>
            <h2 className="text-white hover:text-crediyaGreen font-heading text-lg uppercase tracking-wide mb-4 text-center">Administración</h2>
            <div className="space-y-1">
              <a href="/financial-products" className="block text-white hover:text-crediyaGreen font-sans">Productos Financieros</a>
              <a href="/admin/loans" className="block text-white hover:text-crediyaGreen font-sans">Aprobaciones</a>
              <a href="/admin/promotions" className="block text-white hover:text-crediyaGreen font-sans">Promociones</a>
              <a href="/admin/aprobaciones" className="block text-white hover:text-crediyaGreen font-sans">Aprobaciones Internas</a>
            </div>
          </div>
  
          <div>
            <h2 className="text-white hover:text-crediyaGreen font-heading text-lg uppercase tracking-wide mb-4 text-center">Inventario</h2>
            <div className="space-y-1">
              <a href="/admin/inventory" className="block text-white hover:text-crediyaGreen font-sans">Admin Inventario</a>
              <a href="/warehouse/reception" className="block text-white hover:text-crediyaGreen font-sans">Recepción</a>
              <a href="/admin/assign-imei" className="block text-white hover:text-crediyaGreen font-sans">Asignar IMEI</a>
            </div>
          </div>

          <div>
            <h2 className="text-white hover:text-crediyaGreen font-heading text-lg uppercase tracking-wide mb-4 text-center">Investigación</h2>
            <div className="space-y-1">
              <Link to="/investigation" className="block text-white hover:text-crediyaGreen font-sans">
                Formulario de Crédito
              </Link>
              <Link to="/admin/investigations" className="block text-white hover:text-crediyaGreen font-sans">
                Ver Investigaciones
              </Link>
              <Link to="/investigation-stepper" className="block text-white hover:text-crediyaGreen font-sans">
                Investigación (Móvil)
              </Link>
            </div>
          </div>
        </nav>
      </aside>
    );
  };
  
  export default Sidebar;