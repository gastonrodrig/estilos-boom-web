"use client";

import { useEffect, useState } from "react";
import { OrderDetailsModal } from "./_components";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("orders");
    if (saved) {
      const parsed = JSON.parse(saved);
      setOrders(Array.isArray(parsed) ? parsed : [parsed]);
      return;
    }

    const last = localStorage.getItem("last-order");
    if (last) setOrders([JSON.parse(last)]);
  }, []);

  const openModal = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Órdenes</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No hay órdenes registradas.</p>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Cliente</th>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3">{o.id}</td>
                  <td className="p-3">{o.address.fullName}</td>
                  <td className="p-3">
                    {new Date(o.date).toLocaleDateString("es-PE")}
                  </td>
                  <td className="p-3 font-semibold">
                    S/ {o.total?.toFixed(2)}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => openModal(o)}
                      className="text-pink-600 hover:underline"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      <OrderDetailsModal
        order={selectedOrder}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
