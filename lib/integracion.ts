import pool from "@/lib/mysql";

export const redondear = (numero: number) => Number(Number(numero || 0).toFixed(2));

export const normalizarTexto = (valor: any) => String(valor || "").trim();

export const normalizarCliente = (cliente: any = {}) => {
  const nombre = normalizarTexto(cliente.nombre || cliente.name || "");
  const apellido = normalizarTexto(cliente.apellido || cliente.lastName || "");
  const nombreCompleto = normalizarTexto(
    cliente.nombreCompleto ||
      cliente.cliente ||
      `${nombre} ${apellido}`.trim() ||
      nombre ||
      "Cliente Web",
  );

  return {
    codigo: normalizarTexto(cliente.codigo || cliente.id || cliente.idWeb || cliente.externalId || `WEB-${Date.now()}`),
    externalId: normalizarTexto(cliente.id || cliente.idWeb || cliente.externalId || ""),
    nombre: nombreCompleto,
    apellido,
    telefono: normalizarTexto(cliente.telefono || cliente.celular || cliente.whatsapp || ""),
    direccion: normalizarTexto(cliente.direccion || cliente.domicilio || ""),
    ciudad: normalizarTexto(cliente.ciudad || cliente.localidad || ""),
    localidad: normalizarTexto(cliente.localidad || cliente.ciudad || ""),
    provincia: normalizarTexto(cliente.provincia || ""),
  };
};

export const normalizarProducto = (producto: any = {}) => {
  const tipoMascota = normalizarTexto(producto.tipoMascota || producto.animal || producto.categoria || "");
  const etapa = normalizarTexto(producto.etapa || producto.edad || "");

  return {
    codigo: normalizarTexto(producto.codigo || producto.codigoProducto || producto.id || producto.idWeb || producto.sku || producto.externalId),
    externalId: normalizarTexto(producto.id || producto.idWeb || producto.externalId || ""),
    nombre: normalizarTexto(producto.nombre || producto.producto || "Producto Web"),
    marca: normalizarTexto(producto.marca || producto.proveedor || ""),
    kg: normalizarTexto(producto.kg || producto.cantidad || producto.peso || ""),
    tipoMascota,
    etapa,
    stock: Number(producto.stock || 0),
    precioCosto: Number(producto.precioCosto || producto.costo || 0),
    precio: Number(producto.precio || producto.precioVenta || 0),
    imagen: normalizarTexto(producto.imagen || ""),
  };
};

async function columnaExiste(connection: any, tabla: string, columna: string) {
  const [rows]: any = await connection.query(
    `
    SELECT COUNT(*) AS total
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
    `,
    [tabla, columna],
  );

  return Number(rows[0]?.total || 0) > 0;
}

