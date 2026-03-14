"use client";

import { useState } from "react";
import { clientApi } from "@api";
import { 
  useAppDispatch,
  useAppSelector,
  setLoadingClientPerson,
  refreshClientsPerson
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
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const startCreateClientPerson = async (clientPerson: ClientPerson) => {
    dispatch(setLoadingClientPerson(true));
    try {
      const payload = createClientPersonModel(clientPerson);
      const token = await getFirebaseAuthToken();
      await clientApi.post("/client-admin", payload, getAuthConfig({ token }));
      await startLoadingClientsPersonPaginated();
      toast.success("El cliente persona fue creado exitosamente.");
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message
      toast.error(message ?? "Ocurrió un error al registrar el cliente persona.");
      return false;
    } finally {
      dispatch(setLoadingClientPerson(false));
    }
  };

  const startLoadingClientsPersonPaginated = async () => {
    dispatch(setLoadingClientPerson(true));
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
      const message = (error as HttpError).response?.data?.message
      toast.error(message ?? "Ocurrió un error al cargar los clientes persona.");
      return false;
    } finally {
      dispatch(setLoadingClientPerson(false));
    }
  };

  const startUpdateClientPerson = async (
    id: string, 
    client: ClientPerson
  ) => {
    dispatch(setLoadingClientPerson(true));
    try {
      const payload = updateClientPersonModel(client);
      const token = await getFirebaseAuthToken();
      await clientApi.patch(`/client-admin/${id}`, payload, getAuthConfig({ token }));
      await startLoadingClientsPersonPaginated();
      toast.success("El cliente persona fue actualizado exitosamente.");
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Ocurrió un error al actualizar el cliente.");
      return false;
    } finally {
      dispatch(setLoadingClientPerson(false));
    }
  };

  return {
    clientsPerson,
    selected,
    total,
    loading,
    currentPage,
    rowsPerPage,
    searchTerm,
    setSearchTerm,
    orderBy,
    setOrderBy,
    order,
    setOrder,
    startCreateClientPerson,
    startLoadingClientsPersonPaginated,
    startUpdateClientPerson
  };
};