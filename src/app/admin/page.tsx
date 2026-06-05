'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@store';
import { FullScreenLoader } from '@/components/organisms';
import {
  usePaymentStore,
  useProductionStore,
  useStorehouseStore,
  useClientCompanyStore,
  useClientPersonStore,
} from '@/hooks';
import { motion } from 'framer-motion';
import {
  DollarSign, Clock, CheckCircle2, XCircle, Users2,
  Package, RefreshCw, Activity, Star, Layers,
} from 'lucide-react';

/* ─────────────────────────────────────────────── types / helpers ── */

type Period = 'hoy' | 'semana' | 'mes' | 'todo';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'hoy',    label: 'Hoy'    },
  { key: 'semana', label: 'Semana' },
  { key: 'mes',    label: 'Mes'    },
  { key: 'todo',   label: 'Todo'   },
];

function inPeriod(dateStr: string | undefined, period: Period): boolean {
  if (period === 'todo') return true;
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  if (period === 'hoy') return d.toDateString() === now.toDateString();
  const cutoff = new Date();
  period === 'semana' ? cutoff.setDate(now.getDate() - 7) : cutoff.setDate(now.getDate() - 30);
  return d >= cutoff;
}

const formatPEN = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(n);

const formatDate = (str?: string) =>
  str ? new Date(str).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : '—';

/* ─────────────────────────────────────────── production status map ── */
const PROD_STATUS: Record<string, { label: string; color: string }> = {
  DISEÑO:      { label: 'Diseño',      color: '#8B3A52' },
  DISENIO:     { label: 'Diseño',      color: '#8B3A52' },
  CORTE:       { label: 'Corte',       color: '#d97706' },
  CONFECCION:  { label: 'Confección',  color: '#D6405F' },
  ACABADO:     { label: 'Acabado',     color: '#059669' },
  COMPLETADO:  { label: 'Completado',  color: '#0284c7' },
  EN_TALLER:   { label: 'En Taller',   color: '#ea580c' },
  CANCELADO:   { label: 'Cancelado',   color: '#9ca3af' },
};

const OC_STATUS: Record<string, { label: string; color: string }> = {
  PENDIENTE:  { label: 'Pendiente',  color: '#D6405F' },
  CONFIRMADO: { label: 'Confirmado', color: '#d97706' },
  RECIBIDO:   { label: 'Recibido',   color: '#059669' },
  COMPLETADA: { label: 'Completada', color: '#0284c7' },
  CANCELADO:  { label: 'Cancelada',  color: '#9ca3af' },
};

/* ──────────────────────────────────────────────── micro components ── */

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#EAE0E2]/60 dark:bg-white/10 ${className}`} />;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-40">
      <Activity className="h-7 w-7 text-[#8C6B79]" />
      <p className="text-[11px] text-[#8C6B79] dark:text-gray-400 font-medium">{message}</p>
    </div>
  );
}

function SectionCard({
  title, icon: Icon, children, className = '',
}: {
  title: string; icon: React.ElementType; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`border border-[rgba(212,175,55,0.22)] shadow-[0_2px_20px_rgba(212,175,55,0.07)] bg-white/80 dark:bg-[#2e1d27]/80 backdrop-blur-xl rounded-2xl overflow-hidden ${className}`}>
      {/* glassmorphic header */}
      <div className="px-5 py-3.5 border-b border-[rgba(212,175,55,0.18)] bg-gradient-to-r from-white/70 to-white/20 dark:from-[rgba(139,58,82,0.22)] dark:to-transparent backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-[#8B3A52] dark:text-[#e8d8dc]" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc]">
            {title}
          </h3>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────── main page ── */

