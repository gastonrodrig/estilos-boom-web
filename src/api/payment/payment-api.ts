import axios from "axios";
import { serverEnv } from "@config-server";

export const paymentApi = axios.create({
  baseURL: `${serverEnv.BASE_URL}/admin/payments`,
});

export const manualPaymentApi = axios.create({
  baseURL: `${serverEnv.BASE_URL}/payment-manual`,
});

