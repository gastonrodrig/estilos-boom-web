import axios from "axios";
import { serverEnv } from "@config-server";

export const suggestionsApi = axios.create({
	baseURL: `${serverEnv.BASE_URL}/suggestions`,
});
