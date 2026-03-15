"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Check,
  Copy,
  Eye,
  MoreVertical,
  Search,
  Trash2,
  Edit,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useScreenSizes } from "@/hooks";
import { CTA, Skeleton } from "@/components/atoms";

type Order = "asc" | "desc";

export interface DataTableColumn<T> {
  id: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  truncate?: boolean;
  accessor?: (row: T) => React.ReactNode;
}

export interface DataTableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick?: (row: T) => void;
  url?: (row: T) => string;
  show?: (row: T) => boolean;
}

interface DataTableProps<T> {
  rows?: T[];
  columns?: DataTableColumn<T>[];
  loading?: boolean;
  order?: Order;
  orderBy?: string;
  onRequestSort?: (property: string) => void;
  page?: number;
  rowsPerPage?: number;
  total?: number;
  onPageChange?: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  actions?: DataTableAction<T>[] | ((row: T) => DataTableAction<T>[]);
  hasActions?: boolean;

  title?: string;
  description?: string;
  onAddClick?: () => void;

  mobileTitleKey?: keyof T;
  mobileStatusKey?: keyof T;
  mobileIdKey?: keyof T;

  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
}

function ActionMenu<T>({
  row,
  actions,
}: {
  row: T;
  actions: DataTableAction<T>[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = ref.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);

      if (!clickedTrigger && !clickedMenu) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: DataTableAction<T>) => {
    setIsOpen(false);

    if (action.onClick) {
      action.onClick(row);
      return;
    }

    if (action.url) {
      router.push(action.url(row));
    }
  };

  const handleToggleMenu = () => {
    const menuEstimatedHeight = 220;
    const menuWidth = 192;
    const viewportPadding = 8;
    const triggerRect = ref.current?.getBoundingClientRect();

    if (triggerRect) {
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const hasSpaceAbove = triggerRect.top > menuEstimatedHeight;
      const shouldOpenUp = spaceBelow < menuEstimatedHeight && hasSpaceAbove;

      const top = shouldOpenUp
        ? Math.max(viewportPadding, triggerRect.top - menuEstimatedHeight - 8)
        : Math.min(
            window.innerHeight - menuEstimatedHeight - viewportPadding,
            triggerRect.bottom + 8
          );

      const left = Math.max(
        viewportPadding,
        Math.min(
          triggerRect.right - menuWidth,
          window.innerWidth - menuWidth - viewportPadding
        )
      );

      setMenuPosition({ top, left });
    }

    setIsOpen((prev) => !prev);
  };

  if (!actions.length) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleToggleMenu}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f7e1e6] text-[#a74c66] shadow-sm transition-colors hover:bg-[#f4d4dc] hover:cursor-pointer"
        aria-label="Acciones"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-sm"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            {actions.map((action, index) => (
              <button
                key={`${action.label}-${index}`}
                type="button"
                onClick={() => handleAction(action)}
                className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition hover:cursor-pointer hover:bg-gray-50 ${
                  action.label === "Eliminar" ? "text-red-600" : "text-gray-700"
                }`}
              >
                {action.icon ?? getDefaultIcon(action.label)}
                <span>{action.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

function getDefaultIcon(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("editar")) return <Edit className="h-4 w-4" />;
  if (normalized.includes("eliminar")) return <Trash2 className="h-4 w-4" />;
  if (normalized.includes("ver")) return <Eye className="h-4 w-4" />;

  return <MoreVertical className="h-4 w-4" />;
}

export function DataTable<T extends object>({
  rows = [],
  columns = [],
  loading = false,
  order = "asc",
  orderBy = "",
  onRequestSort,
  page = 0,
  rowsPerPage = 5,
  total = 0,
  onPageChange,
  onRowsPerPageChange,
  actions = [],
  hasActions = false,

  title,
  description,
  onAddClick,

  mobileTitleKey,
  mobileStatusKey,
  mobileIdKey,

  globalFilter = "",
  onGlobalFilterChange,
}: DataTableProps<T>) {
  const { isMd } = useScreenSizes();
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getRowValue = useCallback((row: T, key: keyof T | string) => {
    return (row as Record<string, unknown>)[String(key)];
  }, []);

  const rowsArr = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const columnsArr = Array.isArray(columns) ? columns : [];
  const actionsArr = actions;

  const filteredRows = useMemo(() => {
    if (!globalFilter.trim()) return rowsArr;

    const q = globalFilter.trim().toLowerCase();

    return rowsArr.filter((row) =>
      Object.values(row as Record<string, unknown>).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [rowsArr, globalFilter]);

  const sortedRows = useMemo(() => {
    if (!orderBy) return [...filteredRows];

    return [...filteredRows].sort((a, b) => {
      const aRaw = getRowValue(a, orderBy);
      const bRaw = getRowValue(b, orderBy);

      const aVal = aRaw == null ? "" : String(aRaw).toLowerCase();
      const bVal = bRaw == null ? "" : String(bRaw).toLowerCase();

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredRows, getRowValue, order, orderBy]);

  const safeRowsPerPage =
    Number.isFinite(rowsPerPage) && rowsPerPage > 0 ? rowsPerPage : 5;
  const loadingRowsCount = Math.max(1, Math.min(safeRowsPerPage, 5));
  const safeTotal = Number.isFinite(total) && total >= 0 ? total : 0;
  const totalPages = Math.max(1, Math.ceil(safeTotal / safeRowsPerPage));
  const safePage = Math.min(Number.isFinite(page) ? page : 0, totalPages - 1);
  const isServerPaginated = safeTotal > rowsArr.length;

  const paginatedRows = useMemo(() => {
    if (isServerPaginated) return sortedRows;

    const start = safePage * safeRowsPerPage;
    const end = start + safeRowsPerPage;
    return sortedRows.slice(start, end);
  }, [sortedRows, safePage, safeRowsPerPage, isServerPaginated]);

  const hasNoData = !loading && paginatedRows.length === 0;
  const shouldEnableRowsScroll = !loading && !hasNoData && paginatedRows.length > 5;
  const useCardsLayout = viewportWidth < 1350;
  const mobileCardsScrollThreshold = isMd ? 3 : 2;
  const shouldEnableMobileCardsScroll =
    !loading && !hasNoData && useCardsLayout && paginatedRows.length >= mobileCardsScrollThreshold;

  const getVisibleActions = (row: T) => {
    const list = typeof actionsArr === "function" ? actionsArr(row) : actionsArr;
    return Array.isArray(list) ? list.filter((a) => !a.show || a.show(row)) : [];
  };

  const canShowActions = (row: T) => {
    const status = String(
      getRowValue(row, "status") ?? getRowValue(row, "estado") ?? ""
    ).toLowerCase();
    const closed = ["finalizado", "cancelado", "confirmada"].includes(status);

    return hasActions && getVisibleActions(row).length > 0 && !closed;
  };

  const renderStatusBadge = (status: unknown) => {
    const value = String(status ?? "").toLowerCase();
    const base =
      "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold";

    if (value === "activo") {
      return <span className={`${base} bg-emerald-100 text-emerald-700`}>Activo</span>;
    }

    if (value === "inactivo") {
      return <span className={`${base} bg-rose-100 text-rose-700`}>Inactivo</span>;
    }

    return (
      <span className={`${base} bg-gray-100 text-gray-600`}>
        {String(status ?? "-")}
      </span>
    );
  };

  const isCopyableColumn = (columnId: string) =>
    columnId === "email" || columnId === "phone";

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const copyToClipboard = async (value: unknown, token: string) => {
    if (value == null) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedCell(token);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopiedCell((prev) => (prev === token ? null : prev));
      }, 1200);
    } catch {
      return;
    }
  };

  const renderCellContent = (
    row: T,
    column: DataTableColumn<T>,
    rowToken: string
  ) => {
    const columnId = String(column.id);

    if (columnId === "status" || columnId === "estado") {
      return renderStatusBadge(getRowValue(row, column.id));
    }

    const rawValue = getRowValue(row, column.id);
    const content = column.accessor
      ? column.accessor(row)
      : (rawValue as React.ReactNode);

    if (!isCopyableColumn(columnId)) return content;

    const copyValue = String(rawValue ?? "").trim();
    const cellToken = `${rowToken}:${columnId}`;
    const isCopied = copiedCell === cellToken;

    return (
      <div className="flex items-center gap-2">
        <span className="truncate">{content}</span>
        {copyValue && (
          <button
            type="button"
            onClick={() => void copyToClipboard(copyValue, cellToken)}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:cursor-pointer hover:bg-gray-100 hover:text-gray-700"
            aria-label={`Copiar ${columnId}`}
            title={`Copiar ${columnId}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isCopied ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="inline-flex"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="inline-flex"
                >
                  <Copy className="h-3.5 w-3.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full rounded-2xl bg-white shadow-sm max-[768px]:**:text-xs! max-[768px]:[&_h2]:text-lg!">
      
      {(title || description || onAddClick || onGlobalFilterChange) && (
        <div className="flex flex-col gap-3 px-6 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
              {description && <p className="text-sm text-gray-900/90">{description}</p>}
            </div>

            {onAddClick && (
              <CTA
                className="self-start sm:self-auto"
                onClick={onAddClick}
              >
                Agregar
              </CTA>
            )}
          </div>

          {onGlobalFilterChange && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={globalFilter}
                onChange={(e) => onGlobalFilterChange(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-[#d6687d] focus:outline-none focus:ring-2 focus:ring-[#d6687d]/30"
              />
            </div>
          )}
        </div>
      )}

      {useCardsLayout ? (
        <div
          className={`mt-4 grid gap-4 px-6 pb-2 ${
            isMd ? "grid-cols-2" : "grid-cols-1"
          } ${shouldEnableMobileCardsScroll ? "overflow-y-auto" : "overflow-y-visible"}`}
          style={{ maxHeight: shouldEnableMobileCardsScroll ? "550px" : undefined }}
        >
          {loading
            ? Array.from({ length: Math.max(1, Math.min(safeRowsPerPage, 3)) }, (_, index) => (
                <div
                  key={`mobile-skeleton-${index}`}
                  className="rounded-2xl border border-pink-100 bg-[#fffcfd] p-5 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <Skeleton width="84px" height="14px" borderRadius="8px" />
                    <Skeleton width="60px" height="24px" borderRadius="9999px" />
                  </div>

                  <Skeleton width="55%" height="22px" borderRadius="10px" className="mb-4" />

                  <div className="flex flex-col gap-2.5">
                    {columnsArr.map((column) => (
                      <div key={`mobile-skeleton-${String(column.id)}-${index}`} className="flex items-center">
                        <Skeleton width="96px" height="14px" borderRadius="8px" className="mr-2" />
                        <Skeleton width="100%" height="14px" borderRadius="8px" />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            : hasNoData ? (
                <div className="col-span-full rounded-2xl border border-gray-200 bg-[#fffcfd] p-8 text-center text-sm text-gray-500">
                  No hay registros disponibles.
                </div>
              )
            : paginatedRows.map((row, rowIndex) => {
            const visibleActions = getVisibleActions(row);
            const rowKey = String(
              getRowValue(row, "_id") ?? getRowValue(row, "id") ?? rowIndex
            );

            return (
              <div
                key={rowKey}
                className="rounded-2xl border border-pink-100 bg-[#fffcfd] p-5 shadow-sm"
              >
                <div className="mb-1 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      ID: {mobileIdKey
                        ? String(getRowValue(row, mobileIdKey) ?? "")
                        : String(
                            getRowValue(row, "_id") ?? getRowValue(row, "id") ?? ""
                          )}
                    </span>
                    {renderStatusBadge(
                      mobileStatusKey
                        ? getRowValue(row, mobileStatusKey)
                        : getRowValue(row, "estado") ?? getRowValue(row, "status")
                    )}
                  </div>

                  {canShowActions(row) && (
                    <ActionMenu row={row} actions={visibleActions} />
                  )}
                </div>

                <h3 className="mb-4 text-xl font-normal text-gray-800">
                  {mobileTitleKey
                    ? String(getRowValue(row, mobileTitleKey) ?? "")
                    : String(getRowValue(row, "nombre") ?? getRowValue(row, "name") ?? "")}
                </h3>

                <div className="flex flex-col gap-2.5">
                  {columnsArr.map((column) => (
                    <div
                      key={`${String(column.id)}-${rowKey}`}
                      className="flex items-center"
                    >
                      <span className="w-24 shrink-0 text-sm text-gray-500">
                        {column.label}:
                      </span>
                      <div className="w-full text-sm text-gray-700">
                        {renderCellContent(row, column, rowKey)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto px-6">
          <div
            className={shouldEnableRowsScroll ? "max-h-95 overflow-y-auto rounded-t-2xl" : "overflow-y-visible rounded-t-2xl"}
          >
            <table className="min-w-full border-separate border-spacing-0">
            <thead
              className={shouldEnableRowsScroll ? "sticky top-0 z-20 bg-[#dfa6b6]" : ""}
            >
              <tr className="bg-[#dfa6b6] text-xs font-semibold uppercase text-white">
                {columnsArr.map((column, index) => (
                  <th
                    key={String(column.id)}
                    className={`group bg-[#dfa6b6] px-6 py-3 text-left hover:cursor-pointer ${
                      index === 0 && !shouldEnableRowsScroll ? "rounded-tl-2xl" : ""
                    } ${
                      index === columnsArr.length - 1 && !hasActions
                        ? !shouldEnableRowsScroll
                          ? "rounded-tr-2xl"
                          : ""
                        : ""
                    }`}
                    style={{
                      maxWidth: column.width || "auto",
                    }}
                  >
                    {column.sortable ? (
                      (() => {
                        const isActiveSort = orderBy === String(column.id);
                        const SortIcon =
                          isActiveSort && order === "asc"
                            ? ArrowUp
                            : ArrowDown;

                        return (
                          <button
                            type="button"
                            onClick={() => onRequestSort?.(String(column.id))}
                            className="inline-flex w-full items-center justify-start gap-2 cursor-pointer text-white transition-colors duration-200 hover:cursor-pointer"
                          >
                            <span className="transition-all duration-200 group-hover:font-bold">
                              {column.label}
                            </span>
                            <SortIcon
                              className="h-4 w-4 stroke-2 text-white transition-all duration-200 group-hover:scale-110"
                            />
                          </button>
                        );
                      })()
                    ) : (
                      <span className="text-white transition-all duration-200 group-hover:font-bold">
                        {column.label}
                      </span>
                    )}
                  </th>
                ))}

                {hasActions && (
                  <th
                    className={`bg-[#dfa6b6] px-6 py-3 text-right ${
                      !shouldEnableRowsScroll ? "rounded-tr-2xl" : ""
                    }`}
                  >
                    Acción
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading
                ? Array.from({ length: loadingRowsCount }, (_, rowIndex) => (
                    <tr
                      key={`desktop-skeleton-${rowIndex}`}
                      className={`${rowIndex % 2 === 0 ? "bg-white" : "bg-[#fff1f3]"}`}
                    >
                      {columnsArr.map((column) => (
                        <td
                          key={`desktop-skeleton-${String(column.id)}-${rowIndex}`}
                          className="px-6 py-4"
                        >
                          <Skeleton width="100%" height="14px" borderRadius="8px" />
                        </td>
                      ))}

                      {hasActions && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end">
                            <Skeleton width="36px" height="36px" borderRadius="9999px" />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                : hasNoData ? (
                    <tr>
                      <td
                        colSpan={columnsArr.length + (hasActions ? 1 : 0)}
                        className="px-6 py-10 text-center text-sm text-gray-500"
                      >
                        No hay registros disponibles.
                      </td>
                    </tr>
                  )
                : paginatedRows.map((row, rowIndex) => {
                const visibleActions = getVisibleActions(row);
                const rowKey = String(
                  getRowValue(row, "_id") ?? getRowValue(row, "id") ?? rowIndex
                );

                return (
                  <tr
                    key={rowKey}
                    className={`transition-colors hover:bg-[#f7f1f4] ${
                      rowIndex % 2 === 0 ? "bg-white" : "bg-[#fff1f3]"
                    }`}
                  >
                    {columnsArr.map((column) => (
                      <td
                        key={`${String(column.id)}-${rowKey}`}
                        className={`px-6 py-4 text-sm text-gray-900 ${
                          column.truncate && !isCopyableColumn(String(column.id))
                            ? "max-w-55 truncate"
                            : ""
                        }`}
                        style={{ maxWidth: column.width || "auto" }}
                      >
                        {renderCellContent(row, column, rowKey)}
                      </td>
                    ))}

                    {hasActions && (
                      <td className="px-6 py-4 text-right">
                        {canShowActions(row) && (
                          <div className="flex justify-end">
                            <ActionMenu row={row} actions={visibleActions} />
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-6 pb-6 pt-4 md:flex-row">
        <div className="flex h-9 w-full items-center justify-center gap-2 text-sm text-gray-500 md:w-auto md:justify-start">
          <span>Mostrar</span>
          <select
            value={safeRowsPerPage}
            onChange={(e) => onRowsPerPageChange?.(e)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm hover:cursor-pointer focus:border-[#d6687d] focus:outline-none"
          >
            {[5, 10, 25, 50].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <span>registros</span>
        </div>

        <div className="flex h-9 w-full items-center justify-center text-center text-sm text-gray-500 md:w-auto">
          {loading ? (
            <Skeleton width="180px" height="14px" borderRadius="8px" />
          ) : (
            <>
              Mostrando {safeTotal === 0 ? 0 : safePage * safeRowsPerPage + 1}-
              {Math.min((safePage + 1) * safeRowsPerPage, safeTotal)} de {safeTotal}
            </>
          )}
        </div>

        <div className="flex w-full items-center justify-center gap-2 md:w-auto md:justify-end">
          <button
            type="button"
            onClick={(e) => onPageChange?.(e, safePage - 1)}
            disabled={loading || safePage === 0}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#f2b6c1] bg-white text-[#c33f5a] transition-colors hover:cursor-pointer hover:bg-[#fbe5e8] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={(e) => onPageChange?.(e, safePage + 1)}
            disabled={loading || safePage >= totalPages - 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#f2b6c1] bg-white text-[#c33f5a] transition-colors hover:cursor-pointer hover:bg-[#fbe5e8] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}