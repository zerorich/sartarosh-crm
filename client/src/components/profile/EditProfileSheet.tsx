"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { useUpdateMe } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/error-messages";
import type { User } from "@/types/user";

interface EditProfileSheetProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

export function EditProfileSheet({ open, onClose, user }: EditProfileSheetProps) {
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const updateMe = useUpdateMe();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await updateMe.mutateAsync({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Profilni tahrirlash">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="edit-first-name" className="text-xs font-medium text-muted">
              Ism
            </label>
            <input
              id="edit-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="edit-last-name" className="text-xs font-medium text-muted">
              Familiya
            </label>
            <input
              id="edit-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-avatar" className="text-xs font-medium text-muted">
            Profil rasmi (URL)
          </label>
          <input
            id="edit-avatar"
            type="url"
            placeholder="https://..."
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-primary"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={updateMe.isPending} fullWidth>
          Saqlash
        </Button>
      </form>
    </Sheet>
  );
}
