import axios from "axios";
import { serverEnv } from "@config-server";

export const storehouseApi = axios.create({
	baseURL: `${serverEnv.BASE_URL}`,
});
