import axios from "axios";
import { serverEnv } from "@config-server";

export const supplyApi = axios.create({
	baseURL: `${serverEnv.BASE_URL}/supplies`,
});
