"use client";

import { useState } from "react";
import { RatingStars } from "@/components/ui/RatingStars";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/error-messages";

interface ReviewFormProps {
  onSubmit: (input: { barberRating: number; salonRating: number; serviceRating: number; comment?: string }) => Promise<unknown>;
  submitting?: boolean;
}

export function ReviewForm({ onSubmit, submitting }: ReviewFormProps) {
  const [barberRating, setBarberRating] = useState(0);
  const [salonRating, setSalonRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = barberRating > 0 && salonRating > 0 && serviceRating > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ barberRating, salonRating, serviceRating, comment: comment.trim() || undefined });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
      <p className="text-sm font-semibold">Xizmat qanday o&apos;tdi?</p>

      <RatingField label="Sartarosh" value={barberRating} onChange={setBarberRating} />
      <RatingField label="Salon" value={salonRating} onChange={setSalonRating} />
      <RatingField label="Xizmat sifati" value={serviceRating} onChange={setServiceRating} />

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Fikringizni yozing..."
        rows={3}
        maxLength={2000}
        className="w-full resize-none rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:border-primary"
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={!canSubmit} loading={submitting} fullWidth>
        Yuborish
      </Button>
    </form>
  );
}

function RatingField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted">{label}</span>
      <RatingStars value={value} interactive size={22} onChange={onChange} label={label} />
    </div>
  );
}
