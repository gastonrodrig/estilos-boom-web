import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@store";
import {
    setProductionOrders,
    setSelectedProductionOrder,
    setLoadingProduction,
    setProductionError,
    updateProductionOrderInStore,
} from "../../store/production/production-slice";
import { productionApi } from "@api";
import { useCallback } from "react";
import { getFirebaseAuthToken } from "@helpers";
import { getAuthConfig, getAuthConfigWithParams } from "@utils";
import { AxiosRequestConfig } from "axios";

export const useProductionStore = () => {
    const dispatch = useDispatch();
    const { orders, selectedOrder, loading, error } = useSelector((state: RootState) => state.production);

    const getOptionalToken = useCallback(async () => {
        try {
            return await getFirebaseAuthToken();
        } catch {
            return null;
        }
    }, []);

    const getConfig = useCallback(
        async (params?: Record<string, unknown>): Promise<AxiosRequestConfig> => {
            const token = await getOptionalToken();
            if (token && params) return getAuthConfigWithParams({ token, params }) as AxiosRequestConfig;
            if (token) return getAuthConfig({ token }) as AxiosRequestConfig;
            return params ? { params } : {};
        },
        [getOptionalToken]
    );

    const startLoadingProductionOrders = useCallback(async () => {
        dispatch(setLoadingProduction(true));
        try {
            const config = await getConfig();
            const { data } = await productionApi.get("/production-orders", config);
            dispatch(setProductionOrders(data));
        } catch (error: any) {
            dispatch(setProductionError(error?.response?.data?.message || "Error al cargar órdenes de producción"));
        } finally {
            dispatch(setLoadingProduction(false));
        }
    }, [dispatch, getConfig]);

    const startLoadProductionOrder = useCallback(async (id: string) => {
        dispatch(setLoadingProduction(true));
        try {
            const config = await getConfig();
            const { data } = await productionApi.get(`/production-orders/${id}`, config);
            dispatch(setSelectedProductionOrder(data));
        } catch (error: any) {
            dispatch(setProductionError(error?.response?.data?.message || "Error al cargar la orden de producción"));
        } finally {
            dispatch(setLoadingProduction(false));
        }
    }, [dispatch, getConfig]);

    const startCreateProductionOrder = useCallback(async (payload: any) => {
        dispatch(setLoadingProduction(true));
        try {
            const config = await getConfig();
            const { data } = await productionApi.post("/production-orders", payload, config);
            
            // Refrescar toda la lista para incluir la nueva orden
            await startLoadingProductionOrders();
            
            return { ok: true, data };
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Error al crear la orden de producción";
            dispatch(setProductionError(msg));
            return { ok: false, message: msg };
        } finally {
            dispatch(setLoadingProduction(false));
        }
    }, [dispatch, getConfig, startLoadingProductionOrders]);

    const startUpdateWorkshopQuote = useCallback(async (id: string, payload: any) => {
        dispatch(setLoadingProduction(true));
        try {
            const config = await getConfig();
            const { data } = await productionApi.patch(`/production-orders/${id}/quote`, payload, config);
            dispatch(updateProductionOrderInStore(data));
            return { ok: true, data };
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Error al actualizar cotización";
            dispatch(setProductionError(msg));
            return { ok: false, message: msg };
        } finally {
            dispatch(setLoadingProduction(false));
        }
    }, [dispatch, getConfig]);

    const startConfirmWorkshop = useCallback(async (id: string, workshopId: string) => {
        dispatch(setLoadingProduction(true));
        try {
            const config = await getConfig();
            const { data } = await productionApi.patch(`/production-orders/${id}/confirm`, { id_workshop: workshopId }, config);
            dispatch(updateProductionOrderInStore(data));
            return { ok: true, data };
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Error al confirmar taller";
            dispatch(setProductionError(msg));
            return { ok: false, message: msg };
        } finally {
            dispatch(setLoadingProduction(false));
        }
    }, [dispatch, getConfig]);

    const startUpdateProductionStatus = useCallback(async (id: string, status: string) => {
        dispatch(setLoadingProduction(true));
        try {
            const config = await getConfig();
            const { data } = await productionApi.patch(`/production-orders/${id}/status`, { status }, config);
            dispatch(updateProductionOrderInStore(data));
            return { ok: true, data };
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Error al actualizar estado";
            dispatch(setProductionError(msg));
            return { ok: false, message: msg };
        } finally {
            dispatch(setLoadingProduction(false));
        }
    }, [dispatch, getConfig]);

    const startUpdateSubState = useCallback(async (id: string, step: string) => {
        dispatch(setLoadingProduction(true));
        try {
            const config = await getConfig();
            const { data } = await productionApi.patch(`/production-orders/${id}/substate`, { step }, config);
            dispatch(updateProductionOrderInStore(data));
            return { ok: true, data };
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Error al actualizar subestado";
            dispatch(setProductionError(msg));
            return { ok: false, message: msg };
        } finally {
            dispatch(setLoadingProduction(false));
        }
    }, [dispatch, getConfig]);

    return {
        orders,
        selectedOrder,
        loading,
        error,

        startLoadingProductionOrders,
        startLoadProductionOrder,
        startCreateProductionOrder,
        startUpdateWorkshopQuote,
        startConfirmWorkshop,
        startUpdateProductionStatus,
        startUpdateSubState,
    };
};
