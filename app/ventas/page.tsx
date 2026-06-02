"use client";

import React, { useEffect, useState } from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function VentasPage() {
  const [productosDisponibles, setProductosDisponibles] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<any[]>([]);
  const [abrirClientes, setAbrirClientes] = useState(false);

  const [cliente, setCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");

  const [metodoPago, setMetodoPago] = useState("");
  const [entrega, setEntrega] = useState("");
  const [envio, setEnvio] = useState("");
  const [montoRecibido, setMontoRecibido] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [carrito, setCarrito] = useState<any[]>([]);

  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState("");

  const [historialVentas, setHistorialVentas] = useState<any[]>([]);

  const [modalDetalleVenta, setModalDetalleVenta] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any>(null);

  const [modalPagarDeuda, setModalPagarDeuda] = useState(false);
  const [deudaSeleccionada, setDeudaSeleccionada] = useState<any>(null);
  const [metodoPagoDeuda, setMetodoPagoDeuda] = useState("");
  const [montoPagoDeuda, setMontoPagoDeuda] = useState("");

  const redondear = (numero: number) => {
    return Number(Number(numero || 0).toFixed(2));
  };

  const formatearNumero = (numero: number) => {
    const redondeado = redondear(numero);

    return Number.isInteger(redondeado)
      ? redondeado.toString()
      : redondeado.toFixed(2);
  };

  const obtenerClientes = async () => {
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerProductos = async () => {
    try {
      const res = await fetch("/api/productos");
      const data = await res.json();
      setProductosDisponibles(data);
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerVentas = async () => {
    try {
      const res = await fetch("/api/ventas");
      const data = await res.json();
      setHistorialVentas(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerClientes();
    obtenerProductos();
    obtenerVentas();
  }, []);

  const nombreProductoVenta = (producto: any) => {
    return `${producto.nombre || ""} ${producto.tipoMascota || ""} ${
      producto.etapa || ""
    } ${producto.kg ? `${producto.kg}kg` : ""}`.trim();
  };

  const productosFiltrados = productosDisponibles.filter((producto) => {
    const texto = busqueda.toLowerCase();
    const nombreCompleto = nombreProductoVenta(producto).toLowerCase();

    return (
      nombreCompleto.includes(texto) ||
      producto.nombre?.toLowerCase().includes(texto) ||
      producto.tipoMascota?.toLowerCase().includes(texto) ||
      producto.etapa?.toLowerCase().includes(texto) ||
      producto.kg?.toString().toLowerCase().includes(texto) ||
      producto.codigo?.toString().includes(texto)
    );
  });

  const agregarProducto = (producto: any) => {
    if (cantidad <= 0) {
      alert("Cantidad inválida");
      return;
    }

    if (cantidad > Number(producto.stock)) {
      alert("Stock insuficiente");
      return;
    }

    const nombreVisible = nombreProductoVenta(producto);

    const precioVenta = Number(producto.precio || 0);
    const precioCosto = Number(producto.precioCosto || 0);
    const cantidadProducto = Number(cantidad || 0);
    const totalProducto = redondear(cantidadProducto * precioVenta);
    const costoProducto = redondear(cantidadProducto * precioCosto);
    const gananciaProducto = redondear(totalProducto - costoProducto);

    const nuevoProducto = {
      id: producto.codigo,
      producto: nombreVisible,
      cantidad: cantidadProducto,
      precio: precioVenta,
      precioCosto,
      total: totalProducto,
      costoTotal: costoProducto,
      ganancia: gananciaProducto,
      imagen: producto.imagen || "",
    };

    setCarrito([...carrito, nuevoProducto]);
    setBusqueda("");
    setCantidad(1);
  };

  const subtotalSinDescuento = redondear(
    carrito.reduce((acc, item) => acc + Number(item.total), 0),
  );

  const descuentoNumero = Number(descuentoPorcentaje || 0);

  const montoDescuento =
    descuentoNumero > 0
      ? redondear((subtotalSinDescuento * descuentoNumero) / 100)
      : 0;

  const envioNumero = redondear(Number(envio || 0));

  const totalFinal = redondear(
    Math.max(subtotalSinDescuento - montoDescuento + envioNumero, 0),
  );

  const costoTotalCarrito = redondear(
    carrito.reduce((acc, item) => acc + Number(item.costoTotal || 0), 0),
  );

  const gananciaSinDescuento = redondear(
    subtotalSinDescuento - costoTotalCarrito,
  );

  const gananciaFinal = redondear(totalFinal - costoTotalCarrito);

  const montoEntrega = redondear(Number(entrega || 0));
  const recibidoNumero = redondear(Number(montoRecibido || 0));

  const vuelto =
    metodoPago === "Efectivo"
      ? redondear(Math.max(recibidoNumero - totalFinal, 0))
      : 0;

  const deudaVenta =
    metodoPago === "Fiado"
      ? totalFinal
      : metodoPago === "Entrega"
        ? redondear(totalFinal - montoEntrega)
        : 0;

  const obtenerProductosVenta = (venta: any) => {
    if (!venta?.productos) return [];

    try {
      if (typeof venta.productos === "string") {
        return JSON.parse(venta.productos || "[]");
      }

      if (Array.isArray(venta.productos)) {
        return venta.productos;
      }

      return [];
    } catch (error) {
      console.log("Error al leer productos:", error);
      return [];
    }
  };

  const generarPDF = () => {
    const numeroRemito = Math.floor(100000 + Math.random() * 900000);

    const doc = new jsPDF();

    doc.setFontSize(24);
    doc.text("ANIMARIA", 14, 20);

    doc.setFontSize(12);
    doc.text(`Remito N°: ${numeroRemito}`, 14, 32);
    doc.text(`Cliente: ${cliente}`, 14, 42);
    doc.text(`Teléfono: ${telefono}`, 14, 50);
    doc.text(`Dirección: ${direccion}`, 14, 58);
    doc.text(`Ciudad: ${ciudad}`, 14, 66);
    doc.text(`Provincia: ${provincia}`, 14, 74);
    doc.text(`Método de Pago: ${metodoPago}`, 14, 82);

    autoTable(doc, {
      startY: 95,
      head: [["Código", "Producto", "Cant", "Precio", "Total"]],
      body: carrito.map((item) => [
        item.id,
        item.producto,
        item.cantidad,
        `$${formatearNumero(item.precio)}`,
        `$${formatearNumero(item.total)}`,
      ]),
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;

    doc.setFontSize(14);

    doc.text(`SUBTOTAL: $${formatearNumero(subtotalSinDescuento)}`, 14, finalY);
    doc.text(
      `DESCUENTO: ${formatearNumero(descuentoNumero)}% - $${formatearNumero(
        montoDescuento,
      )}`,
      14,
      finalY + 10,
    );
    doc.text(`ENVÍO: $${formatearNumero(envioNumero)}`, 14, finalY + 20);
    doc.text(`TOTAL: $${formatearNumero(totalFinal)}`, 14, finalY + 30);

    if (metodoPago === "Efectivo") {
      doc.text(
        `RECIBIDO: $${formatearNumero(recibidoNumero)}`,
        14,
        finalY + 40,
      );
      doc.text(`VUELTO: $${formatearNumero(vuelto)}`, 14, finalY + 50);
    }

    if (metodoPago === "Entrega") {
      doc.text(`ENTREGA: $${formatearNumero(montoEntrega)}`, 14, finalY + 40);
      doc.text(`DEUDA: $${formatearNumero(deudaVenta)}`, 14, finalY + 50);
    }

    if (metodoPago === "Fiado") {
      doc.text(`DEUDA: $${formatearNumero(deudaVenta)}`, 14, finalY + 40);
    }

    doc.autoPrint();
    window.open(doc.output("bloburl"));
    doc.save(`Remito-${numeroRemito}.pdf`);
  };

  const limpiarVenta = () => {
    setCarrito([]);
    setCliente("");
    setTelefono("");
    setDireccion("");
    setCiudad("");
    setProvincia("");
    setMetodoPago("");
    setEntrega("");
    setEnvio("");
    setMontoRecibido("");
    setBusqueda("");
    setCantidad(1);
    setDescuentoPorcentaje("");
    setClientesFiltrados([]);
    setAbrirClientes(false);
  };

  const finalizarVenta = async () => {
    if (carrito.length === 0) {
      alert("Debe agregar productos");
      return;
    }

    if (!cliente) {
      alert("Debe seleccionar un cliente");
      return;
    }

    if (!metodoPago) {
      alert("Debe seleccionar método de pago");
      return;
    }

    if (descuentoNumero < 0 || descuentoNumero > 100) {
      alert("El descuento debe estar entre 0 y 100");
      return;
    }

    if (envioNumero < 0) {
      alert("El envío no puede ser negativo");
      return;
    }

    if (
      metodoPago === "Entrega" &&
      (montoEntrega <= 0 || montoEntrega > totalFinal)
    ) {
      alert("Monto de entrega inválido");
      return;
    }

    if (
      metodoPago === "Efectivo" &&
      montoRecibido &&
      recibidoNumero < totalFinal
    ) {
      alert("El monto recibido no puede ser menor al total");
      return;
    }

    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente,
          telefono,
          direccion,
          ciudad,
          provincia,
          metodoPago,
          subtotal: totalFinal,
          subtotalSinDescuento,
          descuentoPorcentaje: descuentoNumero,
          envio: envioNumero,
          montoRecibido: metodoPago === "Efectivo" ? recibidoNumero : 0,
          vuelto: metodoPago === "Efectivo" ? vuelto : 0,
          entrega: metodoPago === "Entrega" ? montoEntrega : 0,
          deuda: deudaVenta > 0 ? deudaVenta : 0,
          total: totalFinal,
          costoTotal: costoTotalCarrito,
          gananciaTotal: gananciaFinal,
          productos: carrito,
          fecha: new Date().toLocaleString(),
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar venta");
      }

      await obtenerVentas();
      await obtenerProductos();
      await obtenerClientes();

      const deseaImprimir = confirm(
        "Venta cargada correctamente.\n\n¿Desea imprimir el remito?",
      );

      if (deseaImprimir) {
        generarPDF();
      }

      limpiarVenta();
    } catch (error) {
      console.log(error);
      alert("Error al finalizar venta");
    }
  };

  const eliminarVenta = async (id: number) => {
    const confirmar = confirm("¿Eliminar venta y restaurar stock?");

    if (!confirmar) return;

    try {
      const res = await fetch("/api/ventas", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Error al eliminar venta");
      }

      await obtenerVentas();
      await obtenerProductos();
      await obtenerClientes();

      alert("Venta eliminada correctamente");
    } catch (error) {
      console.log(error);
      alert("Error al eliminar venta");
    }
  };

  const abrirModalPago = (venta: any) => {
    setDeudaSeleccionada(venta);
    setMetodoPagoDeuda("");
    setMontoPagoDeuda(String(venta.deuda || ""));
    setModalPagarDeuda(true);
  };

  const pagarDeuda = async () => {
    if (!deudaSeleccionada) return;

    if (!metodoPagoDeuda) {
      alert("Seleccione método de pago");
      return;
    }

    const monto = Number(montoPagoDeuda || 0);

    if (monto <= 0) {
      alert("Ingrese un monto válido");
      return;
    }

    try {
      const res = await fetch("/api/ventas", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: deudaSeleccionada.id,
          monto,
          metodoPago: metodoPagoDeuda,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al pagar deuda");
      }

      await obtenerVentas();
      await obtenerClientes();

      setModalPagarDeuda(false);
      setDeudaSeleccionada(null);
      setMetodoPagoDeuda("");
      setMontoPagoDeuda("");

      alert("Pago registrado correctamente");
    } catch (error) {
      console.log(error);
      alert("Error al pagar deuda");
    }
  };

  const ventasConDeuda = historialVentas.filter(
    (venta) => Number(venta.deuda || 0) > 0,
  );

  const saldoRestante =
    deudaSeleccionada && montoPagoDeuda
      ? redondear(
          Number(deudaSeleccionada.deuda || 0) - Number(montoPagoDeuda || 0),
        )
      : deudaSeleccionada
        ? Number(deudaSeleccionada.deuda || 0)
        : 0;

  return (
    <main className="pt-[120px] min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-black mb-8">Nueva Venta</h1>

      <div className="bg-white p-8 rounded-2xl shadow mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Cliente</h2>

          <button
            onClick={() => setAbrirClientes(!abrirClientes)}
            className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800"
          >
            Buscar Cliente
          </button>
        </div>

        {abrirClientes && (
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Buscar cliente por nombre o código..."
              value={cliente}
              onChange={(e) => {
                const valor = e.target.value;
                setCliente(valor);

                const filtrados = clientes.filter(
                  (c) =>
                    c.nombre?.toLowerCase().includes(valor.toLowerCase()) ||
                    c.codigo?.toString().includes(valor),
                );

                setClientesFiltrados(filtrados);
              }}
              className="border p-3 rounded-xl text-black w-full"
            />

            {cliente && clientesFiltrados.length > 0 && (
              <div className="absolute z-50 bg-white border rounded-xl w-full mt-1 shadow-lg max-h-60 overflow-auto">
                {clientesFiltrados.map((clienteEncontrado) => (
                  <button
                    key={clienteEncontrado.id}
                    onClick={() => {
                      setCliente(clienteEncontrado.nombre);
                      setTelefono(clienteEncontrado.telefono || "");
                      setDireccion(clienteEncontrado.direccion || "");
                      setCiudad(clienteEncontrado.ciudad || "");
                      setProvincia(clienteEncontrado.provincia || "");
                      setClientesFiltrados([]);
                      setAbrirClientes(false);
                    }}
                    className="w-full text-left p-4 hover:bg-gray-100 border-b"
                  >
                    <div className="font-bold text-black">
                      {clienteEncontrado.nombre}
                    </div>

                    <div className="text-sm text-gray-500">
                      Código: {clienteEncontrado.codigo}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {cliente && (
          <div className="bg-gray-100 p-5 rounded-xl">
            <p className="text-black">
              <strong>Cliente:</strong> {cliente}
            </p>

            <p className="text-black">
              <strong>Teléfono:</strong> {telefono}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow">
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border p-3 rounded-xl text-black flex-1"
          />

          <input
            type="number"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            className="border p-3 rounded-xl text-black w-40"
          />
        </div>

        {busqueda && (
          <div className="border rounded-xl overflow-hidden">
            {productosFiltrados.map((producto) => (
              <button
                key={producto.id}
                onClick={() => agregarProducto(producto)}
                className="w-full text-left p-4 hover:bg-gray-100 border-b"
              >
                <div className="flex items-center gap-4">
                  <div className="min-w-[50px] max-w-[50px] min-h-[50px] max-h-[50px] overflow-hidden rounded-xl border bg-gray-100 flex items-center justify-center">
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
                      <span className="text-gray-400 text-xs">Sin img</span>
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-black text-lg">
                      {nombreProductoVenta(producto)}
                    </div>

                    <div className="text-green-600 font-bold">
                      ${formatearNumero(producto.precio || 0)}
                    </div>

                    <div className="text-sm text-gray-500">
                      Stock: {producto.stock}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {productosFiltrados.length === 0 && (
              <div className="p-4 text-gray-500">
                No se encontraron productos
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow mt-8">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">Imagen</th>
              <th className="text-left p-3 text-black">Código</th>
              <th className="text-left p-3 text-black">Producto</th>
              <th className="text-left p-3 text-black">Cantidad</th>
              <th className="text-left p-3 text-black">Precio</th>
              <th className="text-left p-3 text-black">Costo</th>
              <th className="text-left p-3 text-black">Ganancia</th>
              <th className="text-left p-3 text-black">Total</th>
              <th className="text-left p-3 text-black">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {carrito.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">
                  <div className="min-w-[50px] max-w-[50px] min-h-[50px] max-h-[50px] overflow-hidden rounded-xl border bg-gray-100 flex items-center justify-center">
                    {item.imagen ? (
                      <img
                        src={item.imagen}
                        alt={item.producto}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">Sin img</span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-black">{item.id}</td>
                <td className="p-3 text-black">{item.producto}</td>
                <td className="p-3 text-black">{item.cantidad}</td>
                <td className="p-3 text-black">
                  ${formatearNumero(item.precio)}
                </td>
                <td className="p-3 text-black">
                  ${formatearNumero(item.costoTotal || 0)}
                </td>
                <td className="p-3 text-green-600 font-bold">
                  ${formatearNumero(item.ganancia || 0)}
                </td>
                <td className="p-3 text-black">
                  ${formatearNumero(item.total)}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => {
                      const nuevoCarrito = carrito.filter(
                        (_, i) => i !== index,
                      );

                      setCarrito(nuevoCarrito);
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 border rounded-2xl p-6">
          <h2 className="text-3xl font-bold text-black mb-4">
            TOTAL: ${formatearNumero(totalFinal)}
          </h2>

          <div className="bg-gray-100 border rounded-xl p-4 mb-6">
            <p className="text-black font-bold">
              Subtotal: ${formatearNumero(subtotalSinDescuento)}
            </p>

            <p className="text-red-600 font-bold mt-2">
              Descuento: {formatearNumero(descuentoNumero)}% - $
              {formatearNumero(montoDescuento)}
            </p>

            <p className="text-black font-bold mt-2">
              Envío: ${formatearNumero(envioNumero)}
            </p>

            <p className="text-black font-bold mt-2">
              Costo productos: ${formatearNumero(costoTotalCarrito)}
            </p>

            <p className="text-green-600 font-bold mt-2">
              Ganancia sin descuento: ${formatearNumero(gananciaSinDescuento)}
            </p>

            <p className="text-green-700 font-bold mt-2">
              Ganancia final: ${formatearNumero(gananciaFinal)}
            </p>

            <p className="text-green-600 font-bold mt-2">
              Total final: ${formatearNumero(totalFinal)}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <select
              value={metodoPago}
              onChange={(e) => {
                setMetodoPago(e.target.value);
                setMontoRecibido("");
              }}
              className="border p-3 rounded-xl text-black"
            >
              <option value="">Método de Pago</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Débito">Débito</option>
              <option value="Crédito">Crédito</option>
              <option value="Fiado">Fiado</option>
              <option value="Entrega">Entrega</option>
            </select>

            <input
              type="number"
              placeholder="Descuento %"
              value={descuentoPorcentaje}
              onChange={(e) => setDescuentoPorcentaje(e.target.value)}
              className="border p-3 rounded-xl text-black"
            />

            <input
              type="number"
              placeholder="Envío a domicilio $"
              value={envio}
              onChange={(e) => setEnvio(e.target.value)}
              className="border p-3 rounded-xl text-black"
            />

            {metodoPago === "Efectivo" && (
              <input
                type="number"
                placeholder="Monto recibido"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />
            )}

            {metodoPago === "Entrega" && (
              <input
                type="number"
                placeholder="Monto entregado"
                value={entrega}
                onChange={(e) => setEntrega(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />
            )}
          </div>

          {metodoPago === "Efectivo" && montoRecibido && (
            <div className="bg-green-100 border border-green-300 rounded-xl p-4 mb-6">
              <p className="text-black font-bold">
                Recibido: ${formatearNumero(recibidoNumero)}
              </p>

              <p className="text-green-700 font-bold mt-2 text-xl">
                Vuelto: ${formatearNumero(vuelto)}
              </p>
            </div>
          )}

          {(metodoPago === "Entrega" || metodoPago === "Fiado") && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 mb-6">
              <p className="text-black font-bold">
                Entrega: $
                {metodoPago === "Entrega" ? formatearNumero(montoEntrega) : 0}
              </p>

              <p className="text-red-600 font-bold mt-2">
                Deuda: ${deudaVenta > 0 ? formatearNumero(deudaVenta) : 0}
              </p>
            </div>
          )}

          <button
            onClick={finalizarVenta}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
          >
            Finalizar Venta
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow mt-8">
        <h2 className="text-3xl font-bold text-black mb-6">
          Historial de Ventas
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">Cliente</th>
              <th className="text-left p-3 text-black">Fecha</th>
              <th className="text-left p-3 text-black">Subtotal</th>
              <th className="text-left p-3 text-black">Desc.</th>
              <th className="text-left p-3 text-black">Envío</th>
              <th className="text-left p-3 text-black">Total</th>
              <th className="text-left p-3 text-black">Costo</th>
              <th className="text-left p-3 text-black">Ganancia</th>
              <th className="text-left p-3 text-black">Deuda</th>
              <th className="text-left p-3 text-black">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {historialVentas.map((venta) => (
              <tr key={venta.id} className="border-b">
                <td className="p-3 text-black font-bold">{venta.cliente}</td>
                <td className="p-3 text-black">{venta.fecha}</td>

                <td className="p-3 text-black">
                  $
                  {formatearNumero(
                    Number(
                      venta.subtotalSinDescuento ||
                        venta.subtotal ||
                        venta.total ||
                        0,
                    ),
                  )}
                </td>

                <td className="p-3 text-red-600 font-bold">
                  {formatearNumero(Number(venta.descuentoPorcentaje || 0))}%
                </td>

                <td className="p-3 text-black font-bold">
                  ${formatearNumero(Number(venta.envio || 0))}
                </td>

                <td className="p-3 text-green-600 font-bold">
                  ${formatearNumero(Number(venta.total || 0))}
                </td>

                <td className="p-3 text-black font-bold">
                  ${formatearNumero(Number(venta.costoTotal || 0))}
                </td>

                <td className="p-3 text-green-700 font-bold">
                  ${formatearNumero(Number(venta.gananciaTotal || 0))}
                </td>

                <td className="p-3 text-red-600 font-bold">
                  ${formatearNumero(Number(venta.deuda || 0))}
                </td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => {
                      setVentaSeleccionada(venta);
                      setModalDetalleVenta(true);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
                  >
                    Ver
                  </button>

                  <button
                    onClick={() => eliminarVenta(venta.id)}
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

      <div className="bg-white p-8 rounded-2xl shadow mt-8">
        <h2 className="text-3xl font-bold text-red-600 mb-6">
          Deudas Pendientes
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">Cliente</th>
              <th className="text-left p-3 text-black">Fecha</th>
              <th className="text-left p-3 text-black">Deuda</th>
              <th className="text-left p-3 text-black">Acción</th>
            </tr>
          </thead>

          <tbody>
            {ventasConDeuda.map((venta) => (
              <tr key={venta.id} className="border-b">
                <td className="p-3 text-black">{venta.cliente}</td>
                <td className="p-3 text-black">{venta.fecha}</td>

                <td className="p-3 text-red-600 font-bold">
                  ${formatearNumero(Number(venta.deuda || 0))}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => abrirModalPago(venta)}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
                  >
                    Pagar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalDetalleVenta && ventaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[1000px] rounded-2xl p-8 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-black">
                  Detalle de Venta
                </h2>

                <p className="text-gray-500 mt-2">
                  Cliente: {ventaSeleccionada.cliente}
                </p>

                <p className="text-gray-500">
                  Fecha: {ventaSeleccionada.fecha}
                </p>

                <p className="text-gray-500">
                  Método: {ventaSeleccionada.metodoPago}
                </p>

                <p className="text-gray-500">
                  Descuento:{" "}
                  {formatearNumero(
                    Number(ventaSeleccionada.descuentoPorcentaje || 0),
                  )}
                  %
                </p>

                <p className="text-gray-500">
                  Envío: $
                  {formatearNumero(Number(ventaSeleccionada.envio || 0))}
                </p>

                <p className="text-gray-500">
                  Recibido: $
                  {formatearNumero(
                    Number(ventaSeleccionada.montoRecibido || 0),
                  )}
                </p>

                <p className="text-gray-500">
                  Vuelto: $
                  {formatearNumero(Number(ventaSeleccionada.vuelto || 0))}
                </p>
              </div>

              <button
                onClick={() => {
                  setModalDetalleVenta(false);
                  setVentaSeleccionada(null);
                }}
                className="bg-red-500 text-white px-5 py-3 rounded-xl hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-black">Imagen</th>
                  <th className="text-left p-3 text-black">Código</th>
                  <th className="text-left p-3 text-black">Producto</th>
                  <th className="text-left p-3 text-black">Cantidad</th>
                  <th className="text-left p-3 text-black">Precio</th>
                  <th className="text-left p-3 text-black">Costo</th>
                  <th className="text-left p-3 text-black">Ganancia</th>
                  <th className="text-left p-3 text-black">Total</th>
                </tr>
              </thead>

              <tbody>
                {obtenerProductosVenta(ventaSeleccionada).map(
                  (item: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">
                        {item.imagen ? (
                          <img
                            src={item.imagen}
                            alt={item.producto}
                            className="w-[50px] h-[50px] object-cover rounded-xl border"
                          />
                        ) : (
                          <div className="w-[50px] h-[50px] rounded-xl border bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            Sin img
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-black">{item.id}</td>
                      <td className="p-3 text-black">{item.producto}</td>
                      <td className="p-3 text-black">{item.cantidad}</td>
                      <td className="p-3 text-black">
                        ${formatearNumero(Number(item.precio || 0))}
                      </td>
                      <td className="p-3 text-black">
                        ${formatearNumero(Number(item.costoTotal || 0))}
                      </td>
                      <td className="p-3 text-green-700 font-bold">
                        $
                        {formatearNumero(
                          Number(
                            item.ganancia ||
                              Number(item.total || 0) -
                                Number(item.costoTotal || 0),
                          ),
                        )}
                      </td>
                      <td className="p-3 text-green-600 font-bold">
                        ${formatearNumero(Number(item.total || 0))}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-black">
                SUBTOTAL: $
                {formatearNumero(
                  Number(
                    ventaSeleccionada.subtotalSinDescuento ||
                      ventaSeleccionada.subtotal ||
                      ventaSeleccionada.total ||
                      0,
                  ),
                )}
              </h2>

              <h2 className="text-xl font-bold text-red-600 mt-2">
                DESCUENTO:{" "}
                {formatearNumero(
                  Number(ventaSeleccionada.descuentoPorcentaje || 0),
                )}
                %
              </h2>

              <h2 className="text-xl font-bold text-black mt-2">
                ENVÍO: ${formatearNumero(Number(ventaSeleccionada.envio || 0))}
              </h2>

              <h2 className="text-xl font-bold text-black mt-2">
                COSTO: $
                {formatearNumero(Number(ventaSeleccionada.costoTotal || 0))}
              </h2>

              <h2 className="text-2xl font-bold text-green-700 mt-2">
                GANANCIA: $
                {formatearNumero(Number(ventaSeleccionada.gananciaTotal || 0))}
              </h2>

              <h2 className="text-3xl font-bold text-black mt-2">
                TOTAL: ${formatearNumero(Number(ventaSeleccionada.total || 0))}
              </h2>

              <h2 className="text-2xl font-bold text-red-600 mt-2">
                DEUDA: ${formatearNumero(Number(ventaSeleccionada.deuda || 0))}
              </h2>
            </div>
          </div>
        </div>
      )}

      {modalPagarDeuda && deudaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[600px] rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-black mb-6">Pagar Deuda</h2>

            <div className="bg-gray-100 rounded-xl p-5 mb-6">
              <p className="text-black">
                <strong>Cliente:</strong> {deudaSeleccionada.cliente}
              </p>

              <p className="text-black mt-2">
                <strong>Deuda actual:</strong> $
                {formatearNumero(Number(deudaSeleccionada.deuda || 0))}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <select
                value={metodoPagoDeuda}
                onChange={(e) => setMetodoPagoDeuda(e.target.value)}
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
                value={montoPagoDeuda}
                onChange={(e) => setMontoPagoDeuda(e.target.value)}
                className="border p-3 rounded-xl text-black"
              />
            </div>

            <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 mb-6">
              <p className="text-black font-bold">
                Entrega: ${formatearNumero(Number(montoPagoDeuda || 0))}
              </p>

              <p className="text-red-600 font-bold mt-2">
                Saldo restante: $
                {saldoRestante <= 0 ? 0 : formatearNumero(saldoRestante)}
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setModalPagarDeuda(false);
                  setDeudaSeleccionada(null);
                  setMetodoPagoDeuda("");
                  setMontoPagoDeuda("");
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
