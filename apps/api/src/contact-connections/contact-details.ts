/** Phone actions exposed only through authorised contact flows. */
export function contactDetails(phone: string) {
  return { phone, whatsappUrl: `https://wa.me/${phone.replace(/^\+/, '')}` };
}

export type ContactDetails = ReturnType<typeof contactDetails>;
