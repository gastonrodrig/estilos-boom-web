import axios from "axios";
import { serverEnv } from "@config-server";

export const paymentApi = axios.create({
  baseURL: `${serverEnv.BASE_URL}/payments`,
});
