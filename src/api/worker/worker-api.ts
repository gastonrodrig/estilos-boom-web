import axios from "axios";
import { serverEnv } from "@config-server";

export const workerApi = axios.create({
  baseURL: `${serverEnv.BASE_URL}/workers`,
});
