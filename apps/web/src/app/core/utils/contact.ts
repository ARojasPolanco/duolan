export const whatsappUrl = (value: string | null | undefined): string | null => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
};
