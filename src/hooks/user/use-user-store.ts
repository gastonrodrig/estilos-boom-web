"use client";

import { clientApi } from "@api";
import {
  useAppDispatch, 
  useAppSelector,
  removeClientProfile,
  setClientData,
  setClientProfile,
  setLoadingClientProfile,
  stopLoadingClientProfile,
  showSnackbar,
} from "@store";
import {
  createUserGoogleModel,
  createUserEmailPasswordModel,
  updateClientDataModel,
  updateClientProfileModel,
} from "@models";
import { getAuthConfig } from "@utils";
import { HttpError } from "@types";
import { getFirebaseAuthToken } from "@helpers";


export const useUsersStore = () => {
  const dispatch = useAppDispatch();

  const {
    uid,
    email,
    firstName,
    lastName,
    phone,
    documentType,
    documentNumber,
    photoURL,
  } = useAppSelector((state) => state.auth);

  const { loadingClientProfile } = useAppSelector((state) => state.clientProfile);

  const openSnackbar = (message: string) => dispatch(showSnackbar({ message }));

  // Crear usuario (google o email/password)
  const startCreateUser = async (
    user: any,
    method: "google" | "email/password"
  ) => {
    try {
      const modelMap = {
        "google": createUserGoogleModel,
        "email/password": createUserEmailPasswordModel,
      };

      const payload = modelMap[method](user);
      const { data } = await clientApi.post("/client-landing", payload);

      return { ok: true, data };
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      openSnackbar(message ?? "Ocurrió un error al registrar el cliente.");
      return { ok: false, data: null };
    }
  };

  // Encontrar usuario por email
  const findUserByEmail = async (
    email: string
  ) => {
    try {
      const { data } = await clientApi.get(`find/${email}`);
      return data ? { ok: true, data } : { ok: false, data: null };
    } catch {
      return { ok: false, data: null };
    }
  };

  // Cargar usuario por documento
  const startLoadingUserDocument = async (
    documentNumber: string,
    documentType: string,
    clientType: string
  ) => {
    try {
      const token = await getFirebaseAuthToken();
      const { data } = await clientApi.get(
        `/get/document?document_number=${documentNumber}&document_type=${documentType}&client_type=${clientType}`,
        getAuthConfig({ token })
      );
      return data;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message
      openSnackbar(message ?? "Ocurrió un error al buscar el usuario.");
      return null;
    }
  };

  // Modificar datos extra del cliente
  const startUpdateExtraData = async (
    uid: string,
    extraData: any
  ): Promise<boolean> => {
    dispatch(setLoadingClientProfile());

    try {
      const token = await getFirebaseAuthToken();
      const payload = updateClientDataModel(extraData);
      const { data } = await clientApi.patch(
        `extra-data/${uid}`,
        payload,
        getAuthConfig({ token })
      );

      dispatch(
        setClientData({
          firstName: data.first_name,
          lastName: data.last_name,
          phone: data.phone,
          documentType: data.document_type,
          documentNumber: data.document_number,
        })
      );

      openSnackbar("Datos actualizados correctamente.");
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message
      openSnackbar(message ?? "Ocurrió un error al actualizar los datos.");
      return false;
    } finally {
      dispatch(stopLoadingClientProfile());
    }
  };

  // Modificar datos del perfil del cliente
  const startUpdateClientProfileData = async (
    uid: string,
    profileData: any
  ): Promise<boolean> => {
    dispatch(setLoadingClientProfile());

    try {
      const token = await getFirebaseAuthToken();
      const payload = updateClientDataModel(profileData);

      const { data } = await clientApi.patch(
        `client-profile/${uid}`,
        payload,
        getAuthConfig({ token })
      );

      dispatch(
        setClientData({
          firstName: data.first_name,
          lastName: data.last_name,
          phone: data.phone,
          documentType: data.document_type,
          documentNumber: data.document_number,
        })
      );

      openSnackbar("Datos actualizados correctamente.");
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message
      openSnackbar(message ?? "Ocurrió un error al actualizar los datos.");
      return false;
    } finally {
      dispatch(stopLoadingClientProfile());
    }
  };

  // Modificar foto de perfil del cliente
  const startUpdateClientProfilePicture = async (
    uid: string,
    profileData: any
  ): Promise<boolean> => {
    dispatch(setLoadingClientProfile());

    try {
      const token = await getFirebaseAuthToken();
      const payload = updateClientProfileModel(profileData);

      const { data } = await clientApi.patch(
        `upload-photo/${uid}`,
        payload,
        getAuthConfig({ token, isFormData: true })
      );

      dispatch(setClientProfile({ photoURL: data.profile_picture }));

      openSnackbar("Foto de perfil actualizada correctamente.");
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message
      openSnackbar(message ?? "Ocurrió un error al actualizar la foto.");
      return false;
    } finally {
      dispatch(stopLoadingClientProfile());
    }
  };

  // Eliminar foto de perfil del cliente
  const startRemoveClientProfilePicture = async (uid: string): Promise<boolean> => {
    dispatch(setLoadingClientProfile());

    try {
      const token = await getFirebaseAuthToken();
      await clientApi.patch(`remove-photo/${uid}`, {}, getAuthConfig({ token }));

      dispatch(removeClientProfile());
      openSnackbar("Foto de perfil eliminada correctamente.");

      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message 
      openSnackbar(message ?? "Ocurrió un error al eliminar la foto de perfil.");
      return false;
    } finally {
      dispatch(stopLoadingClientProfile());
    }
  };

  return {
    // state
    uid,
    email,
    firstName,
    lastName,
    phone,
    documentType,
    documentNumber,
    photoURL,
    loadingClientProfile,

    // actions
    startCreateUser,
    findUserByEmail,
    startUpdateExtraData,
    startUpdateClientProfileData,
    startUpdateClientProfilePicture,
    startRemoveClientProfilePicture,
    startLoadingUserDocument,
  };
};
