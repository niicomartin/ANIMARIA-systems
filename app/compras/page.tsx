"use client";

import React, { useEffect, useState } from "react";

export default function ComprasPage() {
  const [abrirModal, setAbrirModal] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalComprasProveedor, setModalComprasProveedor] = useState(false);

  const [compraSeleccionada, setCompraSeleccionada] = useState<any>(null);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<any>(null);

  const [productos, setProductos] = useState<any[]>([]);
  const [compras, setCompras] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState<any[]>([]);

  const [abrirProveedores, setAbrirProveedores] = useState(false);

  const [proveedor, setProveedor] = useState("");
  const [saldoFavorProveedor, setSaldoFavorProveedor] = useState(0);
  const [factura, setFactura] = useState("");

  const [producto, setProducto] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(false);
  const [cantidad, setCantidad] = useState("");
  const [precioCosto, setPrecioCosto] = useState("");
  const [ganancia, setGanancia] = useState("30");
  const [kg, setKg] = useState("");
  const [tipoMascota, setTipoMascota] = useState("");
  const [etapa, setEtapa] = useState("");
  const [imagen, setImagen] = useState("");

  const [itemsCompra, setItemsCompra] = useState<any[]>([]);

  const [metodoPago, setMetodoPago] = useState("Pago Total");
  const [entrega, setEntrega] = useState("");

  useEffect(() => {
    obtenerProductos();
    obtenerCompras();
    obtenerProveedores();
  }, []);

  const obtenerProductos = async () => {
    try {
      const res = await fetch("/api/productos");
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerCompras = async () => {
    try {
      const res = await fetch("/api/compras");
      const data = await res.json();
      setCompras(data);
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerProveedores = async () => {
    try {
      const res = await fetch("/api/proveedores");
      const data = await res.json();
      setProveedores(data);
    } catch (error) {
      console.log(error);
    }
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

  const normalizarTipoMascota = (valor: any) => {
    const tipo = String(valor || "").trim();

    if (tipo === "Aves" || tipo === "Conejos" || tipo === "Roedores") {
      return "Pequeños Animales";
    }

    return tipo;
  };

  const limpiarFormulario = () => {
    setProveedor("");
    setSaldoFavorProveedor(0);
    setFactura("");
    setProducto("");
    setProductoSeleccionado(false);
    setCantidad("");
    setPrecioCosto("");
    setGanancia("30");
    setKg("");
    setTipoMascota("");
    setEtapa("");
    setImagen("");
    setItemsCompra([]);
    setProveedoresFiltrados([]);
    setAbrirProveedores(false);
    setMetodoPago("Pago Total");
    setEntrega("");
  };

  const seleccionarProductoExistente = (productoEncontrado: any) => {
    setProductoSeleccionado(true);
    setProducto(productoEncontrado.nombre || "");
    setKg(productoEncontrado.kg || "");
    setTipoMascota(normalizarTipoMascota(productoEncontrado.tipoMascota));
    setEtapa(productoEncontrado.etapa || "");
    setPrecioCosto(productoEncontrado.precioCosto || "");
    setImagen(productoEncontrado.imagen || "");
  };

  const productosFiltradosCompra = productos.filter((productoExistente) => {
    if (!producto) return false;

    const texto = producto.toLowerCase();
    const tipoMascotaNormalizado = normalizarTipoMascota(
      productoExistente.tipoMascota,
    ).toLowerCase();

    return (
      productoExistente.nombre?.toLowerCase().includes(texto) ||
      productoExistente.codigo?.toString().includes(texto) ||
      tipoMascotaNormalizado.includes(texto)
    );
  });

  const agregarItem = () => {
    if (!producto || !cantidad || !precioCosto) {
      alert("Complete marca, cantidad y costo");
      return;
    }

    const costo = Number(precioCosto);
    const cantidadNumero = Number(cantidad);

    if (cantidadNumero <= 0 || costo <= 0) {
      alert("Cantidad o costo inválido");
      return;
    }

    const subtotal = costo * cantidadNumero;
    const porcentaje = Number(ganancia);
    const precioVenta = costo + (costo * porcentaje) / 100;

    const productoExistente = productos.find((p) => {
      const mismoCodigo = p.codigo?.toString() === producto;
      const mismaMarca = p.nombre?.toLowerCase() === producto.toLowerCase();
      const mismoProveedor =
        !proveedor || p.marca?.toLowerCase() === proveedor.toLowerCase();
      const mismoKg = !kg || String(p.kg || "") === String(kg || "");
      const mismaMascota =
        !tipoMascota ||
        normalizarTipoMascota(p.tipoMascota) ===
          normalizarTipoMascota(tipoMascota);
      const mismaEtapa = !etapa || p.etapa === etapa;

      return (
        mismoCodigo ||
        (mismaMarca && mismoProveedor && mismoKg && mismaMascota && mismaEtapa)
      );
    });

    const nuevoItem = {
      id: Date.now(),
      codigo:
        productoExistente?.codigo ||
        Math.floor(100000 + Math.random() * 900000).toString(),
      nombre: productoExistente?.nombre || producto,
      cantidad: cantidadNumero,
      precioCosto: costo,
      subtotal,
      porcentaje,
      precioVenta: Math.round(precioVenta),
      kg: productoExistente?.kg || kg,
      tipoMascota: normalizarTipoMascota(
        productoExistente?.tipoMascota || tipoMascota,
      ),
      etapa: productoExistente?.etapa || etapa,
      imagen: productoExistente?.imagen || imagen || "",
    };

    setItemsCompra([...itemsCompra, nuevoItem]);

    setProducto("");
    setProductoSeleccionado(false);
    setCantidad("");
    setPrecioCosto("");
    setKg("");
    setTipoMascota("");
    setEtapa("");
    setImagen("");
  };

  const eliminarItem = (id: number) => {
    setItemsCompra(itemsCompra.filter((item) => item.id !== id));
  };

  const totalCompra = itemsCompra.reduce(
    (acc, item) => acc + Number(item.subtotal),
    0,
  );

  const deudaCompra =
    metodoPago === "Pendiente"
      ? totalCompra
      : metodoPago === "Entrega"
        ? totalCompra - Number(entrega || 0)
        : 0;

  const saldoFavorUsadoPreview =
    deudaCompra > 0 ? Math.min(saldoFavorProveedor, deudaCompra) : 0;

  const deudaConSaldoFavorPreview =
    deudaCompra - saldoFavorUsadoPreview <= 0
      ? 0
      : deudaCompra - saldoFavorUsadoPreview;

  const deudaFinal = deudaCompra <= 0 ? 0 : deudaCompra;

  const entregaFinal =
    metodoPago === "Pago Total"
      ? totalCompra
      : metodoPago === "Entrega"
        ? Number(entrega || 0)
        : 0;

  const estadoPago = deudaFinal <= 0 ? "Pagado" : "Pendiente";

  const finalizarCompra = async () => {
    if (!proveedor) {
      alert("Seleccione o ingrese proveedor");
      return;
    }

    if (itemsCompra.length === 0) {
      alert("Debe agregar marcas");
      return;
    }

    if (metodoPago === "Entrega") {
      if (!entrega || Number(entrega) <= 0) {
        alert("Ingrese el monto entregado");
        return;
      }

      if (Number(entrega) > totalCompra) {
        alert("La entrega no puede ser mayor al total");
        return;
      }
    }

    try {
      const nuevaCompra = {
        proveedor,
        factura,
        metodoPago,
        entrega: entregaFinal,
        deuda: deudaFinal,
        estadoPago,
        fecha: new Date().toLocaleString(),
        total: totalCompra,
        productos: itemsCompra.map((item) => ({
          codigo: item.codigo,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precioCosto: item.precioCosto,
          subtotal: item.subtotal,
          porcentaje: item.porcentaje,
          precioVenta: item.precioVenta,
          kg: item.kg,
          tipoMascota: normalizarTipoMascota(item.tipoMascota),
          etapa: item.etapa,
          imagen: item.imagen,
        })),
      };

      const res = await fetch("/api/compras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaCompra),
      });

      if (!res.ok) {
        throw new Error("Error al guardar compra");
      }

      await obtenerCompras();
      await obtenerProductos();
      await obtenerProveedores();

      limpiarFormulario();
      setAbrirModal(false);

      alert("Compra guardada correctamente");
    } catch (error) {
      console.log(error);
      alert("Error al guardar compra");
    }
  };

  const eliminarCompra = async (id: number) => {
    const confirmar = confirm("¿Eliminar compra y descontar stock?");
    if (!confirmar) return;

    try {
      const res = await fetch("/api/compras", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Error al eliminar compra");
      }

      await obtenerCompras();
      await obtenerProductos();
      await obtenerProveedores();

      alert("Compra eliminada correctamente");
    } catch (error) {
      console.log(error);
      alert("Error al eliminar compra");
    }
  };

  const obtenerProductosCompra = (compra: any) => {
    if (!compra?.productos) return [];

    try {
      if (typeof compra.productos === "string") {
        return JSON.parse(compra.productos || "[]");
      }

      if (Array.isArray(compra.productos)) {
        return compra.productos;
      }

      return [];
    } catch (error) {
      console.log("Error al leer productos de compra:", error);
      return [];
    }
  };

  const deudaProveedorPorNombre = proveedores.reduce(
    (acc: any, proveedorActual: any) => {
      acc[
        String(proveedorActual.nombre || "")
          .toLowerCase()
          .trim()
      ] = Number(proveedorActual.deuda || 0);

      return acc;
    },
    {},
  );

  const saldoFavorProveedorPorNombre = proveedores.reduce(
    (acc: any, proveedorActual: any) => {
      acc[
        String(proveedorActual.nombre || "")
          .toLowerCase()
          .trim()
      ] = Number(proveedorActual.saldoFavor || 0);

      return acc;
    },
    {},
  );

  const comprasAgrupadasPorProveedor = Object.values(
    compras.reduce((acc: any, compra: any) => {
      const nombreProveedor = compra.proveedor || "Sin proveedor";
      const claveProveedor = String(nombreProveedor || "")
        .toLowerCase()
        .trim();

      if (!acc[nombreProveedor]) {
        acc[nombreProveedor] = {
          proveedor: nombreProveedor,
          compras: [],
          totalCompras: 0,
          deudaTotal: deudaProveedorPorNombre[claveProveedor] || 0,
          saldoFavorTotal: saldoFavorProveedorPorNombre[claveProveedor] || 0,
          ultimaCompra: compra.fecha,
          ultimoId: compra.id,
        };
      }

      acc[nombreProveedor].compras.push(compra);
      acc[nombreProveedor].totalCompras += Number(compra.total || 0);
      acc[nombreProveedor].deudaTotal =
        deudaProveedorPorNombre[claveProveedor] || 0;
      acc[nombreProveedor].saldoFavorTotal =
        saldoFavorProveedorPorNombre[claveProveedor] || 0;

      if (Number(compra.id) > Number(acc[nombreProveedor].ultimoId)) {
        acc[nombreProveedor].ultimaCompra = compra.fecha;
        acc[nombreProveedor].ultimoId = compra.id;
      }

      return acc;
    }, {}),
  );

  return (
    <main className="pt-[120px] min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-black">Compras</h1>

        <button
          onClick={() => setAbrirModal(true)}
          className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800"
        >
          + Nueva Compra
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-8 overflow-x-auto">
        <h2 className="text-2xl font-bold text-black mb-6">
          Historial de Compras por Proveedor
        </h2>

        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">Proveedor</th>
              <th className="text-left p-3 text-black">Cantidad Compras</th>
              <th className="text-left p-3 text-black">Última Compra</th>
              <th className="text-left p-3 text-black">Total Comprado</th>
              <th className="text-left p-3 text-black">Deuda</th>
              <th className="text-left p-3 text-black">Saldo a favor</th>
              <th className="text-left p-3 text-black">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {comprasAgrupadasPorProveedor.map((grupo: any) => (
              <tr key={grupo.proveedor} className="border-b">
                <td className="p-3 text-black font-bold">{grupo.proveedor}</td>
                <td className="p-3 text-black">{grupo.compras.length}</td>
                <td className="p-3 text-black">{grupo.ultimaCompra || "-"}</td>
                <td className="p-3 text-green-600 font-bold">
                  ${grupo.totalCompras}
                </td>
                <td className="p-3 text-red-600 font-bold">
                  ${grupo.deudaTotal}
                </td>
                <td className="p-3 text-green-600 font-bold">
                  ${grupo.saldoFavorTotal || 0}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => {
                      setProveedorSeleccionado(grupo);
                      setModalComprasProveedor(true);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
                  >
                    Ver Compras
                  </button>
                </td>
              </tr>
            ))}

            {comprasAgrupadasPorProveedor.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 p-6">
                  No hay compras cargadas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {abrirModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[1100px] rounded-2xl p-8 max-h-[90vh] overflow-auto">
            <h2 className="text-3xl font-bold text-black mb-8">Nueva Compra</h2>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-black">Proveedor</h3>

                <button
                  onClick={() => setAbrirProveedores(!abrirProveedores)}
                  className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800"
                >
                  Buscar Proveedor
                </button>
              </div>

              {abrirProveedores && (
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Buscar proveedor por nombre o ID..."
                    value={proveedor}
                    onChange={(e) => {
                      const valor = e.target.value;
                      setProveedor(valor);

                      const proveedorExacto = proveedores.find(
                        (p) =>
                          p.nombre?.toLowerCase() === valor.toLowerCase() ||
                          p.id?.toString() === valor,
                      );

                      setSaldoFavorProveedor(
                        Number(proveedorExacto?.saldoFavor || 0),
                      );

                      const filtrados = proveedores.filter(
                        (p) =>
                          p.nombre
                            ?.toLowerCase()
                            .includes(valor.toLowerCase()) ||
                          p.id?.toString().includes(valor),
                      );

                      setProveedoresFiltrados(filtrados);
                    }}
                    className="border p-3 rounded-xl text-black w-full"
                  />

                  {proveedor && proveedoresFiltrados.length > 0 && (
                    <div className="absolute z-50 bg-white border rounded-xl w-full mt-1 shadow-lg max-h-60 overflow-auto">
                      {proveedoresFiltrados.map((proveedorEncontrado) => (
                        <button
                          key={proveedorEncontrado.id}
                          onClick={() => {
                            setProveedor(proveedorEncontrado.nombre);
                            setSaldoFavorProveedor(
                              Number(proveedorEncontrado.saldoFavor || 0),
                            );
                            setProveedoresFiltrados([]);
                            setAbrirProveedores(false);
                          }}
                          className="w-full text-left p-4 hover:bg-gray-100 border-b"
                        >
                          <div className="font-bold text-black">
                            {proveedorEncontrado.nombre}
                          </div>

                          <div className="text-sm text-gray-500">
                            ID: {proveedorEncontrado.id}
                          </div>

                          <div className="text-sm text-gray-500">
                            Tel: {proveedorEncontrado.telefono || "-"}
                          </div>

                          <div className="text-sm text-red-500">
                            Deuda: ${proveedorEncontrado.deuda || 0}
                          </div>

                          <div className="text-sm text-green-600">
                            Saldo a favor: $
                            {proveedorEncontrado.saldoFavor || 0}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {proveedor && (
                <div className="bg-gray-100 p-5 rounded-xl">
                  <p className="text-black">
                    <strong>Proveedor:</strong> {proveedor}
                  </p>

                  {saldoFavorProveedor > 0 && (
                    <p className="text-green-600 font-bold mt-2">
                      Saldo a favor disponible: ${saldoFavorProveedor}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
              <input
                type="text"
                placeholder="Factura"
                value={factura}
                onChange={(e) => setFactura(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />
            </div>

            <div className="bg-gray-100 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-black mb-4">
                Agregar Marca
              </h3>

              <div
                className="mb-4"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "50px minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    minWidth: "50px",
                    maxWidth: "50px",
                    overflow: "hidden",
                  }}
                >
                  <input
                    id="imagen-producto-compra"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const archivo = e.target.files?.[0];

                      if (archivo) {
                        subirImagen(archivo);
                      }
                    }}
                    style={{ display: "none" }}
                  />

                  <label
                    htmlFor="imagen-producto-compra"
                    className="rounded-lg border bg-white flex items-center justify-center hover:bg-gray-100 transition"
                    style={{
                      width: "50px",
                      height: "50px",
                      minWidth: "50px",
                      maxWidth: "50px",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    {imagen ? (
                      <img
                        src={imagen}
                        alt="Producto"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <span className="text-gray-400 text-[8px]">IMG</span>
                    )}
                  </label>
                </div>

                <div className="relative min-w-0">
                  <input
                    type="text"
                    placeholder="Marca o código"
                    value={producto}
                    onChange={(e) => {
                      setProducto(e.target.value);
                      setProductoSeleccionado(false);
                    }}
                    className="border p-3 rounded-xl text-black w-full"
                  />

                  {producto &&
                    !productoSeleccionado &&
                    productosFiltradosCompra.length > 0 && (
                      <div className="absolute z-50 bg-white border rounded-xl w-full mt-1 shadow-lg max-h-60 overflow-auto">
                        {productosFiltradosCompra.slice(0, 8).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => seleccionarProductoExistente(item)}
                            className="w-full text-left p-3 hover:bg-gray-100 border-b"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="overflow-hidden rounded-lg border bg-gray-100 flex items-center justify-center"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  minWidth: "50px",
                                  maxWidth: "50px",
                                }}
                              >
                                {item.imagen ? (
                                  <img
                                    src={item.imagen}
                                    alt={item.nombre}
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                      display: "block",
                                    }}
                                  />
                                ) : (
                                  <span className="text-gray-400 text-[10px]">
                                    IMG
                                  </span>
                                )}
                              </div>

                              <div>
                                <div className="font-bold text-black">
                                  {item.nombre}
                                </div>

                                <div className="text-sm text-gray-500">
                                  Código: {item.codigo} | Proveedor:{" "}
                                  {item.marca}
                                </div>

                                <div className="text-sm text-gray-500">
                                  KG: {item.kg || "-"} | Mascota:{" "}
                                  {normalizarTipoMascota(item.tipoMascota) ||
                                    "-"}{" "}
                                  | Etapa: {item.etapa || "-"} | Stock:{" "}
                                  {item.stock}
                                </div>

                                <div className="text-sm text-gray-500">
                                  Costo: ${item.precioCosto || 0} | Venta: $
                                  {item.precio || 0}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                <input
                  type="number"
                  placeholder="Cantidad"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="border p-3 rounded-xl text-black w-full min-w-0"
                />

                <input
                  type="number"
                  placeholder="Costo Unitario"
                  value={precioCosto}
                  onChange={(e) => setPrecioCosto(e.target.value)}
                  className="border p-3 rounded-xl text-black w-full min-w-0"
                />

                <select
                  value={ganancia}
                  onChange={(e) => setGanancia(e.target.value)}
                  className="border p-3 rounded-xl text-black w-full min-w-0"
                >
                  <option value="25">25% Ganancia</option>
                  <option value="30">30% Ganancia</option>
                  <option value="35">35% Ganancia</option>
                  <option value="40">40% Ganancia</option>
                  <option value="50">50% Ganancia</option>
                </select>
              </div>

              <div className="grid grid-cols-4 gap-4">
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
                  <option value="">Mascota</option>
                  <option value="Gatos">Gatos</option>
                  <option value="Perros">Perros</option>
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
                  <option value="Ambos">Ambos</option>
                  <option value="Bebé">Bebé</option>
                  <option value="Cachorro">Cachorro</option>
                </select>

                <button
                  onClick={agregarItem}
                  className="bg-black text-white rounded-xl hover:bg-gray-800"
                >
                  Agregar
                </button>
              </div>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-black">IMG</th>
                  <th className="text-left p-3 text-black">Código</th>
                  <th className="text-left p-3 text-black">Marca</th>
                  <th className="text-left p-3 text-black">KG</th>
                  <th className="text-left p-3 text-black">Mascota</th>
                  <th className="text-left p-3 text-black">Etapa</th>
                  <th className="text-left p-3 text-black">Cantidad</th>
                  <th className="text-left p-3 text-black">Costo</th>
                  <th className="text-left p-3 text-black">Subtotal</th>
                  <th className="text-left p-3 text-black">Venta</th>
                  <th className="text-left p-3 text-black">Acción</th>
                </tr>
              </thead>

              <tbody>
                {itemsCompra.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-3">
                      <div
                        className="overflow-hidden rounded-lg border bg-gray-100 flex items-center justify-center"
                        style={{
                          width: "50px",
                          height: "50px",
                          minWidth: "50px",
                          maxWidth: "50px",
                        }}
                      >
                        {item.imagen ? (
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : (
                          <span className="text-gray-400 text-[10px]">IMG</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-black">{item.codigo}</td>
                    <td className="p-3 text-black">{item.nombre}</td>
                    <td className="p-3 text-black">{item.kg}</td>
                    <td className="p-3 text-black">
                      {normalizarTipoMascota(item.tipoMascota)}
                    </td>
                    <td className="p-3 text-black">{item.etapa}</td>
                    <td className="p-3 text-black">{item.cantidad}</td>
                    <td className="p-3 text-black">${item.precioCosto}</td>
                    <td className="p-3 text-black">${item.subtotal}</td>
                    <td className="p-3 text-green-600 font-bold">
                      ${item.precioVenta}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => eliminarItem(item.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bg-gray-100 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-black mb-4">
                Pago de Compra
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <select
                  value={metodoPago}
                  onChange={(e) => {
                    setMetodoPago(e.target.value);
                    setEntrega("");
                  }}
                  className="border p-3 rounded-xl text-black"
                >
                  <option value="Pago Total">Pago Total</option>
                  <option value="Entrega">Entrega</option>
                  <option value="Pendiente">Pendiente</option>
                </select>

                <input
                  type="number"
                  placeholder="Monto entregado"
                  value={entrega}
                  onChange={(e) => setEntrega(e.target.value)}
                  disabled={metodoPago !== "Entrega"}
                  className="border p-3 rounded-xl text-black disabled:bg-gray-200"
                />

                <div className="bg-white rounded-xl p-3">
                  <p className="text-black font-bold">Deuda: ${deudaFinal}</p>

                  {saldoFavorProveedor > 0 && deudaFinal > 0 && (
                    <>
                      <p className="text-green-600 font-bold mt-1">
                        Saldo a favor disponible: ${saldoFavorProveedor}
                      </p>

                      <p className="text-blue-600 font-bold mt-1">
                        Deuda estimada aplicando saldo: $
                        {deudaConSaldoFavorPreview}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-black">
                TOTAL: ${totalCompra}
              </h2>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    limpiarFormulario();
                    setAbrirModal(false);
                  }}
                  className="bg-gray-300 text-black px-6 py-3 rounded-xl"
                >
                  Cancelar
                </button>

                <button
                  onClick={finalizarCompra}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
                >
                  Finalizar Compra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalComprasProveedor && proveedorSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[1000px] rounded-2xl p-8 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-black">
                  Compras de {proveedorSeleccionado.proveedor}
                </h2>

                <p className="text-gray-500 mt-2">
                  Total compras: {proveedorSeleccionado.compras.length}
                </p>

                <p className="text-gray-500">
                  Total comprado: ${proveedorSeleccionado.totalCompras}
                </p>

                <p className="text-red-500 font-bold">
                  Deuda total: ${proveedorSeleccionado.deudaTotal}
                </p>

                <p className="text-green-600 font-bold">
                  Saldo a favor: ${proveedorSeleccionado.saldoFavorTotal || 0}
                </p>
              </div>

              <button
                onClick={() => {
                  setModalComprasProveedor(false);
                  setProveedorSeleccionado(null);
                }}
                className="bg-red-500 text-white px-5 py-3 rounded-xl hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-black">ID</th>
                  <th className="text-left p-3 text-black">Factura</th>
                  <th className="text-left p-3 text-black">Fecha</th>
                  <th className="text-left p-3 text-black">Pago</th>
                  <th className="text-left p-3 text-black">Deuda</th>
                  <th className="text-left p-3 text-black">Total</th>
                  <th className="text-left p-3 text-black">Acción</th>
                </tr>
              </thead>

              <tbody>
                {proveedorSeleccionado.compras.map((compra: any) => (
                  <tr key={compra.id} className="border-b">
                    <td className="p-3 text-black">#{compra.id}</td>
                    <td className="p-3 text-black">{compra.factura || "-"}</td>
                    <td className="p-3 text-black">{compra.fecha}</td>
                    <td className="p-3 text-black">{compra.metodoPago}</td>
                    <td className="p-3 text-red-600 font-bold">
                      ${compra.deuda || 0}
                    </td>
                    <td className="p-3 text-green-600 font-bold">
                      ${compra.total}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => {
                          setCompraSeleccionada(compra);
                          setModalDetalle(true);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
                      >
                        Ver
                      </button>

                      <button
                        onClick={() => eliminarCompra(compra.id)}
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
        </div>
      )}

      {modalDetalle && compraSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white w-[1000px] rounded-2xl p-8 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-black">
                  Detalle Compra
                </h2>

                <p className="text-gray-500 mt-2">
                  Proveedor: {compraSeleccionada.proveedor}
                </p>

                <p className="text-gray-500">
                  Factura: {compraSeleccionada.factura || "-"}
                </p>

                <p className="text-gray-500">
                  Fecha: {compraSeleccionada.fecha}
                </p>

                <p className="text-gray-500">
                  Pago: {compraSeleccionada.metodoPago || "-"}
                </p>

                <p className="text-gray-500">
                  Entrega: ${compraSeleccionada.entrega || 0}
                </p>

                <p className="text-gray-500">
                  Deuda: ${compraSeleccionada.deuda || 0}
                </p>
              </div>

              <button
                onClick={() => {
                  setModalDetalle(false);
                  setCompraSeleccionada(null);
                }}
                className="bg-red-500 text-white px-5 py-3 rounded-xl hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-black">IMG</th>
                  <th className="text-left p-3 text-black">Código</th>
                  <th className="text-left p-3 text-black">Marca</th>
                  <th className="text-left p-3 text-black">KG</th>
                  <th className="text-left p-3 text-black">Mascota</th>
                  <th className="text-left p-3 text-black">Etapa</th>
                  <th className="text-left p-3 text-black">Cantidad</th>
                  <th className="text-left p-3 text-black">Costo</th>
                  <th className="text-left p-3 text-black">Venta</th>
                </tr>
              </thead>

              <tbody>
                {obtenerProductosCompra(compraSeleccionada).map(
                  (item: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">
                        {item.imagen ? (
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            className="w-12 h-12 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg border bg-gray-100 flex items-center justify-center text-gray-400 text-[10px]">
                            IMG
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-black">{item.codigo}</td>
                      <td className="p-3 text-black">{item.nombre}</td>
                      <td className="p-3 text-black">{item.kg}</td>
                      <td className="p-3 text-black">
                        {normalizarTipoMascota(item.tipoMascota)}
                      </td>
                      <td className="p-3 text-black">{item.etapa}</td>
                      <td className="p-3 text-black">{item.cantidad}</td>
                      <td className="p-3 text-black">${item.precioCosto}</td>
                      <td className="p-3 text-green-600 font-bold">
                        ${item.precioVenta}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            <div className="mt-8">
              <h2 className="text-3xl font-bold text-black">
                TOTAL: ${compraSeleccionada.total}
              </h2>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
