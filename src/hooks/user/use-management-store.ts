"use client";

import { useCallback, useState } from "react";
import { clientApi } from "@api";
import {
    useAppDispatch,
    useAppSelector,
    setLoadingManagement,
    setUsers,
    setPageManagement,
    setRowsPerPageManagement
} from "@store";
import { getAuthConfig } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import toast from "react-hot-toast";

export const useManagementStore = () => {
    const dispatch = useAppDispatch();
    const {
        users,

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


    const setPageGlobal = (page: number) => dispatch(setPageManagement(page));
    const setRowsPerPageGlobal = (rows: number) => dispatch(setRowsPerPageManagement(rows));

    return {
        users, loading, total, currentPage, rowsPerPage, searchTerm,
        setSearchTerm, setPageGlobal, setRowsPerPageGlobal,
        startLoadingUsers
    };
};
