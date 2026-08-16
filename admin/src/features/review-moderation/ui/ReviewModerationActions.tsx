"use client";

import React from "react";
import { Button } from "@/shared/ui/Button";
import { EyeOff, Eye } from "lucide-react";
import { useHideReviewMutation, useRestoreReviewMutation } from "@/entities/review/api/review.queries";
import { useToast } from "@/shared/hooks/useToast";

export function ReviewModerationActions({
  reviewId,
  isHidden,
}: {
  reviewId: string;
  isHidden: boolean;
}) {
  const { mutateAsync: hideReview, isPending: isHiding } = useHideReviewMutation();
  const { mutateAsync: restoreReview, isPending: isRestoring } = useRestoreReviewMutation();
  const { success, error } = useToast();

  const handleToggle = async () => {
    try {
      if (isHidden) {
        await restoreReview(reviewId);
        success("Review Restored", "The review is now visible to customers.");
      } else {
        await hideReview(reviewId);
        success("Review Hidden", "The review has been hidden from public display.");
      }
    } catch (err: any) {
      error("Action failed", err.message || "Failed to update review status.");
    }
  };

  return isHidden ? (
    <Button
      variant="outline"
      size="sm"
      leftIcon={<Eye className="w-3.5 h-3.5" />}
      onClick={handleToggle}
      isLoading={isRestoring}
    >
      Restore
    </Button>
  ) : (
    <Button
      variant="ghost"
      size="sm"
      leftIcon={<EyeOff className="w-3.5 h-3.5" />}
      onClick={handleToggle}
      isLoading={isHiding}
      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
    >
      Hide
    </Button>
  );
}
