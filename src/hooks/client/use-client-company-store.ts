"use client";

import { useState } from "react";
import { clientApi } from "@api";
import { 
  useAppDispatch,
  useAppSelector,
  setLoadingClientCompany,
  refreshClientsCompany
} from "@store"
import { 
  ClientCompany,
  createClientCompanyModel,
  HttpError,
  updateClientCompanyModel
} from "@models";
import { getAuthConfig, getAuthConfigWithParams } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import { ClientType } from "@enums";
import toast from "react-hot-toast";

export const useClientCompanyStore = () => {
  const dispatch = useAppDispatch();

  const {
    clientsCompany,
    selected,
    total,
    loading,
    currentPage,
    rowsPerPage,
  } = useAppSelector((state) => state.clientCompany);

  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const startCreateClientCompany = async (clientCompany: ClientCompany) => {
    dispatch(setLoadingClientCompany(true));
    try {
      const payload = createClientCompanyModel(clientCompany);
      const token = await getFirebaseAuthToken();
      await clientApi.post("/client-admin", payload, getAuthConfig({ token }));
      await startLoadingClientsCompanyPaginated();
      toast.success("El cliente empresa fue creado exitosamente.");
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message
      toast.error(message ?? "Ocurrió un error al registrar el cliente empresa.");
      return false;
    } finally {
      dispatch(setLoadingClientCompany(false));
    }
  };

  const startLoadingClientsCompanyPaginated = async () => {
    dispatch(setLoadingClientCompany(true));
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
            clientType: ClientType.COMPANY,
          },
        })
      );
        dispatch(refreshClientsCompany({
        items: data.items,
        total: data.total,
        page: currentPage,
      }));
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message
      toast.error(message ?? "Ocurrió un error al cargar los clientes empresa.");
      return false;
    } finally {
      dispatch(setLoadingClientCompany(false));
    }
  };

  const startUpdateClientCompany = async (
    id: string, 
    client: ClientCompany
  ) => {
    dispatch(setLoadingClientCompany(true));
    try {
      const payload = updateClientCompanyModel(client);
      const token = await getFirebaseAuthToken();
      await clientApi.patch(`/client-admin/${id}`, payload, getAuthConfig({ token }));
      await startLoadingClientsCompanyPaginated();
      toast.success("El cliente empresa fue actualizado exitosamente.");
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Ocurrió un error al actualizar el cliente.");
      return false;
    } finally {
      dispatch(setLoadingClientCompany(false));
    }
  };

  return {
    clientsCompany,
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
    startCreateClientCompany,
    startLoadingClientsCompanyPaginated,
    startUpdateClientCompany
  };
};