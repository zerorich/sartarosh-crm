"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardBody, CardFooter } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { AdminSettings } from "@/entities/setting/model/types";
import { useUpdateAdminSettingsMutation } from "@/entities/setting/api/setting.queries";
import { useToast } from "@/shared/hooks/useToast";
import { Sliders, Bell, ShieldAlert, CheckCircle2, CalendarCheck, MapPin } from "lucide-react";

const settingsSchema = z.object({
  noShowLimit: z.coerce.number().min(1, "Minimum 1").max(10, "Maximum 10"),
  noShowRestrictionDays: z.coerce.number().min(1, "Minimum 1").max(90, "Maximum 90"),
  barberDelayThreshold: z.coerce.number().min(1, "Minimum 1 min").max(60, "Maximum 60 mins"),
  barberDelayCompensationPercent: z.coerce.number().min(0, "Minimum 0%").max(100, "Maximum 100%"),
  couponExpirationDays: z.coerce.number().min(1, "Minimum 1 day").max(365, "Maximum 365 days"),
  reviewEditWindow: z.coerce.number().min(1, "Minimum 1 hr").max(168, "Maximum 168 hrs"),
  defaultSearchRadius: z.coerce.number().min(1, "Minimum 1 km").max(100, "Maximum 100 km"),
  cancellationWindowHours: z.coerce.number().min(0, "Minimum 0").max(72, "Maximum 72 hrs").optional(),
  defaultDepositPercent: z.coerce.number().min(0, "Minimum 0%").max(100, "Maximum 100%").optional(),
  reminder24hEnabled: z.boolean(),
  reminder30mEnabled: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsForm({ settings }: { settings: AdminSettings }) {
  const { mutateAsync: updateSettings, isPending } = useUpdateAdminSettingsMutation();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      noShowLimit: settings.noShowLimit ?? 3,
      noShowRestrictionDays: settings.noShowRestrictionDays ?? 7,
      barberDelayThreshold: settings.barberDelayThreshold ?? 5,
      barberDelayCompensationPercent: settings.barberDelayCompensationPercent ?? 10,
      couponExpirationDays: settings.couponExpirationDays ?? 30,
      reviewEditWindow: settings.reviewEditWindow ?? 48,
      defaultSearchRadius: settings.defaultSearchRadius ?? 5,
      cancellationWindowHours: settings.cancellationWindowHours ?? 24,
      defaultDepositPercent: settings.defaultDepositPercent ?? 25,
      reminder24hEnabled: settings.reminder24hEnabled ?? true,
      reminder30mEnabled: settings.reminder30mEnabled ?? true,
    },
  });

  useEffect(() => {
    reset({
      noShowLimit: settings.noShowLimit ?? 3,
      noShowRestrictionDays: settings.noShowRestrictionDays ?? 7,
      barberDelayThreshold: settings.barberDelayThreshold ?? 5,
      barberDelayCompensationPercent: settings.barberDelayCompensationPercent ?? 10,
      couponExpirationDays: settings.couponExpirationDays ?? 30,
      reviewEditWindow: settings.reviewEditWindow ?? 48,
      defaultSearchRadius: settings.defaultSearchRadius ?? 5,
      cancellationWindowHours: settings.cancellationWindowHours ?? 24,
      defaultDepositPercent: settings.defaultDepositPercent ?? 25,
      reminder24hEnabled: settings.reminder24hEnabled ?? true,
      reminder30mEnabled: settings.reminder30mEnabled ?? true,
    });
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      await updateSettings(data);
      success("Settings Saved", "Platform policies have been successfully updated.");
    } catch (err: any) {
      error("Save Failed", err.message || "Could not save platform settings.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. No-Show & Penalty Policy */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>No-Show & Penalty Policy</span>
            </div>
          }
          subtitle="Configure penalties for clients who miss booked appointments without prior notice."
        />
        <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Maximum Allowed No-Shows (Limit: 3)"
            type="number"
            helperText="Number of allowed missed bookings before restriction."
            error={errors.noShowLimit?.message}
            {...register("noShowLimit")}
          />
          <Input
            label="Account Restriction Duration (Days: 7)"
            type="number"
            helperText="Days a restricted client is prohibited from online booking."
            error={errors.noShowRestrictionDays?.message}
            {...register("noShowRestrictionDays")}
          />
        </CardBody>
      </Card>

      {/* 2. Barber Delay & SLA Compensation */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-500" />
              <span>Barber Delay & SLA Compensation</span>
            </div>
          }
          subtitle="Define delay thresholds and automatic compensation voucher percentages."
        />
        <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Barber Delay Threshold (Minutes: 5)"
            type="number"
            helperText="Minutes after scheduled start time when compensation applies."
            error={errors.barberDelayThreshold?.message}
            {...register("barberDelayThreshold")}
          />
          <Input
            label="Compensation Voucher Rate (%: 10%)"
            type="number"
            helperText="Percentage discount coupon automatically granted to affected client."
            error={errors.barberDelayCompensationPercent?.message}
            {...register("barberDelayCompensationPercent")}
          />
          <Input
            label="Coupon Expiration Period (Days: 30)"
            type="number"
            helperText="Days before generated compensation coupons expire."
            error={errors.couponExpirationDays?.message}
            {...register("couponExpirationDays")}
          />
          <Input
            label="Customer Review Edit Window (Hours: 48)"
            type="number"
            helperText="Timeframe allowing customers to update their review."
            error={errors.reviewEditWindow?.message}
            {...register("reviewEditWindow")}
          />
        </CardBody>
      </Card>

      {/* 3. Booking & Deposit Policies */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-500" />
              <span>Booking & Deposit Policies</span>
            </div>
          }
          subtitle="Configure default cancellation policies and mandatory online deposit percentages."
        />
        <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Free Cancellation Window (Hours: 24h)"
            type="number"
            helperText="Hours prior to start time when booking cancellation is fully refundable."
            error={errors.cancellationWindowHours?.message}
            {...register("cancellationWindowHours")}
          />
          <Input
            label="Default Deposit Rate (%: 25%)"
            type="number"
            helperText="Standard percentage required upfront to confirm appointment booking."
            error={errors.defaultDepositPercent?.message}
            {...register("defaultDepositPercent")}
          />
        </CardBody>
      </Card>

      {/* 4. Geolocation & Map Search */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-500" />
              <span>Geolocation & Search Perimeter</span>
            </div>
          }
          subtitle="Default discovery radius for nearby barbershops and salons on the client map."
        />
        <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Default Search Radius (KM: 5 km)"
            type="number"
            helperText="Initial geolocation discovery radius on the CutZone customer map."
            error={errors.defaultSearchRadius?.message}
            {...register("defaultSearchRadius")}
          />
        </CardBody>
      </Card>

      {/* 5. Automated Reminders & Push Alerts */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-sky-500" />
              <span>Automated Reminders & Push Alerts</span>
            </div>
          }
          subtitle="Configure automatic push & SMS notifications sent to clients."
        />
        <CardBody className="space-y-4">
          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
              {...register("reminder24hEnabled")}
            />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                24-Hour Advance Reminder (SMS & Push)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send appointment confirmation and reminder 24 hours before scheduled start time.
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
              {...register("reminder30mEnabled")}
            />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                30-Minute Departure Alert (SMS & Push)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send reminder with salon address and navigation link 30 minutes prior to appointment.
              </p>
            </div>
          </label>
        </CardBody>
        <CardFooter className="justify-end gap-3">
          <Button
            type="submit"
            isLoading={isPending}
            disabled={!isDirty && !isPending}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Save Configuration
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default SettingsForm;
