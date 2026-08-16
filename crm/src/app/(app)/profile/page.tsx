"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth, useUpdateMe } from "@/hooks/useAuth";
import { uploadImage } from "@/services/users";
import { getErrorMessage } from "@/lib/error-messages";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export default function ProfilePage() {
  const { user, isOwner } = useAuth();
  const updateMe = useUpdateMe();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setError("Rasm hajmi 5 MB dan oshmasligi kerak.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setAvatarUrl(url);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await updateMe.mutateAsync({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        avatarUrl,
      });
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Profil</h1>
      <p className="mb-6 text-sm text-muted">{user.email} · {isOwner ? "Salon egasi" : "Sartarosh"}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex cursor-pointer items-center justify-center"
            aria-label="Rasm yuklash"
          >
            <Avatar user={{ firstName, lastName, avatarUrl }} size={88} />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
              <Camera className="size-6" aria-hidden />
            </span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="cursor-pointer text-xs font-medium text-accent disabled:opacity-50"
          >
            {uploading ? "Yuklanmoqda..." : "Rasm tanlash"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="first-name" className="text-xs font-medium text-muted">
              Ism
            </label>
            <input
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="last-name" className="text-xs font-medium text-muted">
              Familiya
            </label>
            <input
              id="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && <p className="text-sm text-success">Saqlandi.</p>}

        <Button type="submit" loading={updateMe.isPending} disabled={uploading} fullWidth>
          Saqlash
        </Button>
      </form>
    </div>
  );
}
