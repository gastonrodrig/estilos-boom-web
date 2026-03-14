"use client";

import { ActionMenu, DataTable, Column } from '@/components/organisms/data-table';
import { Copy } from 'lucide-react';

interface ClientPerson {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  ciudad: string;
  estado: string;
  fechaRegistro: string;
}

const columns: Column<ClientPerson>[] = [
  { header: 'ID', accessorKey: 'id' },
  { header: 'Nombre', accessorKey: 'nombre' },
  {
    header: 'Email',
    accessorKey: 'email',
    cell: (cliente: any) => (
      <div className="flex items-center gap-2">
        <span className="truncate">{cliente.email}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(cliente.email);
            alert('¡Correo copiado!');
          }}
        >
          <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-pink-500 cursor-pointer transition-colors" />
        </button>
      </div>
    ),
  },
  {
    header: 'Teléfono',
    accessorKey: 'telefono',
    cell: (cliente: any) => (
      <div className="flex items-center gap-2">
        <span className="truncate">{cliente.telefono}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(cliente.telefono);
            alert('¡Número copiado!');
          }}
        >
          <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-pink-500 cursor-pointer transition-colors" />
        </button>
      </div>
    ),
  },
  { header: 'Ciudad', accessorKey: 'ciudad' },
  { header: 'Estado', accessorKey: 'estado' },
  {
    header: 'Fecha Registro',
    accessorKey: 'fechaRegistro',
    cell: (item) => new Date(item.fechaRegistro).toLocaleDateString('es-ES'),
  },
  {
    header: 'Acciones',
    accessorKey: 'acciones' as keyof ClientPerson,
    cell: (item) => <ActionMenu item={item} />,
  },
];

const mockData: ClientPerson[] = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    email: 'juan.perez@example.com',
    telefono: '+51 987 654 321',
    ciudad: 'Lima',
    estado: 'Activo',
    fechaRegistro: '2023-01-15',
  },
  {
    id: '2',
    nombre: 'María García',
    email: 'maria.garcia@example.com',
    telefono: '+51 987 123 456',
    ciudad: 'Arequipa',
    estado: 'Activo',
    fechaRegistro: '2023-02-20',
  },
  {
    id: '3',
    nombre: 'Carlos López',
    email: 'carlos.lopez@example.com',
    telefono: '+51 987 789 012',
    ciudad: 'Cusco',
    estado: 'Inactivo',
    fechaRegistro: '2023-03-10',
  },
  {
    id: '4',
    nombre: 'Ana Rodríguez',
    email: 'ana.rodriguez@example.com',
    telefono: '+51 987 345 678',
    ciudad: 'Trujillo',
    estado: 'Activo',
    fechaRegistro: '2023-04-05',
  },
  {
    id: '5',
    nombre: 'Luis Castillo',
    email: 'luis.castillo@example.com',
    telefono: '+51 987 111 222',
    ciudad: 'Chiclayo',
    estado: 'Activo',
    fechaRegistro: '2023-05-01',
  },
  {
    id: '6',
    nombre: 'Verónica Chávez',
    email: 'veronica.chavez@example.com',
    telefono: '+51 987 333 444',
    ciudad: 'Piura',
    estado: 'Inactivo',
    fechaRegistro: '2023-06-12',
  },
  {
    id: '7',
    nombre: 'Jorge Herrera',
    email: 'jorge.herrera@example.com',
    telefono: '+51 987 555 666',
    ciudad: 'Iquitos',
    estado: 'Activo',
    fechaRegistro: '2023-07-20',
  },
  {
    id: '8',
    nombre: 'Natalia Soto',
    email: 'natalia.soto@example.com',
    telefono: '+51 987 777 888',
    ciudad: 'Pucallpa',
    estado: 'Activo',
    fechaRegistro: '2023-08-09',
  },
  {
    id: '9',
    nombre: 'RaúlGonzales',
    email: 'raul.gonzales@example.com',
    telefono: '+51 987 999 000',
    ciudad: 'Huancayo',
    estado: 'Inactivo',
    fechaRegistro: '2023-09-14',
  },
  {
    id: '10',
    nombre: 'Adriana León',
    email: 'adriana.leon@example.com',
    telefono: '+51 987 101 202',
    ciudad: 'Tacna',
    estado: 'Activo',
    fechaRegistro: '2023-10-02',
  },
  {
    id: '11',
    nombre: 'Diego Paredes',
    email: 'diego.paredes@example.com',
    telefono: '+51 987 303 404',
    ciudad: 'Ayacucho',
    estado: 'Activo',
    fechaRegistro: '2023-11-11',
  },
  {
    id: '12',
    nombre: 'Mariana Ríos',
    email: 'mariana.rios@example.com',
    telefono: '+51 987 505 606',
    ciudad: 'Huánuco',
    estado: 'Inactivo',
    fechaRegistro: '2023-12-22',
  },
  {
    id: '13',
    nombre: 'Bruno Cruz',
    email: 'bruno.cruz@example.com',
    telefono: '+51 987 707 808',
    ciudad: 'Huaraz',
    estado: 'Activo',
    fechaRegistro: '2024-01-11',
  },
  {
    id: '14',
    nombre: 'Sandra Mora',
    email: 'sandra.mora@example.com',
    telefono: '+51 987 909 010',
    ciudad: 'Tacna',
    estado: 'Activo',
    fechaRegistro: '2024-02-03',
  },
  {
    id: '15',
    nombre: 'Cristian Poma',
    email: 'cristian.poma@example.com',
    telefono: '+51 987 112 233',
    ciudad: 'Tarapoto',
    estado: 'Inactivo',
    fechaRegistro: '2024-03-15',
  },
  {
    id: '16',
    nombre: 'Paola Salinas',
    email: 'paola.salinas@example.com',
    telefono: '+51 987 314 159',
    ciudad: 'Tacna',
    estado: 'Activo',
    fechaRegistro: '2024-04-26',
  },
  {
    id: '17',
    nombre: 'Felipe Arce',
    email: 'felipe.arce@example.com',
    telefono: '+51 987 161 718',
    ciudad: 'Ica',
    estado: 'Activo',
    fechaRegistro: '2024-05-30',
  },
  {
    id: '18',
    nombre: 'Rebeca Linares',
    email: 'rebeca.linares@example.com',
    telefono: '+51 987 192 021',
    ciudad: 'Tacna',
    estado: 'Inactivo',
    fechaRegistro: '2024-06-12',
  },
];

export default function AdminClientPersonsPage() {
  return (
    <DataTable
      title="Clientes - Persona"
      description="Aquí podrás registrar, editar y gestionar los clientes de tipo persona."
      columns={columns}
      data={mockData}
      onAddClick={() => console.log('Agregar nuevo cliente')}
      mobileTitleKey="nombre"
      mobileStatusKey="estado"
      mobileIdKey="id"
    />
  );
}