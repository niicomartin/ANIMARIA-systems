"use client";

import { useEffect, useState } from "react";

export default function ClientesPage() {
  const [abrirModal, setAbrirModal] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [busqueda, setBusqueda] = useState("");

  const [codigo, setCodigo] = useState("");

  const [nombre, setNombre] = useState("");

  const [telefono, setTelefono] = useState("");

  const [direccion, setDireccion] = useState("");

  const [ciudad, setCiudad] = useState("");

  const [provincia, setProvincia] = useState("");

  const [deuda, setDeuda] = useState("0");

  const [clientes, setClientes] = useState<any[]>([]);

  // =========================
  // OBTENER CLIENTES
  // =========================

  const obtenerClientes = async () => {
    try {
      const res = await fetch("/api/clientes");

      const data = await res.json();

      setClientes(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  // =========================
  // LIMPIAR FORMULARIO
  // =========================

  const limpiarFormulario = () => {
    setCodigo("");

    setNombre("");

    setTelefono("");

    setDireccion("");

    setCiudad("");

    setProvincia("");

    setDeuda("0");

    setEditandoId(null);
  };

  // =========================
  // NUEVO CLIENTE
  // =========================

  const abrirNuevoCliente = () => {
    limpiarFormulario();

    setCodigo(Math.floor(100000 + Math.random() * 900000).toString());

    setAbrirModal(true);
  };

  // =========================
  // EDITAR CLIENTE
  // =========================

  const abrirEditarCliente = (cliente: any) => {
    setEditandoId(cliente.id);

    setCodigo(cliente.codigo || "");

    setNombre(cliente.nombre || "");

    setTelefono(cliente.telefono || "");

    setDireccion(cliente.direccion || "");

    setCiudad(cliente.ciudad || "");

    setProvincia(cliente.provincia || "");

    setDeuda(String(cliente.deuda || 0));

    setAbrirModal(true);
  };

  // =========================
  // GUARDAR CLIENTE
  // =========================

  const guardarCliente = async () => {
    if (!nombre) {
      alert("Ingrese el nombre del cliente");

      return;
    }

    try {
      const clienteData = {
        id: editandoId,

        codigo,

        nombre,

        telefono,

        direccion,

        ciudad,

        provincia,

        deuda: Number(deuda || 0),
      };

      const res = await fetch("/api/clientes", {
        method: editandoId ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(clienteData),
      });

      if (!res.ok) {
        throw new Error("Error al guardar cliente");
      }

      await obtenerClientes();

      limpiarFormulario();

      setAbrirModal(false);
    } catch (error) {
      console.log(error);

      alert("Error al guardar cliente");
    }
  };

  // =========================
  // ELIMINAR CLIENTE
  // =========================

  const eliminarCliente = async (id: number) => {
    const confirmar = confirm("¿Eliminar cliente?");

    if (!confirmar) return;

    try {
      const res = await fetch("/api/clientes", {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al eliminar cliente");
      }

      await obtenerClientes();
    } catch (error) {
      console.log(error);

      alert("Error al eliminar cliente");
    }
  };

  // =========================
  // FILTRO
  // =========================

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = busqueda.toLowerCase();

    return (
      cliente.nombre?.toLowerCase().includes(texto) ||
      cliente.codigo?.toString().includes(texto) ||
      cliente.telefono?.toLowerCase().includes(texto) ||
      cliente.ciudad?.toLowerCase().includes(texto) ||
      cliente.provincia?.toLowerCase().includes(texto)
    );
  });

  return (
    <main className="pt-[120px] min-h-screen bg-gray-100 p-10">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-black">Clientes</h1>

        <button
          onClick={abrirNuevoCliente}
          className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800"
        >
          + Nuevo Cliente
        </button>
      </div>

      {/* BUSCADOR */}

      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <input
          type="text"
          placeholder="Buscar cliente por nombre, código, teléfono, ciudad o provincia..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border p-3 rounded-xl text-black w-full"
        />
      </div>

      {/* TABLA */}

      <div className="bg-white rounded-2xl shadow p-8">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">Código</th>

              <th className="text-left p-3 text-black">Cliente</th>

              <th className="text-left p-3 text-black">Teléfono</th>

              <th className="text-left p-3 text-black">Dirección</th>

              <th className="text-left p-3 text-black">Ciudad</th>

              <th className="text-left p-3 text-black">Provincia</th>

              <th className="text-left p-3 text-black">Deuda</th>

              <th className="text-left p-3 text-black">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.id} className="border-b">
                <td className="p-3 text-black">{cliente.codigo}</td>

                <td className="p-3 text-black font-bold">{cliente.nombre}</td>

                <td className="p-3 text-black">{cliente.telefono}</td>

                <td className="p-3 text-black">{cliente.direccion}</td>

                <td className="p-3 text-black">{cliente.ciudad}</td>

                <td className="p-3 text-black">{cliente.provincia}</td>

                <td className="p-3 text-red-600 font-bold">
                  ${cliente.deuda || 0}
                </td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => abrirEditarCliente(cliente)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarCliente(cliente.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}

      {abrirModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[650px]">
            <h2 className="text-2xl font-bold text-black mb-6">
              {editandoId ? "Editar Cliente" : "Nuevo Cliente"}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Código"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <input
                type="text"
                placeholder="Cliente"
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
                type="number"
                placeholder="Deuda automática"
                value={deuda}
                readOnly
                className="border p-3 rounded-xl text-black bg-gray-100"
              />
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => {
                  limpiarFormulario();

                  setAbrirModal(false);
                }}
                className="bg-gray-300 px-5 py-3 rounded-xl text-black"
              >
                Cancelar
              </button>

              <button
                onClick={guardarCliente}
                className="bg-black text-white px-5 py-3 rounded-xl"
              >
                Guardar Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
