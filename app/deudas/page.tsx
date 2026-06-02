"use client";

import { useEffect, useState } from "react";

export default function DeudasPage() {
  const [deudas, setDeudas] = useState<any[]>([]);

  const [busqueda, setBusqueda] = useState("");

  const [modalPagar, setModalPagar] = useState(false);

  const [deudaSeleccionada, setDeudaSeleccionada] = useState<any>(null);

  const [montoPago, setMontoPago] = useState("");

  const [metodoPago, setMetodoPago] = useState("");

  // =========================
  // OBTENER DEUDAS
  // =========================

  const obtenerDeudas = async () => {
    try {
      const res = await fetch("/api/deudas");

      const data = await res.json();

      setDeudas(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerDeudas();
  }, []);

  // =========================
  // ABRIR MODAL PAGO
  // =========================

  const abrirModalPago = (deuda: any) => {
    setDeudaSeleccionada(deuda);

    setMontoPago(String(deuda.total || ""));

    setMetodoPago("");

    setModalPagar(true);
  };

  // =========================
  // PAGAR DEUDA
  // =========================

  const pagarDeuda = async () => {
    if (!deudaSeleccionada) return;

    if (!metodoPago) {
      alert("Seleccione método de pago");

      return;
    }

    const monto = Number(montoPago || 0);

    if (monto <= 0) {
      alert("Ingrese un monto válido");

      return;
    }

    try {
      const res = await fetch("/api/deudas", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id: deudaSeleccionada.id,
          monto,
          metodoPago,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al pagar deuda");
      }

      await obtenerDeudas();

      setModalPagar(false);

      setDeudaSeleccionada(null);

      setMontoPago("");

      setMetodoPago("");

      alert("Pago registrado correctamente");
    } catch (error) {
      console.log(error);

      alert("Error al registrar pago");
    }
  };

  // =========================
  // ELIMINAR DEUDA
  // =========================

  const eliminarDeuda = async (id: number) => {
    const confirmar = confirm("¿Eliminar esta deuda?");

    if (!confirmar) return;

    try {
      const res = await fetch("/api/deudas", {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al eliminar deuda");
      }

      await obtenerDeudas();
    } catch (error) {
      console.log(error);

      alert("Error al eliminar deuda");
    }
  };

  // =========================
  // FILTROS
  // =========================

  const deudasFiltradas = deudas.filter((deuda) => {
    const texto = busqueda.toLowerCase();

    return (
      deuda.cliente?.toLowerCase().includes(texto) ||
      deuda.clienteId?.toString().includes(texto) ||
      deuda.estado?.toLowerCase().includes(texto)
    );
  });

  const deudasPendientes = deudasFiltradas.filter(
    (deuda) => deuda.estado !== "Pagada",
  );

  const deudasPagadas = deudasFiltradas.filter(
    (deuda) => deuda.estado === "Pagada",
  );

  const totalPendiente = deudasPendientes.reduce(
    (acc, deuda) => acc + Number(deuda.total || 0),
    0,
  );

  const saldoRestante =
    deudaSeleccionada && montoPago
      ? Number(deudaSeleccionada.total || 0) - Number(montoPago || 0)
      : deudaSeleccionada
        ? Number(deudaSeleccionada.total || 0)
        : 0;

  return (
    <main className="pt-[120px] min-h-screen bg-gray-100 p-10">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-black">Deudas</h1>

          <p className="text-gray-500 mt-2">Control de cuentas pendientes</p>
        </div>

        <div className="bg-white rounded-2xl shadow px-8 py-5">
          <p className="text-gray-500">Total pendiente</p>

          <p className="text-3xl font-bold text-red-600">${totalPendiente}</p>
        </div>
      </div>

      {/* BUSCADOR */}

      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <input
          type="text"
          placeholder="Buscar por cliente, código o estado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border p-3 rounded-xl text-black w-full"
        />
      </div>

      {/* DEUDAS PENDIENTES */}

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-6">
          Deudas Pendientes
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">Cliente</th>

              <th className="text-left p-3 text-black">Código</th>

              <th className="text-left p-3 text-black">Fecha</th>

              <th className="text-left p-3 text-black">Saldo</th>

              <th className="text-left p-3 text-black">Estado</th>

              <th className="text-left p-3 text-black">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {deudasPendientes.map((deuda) => (
              <tr key={deuda.id} className="border-b">
                <td className="p-3 text-black font-bold">{deuda.cliente}</td>

                <td className="p-3 text-black">{deuda.clienteId || "-"}</td>

                <td className="p-3 text-black">{deuda.fecha}</td>

                <td className="p-3 text-red-600 font-bold">${deuda.total}</td>

                <td className="p-3">
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold text-sm">
                    {deuda.estado}
                  </span>
                </td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => abrirModalPago(deuda)}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
                  >
                    Pagar
                  </button>

                  <button
                    onClick={() => eliminarDeuda(deuda.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {deudasPendientes.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={6}>
                  No hay deudas pendientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DEUDAS PAGADAS */}

      <div className="bg-white rounded-2xl shadow p-8 mt-8">
        <h2 className="text-2xl font-bold text-green-600 mb-6">
          Deudas Pagadas
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">Cliente</th>

              <th className="text-left p-3 text-black">Código</th>

              <th className="text-left p-3 text-black">Fecha</th>

              <th className="text-left p-3 text-black">Saldo</th>

              <th className="text-left p-3 text-black">Estado</th>

              <th className="text-left p-3 text-black">Acción</th>
            </tr>
          </thead>

          <tbody>
            {deudasPagadas.map((deuda) => (
              <tr key={deuda.id} className="border-b">
                <td className="p-3 text-black font-bold">{deuda.cliente}</td>

                <td className="p-3 text-black">{deuda.clienteId || "-"}</td>

                <td className="p-3 text-black">{deuda.fecha}</td>

                <td className="p-3 text-green-600 font-bold">${deuda.total}</td>

                <td className="p-3">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm">
                    {deuda.estado}
                  </span>
                </td>

                <td className="p-3">
                  <button
                    onClick={() => eliminarDeuda(deuda.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {deudasPagadas.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={6}>
                  No hay deudas pagadas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL PAGAR */}

      {modalPagar && deudaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[600px] rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-black mb-6">Pagar Deuda</h2>

            <div className="bg-gray-100 rounded-xl p-5 mb-6">
              <p className="text-black">
                <strong>Cliente:</strong> {deudaSeleccionada.cliente}
              </p>

              <p className="text-black mt-2">
                <strong>Deuda actual:</strong> ${deudaSeleccionada.total}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="border p-3 rounded-xl text-black"
              >
                <option value="">Método de Pago</option>

                <option value="Efectivo">Efectivo</option>

                <option value="Transferencia">Transferencia</option>

                <option value="Débito">Débito</option>

                <option value="Crédito">Crédito</option>
              </select>

              <input
                type="number"
                placeholder="Monto entregado"
                value={montoPago}
                onChange={(e) => setMontoPago(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />
            </div>

            <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 mb-6">
              <p className="text-black font-bold">
                Entrega: ${Number(montoPago || 0)}
              </p>

              <p className="text-red-600 font-bold mt-2">
                Saldo restante: ${saldoRestante <= 0 ? 0 : saldoRestante}
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setModalPagar(false);

                  setDeudaSeleccionada(null);

                  setMontoPago("");

                  setMetodoPago("");
                }}
                className="bg-gray-300 text-black px-5 py-3 rounded-xl"
              >
                Cancelar
              </button>

              <button
                onClick={pagarDeuda}
                className="bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
