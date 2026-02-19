"use client";

import { clientApi } from "@api";
import {
  useAppDispatch, 
  useAppSelector,
  removeClientProfile,
  // setClientProfile,
  setLoadingClientProfile,
  stopLoadingClientProfile,
  setClientData,
} from "@store";
import {
  updateClientDataToApi,
  ExtraInformationValues,
  HttpError
  // updateClientDataToApi,
} from "@models";
import { getAuthConfig } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import { ClientType } from "@enums";
import toast from "react-hot-toast";

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
      return data ?? null;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message
      toast.error(message ?? "Ocurrió un error al buscar el usuario.");
      return null;
    }
  };

  // Modificar datos extra del cliente
  const startUpdateExtraData = async (
    uid: string,
    extraData: ExtraInformationValues
  ): Promise<boolean> => {
    dispatch(setLoadingClientProfile());

    try {
      const token = await getFirebaseAuthToken();
      const payload = updateClientDataToApi(extraData);
      const { data } = await clientApi.patch(
        `extra-data/${uid}`,
        payload,
        getAuthConfig({ token })
      );
      const isCompany = !!data.company_name;

      dispatch(
        setClientData({
          phone: data.phone,
          documentType: data.document_type,
          documentNumber: data.document_number,
          clientType: isCompany ? ClientType.COMPANY : ClientType.PERSON,

          firstName: isCompany ? null : data.first_name,
          lastName: isCompany ? null : data.last_name,

          companyName: isCompany ? data.company_name : null,
          contactName: isCompany ? data.contact_name : null,
        })
      );

      toast.success("Datos actualizados correctamente.");
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message
      toast.error(message ?? "Ocurrió un error al actualizar los datos.");
      return false;
    } finally {
      dispatch(stopLoadingClientProfile());
    }
  };

  // Modificar datos del perfil del cliente
  // const startUpdateClientProfileData = async (
  //   uid: string,
  //   profileData: any
  // ): Promise<boolean> => {
  //   dispatch(setLoadingClientProfile());

  //   try {
  //     const token = await getFirebaseAuthToken();
  //     const payload = updateClientDataModel(profileData);

  //     const { data } = await clientApi.patch(
  //       `client-profile/${uid}`,
  //       payload,
  //       getAuthConfig({ token })
  //     );

  //     dispatch(
  //       setClientData({
  //         firstName: data.first_name,
  //         lastName: data.last_name,
  //         phone: data.phone,
  //         documentType: data.document_type,
  //         documentNumber: data.document_number,
  //       })
  //     );

  //     toast.success("Datos actualizados correctamente.");
  //     return true;
  //   } catch (error: unknown) {
  //     const message = (error as HttpError).response?.data?.message
  //     toast.error(message ?? "Ocurrió un error al actualizar los datos.");
  //     return false;
  //   } finally {
  //     dispatch(stopLoadingClientProfile());
  //   }
  // };

  // Modificar foto de perfil del cliente
  // const startUpdateClientProfilePicture = async (
  //   uid: string,
  //   profileData: any
  // ): Promise<boolean> => {
  //   dispatch(setLoadingClientProfile());

  //   try {
  //     const token = await getFirebaseAuthToken();
  //     const payload = updateClientProfileModel(profileData);

  //     const { data } = await clientApi.patch(
  //       `upload-photo/${uid}`,
  //       payload,
  //       getAuthConfig({ token, isFormData: true })
  //     );

  //     dispatch(setClientProfile({ photoURL: data.profile_picture }));

  //     toast.success("Foto de perfil actualizada correctamente.");
  //     return true;
  //   } catch (error: unknown) {
  //     const message = (error as HttpError).response?.data?.message
  //     toast.error(message ?? "Ocurrió un error al actualizar la foto.");
  //     return false;
  //   } finally {
  //     dispatch(stopLoadingClientProfile());
  //   }
  // };

  // Eliminar foto de perfil del cliente
  const startRemoveClientProfilePicture = async (uid: string): Promise<boolean> => {
    dispatch(setLoadingClientProfile());

    try {
      const token = await getFirebaseAuthToken();
      await clientApi.patch(`remove-photo/${uid}`, {}, getAuthConfig({ token }));

      dispatch(removeClientProfile());
      toast.success("Foto de perfil eliminada correctamente.");

      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message 
      toast.error(message ?? "Ocurrió un error al eliminar la foto de perfil.");
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
    startUpdateExtraData,
    // startUpdateClientProfileData,
    // startUpdateClientProfilePicture,
    startRemoveClientProfilePicture,
    startLoadingUserDocument,
  };
};
