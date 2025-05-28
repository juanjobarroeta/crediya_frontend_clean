const Header = () => {
  return (
    <header className="w-full bg-black text-crediyaGreen flex items-center justify-between px-6 py-4 rounded-tl-3xl rounded-tr-3xl shadow-md">
     <h1 className="text-lg font-bold uppercase tracking-wide font-heading">Hola Juan</h1>
      <div className="flex gap-4">
        <button className="bg-crediyaGreen hover:bg-white hover:text-crediyaGreen text-black font-semibold py-2 px-4 rounded transition duration-200">
          Nuevo Préstamo
        </button>
        <button className="bg-crediyaGreen hover:bg-white hover:text-crediyaGreen text-black font-semibold py-2 px-4 rounded transition duration-200">
          Registrar Pago
        </button>
        <button className="bg-crediyaGreen hover:bg-white hover:text-crediyaGreen text-black font-semibold py-2 px-4 rounded transition duration-200">
          Cotizar
        </button>
        <button className="bg-crediyaGreen hover:bg-white hover:text-crediyaGreen text-black font-semibold py-2 px-4 rounded transition duration-200">
          Nuevo Cliente
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/auth";
          }}
          className="bg-red-500 hover:bg-white hover:text-red-500 text-white font-semibold py-2 px-4 rounded transition duration-200"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default Header;