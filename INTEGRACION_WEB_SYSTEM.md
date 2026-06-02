# Integración Animaria Web ↔ Animaria System

Esta versión queda preparada para que la página web envíe clientes, productos y pedidos al sistema de facturación.

## Endpoints principales

### Estado del servicio

```http
GET /api/integracion/web
```

### Crear o actualizar cliente desde la web

```http
POST /api/integracion/web
Content-Type: application/json
x-animaria-token: TU_TOKEN
```

```json
{
  "accion": "cliente",
  "cliente": {
    "idWeb": "123",
    "nombre": "Juan",
    "apellido": "Pérez",
    "telefono": "2910000000",
    "direccion": "Malvinas 1492",
    "localidad": "Bahía Blanca",
    "provincia": "Buenos Aires"
  }
}
```

El sistema guarda:
- nombre
- apellido
- teléfono
- dirección
- localidad/ciudad
- provincia

No necesita guardar email.

### Crear o actualizar producto desde la web

```json
{
  "accion": "producto",
  "producto": {
    "codigo": "BOCATTO-PERRO-15",
    "nombre": "Bocatto Perro",
    "marca": "Bocatto",
    "kg": "15",
    "tipoMascota": "Perros",
    "etapa": "Adultos",
    "stock": 10,
    "precio": 25000
  }
}
```

Si el producto existe por `codigo`, lo actualiza.  
Si no existe, intenta buscar por nombre/marca/kg.  
Si tampoco existe, lo crea automáticamente.

### Enviar pedido web al sistema

```json
{
  "accion": "pedido",
  "idWeb": "PEDIDO-1001",
  "cliente": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "telefono": "2910000000",
    "direccion": "Malvinas 1492",
    "localidad": "Bahía Blanca",
    "provincia": "Buenos Aires"
  },
  "metodoPago": "Pago en domicilio",
  "envio": 0,
  "productos": [
    {
      "codigo": "BOCATTO-PERRO-15",
      "nombre": "Bocatto Perro",
      "marca": "Bocatto",
      "kg": "15",
      "tipoMascota": "Perros",
      "etapa": "Adultos",
      "cantidad": 1,
      "precio": 25000
    }
  ]
}
```

Al recibir un pedido:
1. Crea o actualiza el cliente.
2. Busca el producto.
3. Si no existe, lo crea.
4. Descuenta stock.
5. Crea una venta.
6. Crea un registro en `pedidos_web`.
7. Guarda los productos en `pedido_web_items`.

## Variables de entorno recomendadas

```env
DATABASE_URL=mysql://usuario:clave@host:puerto/base
ANIMARIA_SYNC_TOKEN=una_clave_secreta
ANIMARIA_WEB_API_URL=https://animaria.onrender.com
ANIMARIA_WEB_API_TOKEN=misma_clave_secreta
```

## Tablas nuevas

- `clientes`
- `productos`
- `ventas`
- `pedidos_web`
- `pedido_web_items`

El archivo `scripts/schema-integracion.sql` contiene SQL para crear/actualizar estas tablas.

## Regla de oro

Para sincronización correcta conviene usar siempre `codigo` en productos.

Ejemplo:
- `BOCATTO-PERRO-15`
- `BOCATTO-CACHORRO-15`
- `PIEDRAS-GATO-4`

No dependas solo del nombre porque puede cambiar.
