"use client";

import { useState, useMemo, useEffect } from "react";
import { Eye, Edit2, Search, SlidersHorizontal, Package, Store, Train, Bike, Truck, ChevronDown, Check, FileText } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { OrderDetailModal } from "../features/admin/orders/order-detail-modal";
import { OrderEditModal } from "../features/admin/orders/order-edit-modal";
import { OrderInvoiceModal } from "../features/admin/orders/order-invoice-modal";

export type DeliveryMethodId = 'store' | 'point' | 'motorized' | 'province';
export type OrderStatus = 'Pendiente' | 'Preparando' | 'En camino' | 'Entregado' | 'Cancelado';

export interface OrderData {
  id: string;
  dbId?: string; // Real backend ID
  date: string;
  client: string;
  amount: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethodId;
  items?: any[];
}

interface OrdersTableProps {
  title: string;
  description: string;
  data: OrderData[];
  baseHref?: string;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

const TABS = [
  { id: 'Recientes', label: 'Recientes (Pendientes)' },
  { id: 'En Progreso', label: 'En Progreso' },
  { id: 'Finalizadas', label: 'Finalizadas' }
];

const DELIVERY_FILTERS = [
  { id: 'all', label: 'Todos los métodos' },
  { id: 'store', label: 'Tienda Física (Recojo)' },
  { id: 'motorized', label: 'Motorizado' },
  { id: 'point', label: 'Punto de Encuentro' },
  { id: 'province', label: 'Provincia (Shalom)' },
];

export function OrdersTable({ title, description, data: initialData, baseHref = "/admin/orders", onStatusChange }: OrdersTableProps) {
  const [data, setData] = useState<OrderData[]>(initialData);
  const [activeTab, setActiveTab] = useState<string>('Recientes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleSaveStatus = (id: string, newStatus: OrderStatus) => {
    setData(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    if (onStatusChange) {
      onStatusChange(id, newStatus);
    }
  };

  // Derivar origen (Virtual/Física) del método de entrega
  const getOrigin = (method: DeliveryMethodId) => {
    return method === 'store' ? 'Venta Física' : 'Venta Virtual';
  };

  const getDeliveryIcon = (method: DeliveryMethodId) => {
    switch (method) {
      case 'store': return <Store className="w-3.5 h-3.5" />;
      case 'motorized': return <Bike className="w-3.5 h-3.5" />;
      case 'point': return <Train className="w-3.5 h-3.5" />;
      case 'province': return <Truck className="w-3.5 h-3.5" />;
    }
  };

  const getDeliveryLabel = (method: DeliveryMethodId) => {
    switch (method) {
      case 'store': return 'Recojo en Tienda';
      case 'motorized': return 'Motorizado';
      case 'point': return 'Punto de Encuentro';
      case 'province': return 'Provincia - Shalom';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pendiente': return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case 'Preparando': return "bg-orange-50 text-orange-700 border-orange-200";
      case 'En camino': return "bg-blue-50 text-blue-700 border-blue-200";
      case 'Entregado': return "bg-green-50 text-green-700 border-green-200";
      case 'Cancelado': return "bg-gray-100 text-gray-700 border-gray-300";
      default: return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(order => {
      // 1. Filtrar por Tab (Estado)
      if (activeTab === 'Recientes' && order.status !== 'Pendiente') return false;
      if (activeTab === 'En Progreso' && (order.status !== 'Preparando' && order.status !== 'En camino')) return false;
      if (activeTab === 'Finalizadas' && (order.status !== 'Entregado' && order.status !== 'Cancelado')) return false;

      // 2. Filtrar por Método de Entrega
      if (selectedDelivery !== 'all' && order.deliveryMethod !== selectedDelivery) return false;

      // 3. Filtrar por Búsqueda (ID o Cliente)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchId = order.id.toLowerCase().includes(query);
        const matchClient = order.client.toLowerCase().includes(query);
        if (!matchId && !matchClient) return false;
      }

      return true;
    });
  }, [data, activeTab, selectedDelivery, searchQuery]);

  return (
    <div className="w-full font-sans transition-colors duration-300 relative space-y-6">
      <div className="w-full relative z-10 space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">{description}</p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-pink-100 bg-[#fffcfd] px-6 py-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="text-xs font-medium text-gray-500">Pendientes</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {data.filter(o => o.status === 'Pendiente').length}
            </p>
          </div>
          <div className="rounded-2xl border border-pink-100 bg-[#fffcfd] px-6 py-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
              <span className="text-xs font-medium text-gray-500">En Progreso</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {data.filter(o => o.status === 'Preparando' || o.status === 'En camino').length}
            </p>
          </div>
          <div className="rounded-2xl border border-pink-100 bg-[#fffcfd] px-6 py-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-gray-500">Finalizadas</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {data.filter(o => o.status === 'Entregado').length}
            </p>
          </div>
          <div className="rounded-2xl border border-pink-100 bg-[#fffcfd] px-6 py-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-700" />
              <span className="text-xs font-medium text-gray-500">Monto Finalizado</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              S/ {data.filter(o => o.status === 'Entregado').reduce((acc, o) => acc + o.amount, 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* CONTROLS (TABS + SEARCH + FILTERS) */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
          
          {/* TABS */}
          <div className="flex p-1 bg-white/50 dark:bg-white/5 border border-[#EAE0E2] dark:border-white/10 rounded-xl w-fit backdrop-blur-md shadow-inner">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${
                  activeTab === tab.id 
                    ? "text-white dark:text-white drop-shadow-sm" 
                    : "text-[#8C6B79] dark:text-gray-400 hover:text-[#40202D] dark:hover:text-white"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-[#D6405F] to-[#F23B69] rounded-lg shadow-md"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* SEARCH & FILTER BAR */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Buscador */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C6B79] dark:text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ID o Cliente..." 
                className="w-full bg-white/50 dark:bg-black/30 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-[12px] font-bold text-[#40202D] dark:text-white focus:outline-none focus:border-[#D6405F] dark:focus:border-[#F8BBD0] transition-colors placeholder:text-[#8C6B79]/60 dark:placeholder:text-gray-500 shadow-inner"
              />
            </div>

            {/* Dropdown de Filtro (Método de Entrega) */}
            <div className="relative w-full sm:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto flex items-center justify-between gap-3 px-5 py-3 bg-white/50 dark:bg-black/30 backdrop-blur-md border border-[#EAE0E2] dark:border-white/10 rounded-xl hover:border-[#D6405F] dark:hover:border-[#F8BBD0] transition-colors shadow-inner group"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#8C6B79] dark:text-gray-400 group-hover:text-[#D6405F] dark:group-hover:text-[#F8BBD0] transition-colors" />
                  <span className="text-[12px] font-black text-[#40202D] dark:text-white tracking-wide">
                    {DELIVERY_FILTERS.find(f => f.id === selectedDelivery)?.label}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-[#8C6B79] dark:text-gray-400 group-hover:text-[#D6405F] dark:group-hover:text-[#F8BBD0] transition-colors" />
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-[#EAE0E2] dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {DELIVERY_FILTERS.map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => {
                          setSelectedDelivery(filter.id);
                          setShowFilters(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/50 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <span className={`text-[11px] font-black tracking-wider uppercase ${selectedDelivery === filter.id ? 'text-[#D6405F] dark:text-[#F8BBD0]' : 'text-[#8C6B79] dark:text-gray-400 hover:text-[#40202D] dark:hover:text-white'}`}>
                          {filter.label}
                        </span>
                        {selectedDelivery === filter.id && <Check className="w-4 h-4 text-[#D6405F] dark:text-[#F8BBD0]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="bg-[#fffcfd] rounded-2xl border border-pink-100 shadow-sm overflow-hidden transition-all duration-300">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-[#dfa6b6] text-xs font-semibold uppercase text-white">
                  <th className="py-3 px-6">ID Orden</th>
                  <th className="py-3 px-6">Fecha</th>
                  <th className="py-3 px-6">Cliente</th>
                  <th className="py-3 px-6">Origen</th>
                  <th className="py-3 px-6">Entrega</th>
                  <th className="py-3 px-6">Monto Total</th>
                  <th className="py-3 px-6">Estado</th>
                  <th className="py-3 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filteredData.map((order) => (
                  <tr key={order.id} className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6">
                      <span className="font-black text-[12px] text-[#D6405F] dark:text-[#F8BBD0]">{order.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400">{order.date}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/50 dark:bg-white/5 flex items-center justify-center shrink-0 border border-[#EAE0E2] dark:border-white/10 shadow-inner">
                          <span className="text-[11px] font-black text-[#D6405F] dark:text-[#F8BBD0]">{order.client.charAt(0)}</span>
                        </div>
                        <span className="font-bold text-[#40202D] dark:text-white text-[13px]">{order.client}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#8C6B79] dark:text-gray-400">
                        {getOrigin(order.deliveryMethod)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="text-[#D6405F] dark:text-[#F8BBD0]">
                          {getDeliveryIcon(order.deliveryMethod)}
                        </div>
                        <span className="text-[12px] font-bold text-[#40202D] dark:text-white">
                          {getDeliveryLabel(order.deliveryMethod)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-sm text-gray-800">S/ {order.amount.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }}
                          className="p-2 text-gray-400 hover:text-[#D6405F] bg-white hover:bg-pink-50 rounded-full transition-colors border border-gray-200 shadow-sm"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedOrder(order); setIsEditOpen(true); }}
                          className="p-2 text-gray-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-full transition-colors border border-gray-200 shadow-sm"
                          title="Editar estado"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedOrder(order); setIsInvoiceOpen(true); }}
                          className="p-2 text-gray-400 hover:text-emerald-600 bg-white hover:bg-emerald-50 rounded-full transition-colors border border-gray-200 shadow-sm"
                          title="Ver comprobante"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-[#844C60] dark:text-white/50">
                        <Package className="w-12 h-12 mb-4 opacity-50 text-[#8C6B79] dark:text-gray-500" />
                        <p className="text-[15px] font-bold text-[#8C6B79] dark:text-gray-400">No hay órdenes para mostrar</p>
                        <p className="text-[13px] mt-1 text-[#8C6B79] dark:text-gray-500 font-medium">Intenta ajustando los filtros o el término de búsqueda.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {filteredData.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-pink-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">Mostrando <strong className="text-gray-800 font-semibold">{filteredData.length}</strong> órdenes</span>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded hover:bg-gray-100 transition-colors bg-white shadow-sm">Anterior</button>
                <button className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded hover:bg-gray-100 transition-colors bg-white shadow-sm">Siguiente</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <OrderDetailModal 
        open={isDetailOpen} 
        order={selectedOrder} 
        onClose={() => { setIsDetailOpen(false); setSelectedOrder(null); }} 
      />

      <OrderEditModal 
        open={isEditOpen} 
        order={selectedOrder} 
        onClose={() => { setIsEditOpen(false); setSelectedOrder(null); }} 
        onSave={handleSaveStatus}
      />

      <OrderInvoiceModal 
        open={isInvoiceOpen} 
        order={selectedOrder} 
        onClose={() => { setIsInvoiceOpen(false); setSelectedOrder(null); }} 
      />
    </div>
  );
}
