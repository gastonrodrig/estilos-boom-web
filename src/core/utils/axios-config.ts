export interface AuthConfigOptions {
  token: string | null;
  isFormData?: boolean;
}

export interface AuthConfigWithParamsOptions {
  token: string | null;
  params?: Record<string, unknown>;
}

export const getAuthConfig = ({ token, isFormData = false }: AuthConfigOptions) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": isFormData ? "multipart/form-data" : "application/json",
  },
});

export const getAuthConfigWithParams = ({ token, params = {} }: AuthConfigWithParamsOptions) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  params,
});
