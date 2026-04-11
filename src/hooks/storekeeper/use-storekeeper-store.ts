"use client";

import { useCallback, useState } from "react";
import { clientApi } from "@api";
import {
  useAppDispatch,
  useAppSelector,
  setLoadingClientPerson,
  refreshClientsPerson,
  selectedClientPerson,
  setPageClientPerson,
  setRowsPerPageClientPerson
} from "@store"
import {
  ClientPerson,
  createClientPersonModel,
  HttpError,
  updateClientPersonModel
} from "@models";
import { getAuthConfig, getAuthConfigWithParams } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import { ClientType } from "@enums";
import toast from "react-hot-toast";
import { createWorkshopModel, updateWorkshopModel, Workshop } from "@/core/models/storekeeper/storekeeper.models";
import { refreshWorkshops, selectedWorkshop, setLoadingWorkshop, setPageWorkshop, setRowsPerPageWorkshop } from "@/store/storekeeper/storekeeper-workshop-slice";
import { workshopApi } from "@/api/storekeeper";

export const useStorekeeperStore = () => {
  const dispatch = useAppDispatch();

  const {
    workshops,
    selected,
    total,
    loading,
    currentPage,
    rowsPerPage,
  } = useAppSelector((state) => state.storekeeper);

  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [loadError, setLoadError] = useState<string | null>(null);

  const getFriendlyErrorMessage = useCallback(
    (error: unknown, fallbackMessage: string) => {
      const httpError = error as HttpError;
      const rawMessage = String(httpError.response?.data?.message ?? "");
      const normalizedMessage = rawMessage.toLowerCase();

      const isThrottled =
        httpError.response?.status === 429 ||
        normalizedMessage.includes("throttlerexception") ||
        normalizedMessage.includes("too many requests");

      if (isThrottled) {
        return "Demasiadas solicitudes en poco tiempo. Intenta nuevamente en unos segundos.";
      }

      return rawMessage || fallbackMessage;
    },
    []
  );

  const startCreateWorkshop = async (workshop: Workshop) => {
    dispatch(setLoadingWorkshop(true));
    setLoadError(null);
    try {
      const payload = createWorkshopModel(workshop);
      const token = await getFirebaseAuthToken();
      await workshopApi.post("/create", payload, getAuthConfig({ token }));
      await startLoadingWorkshopsPaginated();
      toast.success("El taller fue creado exitosamente.");
      return true;
    } catch (error: unknown) {
      const friendlyMessage = getFriendlyErrorMessage(
        error,
        "Ocurrió un error al registrar el taller."
      );
      setLoadError(friendlyMessage);
      toast.error(friendlyMessage);
      return false;
    } finally {
      dispatch(setLoadingWorkshop(false));
    }
  };

  const startLoadingWorkshopsPaginated = useCallback(async () => {
    dispatch(setLoadingWorkshop(true));
    setLoadError(null);
    try {
      const token = await getFirebaseAuthToken();
      const limit = rowsPerPage;
      const offset = currentPage * rowsPerPage;
      const { data } = await workshopApi.get(
        "/paginated",
        getAuthConfigWithParams({
          token,
          params: {
            limit,
            offset,
            search: searchTerm.trim(),
            sortField: orderBy,
            sortOrder: order,
          },
        })
      );

      dispatch(refreshWorkshops({
        items: data.items,
        total: data.total,
        page: currentPage,
      }));
      return true;
    } catch (error: unknown) {
      const friendlyMessage = getFriendlyErrorMessage(
        error,
        "Ocurrió un error al cargar los talleres."
      );

      setLoadError(friendlyMessage);
      toast.error(friendlyMessage);
      return false;
    } finally {
      dispatch(setLoadingWorkshop(false));
    }
  }, [dispatch, rowsPerPage, currentPage, searchTerm, orderBy, order, getFriendlyErrorMessage]);

  const startUpdateWorkshop = async (
    id: string,
    workshop: Workshop
  ) => {
    dispatch(setLoadingWorkshop(true));
    setLoadError(null);
    try {
      const payload = updateWorkshopModel(workshop);
      const token = await getFirebaseAuthToken();
      await workshopApi.patch(`/${id}`, payload, getAuthConfig({ token }));
      await startLoadingWorkshopsPaginated();
      toast.success("El taller fue actualizado exitosamente.");
      return true;
    } catch (error: unknown) {
      const friendlyMessage = getFriendlyErrorMessage(
        error,
        "Ocurrió un error al actualizar el taller."
      );
      setLoadError(friendlyMessage);
      toast.error(friendlyMessage);
      return false;
    } finally {
      dispatch(setLoadingWorkshop(false));
    }
  };

  const startSoftDeleteWorkshop = async (
    id?: string,
  ) => {
    dispatch(setLoadingWorkshop(true));
    setLoadError(null);
    try {
      const token = await getFirebaseAuthToken();
      await workshopApi.delete(`/${id}`, getAuthConfig({ token }));
      await startLoadingWorkshopsPaginated();
      toast.success("El taller fue eliminado exitosamente.");
      return true;
    } catch (error: unknown) {
      const friendlyMessage = getFriendlyErrorMessage(
        error,
        "Ocurrió un error al eliminar el taller."
      );
      setLoadError(friendlyMessage);
      toast.error(friendlyMessage);
      return false;
    } finally {
      dispatch(setLoadingWorkshop(false));
    }
  };

  const setSelectedWorkshop = (workshop: Workshop | null) => {
    dispatch(selectedWorkshop(workshop ? { ...workshop } : null));
  };

  const setPageGlobal = (page: number) => {
    dispatch(setPageWorkshop(page));
  };

  const setRowsPerPageGlobal = (rows: number) => {
    dispatch(setRowsPerPageWorkshop(rows));
  };

  return {
    // state
    workshops,
    selected,
    total,
    loading,
    loadError,
    searchTerm,
    rowsPerPage,
    currentPage,
    orderBy,
    order,

    // setters
    setSearchTerm,
    setOrderBy,
    setOrder,
    setSelectedWorkshop,
    setPageGlobal,
    setRowsPerPageGlobal,

    // actions
    startCreateWorkshop,
    startLoadingWorkshopsPaginated,
    startUpdateWorkshop,
    startSoftDeleteWorkshop,
  };
};