export default function AdminDashboardPage() {
  const router = useRouter();
  const { status } = useAppSelector((s) => s.auth);

  const [period, setPeriod]         = useState<Period>('mes');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /* hooks */
  const { metrics, startLoadingMetrics, loading: lPay }      = usePaymentStore();
  const { orders, startLoadingProductionOrders, loading: lProd } = useProductionStore();
  const {
    purchaseOrders, movements, supplierRanking,
    startLoadingPurchaseOrders, startLoadingInventoryMovements, startLoadingSupplierRanking,
    loading: lStore,
  } = useStorehouseStore();
  const { total: totalCompany, startLoadingClientsCompanyPaginated } = useClientCompanyStore();
  const { total: totalPerson,  startLoadingClientsPersonPaginated  } = useClientPersonStore();

  const isLoading = lPay || lProd || lStore;

  /* auth guard */
  useEffect(() => {
    if (status === 'not-authenticated') router.replace('/auth/login');
  }, [status, router]);

  /* load all sources */
  const loadAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      startLoadingMetrics(),
      startLoadingProductionOrders(),
      startLoadingPurchaseOrders(),
      startLoadingInventoryMovements(),
      startLoadingSupplierRanking(5),
      startLoadingClientsCompanyPaginated(),
      startLoadingClientsPersonPaginated(),
    ]);
    setLastUpdated(new Date());
    setRefreshing(false);
  }, [
    startLoadingMetrics, startLoadingProductionOrders, startLoadingPurchaseOrders,
    startLoadingInventoryMovements, startLoadingSupplierRanking,
    startLoadingClientsCompanyPaginated, startLoadingClientsPersonPaginated,
  ]);

  useEffect(() => {
    if (status === 'authenticated') loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  /* ── derived data ── */
  const filteredOrders = useMemo(
    () => (orders as any[]).filter((o) => inPeriod(o.created_at, period)),
    [orders, period],
  );

  const filteredPurchaseOrders = useMemo(
    () => purchaseOrders.filter((o) => inPeriod(o.created_at, period)),
    [purchaseOrders, period],
  );

  const filteredMovements = useMemo(
    () =>
      movements
        .filter((m) => inPeriod(m.created_at, period))
        .slice()
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 10),
    [movements, period],
  );

  const ordersByStatus = useMemo(() => {
    const g: Record<string, number> = {};
    filteredOrders.forEach((o: any) => { const k = o.status || 'OTROS'; g[k] = (g[k] || 0) + 1; });
    return g;
  }, [filteredOrders]);

  const ocByStatus = useMemo(() => {
    const g: Record<string, number> = {};
    filteredPurchaseOrders.forEach((o) => { g[o.status] = (g[o.status] || 0) + 1; });
    return g;
  }, [filteredPurchaseOrders]);

  const totalInvertido = useMemo(
    () => filteredPurchaseOrders.reduce((s, o) => s + (o.total_amount || 0), 0),
    [filteredPurchaseOrders],
  );

  const totalClientes = (totalCompany || 0) + (totalPerson || 0);

  if (status === 'checking' || status === 'not-authenticated') return <FullScreenLoader />;

  /* ── KPI card config ── */
  const kpiCards = [
    {
      icon: DollarSign,
      label: 'Total Cobrado',
      value: isLoading ? null : formatPEN(metrics?.totalVerifiedAmount || 0),
      sub: 'Pagos verificados acumulados',
      color: '#059669',
      alert: false,
    },
    {
      icon: Clock,
      label: 'Pagos Pendientes',
      value: isLoading ? null : String(metrics?.pending || 0),
      sub: (metrics?.pending || 0) > 0 ? '⚠ Requieren revisión' : 'Sin pendientes',
      color: (metrics?.pending || 0) > 0 ? '#D6405F' : '#059669',
      alert: (metrics?.pending || 0) > 0,
    },
    {
      icon: CheckCircle2,
      label: 'Verificados Hoy',
      value: isLoading ? null : String(metrics?.verifiedToday || 0),
      sub: 'Confirmados en el día',
      color: '#0284c7',
      alert: false,
    },
    {
      icon: XCircle,
      label: 'Rechazados',
      value: isLoading ? null : String(metrics?.rejected || 0),
      sub: 'Pagos con problema',
      color: '#dc2626',
      alert: false,
    },
    {
      icon: Users2,
      label: 'Clientes',
      value: isLoading ? null : String(totalClientes),
      sub: `${totalCompany || 0} empresas · ${totalPerson || 0} personas`,
      color: '#7c3aed',
      alert: false,
    },
  ];

  /* ─────────────────────────────────────── render ── */
  return (
    <div className="flex flex-col gap-6 transition-colors duration-500">

      {/* ── HEADER ── */}
      <div className="flex flex-col gap-3 pt-8 pb-1 md:flex-row md:items-center justify-between">
        <div>
          <div
            className="mb-2 text-[#8B3A52] opacity-60 dark:text-white dark:opacity-35 font-medium"
            style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}
          >
            Inicio / Estadísticas
          </div>
          <h2
            className="text-[#40202D] dark:text-white leading-none"
            style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '2rem', fontWeight: 300 }}
          >
            Estadísticas
          </h2>
          <p
            className="text-[#8C6B79] dark:text-white tracking-[0.03em] mt-2"
            style={{ fontSize: '0.78rem', opacity: 0.45 }}
          >
            Datos en tiempo real para tomar decisiones estratégicas.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start mt-2 md:mt-0">
          {/* Period pills */}
          <div className="flex bg-white/50 dark:bg-black/50 p-1 rounded-xl border border-[rgba(212,175,55,0.15)] shadow-inner backdrop-blur-md">
            {PERIODS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all tracking-wider uppercase ${
                  period === key
                    ? 'bg-gradient-to-r from-[rgba(139,58,82,0.85)] to-[rgba(139,58,82,0.65)] text-white shadow-sm'
                    : 'text-[#8C6B79] dark:text-gray-400 hover:text-[#40202D] dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={loadAll}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[rgba(212,175,55,0.2)] bg-white/60 dark:bg-black/40 text-[#8B3A52] dark:text-[#e8d8dc] text-[10px] font-black uppercase tracking-wider hover:border-[rgba(212,175,55,0.45)] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-[10px] text-[#8C6B79]/50 dark:text-gray-600 -mt-4">
          Actualizado a las{' '}
          {lastUpdated.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      )}

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="border border-[rgba(212,175,55,0.2)] shadow-[0_4px_20px_rgba(212,175,55,0.07)] bg-white/80 dark:bg-[#2e1d27]/80 backdrop-blur-xl rounded-2xl p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-xl" style={{ background: card.color + '1a' }}>
                <card.icon className="h-4 w-4" style={{ color: card.color }} />
              </div>
              {card.alert && (
                <span className="relative flex h-2.5 w-2.5 mt-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: card.color }} />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: card.color }} />
                </span>
              )}
            </div>
            <div>
              {card.value === null ? (
                <Skeleton className="h-7 w-20 mb-1" />
              ) : (
                <p className="text-xl font-black text-[#40202D] dark:text-white">{card.value}</p>
              )}
              <p className="text-[11px] font-semibold text-[#8C6B79] dark:text-gray-300 mt-0.5">{card.label}</p>
              <p className="text-[10px] text-[#8C6B79]/60 dark:text-gray-500 mt-0.5">{card.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── ROW 2: Producción + Compras ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Producción */}
        <SectionCard title="Estado de Producción" icon={Layers}>
          {lProd ? (
            <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-9" />)}</div>
          ) : filteredOrders.length === 0 ? (
            <EmptyState message="Sin órdenes de producción en este período" />
          ) : (
            <div className="space-y-3">
              {Object.entries(ordersByStatus)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => {
                  const cfg = PROD_STATUS[status] ?? { label: status, color: '#8C6B79' };
                  const pct = Math.round((count / filteredOrders.length) * 100);
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 w-28 flex-shrink-0">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                        <span className="text-[11px] font-semibold text-[#40202D] dark:text-gray-200 truncate">{cfg.label}</span>
                      </div>
                      <div className="flex-1 h-1.5 rounded-full bg-[#EAE0E2]/60 dark:bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: cfg.color }}
                        />
                      </div>
                      <span className="text-[12px] font-black text-[#40202D] dark:text-white w-6 text-right">{count}</span>
                      <span className="text-[10px] text-[#8C6B79] dark:text-gray-500 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              <div className="pt-3 mt-1 border-t border-[rgba(212,175,55,0.12)]">
                <span className="text-[11px] text-[#8C6B79] dark:text-gray-400">
                  Total en período:{' '}
                  <strong className="text-[#40202D] dark:text-white">{filteredOrders.length}</strong> órdenes
                </span>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Órdenes de Compra */}
        <SectionCard title="Órdenes de Compra" icon={Package}>
          {lStore ? (
            <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-9" />)}</div>
          ) : filteredPurchaseOrders.length === 0 ? (
            <EmptyState message="Sin órdenes de compra en este período" />
          ) : (
            <div className="space-y-3">
              {Object.entries(ocByStatus)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => {
                  const cfg = OC_STATUS[status] ?? { label: status, color: '#8C6B79' };
                  const pct = Math.round((count / filteredPurchaseOrders.length) * 100);
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 w-28 flex-shrink-0">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                        <span className="text-[11px] font-semibold text-[#40202D] dark:text-gray-200 truncate">{cfg.label}</span>
                      </div>
                      <div className="flex-1 h-1.5 rounded-full bg-[#EAE0E2]/60 dark:bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: cfg.color }}
                        />
                      </div>
                      <span className="text-[12px] font-black text-[#40202D] dark:text-white w-6 text-right">{count}</span>
                      <span className="text-[10px] text-[#8C6B79] dark:text-gray-500 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}

              <div className="pt-3 mt-1 border-t border-[rgba(212,175,55,0.12)] grid grid-cols-2 gap-3">
                <div className="bg-[#fdf8f9] dark:bg-[#321f2b] rounded-xl p-3.5">
                  <p className="text-[10px] text-[#8C6B79] dark:text-gray-400 mb-0.5">Total OC</p>
                  <p className="text-xl font-black text-[#40202D] dark:text-white">{filteredPurchaseOrders.length}</p>
                </div>
                <div className="bg-[#fdf8f9] dark:bg-[#321f2b] rounded-xl p-3.5">
                  <p className="text-[10px] text-[#8C6B79] dark:text-gray-400 mb-0.5">Invertido</p>
                  <p className="text-base font-black text-[#40202D] dark:text-white leading-tight">{formatPEN(totalInvertido)}</p>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── ROW 3: Movimientos + Proveedores ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-8">

        {/* Movimientos (col-span-2) */}
        <div className="lg:col-span-2">
          <SectionCard title="Movimientos de Inventario" icon={Activity}>
            {lStore ? (
              <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10" />)}</div>
            ) : filteredMovements.length === 0 ? (
              <EmptyState message="Sin movimientos en este período" />
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-white/80 to-white/40 dark:from-[rgba(139,58,82,0.25)] dark:to-[rgba(212,175,55,0.08)] border-b border-[rgba(212,175,55,0.18)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc]">Tipo</th>
                      <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc]">Cant.</th>
                      <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] hidden sm:table-cell">Anterior</th>
                      <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc]">Nuevo</th>
                      <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#8B3A52] dark:text-[#e8d8dc] hidden md:table-cell">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovements.map((m, idx) => {
                      const isEntrada = m.type === 'ENTRADA';
                      const isSalida  = m.type === 'SALIDA';
                      const badgeCls  = isEntrada
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : isSalida
                        ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                        : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
                      return (
                        <tr
                          key={m._id}
                          className={`transition-colors group/row ${
                            idx % 2 === 0
                              ? 'bg-[#ffffff] dark:bg-[#2e1d27]'
                              : 'bg-[#fdf8f9] dark:bg-[#321f2b]'
                          } hover:bg-[rgba(139,58,82,0.04)] dark:hover:bg-[rgba(139,58,82,0.15)]`}
                        >
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${badgeCls}`}>
                              {isEntrada ? '↑' : isSalida ? '↓' : '~'} {m.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-black text-[#40202D] dark:text-white">
                            {isEntrada ? '+' : isSalida ? '-' : ''}{m.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-[#8C6B79] dark:text-gray-400 hidden sm:table-cell">{m.previous_stock}</td>
                          <td className="px-4 py-3 text-right font-bold text-[#40202D] dark:text-white">{m.new_stock}</td>
                          <td className="px-4 py-3 text-right text-[10px] text-[#8C6B79] dark:text-gray-500 hidden md:table-cell whitespace-nowrap">
                            {formatDate(m.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Top Proveedores */}
        <SectionCard title="Top Proveedores" icon={Star}>
          {lStore ? (
            <div className="space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}</div>
          ) : supplierRanking.length === 0 ? (
            <EmptyState message="Sin datos de proveedores" />
          ) : (
            <div className="space-y-5">
              {supplierRanking.map((s, i) => {
                const rating  = Math.round((s.rating || 0) * 10) / 10;
                const onTime  = Math.round((s.on_time_delivery_rate || 0) * 100);
                return (
                  <div key={s._id} className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#D4AF37] w-4 flex-shrink-0">#{i + 1}</span>
                        <div>
                          <p className="text-[11px] font-bold text-[#40202D] dark:text-white leading-tight">{s.name_company}</p>
                          <p className="text-[10px] text-[#8C6B79] dark:text-gray-500">{s.total_orders ?? 0} órdenes</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[11px] font-black text-[#40202D] dark:text-white">{rating}/5 ★</p>
                        <p className="text-[10px] text-[#8C6B79] dark:text-gray-500">{onTime}% puntual</p>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#EAE0E2]/60 dark:bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(rating / 5) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #D4AF37 0%, #D6405F 100%)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
