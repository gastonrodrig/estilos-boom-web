import axios from "axios";
import { serverEnv } from "@config-server";

export const productApi = axios.create({
  baseURL: `${serverEnv.BASE_URL}/products`,
});