import axios from "axios";
import { serverEnv } from "@config-server";

export const supplierApi = axios.create({
  baseURL: `${serverEnv.BASE_URL}/suppliers`,
});
