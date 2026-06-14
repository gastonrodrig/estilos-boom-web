import axios from 'axios';

const NEXT_PUBLIC_BASE_URL_DEV = process.env.NEXT_PUBLIC_BASE_URL_DEV || 'http://localhost:3001/api/v1';

export const mercadopagoApi = {
  createPreference: async (payload: any, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await axios.post(`${NEXT_PUBLIC_BASE_URL_DEV}/mercadopago/preference`, payload, { headers });
    return response.data;
  },
  processPayment: async (payload: any, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await axios.post(`${NEXT_PUBLIC_BASE_URL_DEV}/mercadopago/process`, payload, { headers });
    return response.data;
  }
};
