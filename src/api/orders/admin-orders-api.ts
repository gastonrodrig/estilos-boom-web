import axios, { AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const adminOrdersApi = {
  // Obtener todas las órdenes de venta (Pendientes, Preparando, etc.)
  getAdminOrders: async (config?: AxiosRequestConfig) => {
    const response = await axios.get(`${API_URL}/admin/orders`, config);
    return response.data;
  },

  // Actualizar el estado de una orden
  updateOrderStatus: async (orderId: string, status: string, config?: AxiosRequestConfig) => {
    const response = await axios.patch(`${API_URL}/admin/orders/${orderId}/status`, { status }, config);
    return response.data;
  }
};
