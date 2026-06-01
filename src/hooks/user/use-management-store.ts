"use client";

import { useCallback, useState } from "react";
import { clientApi, workerApi } from "@api";
import {
    useAppDispatch,
    useAppSelector,
    setLoadingManagement,
    setLoadingWorkers,
    setLoadingRoles,
    setUsers,
    setWorkers,
    setRoles,
    setPageManagement,
    setRowsPerPageManagement,
} from "@store";
import { getAuthConfig } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import toast from "react-hot-toast";

export const useManagementStore = () => {
    const dispatch = useAppDispatch();
    const {
        users,
        workers,
        roles,
        loading,
        loadingWorkers,
        loadingRoles,
        total,
        currentPage,
        rowsPerPage,
    } = useAppSelector((state) => state.management);

    const [searchTerm, setSearchTerm] = useState("");

    // ── Usuarios del sistema ────────────────────────────────────────────────
    const startLoadingUsers = useCallback(async () => {
        dispatch(setLoadingManagement(true));
        try {
            const token = await getFirebaseAuthToken();
            const { data } = await clientApi.get("/users", getAuthConfig({ token }));
            const adapted = data.map((u: any) => ({
                id: u._id,
                name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email.split('@')[0],
                email: u.email,
                role: u.role || 'Sin rol',
                status: u.status || 'Activo',
            }));
            dispatch(setUsers({ items: adapted, total: adapted.length, page: 0 }));
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar usuarios");
        } finally {
            dispatch(setLoadingManagement(false));
        }
    }, [dispatch]);

    // ── Trabajadores ────────────────────────────────────────────────────────
    // GET /workers  (@Public — no requiere token)
    const startLoadingWorkers = useCallback(async () => {
        dispatch(setLoadingWorkers(true));
        try {
            const { data } = await workerApi.get("/");
            const mapped = (Array.isArray(data) ? data : []).map((w: any) => {
                const u = typeof w.id_user === "object" ? w.id_user : {};
                return {
                    _id:               w._id,
                    first_name:        u.first_name  ?? "—",
                    last_name:         u.last_name   ?? "—",
                    email:             u.email       ?? "—",
                    phone:             u.phone       ?? "—",
                    document_type:     u.document_type   ?? "—",
                    document_number:   u.document_number ?? "—",
                    system_role:       u.role         ?? "—",   // rol de User (Administrador, Almacenero…)
                    worker_role:       w.role         ?? "—",   // cargo/posición del Worker
                    employment_status: w.employment_status ?? "—",
                    hired_at:          w.hired_at ? new Date(w.hired_at).toLocaleDateString("es-PE") : "—",
                };
            });
            dispatch(setWorkers(mapped));
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar trabajadores");
        } finally {
            dispatch(setLoadingWorkers(false));
        }
    }, [dispatch]);

    // Crear trabajador
    // POST /workers — requiere datos de usuario ya creado + cargo
    const startCreateWorker = useCallback(async (payload: {
        id_user: string;
        role: string;
    }) => {
        try {
            await workerApi.post("/", payload);
            toast.success("Trabajador registrado correctamente.");
            await startLoadingWorkers();
            return true;
        } catch (error: any) {
            toast.error(error?.response?.data?.message ?? "Error al crear trabajador.");
            return false;
        }
    }, [startLoadingWorkers]);

    // Actualizar trabajador
    // PATCH /workers/:id — requiere Bearer + ADMIN
    // UpdateWorkerDto: { full_name?, phone?, is_active? }
    // is_active: true → employment_status "Activo" | false → "Inactivo"
    const startUpdateWorker = useCallback(async (id: string, payload: { full_name?: string; phone?: string; is_active?: boolean }) => {
        try {
            const token = await getFirebaseAuthToken();
            await workerApi.patch(`/${id}`, payload, getAuthConfig({ token }));
            toast.success("Trabajador actualizado.");
            await startLoadingWorkers();
            return true;
        } catch (error: any) {
            toast.error(error?.response?.data?.message ?? "Error al actualizar trabajador.");
            return false;
        }
    }, [startLoadingWorkers]);

    // Eliminar trabajador
    // DELETE /workers/:id — requiere Bearer + ADMIN
    const startDeleteWorker = useCallback(async (id: string) => {
        try {
            const token = await getFirebaseAuthToken();
            await workerApi.delete(`/${id}`, getAuthConfig({ token }));
            toast.success("Trabajador eliminado.");
            await startLoadingWorkers();
            return true;
        } catch (error: any) {
            toast.error(error?.response?.data?.message ?? "Error al eliminar trabajador.");
            return false;
        }
    }, [startLoadingWorkers]);

    // ── Roles y permisos ────────────────────────────────────────────────────
    // GET /client/users/roles-permissions — público (datos no sensibles)
    const startLoadingRoles = useCallback(async () => {
        dispatch(setLoadingRoles(true));
        try {
            const { data } = await clientApi.get("/users/roles-permissions");
            const list = Array.isArray(data) ? data : [];
            dispatch(setRoles(
                list.map((r: any) => ({
                    name:        r.name,
                    user_count:  r.user_count ?? 0,
                    is_active:   r.is_active ?? true,
                    permissions: r.permissions ?? [],
                }))
            ));
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar roles del sistema.");
        } finally {
            dispatch(setLoadingRoles(false));
        }
    }, [dispatch]);

    // ── Paginación ──────────────────────────────────────────────────────────
    const setPageGlobal = (page: number) => dispatch(setPageManagement(page));
    const setRowsPerPageGlobal = (rows: number) => dispatch(setRowsPerPageManagement(rows));

    return {
        // estado
        users, workers, roles,
        loading, loadingWorkers, loadingRoles,
        total, currentPage, rowsPerPage, searchTerm,
        // acciones
        setSearchTerm, setPageGlobal, setRowsPerPageGlobal,
        startLoadingUsers,
        startLoadingWorkers,
        startCreateWorker,
        startUpdateWorker,
        startDeleteWorker,
        startLoadingRoles,
    };
};
