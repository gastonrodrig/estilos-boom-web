"use client";

import { useCallback, useState } from "react";
import { clientApi } from "@api";
import {
    useAppDispatch,
    useAppSelector,
    setLoadingManagement,
    setUsers,
    setRoles,
    setPageManagement,
    setRowsPerPageManagement,
    addRole,
    updateRole
} from "@store";
import { getAuthConfig } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import toast from "react-hot-toast";

export const useManagementStore = () => {
    const dispatch = useAppDispatch();
    const {
        users,
        roles,
        loading,
        total,
        currentPage,
        rowsPerPage
    } = useAppSelector((state) => state.management);

    const [searchTerm, setSearchTerm] = useState("");

    const startLoadingUsers = useCallback(async () => {
        dispatch(setLoadingManagement(true));
        try {
            const token = await getFirebaseAuthToken();
            // Corregido: Volvemos a las rutas originales que ya incluyen el prefijo en el cliente
            const { data } = await clientApi.get("/users", getAuthConfig({ token }));

            const adapted = data.map((u: any) => ({
                id: u._id,
                name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email.split('@')[0],
                email: u.email,
                role: u.role || 'Sin rol',
                status: u.status || 'Activo'
            }));

            dispatch(setUsers({ items: adapted, total: adapted.length, page: 0 }));
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar usuarios");
        } finally {
            dispatch(setLoadingManagement(false));
        }
    }, [dispatch]);

    const startLoadingRoles = useCallback(async () => {
        try {
            const token = await getFirebaseAuthToken();
            const { data } = await clientApi.get("/users/roles-permissions", getAuthConfig({ token }));

            const adaptedRoles = Object.keys(data).map(roleName => ({
                id: roleName.toLowerCase().replace(/\s+/g, '-'),
                name: roleName,
                permissions: data[roleName]
            }));

            dispatch(setRoles(adaptedRoles));
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar roles");
        }
    }, [dispatch]);

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

            dispatch(updateRole({ ...role, permissions: newPermissions }));
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
                permissions: data.permissions
            };

            dispatch(addRole(newRole));
            return newRole.id;
        } catch (error) {
            console.error(error);
            toast.error("Error al crear nuevo rol");
            return null;
        }
    };

    return {
        users, roles, loading, total, currentPage, rowsPerPage, searchTerm,
        setSearchTerm, setPageGlobal, setRowsPerPageGlobal,
        startLoadingUsers, startLoadingRoles, togglePermission, createNewRole
    };
};
