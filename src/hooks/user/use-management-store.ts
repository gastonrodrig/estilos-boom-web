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
                const u = w.id_user;
                return {
                    _id:               w._id,
                    first_name:        u?.first_name  ?? "—",
                    last_name:         u?.last_name   ?? "—",
                    email:             u?.email       ?? "—",
                    phone:             u?.phone       ?? "—",
                    document_type:     u?.document_type   ?? "—",
                    document_number:   u?.document_number ?? "—",
                    system_role:       u?.role         ?? "—",   // rol de User (Administrador, Almacenero…)
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
                    id:          r.name.toLowerCase().replace(/\s+/g, '-'),
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

    const togglePermission = async (roleId: string, item: any, isActive: boolean) => {
        const role = roles.find(r => r.id === roleId);
        if (!role) return;

        let newPermissions = [...role.permissions];

        if (isActive) {
            newPermissions = newPermissions.filter(p => !item.matches(p));
        } else {
            const toAdd: Record<string, string[]> = {
                'dash_metrics': ['dashboard:view'],
                'cat_view': ['products:view', 'categories:view', 'production:view'],
                'cat_manage': ['products:add', 'products:edit', 'categories:edit'],
                'inv_view': ['products_inventory:view', 'supplies_inventory:view'],
                'inv_manage': ['products_inventory:update', 'supplies_inventory:create', 'supplies_inventory:update'],
                'log_view': ['orders:view', 'payments:view'],
                'log_manage': ['orders:manage', 'procurement:update']
            };

            const permsToAdd = toAdd[item.id] || [];
            permsToAdd.forEach(p => {
                if (!newPermissions.includes(p)) newPermissions.push(p);
            });
        }

        try {
            const token = await getFirebaseAuthToken();
            await clientApi.patch(`/users/roles-permissions/${role.name}`, {
                permissions: newPermissions
            }, getAuthConfig({ token }));

            dispatch(setRoles(roles.map(r => r.id === roleId ? { ...r, permissions: newPermissions } : r)));
            toast.success("Permisos guardados satisfactoriamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar cambios");
        }
    };

    const createNewRole = async (name: string, permissions: string[] = []) => {
        try {
            const token = await getFirebaseAuthToken();
            const { data } = await clientApi.post("/users/roles-permissions", {
                name,
                permissions
            }, getAuthConfig({ token }));

            const newRole = {
                id: name.toLowerCase().replace(/\s+/g, '-'),
                name: data.name,
                permissions: data.permissions,
                user_count: 0,
                is_active: true
            };

            dispatch(setRoles([...roles, newRole]));
            return newRole.id;
        } catch (error) {
            console.error(error);
            toast.error("Error al crear nuevo rol");
            return null;
        }
    };

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
        togglePermission,
        createNewRole,
    };
};
