"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, DataTableAction, DataTableColumn } from "@/components/organisms";
import { WorkshopModal } from "@/components/organisms/modals";
import { workshopApi } from "@api";
import { Eye, Pencil, Trash2, Phone, MessageCircle } from "lucide-react";
import { Workshop } from "@/components/organisms/modals/workshop-modal/workshop-modal.types";

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadWorkshops = async () => {
    setLoading(true);
    try {
      const { data } = await workshopApi.get("/", {
        params: {
          search: searchTerm || undefined,
          status: true,
        },
      });
      setWorkshops(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading workshops", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWorkshops();
  }, [searchTerm]);

  const handleEdit = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setIsModalOpen(true);
  };

  const handleDelete = async (workshop: Workshop) => {
    if (!workshop._id) return;
    if (!confirm("¿Estás seguro de inhabilitar este taller?")) return;
    setLoading(true);
    try {
      await workshopApi.delete(`/${workshop._id}`);
      await loadWorkshops();
    } catch (error) {
      console.error("Error disabling workshop", error);
    } finally {
      setLoading(false);
    }
  };

  const actions: DataTableAction<Workshop>[] = [
    {
      label: "Editar",
      icon: <Pencil className="h-4 w-4" />,
      onClick: handleEdit,
    },
    {
      label: "Llamar",
      icon: <Phone className="h-4 w-4" />,
      onClick: (row) => window.open(`tel:${row.phone}`, "_self"),
      show: (row) => !!row.phone,
    },
    {
      label: "WhatsApp",
      icon: <MessageCircle className="h-4 w-4" />,
      onClick: (row) => window.open(`https://wa.me/${row.phone}`, "_blank"),
      show: (row) => !!row.phone,
    },
    {
      label: "Inhabilitar",
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
      onClick: handleDelete,
      show: (row) => row.status !== false,
    },
  ];

  const columns: DataTableColumn<Workshop>[] = [
    { id: "name_company", label: "Taller / Empresa", sortable: true, width: "200px", truncate: true },
    { id: "specialty", label: "Especialidad", sortable: true, width: "150px" },
    { id: "weekly_capacity", label: "Capacidad Sem.", sortable: true, width: "130px" },
    {
      id: "operating_status",
      label: "Estado Operativo",
      width: "180px",
      accessor: (row) => {
        const statuses: Record<string, string> = {
          AVAILABLE: "Capacidad Disponible",
          LIMITED: "Capacidad Limitada",
          SATURATED: "Saturado",
          INACTIVE: "Inactivo Temporal",
        };
        return statuses[row.operating_status || "AVAILABLE"];
      },
    },
    { id: "contact_person", label: "Contacto", sortable: true, width: "160px" },
    { id: "phone", label: "Telefono", sortable: true, width: "140px" },
  ];

  return (
    <>
      <DataTable
        rows={workshops}
        loading={loading}
        title="Talleres de Producción"
        description="Gestiona tus talleres externos, especialidades y capacidad operativa."
        onAddClick={() => {
          setSelectedWorkshop(null);
          setIsModalOpen(true);
        }}
        globalFilter={searchTerm}
        onGlobalFilterChange={setSearchTerm}
        columns={columns}
        actions={actions}
        hasActions
      />

      <WorkshopModal
        open={isModalOpen}
        selectedWorkshop={selectedWorkshop}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadWorkshops}
      />
    </>
  );
}
