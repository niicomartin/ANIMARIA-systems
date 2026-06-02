export default function IntegracionPage() {
  return (
    <main className="pt-[120px] min-h-screen bg-gray-100 p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <section className="bg-black text-white rounded-3xl p-10 shadow">
          <p className="text-yellow-400 font-bold uppercase tracking-[0.25em] text-sm mb-3">
            Animaria System
          </p>
          <h1 className="text-4xl font-black mb-4">Integración con la página web</h1>
          <p className="text-gray-300 text-lg max-w-3xl">
            Este módulo recibe clientes, productos y pedidos desde Animaria Web para mantener conectado el sistema de facturación con la tienda online.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 shadow border">
            <h2 className="text-xl font-black text-black mb-2">Clientes</h2>
            <p className="text-gray-600">Cuando un usuario se registra en la web, puede crearse o actualizarse como cliente del sistema.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border">
            <h2 className="text-xl font-black text-black mb-2">Pedidos</h2>
            <p className="text-gray-600">Las compras online entran como ventas/pedidos para prepararlas y enviarlas desde el sistema.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border">
            <h2 className="text-xl font-black text-black mb-2">Stock</h2>
            <p className="text-gray-600">Si el producto existe, se actualiza stock. Si no existe, se crea automáticamente con precio y stock.</p>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-8 shadow border">
          <h2 className="text-2xl font-black text-black mb-4">Endpoint para Animaria Web</h2>
          <code className="block bg-gray-900 text-yellow-300 rounded-xl p-4 overflow-auto">
            POST /api/integracion/web
          </code>
          <p className="text-gray-600 mt-4">
            Usar la variable <strong>ANIMARIA_SYNC_TOKEN</strong> para proteger la integración. La web debe enviar ese valor en el header <strong>x-animaria-token</strong>.
          </p>
        </section>
      </div>
    </main>
  );
}
