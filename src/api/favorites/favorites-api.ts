import axios from "axios";
import { serverEnv } from "@config-server";

export const favoritesApi = axios.create({
	baseURL: `${serverEnv.BASE_URL}/favorites`,
});

// Since favorites endpoints require authentication, 
// make sure to add the interceptor if you have a central one,
// or the token in the headers when calling the methods.
