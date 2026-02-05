import { Benefit } from "@/components/molecules/benefit-card/benefit-card";
import { CreditCard, Lock, MapPin, Truck } from "lucide-react";

export const benefits: Benefit[] = [
  {
    icon: Truck,
    title: "ENVÍOS GRATIS A TODO PERÚ",
    subtitle: "por compras mayores a S/ 149",
  },
  {
    icon: Lock,
    title: "PAGOS 100% SEGUROS",
    subtitle: "protección garantizada",
  },
  {
    icon: CreditCard,
    title: "MÚLTIPLES MEDIOS DE PAGO",
    subtitle: "tarjeta o transferencia",
  },
  {
    icon: MapPin,
    title: "PUNTOS DE RECOJO",
    subtitle: "previa coordinación",
  },
];