import axios from "axios";
import { serverEnv } from "@config-server";

export const cartApi = axios.create({
	baseURL: `${serverEnv.BASE_URL}/cart`,
});
