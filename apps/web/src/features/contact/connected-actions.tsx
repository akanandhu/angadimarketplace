import { MessageCircle, Phone } from 'lucide-react';
import type { ContactDetails } from '@/lib/api/types';
import { cn } from '@/lib/cn';

interface Props {
  contact: ContactDetails;
  /** "Seller", "Buyer" or "Dealer" — used in the button labels. */
  who: string;
  message?: string;
  className?: string;
}

/** Call + WhatsApp actions, shown only once contact has been shared. */
export function ConnectedActions({ contact, who, message, className }: Props) {
  const whatsapp = message
    ? `${contact.whatsappUrl}?text=${encodeURIComponent(message)}`
    : contact.whatsappUrl;
  const base =
    'flex h-11 flex-1 items-center justify-center gap-2 rounded-button text-sm font-semibold';
  return (
    <div className={cn('flex gap-2', className)}>
      <a
        href={`tel:${contact.phone}`}
        className={cn(base, 'bg-brand text-white hover:bg-brand-strong')}
      >
        <Phone className="size-4" aria-hidden /> Call {who}
      </a>
      <a
        href={whatsapp}
        target="_blank"
        rel="noreferrer"
        className={cn(base, 'border border-brand text-brand hover:bg-brand-soft')}
      >
        <MessageCircle className="size-4" aria-hidden /> WhatsApp
      </a>
    </div>
  );
}
