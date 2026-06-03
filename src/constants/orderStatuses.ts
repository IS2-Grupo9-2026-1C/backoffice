export const ORDER_STATUSES = [
  { id: 'pendiente_de_pago', label: 'Pendiente de pago' },
  { id: 'confirmada', label: 'Confirmada' },
  { id: 'en_preparacion', label: 'En preparación' },
  { id: 'enviada', label: 'Enviada' },
  { id: 'entregada', label: 'Entregada' },
  { id: 'pago_rechazado', label: 'Pago rechazado' },
  { id: 'cancelada', label: 'Cancelada' },
  { id: 'reembolso_en_proceso', label: 'Reembolso en proceso' },
  { id: 'reembolso_procesado', label: 'Reembolso procesado' },
];

export const ORDER_STATUS_LABEL: Record<string, string> = Object.fromEntries(
  ORDER_STATUSES.map((s) => [s.id, s.label]),
);
