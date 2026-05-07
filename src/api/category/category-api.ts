import axios from "axios";
import { serverEnv } from "@config-server";

export const categoryApi = axios.create({
  baseURL: `${serverEnv.BASE_URL}/categories`,
});