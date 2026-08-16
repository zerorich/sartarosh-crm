"use client";

import React from "react";
import Link from "next/link";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { ReviewStars } from "@/entities/review/ui/ReviewStars";
import { Review } from "@/entities/review/model/types";
import { formatDate } from "@/shared/lib/utils";
import { Star, Building2, Scissors, User, CalendarCheck, Quote } from "lucide-react";

export function ReviewDetailModal({
  isOpen,
  onClose,
  review,
}: {
  isOpen: boolean;
  onClose: () => void;
  review: Review;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Customer Review Details"
      description="Inspect customer rating breakdown and written feedback"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Customer & Appointment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Customer</span>
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {review.client.firstName || review.client.lastName
                  ? `${review.client.firstName || ""} ${review.client.lastName || ""}`.trim()
                  : "Client"}
              </span>
            </div>
            <p className="text-slate-400 font-mono text-[11px]">ID: {review.clientId}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Linked Booking</span>
            <div className="flex items-center gap-2 font-mono font-bold text-slate-900 dark:text-white">
              <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
              <Link
                href={`/admin/bookings/${review.bookingId}`}
                className="hover:text-rose-600 transition-colors"
              >
                #{review.bookingId}
              </Link>
            </div>
            <p className="text-slate-400 text-[11px]">Posted: {formatDate(review.createdAt)}</p>
          </div>
        </div>

        {/* Target Salon & Barber */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Salon</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{review.salon.name}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Master Barber</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Scissors className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {review.barber.user.firstName} {review.barber.user.lastName}
              </span>
            </div>
          </div>
        </div>

        {/* 3-Dimensional Ratings Breakdown */}
        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
            Multi-factor Rating Breakdown
          </span>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 shadow-xs">
              <span className="text-[11px] text-slate-500 block mb-1">Barber Skill</span>
              <div className="flex justify-center">
                <ReviewStars rating={review.barberRating} size="xs" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                {review.barberRating} / 5
              </span>
            </div>

            <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 shadow-xs">
              <span className="text-[11px] text-slate-500 block mb-1">Salon Comfort</span>
              <div className="flex justify-center">
                <ReviewStars rating={review.salonRating} size="xs" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                {review.salonRating} / 5
              </span>
            </div>

            <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-900 shadow-xs">
              <span className="text-[11px] text-slate-500 block mb-1">Service Quality</span>
              <div className="flex justify-center">
                <ReviewStars rating={review.serviceRating} size="xs" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                {review.serviceRating} / 5
              </span>
            </div>
          </div>
        </div>

        {/* Written Review Feedback */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px]">
            <Quote className="w-3.5 h-3.5" />
            <span>Customer Comment Text</span>
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic">
            &quot;{review.comment || "No written review comments provided."}&quot;
          </p>
        </div>
      </div>
    </Modal>
  );
}
