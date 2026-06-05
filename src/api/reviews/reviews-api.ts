import axios from "axios";
import { serverEnv } from "@config-server";

export const reviewsApi = axios.create({
	baseURL: `${serverEnv.BASE_URL}/reviews`,
});
