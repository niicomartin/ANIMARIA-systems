"use client";

import React, { useEffect, useState } from "react";

export default function DashboardPage() {
  const [datos, setDatos] = useState<any>({
    ventas: [],
    productos: [],
    compras: [],
    clientes: [],
    deudas: [],
    gastos: [],
    proveedores: [],

    totalVentas: 0,
    totalCompras: 0,
    inversionStock: 0,
    totalGastos: 0,
    totalDeudas: 0,
    deudaProveedores: 0,
    gananciaProductos: 0,
    gananciaReal: 0,
    ganancia: 0,

    totalProductos: 0,
    totalClientes: 0,
    totalProveedores: 0,

    cantidadVentas: 0,
    cantidadCompras: 0,

    efectivo: 0,
    transferencia: 0,
    debito: 0,
    credito: 0,
    entregas: 0,

    stockBajo: [],
    productosAgotados: [],
  });

  const dinero = (valor: any) => {
    return Number(valor || 0).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const obtenerDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();

      setDatos(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerDashboard();
  }, []);

  return (
    <main className="pt-[120px] min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-black">Dashboard General</h1>
          <p className="text-gray-500 mt-2">Resumen general del sistema</p>
        </div>

        <button
          onClick={obtenerDashboard}
          className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800"
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-500">
          <h2 className="text-gray-500 text-lg">Ventas Totales</h2>

          <p className="text-4xl font-bold text-green-600 mt-4">
            {dinero(datos.totalVentas)}
          </p>

          <p className="text-gray-400 mt-2">
            {datos.cantidadVentas || 0} ventas
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-orange-500">
          <h2 className="text-gray-500 text-lg">Inversión en Stock</h2>

          <p className="text-4xl font-bold text-orange-500 mt-4">
            {dinero(datos.inversionStock || datos.totalCompras)}
          </p>

          <p className="text-gray-400 mt-2">
            {datos.cantidadCompras || 0} compras
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-yellow-500">
          <h2 className="text-gray-500 text-lg">Gastos Totales</h2>

          <p className="text-4xl font-bold text-yellow-500 mt-4">
            {dinero(datos.totalGastos)}
          </p>

          <p className="text-gray-400 mt-2">Servicios y egresos</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-500">
          <h2 className="text-gray-500 text-lg">Ganancia Real</h2>

          <p
            className={`text-4xl font-bold mt-4 ${
              Number(datos.gananciaReal || 0) >= 0
                ? "text-blue-600"
                : "text-red-600"
            }`}
          >
            {dinero(datos.gananciaReal)}
          </p>

          <p className="text-gray-400 mt-2">Ganancia de ventas - gastos</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-500 text-lg">Productos</h2>

          <p className="text-4xl font-bold text-blue-600 mt-4">
            {datos.totalProductos || 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-500 text-lg">Clientes</h2>

          <p className="text-4xl font-bold text-purple-600 mt-4">
            {datos.totalClientes || 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-500 text-lg">Deuda Proveedores</h2>

          <p className="text-4xl font-bold text-red-600 mt-4">
            {dinero(datos.deudaProveedores)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-500 text-lg">Deudas Clientes</h2>

          <p className="text-4xl font-bold text-red-600 mt-4">
            {dinero(datos.totalDeudas)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-8 mb-8">
        <h2 className="text-2xl font-bold text-black mb-6">
          Caja por Método de Pago
        </h2>

        <div className="grid grid-cols-5 gap-6">
          <div className="bg-green-50 rounded-2xl p-5">
            <h3 className="text-green-700 font-bold">Efectivo</h3>

            <p className="text-3xl font-bold text-green-600 mt-3">
              {dinero(datos.efectivo)}
            </p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-5">
            <h3 className="text-blue-700 font-bold">Transferencia</h3>

            <p className="text-3xl font-bold text-blue-600 mt-3">
              {dinero(datos.transferencia)}
            </p>
          </div>

          <div className="bg-yellow-50 rounded-2xl p-5">
            <h3 className="text-yellow-700 font-bold">Débito</h3>

            <p className="text-3xl font-bold text-yellow-600 mt-3">
              {dinero(datos.debito)}
            </p>
          </div>

          <div className="bg-pink-50 rounded-2xl p-5">
            <h3 className="text-pink-700 font-bold">Crédito</h3>

            <p className="text-3xl font-bold text-pink-600 mt-3">
              {dinero(datos.credito)}
            </p>
          </div>

          <div className="bg-orange-50 rounded-2xl p-5">
            <h3 className="text-orange-700 font-bold">Entregas</h3>

            <p className="text-3xl font-bold text-orange-600 mt-3">
              {dinero(datos.entregas)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-red-500 text-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold">Productos Agotados</h2>

          <p className="text-5xl font-bold mt-4">
            {datos.productosAgotados?.length || 0}
          </p>
        </div>

        <div className="bg-yellow-500 text-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold">Productos con Stock Bajo</h2>

          <p className="text-5xl font-bold mt-4">
            {datos.stockBajo?.length || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold text-black mb-6">Últimas Ventas</h2>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-black">Cliente</th>
                <th className="text-left p-3 text-black">Método</th>
                <th className="text-left p-3 text-black">Total</th>
              </tr>
            </thead>

            <tbody>
              {datos.ventas?.slice(0, 5).map((venta: any) => (
                <tr key={venta.id} className="border-b">
                  <td className="p-3 text-black">{venta.cliente}</td>
                  <td className="p-3 text-black">{venta.metodoPago}</td>
                  <td className="p-3 text-green-600 font-bold">
                    {dinero(venta.total)}
                  </td>
                </tr>
              ))}

              {datos.ventas?.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500 p-6">
                    No hay ventas cargadas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold text-black mb-6">
            Últimas Compras
          </h2>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-black">Proveedor</th>
                <th className="text-left p-3 text-black">Fecha</th>
                <th className="text-left p-3 text-black">Total</th>
              </tr>
            </thead>

            <tbody>
              {datos.compras?.slice(0, 5).map((compra: any) => (
                <tr key={compra.id} className="border-b">
                  <td className="p-3 text-black">{compra.proveedor}</td>
                  <td className="p-3 text-black">{compra.fecha}</td>
                  <td className="p-3 text-orange-600 font-bold">
                    {dinero(compra.total)}
                  </td>
                </tr>
              ))}

              {datos.compras?.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500 p-6">
                    No hay compras cargadas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-8 mt-8">
        <h2 className="text-2xl font-bold text-red-600 mb-6">
          Productos con Stock Bajo
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">Producto</th>
              <th className="text-left p-3 text-black">Proveedor</th>
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
