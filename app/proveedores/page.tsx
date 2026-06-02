"use client";

import React, { useEffect, useState } from "react";

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [abrirModal, setAbrirModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [cuit, setCuit] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [deuda, setDeuda] = useState("0");
  const [saldoFavor, setSaldoFavor] = useState("0");

  const [modalPago, setModalPago] = useState(false);
  const [proveedorPago, setProveedorPago] = useState<any>(null);
  const [montoPago, setMontoPago] = useState("");
  const [pagosProveedor, setPagosProveedor] = useState<any[]>([]);

  const obtenerProveedores = async () => {
    try {
      const res = await fetch("/api/proveedores");
      const data = await res.json();
      setProveedores(data);
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerPagosProveedor = async (proveedorId: number) => {
    try {
      const res = await fetch(`/api/proveedores?proveedorId=${proveedorId}`);
      const data = await res.json();
      setPagosProveedor(data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setTelefono("");
    setDireccion("");
    setCiudad("");
    setProvincia("");
    setCuit("");
    setObservaciones("");
    setDeuda("0");
    setSaldoFavor("0");
    setEditandoId(null);
  };

  const abrirNuevoProveedor = () => {
    limpiarFormulario();
    setAbrirModal(true);
  };

  const abrirEditarProveedor = (proveedor: any) => {
    setEditandoId(proveedor.id);
    setNombre(proveedor.nombre || "");
    setTelefono(proveedor.telefono || "");
    setDireccion(proveedor.direccion || "");
    setCiudad(proveedor.ciudad || "");
    setProvincia(proveedor.provincia || "");
    setCuit(proveedor.cuit || "");
    setObservaciones(proveedor.observaciones || "");
    setDeuda(String(proveedor.deuda || 0));
    setSaldoFavor(String(proveedor.saldoFavor || 0));
    setAbrirModal(true);
  };

  const abrirPagoProveedor = async (proveedor: any) => {
    setProveedorPago(proveedor);
    setMontoPago("");
    setModalPago(true);
    await obtenerPagosProveedor(proveedor.id);
  };

  const guardarProveedor = async () => {
    if (!nombre) {
      alert("Ingrese nombre");
      return;
    }

    try {
      const proveedorData = {
        id: editandoId,
        nombre,
        telefono,
        direccion,
        ciudad,
        provincia,
        cuit,
        observaciones,
        deuda: Number(deuda || 0),
        saldoFavor: Number(saldoFavor || 0),
      };

      const res = await fetch("/api/proveedores", {
        method: editandoId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proveedorData),
      });

      if (!res.ok) {
        throw new Error("Error al guardar proveedor");
      }

      await obtenerProveedores();
      limpiarFormulario();
      setAbrirModal(false);
    } catch (error) {
      console.log(error);
      alert("Error al guardar proveedor");
    }
  };

  const eliminarProveedor = async (id: number) => {
    const confirmar = confirm("¿Eliminar proveedor?");

    if (!confirmar) return;

    try {
      const res = await fetch("/api/proveedores", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Error al eliminar proveedor");
      }

      await obtenerProveedores();
    } catch (error) {
      console.log(error);
      alert("Error al eliminar proveedor");
    }
  };

  const deudaProveedorActual = Number(proveedorPago?.deuda || 0);

  const saldoFavorProveedorActual = Number(proveedorPago?.saldoFavor || 0);

  const montoPagoNumero = Number(montoPago || 0);

  const diferenciaPago = deudaProveedorActual - montoPagoNumero;

  const deudaRestantePreview =
    montoPagoNumero > 0
      ? diferenciaPago > 0
        ? diferenciaPago
        : 0
      : deudaProveedorActual;

  const saldoFavorGeneradoPreview =
    montoPagoNumero > 0 && diferenciaPago < 0 ? Math.abs(diferenciaPago) : 0;

  const saldoFavorTotalPreview =
    saldoFavorProveedorActual + saldoFavorGeneradoPreview;

  const pagarDeudaProveedor = async () => {
    if (!proveedorPago) return;

    if (!montoPago || Number(montoPago) <= 0) {
      alert("Ingrese monto válido");
      return;
    }

    try {
      const res = await fetch("/api/proveedores", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: proveedorPago.id,
          pagarDeuda: Number(montoPago),
          fechaPago: new Date().toLocaleString(),
        }),
      });

      if (!res.ok) {
        throw new Error("Error al pagar deuda");
      }

      const data = await res.json();

      const nuevaDeuda = Number(data.deuda || 0);
      const nuevoSaldoFavor = Number(data.saldoFavor || 0);
      const saldoFavorGenerado = Number(data.saldoFavorGenerado || 0);

      setProveedorPago({
        ...proveedorPago,
        deuda: nuevaDeuda,
        saldoFavor: nuevoSaldoFavor,
      });

      setMontoPago("");

      await obtenerProveedores();
      await obtenerPagosProveedor(proveedorPago.id);

      if (saldoFavorGenerado > 0) {
        alert(
          `Pago registrado correctamente.\n\nDeuda cancelada.\nSaldo a favor: $${saldoFavorGenerado}`,
        );
      } else {
        alert("Pago registrado correctamente");
      }
    } catch (error) {
      console.log(error);
      alert("Error al pagar deuda");
    }
  };

  const proveedoresFiltrados = proveedores.filter((proveedor) => {
    const texto = busqueda.toLowerCase();

    return (
      proveedor.nombre?.toLowerCase().includes(texto) ||
      proveedor.telefono?.toLowerCase().includes(texto) ||
      proveedor.ciudad?.toLowerCase().includes(texto) ||
      proveedor.provincia?.toLowerCase().includes(texto) ||
      proveedor.cuit?.toLowerCase().includes(texto) ||
      proveedor.id?.toString().includes(texto)
    );
  });

  return (
    <main className="pt-[120px] min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-black">Proveedores</h1>

        <button
          onClick={abrirNuevoProveedor}
          className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800"
        >
          + Nuevo Proveedor
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <input
          type="text"
          placeholder="Buscar proveedor por nombre, teléfono, ciudad, provincia o CUIT..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border p-3 rounded-xl w-full text-black"
        />
      </div>

      <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
        <table className="w-full min-w-[1050px]">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">ID</th>
              <th className="text-left p-3 text-black">Proveedor</th>
              <th className="text-left p-3 text-black">Teléfono</th>
              <th className="text-left p-3 text-black">Ciudad</th>
              <th className="text-left p-3 text-black">Provincia</th>
              <th className="text-left p-3 text-black">CUIT</th>
              <th className="text-left p-3 text-black">Deuda</th>
              <th className="text-left p-3 text-black">Saldo a favor</th>
              <th className="text-left p-3 text-black">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {proveedoresFiltrados.map((proveedor) => (
              <tr key={proveedor.id} className="border-b">
                <td className="p-3 text-black">#{proveedor.id}</td>

                <td className="p-3 text-black font-bold">{proveedor.nombre}</td>

                <td className="p-3 text-black">{proveedor.telefono}</td>

                <td className="p-3 text-black">{proveedor.ciudad}</td>

                <td className="p-3 text-black">{proveedor.provincia}</td>

                <td className="p-3 text-black">{proveedor.cuit}</td>

                <td className="p-3 text-red-600 font-bold">
                  ${proveedor.deuda || 0}
                </td>

                <td className="p-3 text-green-600 font-bold">
                  ${proveedor.saldoFavor || 0}
                </td>

                <td className="p-3">
                  <div className="flex gap-2">
                    {Number(proveedor.deuda || 0) > 0 && (
                      <button
                        onClick={() => abrirPagoProveedor(proveedor)}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
                      >
                        Pagar
                      </button>
                    )}

                    <button
                      onClick={() => abrirEditarProveedor(proveedor)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => eliminarProveedor(proveedor.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {proveedoresFiltrados.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 p-6">
                  No hay proveedores cargados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {abrirModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[700px]">
            <h2 className="text-2xl font-bold text-black mb-6">
              {editandoId !== null ? "Editar Proveedor" : "Nuevo Proveedor"}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <input
                type="text"
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <input
                type="text"
                placeholder="Dirección"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <input
                type="text"
                placeholder="Ciudad"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <input
                type="text"
                placeholder="Provincia"
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <input
                type="text"
                placeholder="CUIT"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <input
                type="number"
                placeholder="Deuda"
                value={deuda}
                onChange={(e) => setDeuda(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <input
                type="number"
                placeholder="Saldo a favor"
                value={saldoFavor}
                onChange={(e) => setSaldoFavor(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <input
                type="text"
                placeholder="Observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => {
                  setAbrirModal(false);
                  limpiarFormulario();
                }}
                className="bg-gray-300 px-5 py-3 rounded-xl text-black"
              >
                Cancelar
              </button>

              <button
                onClick={guardarProveedor}
                className="bg-black text-white px-5 py-3 rounded-xl"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalPago && proveedorPago && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[700px] max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-bold text-black mb-2">Pagar deuda</h2>

            <p className="text-gray-500 mb-6">
              Proveedor: {proveedorPago.nombre}
            </p>

            <div className="bg-gray-100 rounded-2xl p-5 mb-6">
              <p className="text-black font-bold text-xl">
                Deuda actual: ${proveedorPago.deuda || 0}
              </p>

              <p className="text-green-600 font-bold mt-2">
                Saldo a favor actual: ${proveedorPago.saldoFavor || 0}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="number"
                placeholder="Monto entregado"
                value={montoPago}
                onChange={(e) => setMontoPago(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <button
                onClick={pagarDeudaProveedor}
                className="bg-green-600 text-white rounded-xl hover:bg-green-700"
              >
                Pagar
              </button>
            </div>

            {montoPago && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-5 mb-8">
                <p className="text-black font-bold">
                  Monto entregado: ${montoPagoNumero}
                </p>

                <p className="text-red-600 font-bold mt-2">
                  Deuda restante: ${deudaRestantePreview}
                </p>

                {saldoFavorGeneradoPreview > 0 && (
                  <p className="text-green-700 font-bold mt-2">
                    Saldo a favor generado: ${saldoFavorGeneradoPreview}
                  </p>
                )}

                <p className="text-green-600 font-bold mt-2">
                  Saldo a favor total: ${saldoFavorTotalPreview}
                </p>
              </div>
            )}

            <h3 className="text-xl font-bold text-black mb-4">
              Historial de entregas
            </h3>

            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-black">Fecha</th>
                  <th className="text-left p-3 text-black">Monto</th>
                </tr>
              </thead>

              <tbody>
                {pagosProveedor.map((pago) => (
                  <tr key={pago.id} className="border-b">
                    <td className="p-3 text-black">{pago.fecha}</td>
                    <td className="p-3 text-green-600 font-bold">
                      ${pago.monto}
                    </td>
                  </tr>
                ))}

                {pagosProveedor.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center text-gray-500 p-6">
                      No hay pagos cargados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => {
                  setModalPago(false);
                  setProveedorPago(null);
                  setMontoPago("");
                  setPagosProveedor([]);
                }}
                className="bg-gray-300 text-black px-5 py-3 rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
