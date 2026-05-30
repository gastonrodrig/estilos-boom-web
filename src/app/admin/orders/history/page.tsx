"use client";

import { OrdersTable, OrderData } from "@/components/organisms/orders-table";

export default function AdminOrdersHistoryPage() {
  const dummyData: OrderData[] = [
    { id: "#ORD-0128", date: "29 May 2026, 14:30", client: "María Elena", amount: 150.00, status: "Pendiente", deliveryMethod: "motorized" },
    { id: "#ORD-0127", date: "29 May 2026, 11:15", client: "Carlos Ruiz", amount: 320.50, status: "Pendiente", deliveryMethod: "province" },
    { id: "#ORD-0126", date: "28 May 2026, 16:45", client: "Ana López", amount: 85.00, status: "En Progreso", deliveryMethod: "store" },
    { id: "#ORD-0125", date: "28 May 2026, 09:20", client: "Juan Pérez", amount: 412.00, status: "Finalizado", deliveryMethod: "point" },
    { id: "#ORD-0124", date: "27 May 2026, 15:10", client: "Lucía Gómez", amount: 210.00, status: "Finalizado", deliveryMethod: "motorized" },
    { id: "#ORD-0123", date: "27 May 2026, 10:00", client: "Pedro Sánchez", amount: 95.00, status: "En Progreso", deliveryMethod: "province" },
  ];

  return (
    <OrdersTable 
      title="Órdenes de Venta" 
      description="Visualiza y gestiona todas las ventas realizadas, su método de entrega y estado."
      data={dummyData}
    />
  );
}
