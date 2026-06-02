-- Integración Animaria Web ↔ Animaria System
-- Ejecutar en la base MySQL del sistema si necesitás crear/actualizar tablas manualmente.
-- Si el sistema ya las tiene, estos CREATE TABLE IF NOT EXISTS no rompen nada.

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
);

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
);

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
);

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
);

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
);
