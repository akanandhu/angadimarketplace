'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/api/errors';

interface Props {
  label: string;
  title: string;
  run: (note?: string) => Promise<unknown>;
  destructive?: boolean;
  withNote?: boolean;
}

/** Small button that confirms (optionally with a note) before a moderation call. */
export function ModerationAction({ label, title, run, destructive, withNote = true }: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await run(note.trim() || undefined);
      toast(`${label} done`);
      setOpen(false);
      setNote('');
      await queryClient.invalidateQueries({ queryKey: ['admin'] });
    } catch (error) {
      toast(errorMessage(error), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${destructive ? 'border-danger/40 text-danger hover:bg-danger-soft' : 'border-line-strong hover:bg-canvas'}`}
      >
        {label}
      </button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              block
              variant={destructive ? 'danger' : 'primary'}
              loading={busy}
              onClick={confirm}
            >
              {label}
            </Button>
          </>
        }
      >
        {withNote ? (
          <Field label="Note" htmlFor="moderation-note" optional>
            <Textarea
              id="moderation-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-20"
            />
          </Field>
        ) : (
          <p className="text-sm text-muted">Please confirm.</p>
        )}
      </Sheet>
    </>
  );
}
