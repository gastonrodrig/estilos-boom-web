import axios from "axios";
import { serverEnv } from "@config-server";

export const workshopApi = axios.create({
  baseURL: `${serverEnv.BASE_URL}/workshops`,
  headers: {
    "Content-Type": "application/json",
  },
});
