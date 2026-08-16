"use client";

import { useState } from "react";
import { Plus, UserX, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Sheet } from "@/components/ui/Sheet";
import { useInviteStaff, useMySalons, useSalonStaff, useUpdateStaff } from "@/hooks/queries";
import { getErrorMessage } from "@/lib/error-messages";
import { cn, fullName } from "@/lib/utils";
import type { StaffStatus } from "@/types/barber";

const STATUS_LABEL: Record<StaffStatus, string> = {
  INVITED: "Taklif yuborilgan",
  ACTIVE: "Faol",
  REJECTED: "Rad etilgan",
  REMOVED: "Olib tashlangan",
};

export default function StaffPage() {
  const salons = useMySalons();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const items = salons.data?.items ?? [];
  const salonId = selectedId ?? items[0]?.id;

  const staff = useSalonStaff(salonId);
  const updateStaff = useUpdateStaff(salonId ?? "");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (salons.isLoading) return <div className="mx-auto max-w-2xl px-4 py-6"><Skeleton className="h-48 w-full" /></div>;
  if (salons.error) return <ErrorState error={salons.error} onRetry={() => salons.refetch()} />;
  if (!salonId) return <EmptyState icon={Users} title="Sizga tegishli salon topilmadi" />;

  async function handleRemove(staffId: string) {
    setError(null);
    try {
      await updateStaff.mutateAsync({ id: staffId, input: { status: "REMOVED" } });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Xodimlar</h1>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <Plus className="size-4" aria-hidden /> Taklif qilish
        </Button>
      </div>

      {items.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {items.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium",
                salonId === s.id ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      {staff.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : staff.error ? (
        <ErrorState error={staff.error} onRetry={() => staff.refetch()} />
      ) : (staff.data ?? []).length === 0 ? (
        <EmptyState icon={Users} title="Xodimlar hali qo'shilmagan" />
      ) : (
        <div className="flex flex-col gap-2">
          {(staff.data ?? []).map((member) => (
            <div key={member.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
              <Avatar user={member.barber.user} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{fullName(member.barber.user) || member.barber.user.email}</p>
                <p className="text-xs text-muted">{STATUS_LABEL[member.status]}</p>
              </div>
              {member.status === "ACTIVE" && (
                <button
                  onClick={() => handleRemove(member.id)}
                  aria-label="Olib tashlash"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full text-danger hover:bg-danger/10"
                >
                  <UserX className="size-4" aria-hidden />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <InviteStaffSheet open={inviteOpen} onClose={() => setInviteOpen(false)} salonId={salonId} />
    </div>
  );
}

function InviteStaffSheet({ open, onClose, salonId }: { open: boolean; onClose: () => void; salonId: string }) {
  const inviteStaff = useInviteStaff(salonId);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await inviteStaff.mutateAsync({ barberEmail: email.trim() });
      setEmail("");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Sartaroshni taklif qilish">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
        <p className="text-sm text-muted">
          Sartarosh oldindan tizimga BARBER sifatida ro&apos;yxatdan o&apos;tgan bo&apos;lishi kerak.
        </p>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted" htmlFor="barber-email">
            Email
          </label>
          <input
            id="barber-email"
            type="email"
            required
            placeholder="sartarosh@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={inviteStaff.isPending} fullWidth>
          Taklif yuborish
        </Button>
      </form>
    </Sheet>
  );
}
