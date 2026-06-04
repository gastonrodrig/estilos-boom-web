import axios from 'axios';
import { serverEnv } from "@config-server";

export const ordersApi = axios.create({
  baseURL: `${serverEnv.BASE_URL}/orders`,
  headers: {
    'Content-Type': 'application/json',
  },
});
