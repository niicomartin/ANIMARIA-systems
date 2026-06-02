"use client";

import React, { useEffect, useState } from "react";

export default function ListasPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [listaActiva, setListaActiva] = useState("perros-adultos");

  const obtenerProductos = async () => {
    try {
      const res = await fetch("/api/productos");
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  const dinero = (valor: any) => {
    return Number(valor || 0).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const productosFiltrados = productos.filter((producto) => {
    if (listaActiva === "perros-adultos") {
      return producto.tipoMascota === "Perros" && producto.etapa === "Adulto";
    }

    if (listaActiva === "perros-cachorros") {
      return producto.tipoMascota === "Perros" && producto.etapa === "Cachorro";
    }

    if (listaActiva === "gatos") {
      return producto.tipoMascota === "Gatos";
    }

    return false;
  });

  const tituloLista =
    listaActiva === "perros-adultos"
      ? "Lista Perros Adultos"
      : listaActiva === "perros-cachorros"
        ? "Lista Perros Cachorros"
        : "Lista Gatos";

  return (
    <main className="pt-[120px] min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-black mb-8">Listas de Precios</h1>

      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setListaActiva("perros-adultos")}
            className={`p-4 rounded-xl font-bold ${
              listaActiva === "perros-adultos"
                ? "bg-black text-white"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            Perros Adultos
          </button>

          <button
            onClick={() => setListaActiva("perros-cachorros")}
            className={`p-4 rounded-xl font-bold ${
              listaActiva === "perros-cachorros"
                ? "bg-black text-white"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            Perros Cachorros
          </button>

          <button
            onClick={() => setListaActiva("gatos")}
            className={`p-4 rounded-xl font-bold ${
              listaActiva === "gatos"
                ? "bg-black text-white"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            Gatos
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-3xl font-bold text-black mb-6">{tituloLista}</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 text-black">Marca</th>
              <th className="text-left p-4 text-black">KG</th>
              <th className="text-left p-4 text-black">Precio</th>
            </tr>
          </thead>

          <tbody>
            {productosFiltrados.map((producto) => (
              <tr key={producto.id} className="border-b">
                <td className="p-4 text-black font-bold">{producto.nombre}</td>
                <td className="p-4 text-black">{producto.kg || "-"}</td>
                <td className="p-4 text-green-600 font-bold text-xl">
                  {dinero(producto.precio)}
                </td>
              </tr>
            ))}

            {productosFiltrados.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-gray-500 p-8">
                  No hay productos para esta lista
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
