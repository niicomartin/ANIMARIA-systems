"use client";

import React, { useEffect, useState } from "react";

export default function CajaPage() {
  const [caja, setCaja] = useState<any>(null);

  const [movimientos, setMovimientos] = useState<any[]>([]);

  const [ventas, setVentas] = useState<any[]>([]);

  const [totales, setTotales] = useState<any>({
    cajaInicial: 0,
    ventasHoy: 0,
    cajaEsperada: 0,
    efectivo: 0,
    transferencia: 0,
    debito: 0,
    credito: 0,
    entregas: 0,
    ingresos: 0,
    egresos: 0,
  });

  const [descripcion, setDescripcion] = useState("");

  const [monto, setMonto] = useState("");

  const [tipoMovimiento, setTipoMovimiento] = useState("Ingreso");

  const [cajaReal, setCajaReal] = useState("");

  // =========================
  // OBTENER CAJA
  // =========================

  const obtenerCaja = async () => {
    try {
      const res = await fetch("/api/caja");

      const data = await res.json();

      setCaja(data.caja);

      setMovimientos(data.movimientos || []);

      setVentas(data.ventas || []);

      setTotales(data.totales || {});
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerCaja();
  }, []);

  // =========================
  // ABRIR CAJA
  // =========================

  const abrirCaja = async () => {
    const montoInicial = prompt("Ingrese monto inicial");

    if (!montoInicial) return;

    try {
      const res = await fetch("/api/caja", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          accion: "abrir",

          montoInicial: Number(montoInicial || 0),
        }),
      });

      if (!res.ok) {
        alert("La caja de hoy ya está abierta");

        return;
      }

      await obtenerCaja();
    } catch (error) {
      console.log(error);

      alert("Error al abrir caja");
    }
  };

  // =========================
  // AGREGAR MOVIMIENTO
  // =========================

  const agregarMovimiento = async () => {
    if (!caja) {
      alert("Primero debe abrir la caja");

      return;
    }

    if (caja.estado === "Cerrada") {
      alert("La caja ya está cerrada");

      return;
    }

    if (!descripcion || !monto) {
      alert("Complete todos los campos");

      return;
    }

    try {
      const res = await fetch("/api/caja", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          accion: "movimiento",

          cajaId: caja.id,

          descripcion,

          tipo: tipoMovimiento,

          monto: Number(monto || 0),

          fecha: new Date().toLocaleString(),
        }),
      });

      if (!res.ok) {
        throw new Error("Error al agregar movimiento");
      }

      setDescripcion("");

      setMonto("");

      setTipoMovimiento("Ingreso");

      await obtenerCaja();
    } catch (error) {
      console.log(error);

      alert("Error al agregar movimiento");
    }
  };

  // =========================
  // ELIMINAR MOVIMIENTO
  // =========================

  const eliminarMovimiento = async (id: number) => {
    const confirmar = confirm("¿Eliminar movimiento?");

    if (!confirmar) return;

    try {
      const res = await fetch("/api/caja", {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al eliminar movimiento");
      }

      await obtenerCaja();
    } catch (error) {
      console.log(error);

      alert("Error al eliminar movimiento");
    }
  };

  // =========================
  // CERRAR CAJA
  // =========================

  const cerrarCaja = async () => {
    if (!caja) {
      alert("No hay caja abierta");

      return;
    }

    if (caja.estado === "Cerrada") {
      alert("La caja ya está cerrada");

      return;
    }

    if (!cajaReal) {
      alert("Ingrese caja real");

      return;
    }

    const confirmar = confirm("¿Cerrar caja?");

    if (!confirmar) return;

    try {
      const res = await fetch("/api/caja", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id: caja.id,

          cajaReal: Number(cajaReal || 0),

          cajaEsperada: Number(totales.cajaEsperada || 0),
        }),
      });

      if (!res.ok) {
        throw new Error("Error al cerrar caja");
      }

      setCajaReal("");

      await obtenerCaja();

      alert("Caja cerrada correctamente");
    } catch (error) {
      console.log(error);

      alert("Error al cerrar caja");
    }
  };

  const diferencia =
    Number(cajaReal || caja?.cajaReal || 0) - Number(totales.cajaEsperada || 0);

  return (
    <main className="pt-[120px] min-h-screen bg-gray-100 p-10">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-black">Caja Diaria</h1>

          <p className="text-gray-500 mt-2">
            {caja ? `Estado: ${caja.estado}` : "No hay caja abierta para hoy"}
          </p>
        </div>

        <button
          onClick={abrirCaja}
          disabled={!!caja}
          className={`px-5 py-3 rounded-xl ${
            caja
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          Abrir Caja
        </button>
      </div>

      {/* TARJETAS */}

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Caja Inicial</h2>

          <p className="text-4xl mt-4 text-blue-600 font-bold">
            ${totales.cajaInicial || 0}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Total Vendido</h2>

          <p className="text-4xl mt-4 text-green-600 font-bold">
            ${totales.ventasHoy || 0}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Caja Esperada</h2>

          <p className="text-4xl mt-4 text-black font-bold">
            ${totales.cajaEsperada || 0}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Efectivo</h2>

          <p className="text-4xl mt-4 text-black font-bold">
            ${totales.efectivo || 0}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Transferencia</h2>

          <p className="text-4xl mt-4 text-black font-bold">
            ${totales.transferencia || 0}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-black">Débito / Crédito</h2>

          <p className="text-4xl mt-4 text-black font-bold">
            ${Number(totales.debito || 0) + Number(totales.credito || 0)}
          </p>
        </div>
      </div>

      {/* MOVIMIENTOS */}

      <div className="bg-white p-8 rounded-2xl shadow mb-10">
        <h2 className="text-2xl font-bold text-black mb-6">
          Movimientos de Caja
        </h2>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="border p-3 rounded-xl text-black"
          />

          <input
            type="number"
            placeholder="Monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="border p-3 rounded-xl text-black"
          />

          <select
            value={tipoMovimiento}
            onChange={(e) => setTipoMovimiento(e.target.value)}
            className="border p-3 rounded-xl text-black"
          >
            <option value="Ingreso">Ingreso</option>

            <option value="Egreso">Egreso</option>
          </select>

          <button
            onClick={agregarMovimiento}
            className="bg-black text-white rounded-xl"
          >
            Agregar
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">Fecha</th>

              <th className="text-left p-3 text-black">Descripción</th>

              <th className="text-left p-3 text-black">Tipo</th>

              <th className="text-left p-3 text-black">Monto</th>

              <th className="text-left p-3 text-black">Acción</th>
            </tr>
          </thead>

          <tbody>
            {movimientos.map((mov) => (
              <tr key={mov.id} className="border-b">
                <td className="p-3 text-black">{mov.fecha}</td>

                <td className="p-3 text-black">{mov.descripcion}</td>

                <td className="p-3 text-black">{mov.tipo}</td>

                <td
                  className={`p-3 font-bold ${
                    mov.tipo === "Ingreso" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${mov.monto}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => eliminarMovimiento(mov.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {movimientos.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 p-6">
                  No hay movimientos cargados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VENTAS DEL DÍA */}

      <div className="bg-white p-8 rounded-2xl shadow mb-10">
        <h2 className="text-2xl font-bold text-black mb-6">Ventas del Día</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">Cliente</th>

              <th className="text-left p-3 text-black">Método</th>

              <th className="text-left p-3 text-black">Total</th>

              <th className="text-left p-3 text-black">Entrega</th>
            </tr>
          </thead>

          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id} className="border-b">
                <td className="p-3 text-black">{venta.cliente}</td>

                <td className="p-3 text-black">{venta.metodoPago}</td>

                <td className="p-3 text-green-600 font-bold">${venta.total}</td>

                <td className="p-3 text-black">${venta.entrega || 0}</td>
              </tr>
            ))}

            {ventas.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 p-6">
                  No hay ventas cargadas hoy
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CIERRE */}

      <div className="bg-white p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-bold text-black mb-6">Cierre de Caja</h2>

        <input
          type="number"
          placeholder="Caja real"
          value={cajaReal}
          onChange={(e) => setCajaReal(e.target.value)}
          disabled={caja?.estado === "Cerrada"}
          className="border p-3 rounded-xl text-black w-full mb-6"
        />

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-gray-500">Caja Esperada</p>

            <p className="text-3xl font-bold text-black">
              ${totales.cajaEsperada || 0}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Diferencia</p>

            <p
              className={`text-3xl font-bold ${
                diferencia < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              ${diferencia}
            </p>
          </div>
        </div>

        <button
          onClick={cerrarCaja}
          disabled={!caja || caja?.estado === "Cerrada"}
          className={`px-6 py-3 rounded-xl ${
            !caja || caja?.estado === "Cerrada"
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Cerrar Caja
        </button>
      </div>
    </main>
  );
}
