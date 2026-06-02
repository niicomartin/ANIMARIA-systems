"use client";

import { useEffect, useState } from "react";

export default function EstadisticasPage() {
  const [datos, setDatos] = useState<any>({
    totalVentas: 0,
    cantidadVentas: 0,
    totalClientes: 0,
    totalProductos: 0,
    totalCompras: 0,
    inversionStock: 0,
    totalGastos: 0,
    totalDeudas: 0,
    deudaProveedores: 0,
    gananciaProductos: 0,
    ganancia: 0,
    stockBajo: [],
    productosAgotados: [],
    productoMasVendido: "Sin ventas",
    cantidadMasVendida: 0,
  });

  const dinero = (valor: any) => {
    return Number(valor || 0).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const obtenerEstadisticas = async () => {
    try {
      const res = await fetch("/api/estadisticas");

      const data = await res.json();

      setDatos(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerEstadisticas();
  }, []);

  return (
    <main className="pt-[120px] min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-black mb-8">Estadísticas</h1>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Total Vendido</h2>

          <p className="text-4xl mt-4 text-green-600 font-bold">
            {dinero(datos.totalVentas)}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Cantidad Ventas</h2>

          <p className="text-4xl mt-4 text-black">
            {datos.cantidadVentas || 0}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Clientes</h2>

          <p className="text-4xl mt-4 text-black">{datos.totalClientes || 0}</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Productos</h2>

          <p className="text-4xl mt-4 text-blue-600 font-bold">
            {datos.totalProductos || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Inversión en Stock</h2>

          <p className="text-4xl mt-4 text-orange-500 font-bold">
            {dinero(datos.inversionStock || datos.totalCompras)}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Gastos</h2>

          <p className="text-4xl mt-4 text-yellow-500 font-bold">
            {dinero(datos.totalGastos)}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Deudas Clientes</h2>

          <p className="text-4xl mt-4 text-red-600 font-bold">
            {dinero(datos.totalDeudas)}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Ganancia Real</h2>

          <p
            className={`text-4xl mt-4 font-bold ${
              Number(datos.ganancia || 0) >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {dinero(datos.ganancia)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Ganancia Productos</h2>

          <p className="text-4xl mt-4 text-green-700 font-bold">
            {dinero(datos.gananciaProductos)}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Deuda Proveedores</h2>

          <p className="text-4xl mt-4 text-red-700 font-bold">
            {dinero(datos.deudaProveedores)}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Agotados</h2>

          <p className="text-4xl mt-4 text-red-600 font-bold">
            {datos.productosAgotados?.length || 0}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Stock Bajo</h2>

          <p className="text-4xl mt-4 text-yellow-600 font-bold">
            {datos.stockBajo?.length || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-2xl font-bold text-black mb-4">
            Producto Más Vendido
          </h2>

          <p className="text-3xl font-bold text-blue-600">
            {datos.productoMasVendido}
          </p>

          <p className="text-gray-500 mt-3">
            {datos.cantidadMasVendida || 0} unidades vendidas
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-2xl font-bold text-black mb-4">
            Alertas de Stock
          </h2>

          <p className="text-4xl font-bold text-red-600">
            {datos.stockBajo?.length || 0}
          </p>

          <p className="text-gray-500 mt-3">productos con stock bajo</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-6">
          Productos con Stock Bajo
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">Producto</th>

              <th className="text-left p-3 text-black">Marca</th>

              <th className="text-left p-3 text-black">Stock</th>

              <th className="text-left p-3 text-black">Estado</th>
            </tr>
          </thead>

          <tbody>
            {datos.stockBajo?.map((producto: any) => (
              <tr key={producto.id} className="border-b">
                <td className="p-3 text-black">{producto.nombre}</td>

                <td className="p-3 text-black">{producto.marca}</td>

                <td className="p-3 text-black">{producto.stock}</td>

                <td className="p-3">
                  {Number(producto.stock || 0) <= 0 ? (
                    <span className="text-red-600 font-bold">Agotado</span>
                  ) : (
                    <span className="text-yellow-600 font-bold">Bajo</span>
                  )}
                </td>
              </tr>
            ))}

            {datos.stockBajo?.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 p-6">
                  No hay productos con stock bajo
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
