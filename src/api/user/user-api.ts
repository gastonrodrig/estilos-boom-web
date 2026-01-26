import axios from "axios";
import { serverEnv } from "@config-server";

export const userApi = axios.create({
  baseURL: serverEnv.BASE_URL,
});
