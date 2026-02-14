import axios from "axios";
import { serverEnv } from "@config-server";

export const clientApi = axios.create({
  baseURL: `${serverEnv.BASE_URL}/client`,
});