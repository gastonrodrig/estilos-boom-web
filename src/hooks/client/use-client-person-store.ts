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

export const useClientPersonStore = () => {
  const dispatch = useAppDispatch();

  const {
    clientsPerson,
    selected,
    total,
    loading,
    currentPage,
    rowsPerPage,
  } = useAppSelector((state) => state.clientPerson);

  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('first_name');
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

  const startCreateClientPerson = async (clientPerson: ClientPerson) => {
    dispatch(setLoadingClientPerson(true));
    setLoadError(null);
    try {
      const payload = createClientPersonModel(clientPerson);
      const token = await getFirebaseAuthToken();
      await clientApi.post("/client-admin", payload, getAuthConfig({ token }));
      await startLoadingClientsPersonPaginated();
      toast.success("El cliente persona fue creado exitosamente.");
      return true;
    } catch (error: unknown) {
      const friendlyMessage = getFriendlyErrorMessage(
        error,
        "Ocurrió un error al registrar el cliente persona."
      );
      setLoadError(friendlyMessage);
      toast.error(friendlyMessage);
      return false;
    } finally {
      dispatch(setLoadingClientPerson(false));
    }
  };

  const startLoadingClientsPersonPaginated = useCallback(async () => {
    dispatch(setLoadingClientPerson(true));
    setLoadError(null);
    try {
      const token = await getFirebaseAuthToken();
      const limit = rowsPerPage;
      const offset = currentPage * rowsPerPage;
      const { data } = await clientApi.get(
        "/customers-paginated",
        getAuthConfigWithParams({
          token,
          params: {
            limit,
            offset,
            search: searchTerm.trim(),
            sortField: orderBy,
            sortOrder: order,
            clientType: ClientType.PERSON,
          },
        })
      );
      dispatch(refreshClientsPerson({
        items: data.items,
        total: data.total,
        page: currentPage,
      }));
      return true;
    } catch (error: unknown) {
      const friendlyMessage = getFriendlyErrorMessage(
        error,
        "Ocurrió un error al cargar los clientes persona."
      );

      setLoadError(friendlyMessage);
      toast.error(friendlyMessage);
      return false;
    } finally {
      dispatch(setLoadingClientPerson(false));
    }
  }, [dispatch, rowsPerPage, currentPage, searchTerm, orderBy, order, getFriendlyErrorMessage]);

  const startUpdateClientPerson = async (
    id: string,
    client: ClientPerson
  ) => {
    dispatch(setLoadingClientPerson(true));
    setLoadError(null);
    try {
      const payload = updateClientPersonModel(client);
      const token = await getFirebaseAuthToken();
      await clientApi.patch(`/client-admin/${id}`, payload, getAuthConfig({ token }));
      await startLoadingClientsPersonPaginated();
      toast.success("El cliente persona fue actualizado exitosamente.");
      return true;
    } catch (error: unknown) {
      const friendlyMessage = getFriendlyErrorMessage(
        error,
        "Ocurrió un error al actualizar el cliente."
      );
      setLoadError(friendlyMessage);
      toast.error(friendlyMessage);
      return false;
    } finally {
      dispatch(setLoadingClientPerson(false));
    }
  };

  const setSelectedClientPerson = (client: ClientPerson | null) => {
    dispatch(selectedClientPerson(client ? { ...client } : null));
  };

  const setPageGlobal = (page: number) => {
    dispatch(setPageClientPerson(page));
  };

  const setRowsPerPageGlobal = (rows: number) => {
    dispatch(setRowsPerPageClientPerson(rows));
  };

  return {
    // state
    clientsPerson,
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
    setSelectedClientPerson,
    setPageGlobal,
    setRowsPerPageGlobal,

    // actions
    startCreateClientPerson,
    startLoadingClientsPersonPaginated,
    startUpdateClientPerson,
  };
};