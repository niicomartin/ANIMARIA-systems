"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [rol, setRol] = useState("");
  const [logueado, setLogueado] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState("");

  useEffect(() => {
    const usuario = localStorage.getItem("usuarioLogueado");

    if (usuario) {
      const datos = JSON.parse(usuario);
      setRol(datos.rol);
      setLogueado(true);
    } else {
      setRol("");
      setLogueado(false);
    }
  }, [pathname]);

  if (pathname === "/login" || !logueado) return null;

  const grupos = [
    {
      nombre: "Inicio",
      items: [
        { nombre: "Dashboard", ruta: "/dashboard", roles: ["admin"] },
        { nombre: "Estadísticas", ruta: "/estadisticas", roles: ["admin"] },
        { nombre: "Finanzas", ruta: "/finanzas", roles: ["admin"] },
      ],
    },
    {
      nombre: "Ventas",
      items: [
        {
          nombre: "Nueva Venta",
          ruta: "/ventas",
          roles: ["admin", "caja", "empleado"],
        },
        { nombre: "Clientes", ruta: "/clientes", roles: ["admin", "caja"] },
        { nombre: "Deudas", ruta: "/deudas", roles: ["admin", "caja"] },
        {
          nombre: "Remitos / Facturas",
          ruta: "/remitos",
          roles: ["admin", "caja"],
        },
      ],
    },
    {
      nombre: "Stock",
      items: [
        { nombre: "Productos", ruta: "/productos", roles: ["admin"] },
        {
          nombre: "Listas de Precios",
          ruta: "/listas",
          roles: ["admin", "caja", "empleado"],
        },
        { nombre: "Compras", ruta: "/compras", roles: ["admin"] },
        { nombre: "Proveedores", ruta: "/proveedores", roles: ["admin"] },
        { nombre: "Integración Web", ruta: "/integracion", roles: ["admin"] },
      ],
    },
    {
      nombre: "Caja",
      items: [
        { nombre: "Caja Diaria", ruta: "/caja", roles: ["admin", "caja"] },
        { nombre: "Gastos", ruta: "/gastos", roles: ["admin"] },
      ],
    },
  ];

  const gruposVisibles = grupos.filter((grupo) =>
    grupo.items.some((item) => item.roles.includes(rol)),
  );

  const grupoSeleccionado = gruposVisibles.find(
    (grupo) => grupo.nombre === menuAbierto,
  );

  return (
    <div
      className="fixed top-0 left-0 z-[99999] w-full"
      onMouseLeave={() => setMenuAbierto("")}
    >
      {/* BARRA PRINCIPAL */}
      <header className="h-[78px] bg-black text-white border-b border-gray-800">
        <div className="h-full flex items-center px-8 gap-8">
          <h1 className="text-2xl font-bold min-w-[160px]">ANIMARIA</h1>

          <nav className="flex items-center gap-4 flex-1">
            {gruposVisibles.map((grupo) => (
              <button
                key={grupo.nombre}
                onMouseEnter={() => setMenuAbierto(grupo.nombre)}
                className={`px-5 py-3 rounded-xl text-sm font-bold transition ${
                  menuAbierto === grupo.nombre
                    ? "bg-white text-black"
                    : "hover:bg-gray-800"
                }`}
              >
                {grupo.nombre}
              </button>
            ))}
          </nav>

          <button
            onClick={() => {
              localStorage.removeItem("usuarioLogueado");

              document.cookie =
                "usuarioLogueado=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

              router.push("/login");
            }}
            className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* BARRA DESPLEGABLE */}
      {grupoSeleccionado && (
        <div
          className="h-[58px] bg-white text-black border-b border-gray-300 shadow flex items-center px-[200px] gap-3"
          onMouseEnter={() => setMenuAbierto(grupoSeleccionado.nombre)}
        >
          {grupoSeleccionado.items
            .filter((item) => item.roles.includes(rol))
            .map((item) => (
              <Link
                key={item.ruta}
                href={item.ruta}
                onClick={() => setMenuAbierto("")}
                className={`px-5 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${
                  pathname === item.ruta
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {item.nombre}
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
