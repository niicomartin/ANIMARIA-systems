"use client";

import React, { useEffect, useState } from "react";

export default function ProductosPage() {
  const [abrirModal, setAbrirModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [productos, setProductos] = useState<any[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroMascota, setFiltroMascota] = useState("");
  const [filtroEtapa, setFiltroEtapa] = useState("");

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [kg, setKg] = useState("");
  const [tipoMascota, setTipoMascota] = useState("");
  const [etapa, setEtapa] = useState("");
  const [stock, setStock] = useState("");
  const [precioCosto, setPrecioCosto] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState("");

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

  const normalizarTipoMascota = (valor: any) => {
    const tipo = String(valor || "").trim();

    if (tipo === "Aves" || tipo === "Conejos" || tipo === "Roedores") {
      return "Pequeños Animales";
    }

    return tipo;
  };

  const limpiarFormulario = () => {
    setCodigo("");
    setNombre("");
    setMarca("");
    setKg("");
    setTipoMascota("");
    setEtapa("");
    setStock("");
    setPrecioCosto("");
    setPrecio("");
    setImagen("");
    setEditandoId(null);
  };

  const abrirNuevoProducto = () => {
    limpiarFormulario();

    setCodigo(Math.floor(100000 + Math.random() * 900000).toString());

    setAbrirModal(true);
  };

  const editarProducto = (producto: any) => {
    setEditandoId(producto.id);

    setCodigo(producto.codigo || "");
    setNombre(producto.nombre || "");
    setMarca(producto.marca || "");
    setKg(producto.kg || "");
    setTipoMascota(normalizarTipoMascota(producto.tipoMascota));
    setEtapa(producto.etapa || "");
    setStock(producto.stock || "");
    setPrecioCosto(producto.precioCosto || "");
    setPrecio(producto.precio || "");
    setImagen(producto.imagen || "");

    setAbrirModal(true);
  };

  const subirImagen = async (archivo: File) => {
    try {
      const formData = new FormData();

      formData.append("imagen", archivo);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al subir imagen");
      }

      setImagen(data.imagen || "");
    } catch (error) {
      console.log(error);

      alert("Error al subir imagen");
    }
  };

  const guardarProducto = async () => {
    if (!nombre || !marca || !stock || !precio) {
      alert("Complete todos los campos");
      return;
    }

    try {
      const res = await fetch("/api/productos", {
        method: editandoId ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id: editandoId,
          codigo,
          nombre,
          marca,
          kg,
          tipoMascota: normalizarTipoMascota(tipoMascota),
          etapa,
          stock,
          precioCosto: Number(precioCosto || 0),
          precio,
          imagen,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar producto");
      }

      await obtenerProductos();

      limpiarFormulario();

      setAbrirModal(false);
    } catch (error) {
      console.log(error);

      alert("Error al guardar producto");
    }
  };

  const eliminarProducto = async (id: number) => {
    const confirmar = confirm("¿Eliminar producto?");

    if (!confirmar) return;

    try {
      const res = await fetch("/api/productos", {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Error al eliminar producto");
      }

      await obtenerProductos();
    } catch (error) {
      console.log(error);

      alert("Error al eliminar producto");
    }
  };

  const productosFiltrados = productos.filter((producto) => {
    const texto = busqueda.toLowerCase();
    const tipoMascotaNormalizado = normalizarTipoMascota(producto.tipoMascota);

    const coincideBusqueda =
      producto.nombre?.toLowerCase().includes(texto) ||
      producto.marca?.toLowerCase().includes(texto) ||
      producto.codigo?.toString().includes(texto) ||
      tipoMascotaNormalizado.toLowerCase().includes(texto);

    const coincideMascota =
      filtroMascota === "" || tipoMascotaNormalizado === filtroMascota;

    const coincideEtapa = filtroEtapa === "" || producto.etapa === filtroEtapa;

    return coincideBusqueda && coincideMascota && coincideEtapa;
  });

  return (
    <main className="pt-[120px] min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-black">Productos</h1>

        <button
          onClick={abrirNuevoProducto}
          className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800"
        >
          + Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border p-3 rounded-xl text-black"
          />

          <select
            value={filtroMascota}
            onChange={(e) => setFiltroMascota(e.target.value)}
            className="border p-3 rounded-xl text-black"
          >
            <option value="">Todas las mascotas</option>

            <option value="Perros">Perros</option>

            <option value="Gatos">Gatos</option>

            <option value="Pequeños Animales">Pequeños Animales</option>

            <option value="Otros">Otros</option>
          </select>

          <select
            value={filtroEtapa}
            onChange={(e) => setFiltroEtapa(e.target.value)}
            className="border p-3 rounded-xl text-black"
          >
            <option value="">Todas las etapas</option>

            <option value="Adulto">Adulto</option>

            <option value="Cachorro">Cachorro</option>

            <option value="Ambos">Ambos</option>

            <option value="Bebé">Bebé</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-8 overflow-x-auto">
        <table className="w-full min-w-[1200px] table-fixed">
          <thead>
            <tr className="border-b">
              <th className="w-[40px] max-w-[40px] min-w-[40px] p-1 text-black overflow-hidden">
                IMG
              </th>

              <th className="text-left p-3 text-black">Código</th>

              <th className="text-left p-3 text-black">Marca</th>

              <th className="text-left p-3 text-black">Proveedor</th>

              <th className="text-left p-3 text-black">KG</th>

              <th className="text-left p-3 text-black">Mascota</th>

              <th className="text-left p-3 text-black">Etapa</th>

              <th className="text-left p-3 text-black">Stock</th>

              <th className="text-left p-3 text-black">Costo</th>

              <th className="text-left p-3 text-black">Precio</th>

              <th className="text-left p-3 text-black">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {productosFiltrados.map((producto) => (
              <tr key={producto.id} className="border-b">
                <td className="p-1 w-[48px] max-w-[48px] min-w-[48px] h-[48px] max-h-[48px] overflow-hidden align-middle">
                  <div className="w-[28px] h-[28px] max-w-[28px] max-h-[28px] overflow-hidden rounded-md border bg-gray-100">
                    {producto.imagen ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div className="w-[28px] h-[28px] flex items-center justify-center text-gray-400 text-[7px]">
                        IMG
                      </div>
                    )}
                  </div>
                </td>

                <td className="p-3 text-black">{producto.codigo}</td>

                <td className="p-3 text-black font-bold">{producto.nombre}</td>

                <td className="p-3 text-black">{producto.marca}</td>

                <td className="p-3 text-black">{producto.kg}</td>

                <td className="p-3 text-black">
                  {normalizarTipoMascota(producto.tipoMascota)}
                </td>

                <td className="p-3 text-black">{producto.etapa}</td>

                <td className="p-3 text-black">
                  {producto.stock}

                  {Number(producto.stock) <= 5 && (
                    <p className="text-red-600 font-bold text-sm mt-1">
                      ⚠ Stock Bajo
                    </p>
                  )}
                </td>

                <td className="p-3 text-black font-bold">
                  ${producto.precioCosto || 0}
                </td>

                <td className="p-3 text-green-600 font-bold">
                  ${producto.precio}
                </td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => editarProducto(producto)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarProducto(producto.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {productosFiltrados.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center text-gray-500 p-6">
                  No hay productos cargados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {abrirModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[750px] rounded-2xl p-8 max-h-[90vh] overflow-auto">
            <h2 className="text-3xl font-bold text-black mb-8">
              {editandoId ? "Editar Producto" : "Nuevo Producto"}
            </h2>

            <div className="bg-gray-100 rounded-2xl p-5 mb-6">
              <h3 className="text-lg font-bold text-black mb-4">
                Imagen del producto
              </h3>

              <div className="flex items-center gap-5">
                <div className="w-[28px] h-[28px] overflow-hidden rounded-md border bg-white">
                  {imagen ? (
                    <img
                      src={imagen}
                      alt="Vista previa"
                      style={{
                        width: "28px",
                        height: "28px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div className="w-[28px] h-[28px] flex items-center justify-center text-gray-400 text-[7px]">
                      IMG
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const archivo = e.target.files?.[0];

                      if (archivo) {
                        subirImagen(archivo);
                      }
                    }}
                    className="border p-3 rounded-xl text-black bg-white w-full"
                  />

                  {imagen && (
                    <button
                      onClick={() => setImagen("")}
                      className="mt-3 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
                    >
                      Quitar imagen
                    </button>
                  )}
                </div>
              </div>
            </div>

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
                placeholder="Marca"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <input
                type="text"
                placeholder="Proveedor"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <input
                type="text"
                placeholder="KG"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <select
                value={tipoMascota}
                onChange={(e) => setTipoMascota(e.target.value)}
                className="border p-3 rounded-xl text-black"
              >
                <option value="">Tipo Mascota</option>

                <option value="Perros">Perros</option>

                <option value="Gatos">Gatos</option>

                <option value="Pequeños Animales">Pequeños Animales</option>

                <option value="Otros">Otros</option>
              </select>

              <select
                value={etapa}
                onChange={(e) => setEtapa(e.target.value)}
                className="border p-3 rounded-xl text-black"
              >
                <option value="">Etapa</option>

                <option value="Adulto">Adulto</option>

                <option value="Cachorro">Cachorro</option>

                <option value="Ambos">Ambos</option>

                <option value="Bebé">Bebé</option>
              </select>

              <input
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <input
                type="number"
                placeholder="Precio Costo"
                value={precioCosto}
                onChange={(e) => setPrecioCosto(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />

              <input
                type="number"
                placeholder="Precio Venta"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="border p-3 rounded-xl text-black col-span-2"
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
                onClick={guardarProducto}
                className="bg-black text-white px-5 py-3 rounded-xl"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
