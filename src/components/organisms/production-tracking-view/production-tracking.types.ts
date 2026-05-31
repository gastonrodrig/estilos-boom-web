export interface ChatMessage {
  sender: "bot" | "workshop";
  text: string;
  timestamp: string | Date;
}

export interface ProductionProgress {
  corteIniciado?: boolean;
  fechaEstimadaCorte?: string;
  costuraIniciada?: boolean;
  unidadesListas?: number;
  fechaProyectadaFin?: string;
}

export interface ProductionBaseItem {
  id_variant?: string;
  quantity: number;
  unit_cost?: number;
}

export interface TrackingOrder {
  _id: string;
  order_number?: string;
  pre_order_number?: string;
  status: string;
  botState?: string;
  workshopPhone?: string;
  workshopName?: string;
  progress?: ProductionProgress;
  chatHistory?: ChatMessage[];
  base_items?: ProductionBaseItem[];
}