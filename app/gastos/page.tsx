"use client";

import React, { useEffect, useState } from "react";

const SERVICIOS = [
  "Agua",
  "ARBA",
  "ARCA",
  "Cable",
  "Combustibles",
  "Gas",
  "Internet",
  "Luz",
  "Municipalidad",
  "Otros",
  "Sueldos",
];

export default function GastosPage() {
  const [gastos, setGastos] = useState<any[]>([]);

  const [servicio, setServicio] = useState("");

  const [monto, setMonto] = useState("");

  const [busqueda, setBusqueda] = useState("");

  // =========================
  // OBTENER GASTOS
  // =========================

  const obtenerGastos = async () => {
    try {
      const res = await fetch("/api/gastos");

      const data = await res.json();

      setGastos(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerGastos();
  }, []);

  // =========================
  // AGREGAR GASTO
  // =========================

  const agregarGasto = async () => {
    if (!servicio || !monto) {
      alert("Seleccione servicio e ingrese monto");

      return;
    }

    if (Number(monto) <= 0) {
      alert("Ingrese un monto válido");

      return;
    }

    try {
      const res = await fetch("/api/gastos", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          servicio,

          monto: Number(monto),

          fecha: new Date().toLocaleString(),
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar gasto");
      }

      setServicio("");

      setMonto("");

      await obtenerGastos();
    } catch (error) {
      console.log(error);

      alert("Error al guardar gasto");
    }
  };

  // =========================
  // ELIMINAR GASTO
  // =========================

  const eliminarGasto = async (id: number) => {
    const confirmar = confirm("¿Eliminar gasto?");

    if (!confirmar) return;

    try {
      const res = await fetch("/api/gastos", {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al eliminar gasto");
      }

      await obtenerGastos();
    } catch (error) {
      console.log(error);

      alert("Error al eliminar gasto");
    }
  };

  // =========================
  // FILTROS Y TOTALES
  // =========================

  const gastosFiltrados = gastos.filter((gasto) => {
    const texto = busqueda.toLowerCase();

    return (
      gasto.servicio?.toLowerCase().includes(texto) ||
      gasto.fecha?.toLowerCase().includes(texto)
    );
  });

  const totalGastos = gastos.reduce(
    (acc, gasto) => acc + Number(gasto.monto || 0),
    0,
  );

  const totalFiltrado = gastosFiltrados.reduce(
    (acc, gasto) => acc + Number(gasto.monto || 0),
    0,
  );

  const totalPorServicio = (nombreServicio: string) =>
    gastos
      .filter((gasto) => gasto.servicio === nombreServicio)
      .reduce((acc, gasto) => acc + Number(gasto.monto || 0), 0);

  return (
    <main className="pt-[120px] min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-black mb-8">Gestión de Gastos</h1>

      {/* TARJETAS */}

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg text-gray-500">Total Gastos</h2>

          <p className="text-4xl font-bold text-red-600 mt-4">${totalGastos}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg text-gray-500">Luz</h2>

          <p className="text-4xl font-bold text-yellow-500 mt-4">
            ${totalPorServicio("Luz")}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg text-gray-500">Internet</h2>

          <p className="text-4xl font-bold text-blue-500 mt-4">
            ${totalPorServicio("Internet")}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg text-gray-500">Sueldos</h2>

          <p className="text-4xl font-bold text-purple-500 mt-4">
            ${totalPorServicio("Sueldos")}
          </p>
        </div>
      </div>

      {/* FORMULARIO */}

      <div className="bg-white rounded-2xl shadow p-8 mb-10">
        <h2 className="text-2xl font-bold text-black mb-6">Nuevo Gasto</h2>

        <div className="grid grid-cols-3 gap-4">
          <select
            value={servicio}
            onChange={(e) => setServicio(e.target.value)}
            className="border p-3 rounded-xl text-black"
          >
            <option value="">Servicio</option>

            {SERVICIOS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="border p-3 rounded-xl text-black"
          />

          <button
            onClick={agregarGasto}
            className="bg-black text-white rounded-xl hover:bg-gray-800"
          >
            Agregar Gasto
          </button>
        </div>
      </div>

      {/* BUSCADOR */}

      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <input
          type="text"
          placeholder="Buscar por servicio o fecha..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border p-3 rounded-xl text-black w-full"
        />

        <p className="text-gray-500 mt-4">
          Total filtrado:{" "}
          <span className="font-bold text-black">${totalFiltrado}</span>
        </p>
      </div>

      {/* TABLA */}

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-bold text-black mb-6">
          Historial de Gastos
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">Fecha</th>

              <th className="text-left p-3 text-black">Servicio</th>

              <th className="text-left p-3 text-black">Monto</th>

              <th className="text-left p-3 text-black">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {gastosFiltrados.map((gasto) => (
              <tr key={gasto.id} className="border-b">
                <td className="p-3 text-black">{gasto.fecha}</td>

                <td className="p-3 text-black font-bold">{gasto.servicio}</td>

                <td className="p-3 text-red-600 font-bold">${gasto.monto}</td>

                <td className="p-3">
                  <button
                    onClick={() => eliminarGasto(gasto.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {gastosFiltrados.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 p-6">
                  No hay gastos cargados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