export async function asegurarTablasIntegracion(connection: any) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      codigo VARCHAR(255) NULL,
      nombre VARCHAR(255) NOT NULL,
      apellido VARCHAR(255) NULL,
      telefono VARCHAR(255) NULL,
      direccion VARCHAR(255) NULL,
      ciudad VARCHAR(255) NULL,
      localidad VARCHAR(255) NULL,
      provincia VARCHAR(255) NULL,
      deuda DOUBLE DEFAULT 0,
      origen VARCHAR(50) DEFAULT 'SYSTEM',
      externalId VARCHAR(255) NULL,
      creadoEn DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS productos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      codigo VARCHAR(255) NULL,
      nombre VARCHAR(255) NOT NULL,
      marca VARCHAR(255) NULL,
      kg VARCHAR(255) NULL,
      tipoMascota VARCHAR(255) NULL,
      etapa VARCHAR(255) NULL,
      stock INT DEFAULT 0,
      precioCosto DOUBLE DEFAULT 0,
      precio DOUBLE DEFAULT 0,
      imagen TEXT NULL,
      origen VARCHAR(50) DEFAULT 'SYSTEM',
      externalId VARCHAR(255) NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS ventas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cliente VARCHAR(255) NOT NULL,
      telefono VARCHAR(255) NULL,
      direccion VARCHAR(255) NULL,
      ciudad VARCHAR(255) NULL,
      provincia VARCHAR(255) NULL,
      metodoPago VARCHAR(255) NOT NULL,
      subtotal DOUBLE DEFAULT 0,
      subtotalSinDescuento DOUBLE DEFAULT 0,
      descuentoPorcentaje DOUBLE DEFAULT 0,
      envio DOUBLE DEFAULT 0,
      entrega DOUBLE DEFAULT 0,
      deuda DOUBLE DEFAULT 0,
      total DOUBLE NOT NULL,
      costoTotal DOUBLE DEFAULT 0,
      gananciaTotal DOUBLE DEFAULT 0,
      productos JSON NULL,
      origen VARCHAR(50) DEFAULT 'SYSTEM',
      externalId VARCHAR(255) NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS pedidos_web (
      id INT AUTO_INCREMENT PRIMARY KEY,
      externalId VARCHAR(255) NULL,
      clienteId INT NULL,
      nombre VARCHAR(255) NOT NULL,
      telefono VARCHAR(255) NULL,
      direccion VARCHAR(255) NULL,
      ciudad VARCHAR(255) NULL,
      localidad VARCHAR(255) NULL,
      provincia VARCHAR(255) NULL,
      metodoPago VARCHAR(255) DEFAULT 'Pago en domicilio',
      subtotal DOUBLE DEFAULT 0,
      envio DOUBLE DEFAULT 0,
      total DOUBLE NOT NULL,
      estado VARCHAR(50) DEFAULT 'PENDIENTE',
      origen VARCHAR(50) DEFAULT 'WEB',
      ventaId INT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS pedido_web_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pedidoId INT NOT NULL,
      productoId INT NULL,
      codigo VARCHAR(255) NULL,
      nombre VARCHAR(255) NOT NULL,
      marca VARCHAR(255) NULL,
      kg VARCHAR(255) NULL,
      tipoMascota VARCHAR(255) NULL,
      etapa VARCHAR(255) NULL,
      cantidad INT NOT NULL,
      precio DOUBLE DEFAULT 0,
      precioCosto DOUBLE DEFAULT 0,
      subtotal DOUBLE DEFAULT 0
    )
  `);

  const columnas = [
    ["clientes", "apellido", "VARCHAR(255) NULL"],
    ["clientes", "localidad", "VARCHAR(255) NULL"],
    ["clientes", "origen", "VARCHAR(50) DEFAULT 'SYSTEM'"],
    ["clientes", "externalId", "VARCHAR(255) NULL"],
    ["clientes", "creadoEn", "DATETIME DEFAULT CURRENT_TIMESTAMP"],
    ["productos", "codigo", "VARCHAR(255) NULL"],
    ["productos", "precioCosto", "DOUBLE DEFAULT 0"],
    ["productos", "imagen", "TEXT NULL"],
    ["productos", "origen", "VARCHAR(50) DEFAULT 'SYSTEM'"],
    ["productos", "externalId", "VARCHAR(255) NULL"],
    ["ventas", "direccion", "VARCHAR(255) NULL"],
    ["ventas", "ciudad", "VARCHAR(255) NULL"],
    ["ventas", "provincia", "VARCHAR(255) NULL"],
    ["ventas", "subtotal", "DOUBLE DEFAULT 0"],
    ["ventas", "subtotalSinDescuento", "DOUBLE DEFAULT 0"],
    ["ventas", "descuentoPorcentaje", "DOUBLE DEFAULT 0"],
    ["ventas", "envio", "DOUBLE DEFAULT 0"],
    ["ventas", "entrega", "DOUBLE DEFAULT 0"],
    ["ventas", "deuda", "DOUBLE DEFAULT 0"],
    ["ventas", "costoTotal", "DOUBLE DEFAULT 0"],
    ["ventas", "gananciaTotal", "DOUBLE DEFAULT 0"],
    ["ventas", "productos", "JSON NULL"],
    ["ventas", "origen", "VARCHAR(50) DEFAULT 'SYSTEM'"],
    ["ventas", "externalId", "VARCHAR(255) NULL"],
  ];

  for (const [tabla, columna, definicion] of columnas) {
    if (!(await columnaExiste(connection, tabla, columna))) {
      await connection.query(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`);
    }
  }
}

export async function upsertClienteWeb(connection: any, clienteInput: any) {
  await asegurarTablasIntegracion(connection);

  const cliente = normalizarCliente(clienteInput);

  const [rows]: any = await connection.query(
    `
    SELECT *
    FROM clientes
    WHERE (externalId IS NOT NULL AND externalId <> '' AND externalId = ?)
       OR (telefono IS NOT NULL AND telefono <> '' AND telefono = ?)
       OR LOWER(TRIM(nombre)) = LOWER(TRIM(?))
    LIMIT 1
    `,
    [cliente.externalId, cliente.telefono, cliente.nombre],
  );

  if (rows.length > 0) {
    await connection.query(
      `
      UPDATE clientes
      SET codigo = COALESCE(NULLIF(?, ''), codigo),
          externalId = COALESCE(NULLIF(?, ''), externalId),
          nombre = ?,
          apellido = ?,
          telefono = ?,
          direccion = ?,
          ciudad = ?,
          localidad = ?,
          provincia = ?,
          origen = 'WEB'
      WHERE id = ?
      `,
      [
        cliente.codigo,
        cliente.externalId,
        cliente.nombre,
        cliente.apellido,
        cliente.telefono,
        cliente.direccion,
        cliente.ciudad,
        cliente.localidad,
        cliente.provincia,
        rows[0].id,
      ],
    );

    return rows[0].id;
  }

  const [result]: any = await connection.query(
    `
    INSERT INTO clientes
    (codigo, externalId, nombre, apellido, telefono, direccion, ciudad, localidad, provincia, deuda, origen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'WEB')
    `,
    [
      cliente.codigo,
      cliente.externalId,
      cliente.nombre,
      cliente.apellido,
      cliente.telefono,
      cliente.direccion,
      cliente.ciudad,
      cliente.localidad,
      cliente.provincia,
    ],
  );

  return result.insertId;
}

