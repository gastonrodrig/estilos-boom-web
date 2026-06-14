"use client";

import { useEffect, useState } from "react";
import { OrdersTable, OrderData, OrderStatus } from "@/components/organisms/orders-table";
import { adminOrdersApi } from "@/api/orders/admin-orders-api";
import { getFirebaseAuthToken } from "@helpers";

export default function AdminOrdersHistoryPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  const mapBackendStatus = (backendStatus: string): OrderStatus => {
    switch (backendStatus) {
      case 'CONFIRMED': return 'Pendiente';
      case 'PREPARING': return 'Preparando';
      case 'SHIPPED': return 'En camino';
      case 'DELIVERED': return 'Entregado';
      case 'CANCELLED': return 'Cancelado';
      default: return 'Pendiente';
    }
  };

  const mapFrontendStatus = (frontendStatus: OrderStatus): string => {
    switch (frontendStatus) {
      case 'Pendiente': return 'CONFIRMED';
      case 'Preparando': return 'PREPARING';
      case 'En camino': return 'SHIPPED';
      case 'Entregado': return 'DELIVERED';
      case 'Cancelado': return 'CANCELLED';
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getFirebaseAuthToken();
        const data = await adminOrdersApi.getAdminOrders({
          headers: { Authorization: `Bearer ${token}` }
        });

        let mappedOrders: OrderData[] = data.map((o: any) => ({
          id: o.orderNumber,
          dbId: o._id,
          date: new Date(o.createdAt).toLocaleString("es-PE", {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }),
          client: o.clientName,
          amount: o.amount,
          status: mapBackendStatus(o.status),
          deliveryMethod: o.deliveryMethod || 'store',
          items: o.items || [],
          trackingNumber: o.trackingNumber,
          shippingEvidenceUrl: o.shippingEvidenceUrl
        }));

        // INYECCIÓN TEMPORAL: Mezclamos la data falsa con la real para que siempre tengas registros visibles para probar.
        const dummyData: OrderData[] = [
          { id: "#ORD-0128", date: "29 May 2026, 14:30", client: "María Elena", amount: 150.00, status: "Pendiente", deliveryMethod: "motorized" },
          { id: "#ORD-0127", date: "29 May 2026, 11:15", client: "Carlos Ruiz", amount: 320.50, status: "Pendiente", deliveryMethod: "province" },
          { id: "#ORD-0126", date: "28 May 2026, 16:45", client: "Ana López", amount: 85.00, status: "Preparando", deliveryMethod: "store" },
          { id: "#ORD-0125", date: "28 May 2026, 09:20", client: "Juan Pérez", amount: 412.00, status: "Entregado", deliveryMethod: "point" },
          { id: "#ORD-0124", date: "27 May 2026, 15:10", client: "Lucía Gómez", amount: 210.00, status: "Entregado", deliveryMethod: "motorized" },
          { id: "#ORD-0123", date: "27 May 2026, 10:00", client: "Pedro Sánchez", amount: 95.00, status: "Preparando", deliveryMethod: "province" },
        ];

        setOrders([...mappedOrders, ...dummyData]);
      } catch (error) {
        console.error("Error fetching admin orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order || !order.dbId) return;

      const backendStatus = mapFrontendStatus(newStatus);
      const token = await getFirebaseAuthToken();
      await adminOrdersApi.updateOrderStatus(order.dbId, backendStatus, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Hubo un error al actualizar el estado del pedido.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando órdenes de venta...</div>;
  }

  return (
    <OrdersTable
      title="Órdenes de Venta"
      description="Visualiza y gestiona todas las ventas realizadas, su método de entrega y estado."
      data={orders}
      onStatusChange={handleStatusChange}
    />
  );
}


