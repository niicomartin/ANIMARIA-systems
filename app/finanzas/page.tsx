"use client";

import React, { useEffect, useState } from "react";

export default function FinanzasPage() {
  const [datos, setDatos] = useState<any>({
    ventas: [],
    compras: [],
    gastos: [],
    productos: [],
    deudas: [],
    proveedores: [],

    totalVentas: 0,
    totalCompras: 0,
    inversionStock: 0,
    totalGastos: 0,
    totalDeudas: 0,
    deudaProveedores: 0,
    gananciaProductos: 0,
    gananciaReal: 0,

    efectivo: 0,
    transferencia: 0,
    debito: 0,
    credito: 0,
    entregas: 0,

    productoMasVendido: "Sin ventas",
    cantidadMasVendida: 0,

    mejorCliente: "Sin clientes",
    mejorMonto: 0,

    stockCritico: [],
  });

  const dinero = (valor: any) => {
    return Number(valor || 0).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const obtenerFinanzas = async () => {
    try {
      const res = await fetch("/api/finanzas");
      const data = await res.json();

      setDatos(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerFinanzas();
  }, []);

  return (
    <main className="pt-[120px] min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-black mb-10">Finanzas</h1>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-500 text-lg">Ventas Totales</h2>

          <p className="text-4xl font-bold text-green-600 mt-4">
            {dinero(datos.totalVentas)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-500 text-lg">Inversión en Stock</h2>

          <p className="text-4xl font-bold text-orange-500 mt-4">
            {dinero(datos.inversionStock || datos.totalCompras)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-500 text-lg">Gastos Totales</h2>

          <p className="text-4xl font-bold text-yellow-500 mt-4">
            {dinero(datos.totalGastos)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
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
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-black">Efectivo</h2>

          <p className="text-3xl font-bold text-green-600 mt-4">
            {dinero(datos.efectivo)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-black">Transferencia</h2>

          <p className="text-3xl font-bold text-blue-600 mt-4">
            {dinero(datos.transferencia)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-black">Débito</h2>

          <p className="text-3xl font-bold text-yellow-600 mt-4">
            {dinero(datos.debito)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-black">Crédito</h2>

          <p className="text-3xl font-bold text-pink-600 mt-4">
            {dinero(datos.credito)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-black">Deudas Clientes</h2>

          <p className="text-3xl font-bold text-red-600 mt-4">
            {dinero(datos.totalDeudas)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold text-black mb-6">
            Producto Más Vendido
          </h2>

          <p className="text-3xl font-bold text-blue-600">
            {datos.productoMasVendido}
          </p>

          <p className="text-xl text-gray-600 mt-4">
            {datos.cantidadMasVendida || 0} unidades vendidas
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold text-black mb-6">Mejor Cliente</h2>

          <p className="text-3xl font-bold text-green-600">
            {datos.mejorCliente}
          </p>

          <p className="text-xl text-gray-600 mt-4">
            {dinero(datos.mejorMonto)} comprados
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-black">Ganancia Productos</h2>

          <p className="text-3xl font-bold text-green-700 mt-4">
            {dinero(datos.gananciaProductos)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-black">Deuda Proveedores</h2>

          <p className="text-3xl font-bold text-red-700 mt-4">
            {dinero(datos.deudaProveedores)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-black">Entregas</h2>

          <p className="text-3xl font-bold text-orange-600 mt-4">
            {dinero(datos.entregas)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-3xl font-bold text-red-600 mb-6">
          Alertas del Sistema
        </h2>

        {datos.stockCritico?.length === 0 ? (
          <p className="text-green-600 font-bold text-xl">
            No hay alertas de stock
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-black">Producto</th>
                <th className="text-left p-3 text-black">Stock</th>
                <th className="text-left p-3 text-black">Estado</th>
              </tr>
            </thead>

            <tbody>
              {datos.stockCritico?.map((producto: any) => (
                <tr key={producto.id} className="border-b">
                  <td className="p-3 text-black">{producto.nombre}</td>
                  <td className="p-3 text-black">{producto.stock}</td>
                  <td className="p-3 text-red-600 font-bold">Stock Crítico</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
