"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@store";
import { setLoading, setItems, setMetrics, removePayment } from "@store";
import { paymentApi } from "@api";
import { getAuthConfig } from "@utils";
import { getFirebaseAuthToken } from "@helpers";
import {
  paymentFromApi,
  paymentMetricsFromApi,
  buildPaymentRows,
  PaymentApi,
  PaymentMetricsApi,
  HttpError,
} from "@models";
import toast from "react-hot-toast";

export const usePaymentStore = () => {
  const dispatch = useAppDispatch();
  const { loading, items: payments, metrics } = useAppSelector((s) => s.payment);

  const startLoadingMetrics = useCallback(async (): Promise<boolean> => {
    try {
      const token = await getFirebaseAuthToken();
      const { data } = await paymentApi.get<PaymentMetricsApi>(
        "/summary",
        getAuthConfig({ token })
      );
      dispatch(setMetrics(paymentMetricsFromApi(data)));
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Error al cargar las métricas de pago.");
      return false;
    }
  }, [dispatch]);

  const startLoadingPayments = useCallback(async (): Promise<boolean> => {
    dispatch(setLoading(true));
    try {
      const token = await getFirebaseAuthToken();
      const { data } = await paymentApi.get<PaymentApi[]>(
        "/", // Fetches all payments from /admin/payments
        getAuthConfig({ token })
      );
      dispatch(setItems(data.map(paymentFromApi)));
      await startLoadingMetrics();
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Error al cargar los pagos.");
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, startLoadingMetrics]);

  const startConfirmPayment = async (id: string): Promise<boolean> => {
    dispatch(setLoading(true));
    try {
      const token = await getFirebaseAuthToken();
      await paymentApi.patch(`/manual/${id}/confirm`, {}, getAuthConfig({ token }));
      toast.success("Pago confirmado exitosamente.");
      await startLoadingPayments(); // reload all payments and metrics
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Error al confirmar el pago.");
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const startRejectPayment = async (id: string): Promise<boolean> => {
    dispatch(setLoading(true));
    try {
      const token = await getFirebaseAuthToken();
      await paymentApi.patch(`/manual/${id}/reject`, {}, getAuthConfig({ token }));
      toast.success("Pago rechazado correctamente.");
      await startLoadingPayments(); // reload all payments
      return true;
    } catch (error: unknown) {
      const message = (error as HttpError).response?.data?.message;
      toast.error(message ?? "Error al rechazar el pago.");
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const paymentRows = buildPaymentRows(payments);

  return {
    loading,
    payments,
    metrics,
    paymentRows,
    startLoadingPayments,
    startLoadingMetrics,
    startConfirmPayment,
    startRejectPayment,
  };
};
