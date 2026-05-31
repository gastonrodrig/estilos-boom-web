import axios from 'axios';

const NEXT_PUBLIC_BASE_URL_DEV = process.env.NEXT_PUBLIC_BASE_URL_DEV || 'http://localhost:3001/api/v1';

export const mercadopagoApi = {
  createPreference: async (payload: any) => {
    const response = await axios.post(`${NEXT_PUBLIC_BASE_URL_DEV}/mercadopago/preference`, payload);
    return response.data;
  },
  processPayment: async (payload: any) => {
    const response = await axios.post(`${NEXT_PUBLIC_BASE_URL_DEV}/mercadopago/process`, payload);
    return response.data;
  }
};