export async function upsertProductoWeb(connection: any, productoInput: any, ajusteStock = 0) {
  await asegurarTablasIntegracion(connection);

  const producto = normalizarProducto(productoInput);

  if (!producto.codigo) {
    producto.codigo = `WEB-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
  }

  const [porCodigo]: any = await connection.query(
    `SELECT * FROM productos WHERE codigo = ? OR externalId = ? LIMIT 1`,
    [producto.codigo, producto.externalId],
  );

  if (porCodigo.length > 0) {
    const existente = porCodigo[0];
    const stockBase = producto.stock && ajusteStock < 0 ? Number(producto.stock || 0) : Number(existente.stock || 0);
    const nuevoStock = stockBase + Number(ajusteStock || 0);

    await connection.query(
      `
      UPDATE productos
      SET codigo = COALESCE(NULLIF(?, ''), codigo),
          externalId = COALESCE(NULLIF(?, ''), externalId),
          nombre = ?,
          marca = ?,
          kg = ?,
          tipoMascota = ?,
          etapa = ?,
          stock = ?,
          precioCosto = ?,
          precio = ?,
          imagen = ?,
          origen = COALESCE(NULLIF(origen, ''), 'WEB')
      WHERE id = ?
      `,
      [
        producto.codigo,
        producto.externalId,
        producto.nombre || existente.nombre,
        producto.marca || existente.marca,
        producto.kg || existente.kg,
        producto.tipoMascota || existente.tipoMascota,
        producto.etapa || existente.etapa,
        Math.max(nuevoStock, 0),
        producto.precioCosto || existente.precioCosto || 0,
        producto.precio || existente.precio || 0,
        producto.imagen || existente.imagen || "",
        existente.id,
      ],
    );

    return existente.id;
  }

  const [porDatos]: any = await connection.query(
    `
    SELECT *
    FROM productos
    WHERE LOWER(nombre) = LOWER(?)
      AND LOWER(COALESCE(marca, '')) = LOWER(COALESCE(?, ''))
      AND COALESCE(kg, '') = COALESCE(?, '')
    LIMIT 1
    `,
    [producto.nombre, producto.marca, producto.kg],
  );

  if (porDatos.length > 0) {
    const existente = porDatos[0];
    const nuevoStock = Number(existente.stock || 0) + Number(ajusteStock || 0);

    await connection.query(
      `
      UPDATE productos
      SET codigo = COALESCE(NULLIF(?, ''), codigo),
          externalId = COALESCE(NULLIF(?, ''), externalId),
          stock = ?,
          tipoMascota = ?,
          etapa = ?,
          precioCosto = ?,
          precio = ?,
          imagen = ?
      WHERE id = ?
      `,
      [
        producto.codigo,
        producto.externalId,
        Math.max(nuevoStock, 0),
        producto.tipoMascota || existente.tipoMascota,
        producto.etapa || existente.etapa,
        producto.precioCosto || existente.precioCosto || 0,
        producto.precio || existente.precio || 0,
        producto.imagen || existente.imagen || "",
        existente.id,
      ],
    );

    return existente.id;
  }

  const stockInicial = Math.max(Number(producto.stock || 0) + Number(ajusteStock || 0), 0);

  const [result]: any = await connection.query(
    `
    INSERT INTO productos
    (codigo, externalId, nombre, marca, kg, tipoMascota, etapa, stock, precioCosto, precio, imagen, origen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'WEB')
    `,
    [
      producto.codigo,
      producto.externalId,
      producto.nombre,
      producto.marca,
      producto.kg,
      producto.tipoMascota,
      producto.etapa,
      stockInicial,
      producto.precioCosto,
      producto.precio,
      producto.imagen,
    ],
  );

  return result.insertId;
}

export async function registrarPedidoWeb(payload: any) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await asegurarTablasIntegracion(connection);

    const externalId = normalizarTexto(payload.id || payload.idWeb || payload.pedidoId || payload.externalId || "");
    const cliente = normalizarCliente(payload.cliente || payload.usuario || payload);
    const clienteId = await upsertClienteWeb(connection, cliente);

    const productosInput = Array.isArray(payload.productos)
      ? payload.productos
      : Array.isArray(payload.items)
        ? payload.items
        : [];

    const productosVenta = [];
    const pedidoItems: any[] = [];
    let totalCalculado = 0;
    let costoTotal = 0;

    for (const item of productosInput) {
      const cantidad = Number(item.cantidad || 1);
      const producto = normalizarProducto(item.producto || item);

      const productoId = await upsertProductoWeb(connection, producto, -cantidad);

      const precio = Number(producto.precio || item.precio || 0);
      const precioCosto = Number(producto.precioCosto || 0);
      const totalProducto = redondear(precio * cantidad);
      const costoProducto = redondear(precioCosto * cantidad);

      totalCalculado += totalProducto;
      costoTotal += costoProducto;

      const itemPedido = {
        productoId,
        codigo: producto.codigo,
        nombre: producto.nombre,
        marca: producto.marca,
        kg: producto.kg,
        tipoMascota: producto.tipoMascota,
        etapa: producto.etapa,
        cantidad,
        precio,
        precioCosto,
        subtotal: totalProducto,
      };

      pedidoItems.push(itemPedido);

      productosVenta.push({
        id: producto.codigo,
        codigo: producto.codigo,
        producto: `${producto.nombre} ${producto.tipoMascota} ${producto.etapa} ${producto.kg ? `${producto.kg} KG` : ""}`.trim(),
        nombre: producto.nombre,
        marca: producto.marca,
        kg: producto.kg,
        tipoMascota: producto.tipoMascota,
        etapa: producto.etapa,
        cantidad,
        precio,
        precioCosto,
        total: totalProducto,
        costoTotal: costoProducto,
        origen: "WEB",
        pedidoWebId: externalId,
      });
    }

    const envio = redondear(Number(payload.envio || payload.costoEnvio || 0));
    const subtotal = redondear(Number(payload.subtotal || totalCalculado));
    const total = redondear(Number(payload.total || subtotal + envio));
    const gananciaTotal = redondear(total - costoTotal);
    const fecha = payload.fecha || new Date().toISOString().slice(0, 10);
    const metodoPago = payload.metodoPago || "Pago en domicilio";

    const [ventaResult]: any = await connection.query(
      `
      INSERT INTO ventas
      (
        cliente,
        telefono,
        direccion,
        ciudad,
        provincia,
        metodoPago,
        subtotal,
        subtotalSinDescuento,
        descuentoPorcentaje,
        envio,
        entrega,
        deuda,
        total,
        costoTotal,
        gananciaTotal,
        productos,
        fecha,
        origen,
        externalId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'WEB', ?)
      `,
      [
        cliente.nombre,
        cliente.telefono,
        cliente.direccion,
        cliente.ciudad,
        cliente.provincia,
        metodoPago,
        subtotal,
        subtotal,
        0,
        envio,
        0,
        metodoPago === "Fiado" ? total : 0,
        total,
        redondear(costoTotal),
        gananciaTotal,
        JSON.stringify(productosVenta),
        fecha,
        externalId,
      ],
    );

    const ventaId = ventaResult.insertId;

    const [pedidoResult]: any = await connection.query(
      `
      INSERT INTO pedidos_web
      (
        externalId,
        clienteId,
        nombre,
        telefono,
        direccion,
        ciudad,
        localidad,
        provincia,
        metodoPago,
        subtotal,
        envio,
        total,
        estado,
        origen,
        ventaId,
        fecha
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', 'WEB', ?, ?)
      `,
      [
        externalId,
        clienteId,
        cliente.nombre,
        cliente.telefono,
        cliente.direccion,
        cliente.ciudad,
        cliente.localidad,
        cliente.provincia,
        metodoPago,
        subtotal,
        envio,
        total,
        ventaId,
        fecha,
      ],
    );

    const pedidoId = pedidoResult.insertId;

    for (const item of pedidoItems) {
      await connection.query(
        `
        INSERT INTO pedido_web_items
        (pedidoId, productoId, codigo, nombre, marca, kg, tipoMascota, etapa, cantidad, precio, precioCosto, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          pedidoId,
          item.productoId,
          item.codigo,
          item.nombre,
          item.marca,
          item.kg,
          item.tipoMascota,
          item.etapa,
          item.cantidad,
          item.precio,
          item.precioCosto,
          item.subtotal,
        ],
      );
    }

    await connection.commit();

    return { success: true, ventaId, pedidoWebId: pedidoId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
