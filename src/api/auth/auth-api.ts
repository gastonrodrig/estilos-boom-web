import axios from "axios";
import { serverEnv } from "@config-server";

export const AuthApi = axios.create({
  baseURL: `${serverEnv.BASE_URL}/auth`,
});