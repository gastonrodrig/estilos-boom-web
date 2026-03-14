import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit, Eye, MoreVertical, Search, Trash2 } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  description: string;
  columns: Column<T>[];
  data: T[];
  onAddClick?: () => void;
  mobileTitleKey?: keyof T;
  mobileStatusKey?: keyof T;
  mobileIdKey?: keyof T;
}

export function ActionMenu<T>({ item }: { item: T }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (action: string) => {
    console.log(action, item);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f7e1e6] text-[#a74c66] shadow-sm transition-colors hover:bg-[#f4d4dc]"
        aria-label="Acciones"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-44 rounded-md bg-white shadow-lg ring-1 ring-black/5">
          <button
            onClick={() => handleItemClick('Editar')}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Edit className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={() => handleItemClick('Eliminar')}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
          <button
            onClick={() => handleItemClick('Ver Detalles')}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            Ver Detalles
          </button>
        </div>
      )}
    </div>
  );
}

export function DataTable<T>({
  title,
  description,
  columns,
  data,
  onAddClick,
  mobileTitleKey,
  mobileStatusKey,
  mobileIdKey,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [globalFilter, setGlobalFilter] = useState('');

  const filteredData = useMemo(() => {
    if (!globalFilter.trim()) {
      return data;
    }

    const q = globalFilter.trim().toLowerCase();

    return data.filter((item) =>
      Object.values(item as any).some((value) =>
        String(value).toLowerCase().includes(q),
      ),
    );
  }, [data, globalFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [globalFilter]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentData = useMemo(() => filteredData.slice(startIndex, endIndex), [filteredData, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const renderStatusBadge = (status: unknown) => {
    const value = String(status ?? '').toLowerCase();
    const isActive = value === 'activo';
    const isInactive = value === 'inactivo';

    const baseClasses = 'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold';

    if (isActive) {
      return <span className={`${baseClasses} bg-emerald-100 text-emerald-700`}>Activo</span>;
    }

    if (isInactive) {
      return <span className={`${baseClasses} bg-rose-100 text-rose-700`}>Inactivo</span>;
    }

    return <span className={`${baseClasses} bg-gray-100 text-gray-600`}>{String(status)}</span>;
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-lg">
      {/* Header */}
      <div className="flex flex-col gap-3 px-6 pt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-900/90">{description}</p>
          </div>

          {onAddClick && (
            <button
              onClick={onAddClick}
              className="inline-flex items-center justify-center rounded-full bg-[#d6687d] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#c8596a]"
            >
              Agregar
            </button>
          )}
        </div>

        <div className="mt-4 relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-[#d6687d] focus:outline-none focus:ring-2 focus:ring-[#d6687d]/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto px-6">
        <table className="min-w-full border-separate border-spacing-0 hidden md:table">
          <thead>
            <tr className="bg-[#dfa6b6] text-white text-xs uppercase font-semibold">
              {columns.map((column, index) => (
                <th
                  key={column.accessorKey as string}
                  className={`px-6 py-3 text-left ${
                    index === 0 ? 'rounded-tl-2xl' : ''
                  } ${index === columns.length - 1 ? 'rounded-tr-2xl' : ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#fff1f3]'} hover:bg-[#f7f1f4] transition-colors`}
              >
                {columns.map((column) => (
                  <td key={column.accessorKey as string} className="px-6 py-4 text-sm text-gray-900">
                    {column.accessorKey === 'estado'
                      ? renderStatusBadge(item[column.accessorKey])
                      : column.cell
                      ? column.cell(item)
                      : (item[column.accessorKey] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="mt-4 grid grid-cols-1 min-[500px]:grid-cols-2 gap-4 md:hidden px-6">
        {currentData.map((item, rowIndex) => (
          <div key={rowIndex} className="bg-[#fffcfd] border border-pink-100 rounded-2xl shadow-sm p-5">
            {/* Cabecera */}
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">ID: {mobileIdKey ? String(item[mobileIdKey]) : ''}</span>
                {renderStatusBadge(mobileStatusKey ? item[mobileStatusKey] : (item as any).estado)}
              </div>
              <ActionMenu item={item} />
            </div>

            {/* Nombre */}
            <h3 className="text-xl font-normal text-gray-800 mb-4">
              {mobileTitleKey ? String(item[mobileTitleKey]) : String((item as any).nombre ?? '')}
            </h3>

            {/* Lista de Datos */}
            <div className="flex flex-col gap-2.5">
              {columns
                .filter((col) => {
                  const excludeKeys = new Set<string>(['acciones']);
                  if (mobileIdKey) excludeKeys.add(String(mobileIdKey));
                  if (mobileStatusKey) excludeKeys.add(String(mobileStatusKey));
                  if (mobileTitleKey) excludeKeys.add(String(mobileTitleKey));
                  return !excludeKeys.has(String(col.accessorKey));
                })
                .map(column => (
                  <div key={column.accessorKey as string} className="flex items-center">
                    <span className="w-20 shrink-0 text-sm text-gray-500">{column.header}:</span>
                    <div className="text-sm text-gray-700 truncate w-full">
                      {column.cell ? column.cell(item) : (item[column.accessorKey] as React.ReactNode)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 mt-6 pt-4 pb-6 px-6 border-t border-gray-100">
        <div className="flex w-full md:w-auto items-center justify-center md:justify-start gap-2 text-sm text-gray-500 h-9">
          <span>Mostrar</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm focus:border-[#d6687d] focus:outline-none"
          >
            {[5, 10, 15].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <span>registros</span>
        </div>

        <div className="w-full md:w-auto text-sm text-gray-500 text-center h-9 flex items-center justify-center">
          Mostrando {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} de {totalItems}
        </div>

        <div className="flex w-full md:w-auto items-center justify-center md:justify-end gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#f2b6c1] bg-white text-[#c33f5a] transition-colors hover:bg-[#fbe5e8] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`h-9 min-w-[2.25rem] rounded-lg border px-3 text-sm font-semibold transition-colors ${
                page === currentPage
                  ? 'border-[#d6687d] bg-[#d6687d] text-white'
                  : 'border-[#f2b6c1] bg-white text-[#c33f5a] hover:bg-[#fbe5e8]'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#f2b6c1] bg-white text-[#c33f5a] transition-colors hover:bg-[#fbe5e8] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}