"use client";

import React, { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { EyeOff, Eye, Trash2, Info } from "lucide-react";
import {
  useHideReviewMutation,
  useRestoreReviewMutation,
  useRemoveReviewMutation,
} from "@/entities/review/api/review.queries";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { useToast } from "@/shared/hooks/useToast";
import { Review } from "@/entities/review/model/types";
import { ReviewDetailModal } from "./ReviewDetailModal";

export function ReviewModerationActions({
  review,
}: {
  review: Review;
}) {
  const { mutateAsync: hideReview, isPending: isHiding } = useHideReviewMutation();
  const { mutateAsync: restoreReview, isPending: isRestoring } = useRestoreReviewMutation();
  const { mutateAsync: removeReview, isPending: isRemoving } = useRemoveReviewMutation();
  const { success, error } = useToast();

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleToggleHide = async () => {
    try {
      if (review.isHidden) {
        await restoreReview(review.id);
        success("Review Restored", "The review has been restored to public view.");
      } else {
        await hideReview(review.id);
        success("Review Hidden", "The review is now hidden from public view.");
      }
    } catch (err: any) {
      error("Action failed", err.message || "Could not update review status.");
    }
  };

  const handleRemoveConfirm = async () => {
    try {
      await removeReview(review.id);
      success("Review Removed", "The review has been permanently removed.");
      setIsConfirmDeleteOpen(false);
    } catch (err: any) {
      error("Delete failed", err.message || "Could not remove review.");
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDetailOpen(true)}
          leftIcon={<Info className="w-3.5 h-3.5" />}
          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          View
        </Button>

        {review.isHidden ? (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            onClick={handleToggleHide}
            isLoading={isRestoring}
          >
            Restore
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<EyeOff className="w-3.5 h-3.5" />}
            onClick={handleToggleHide}
            isLoading={isHiding}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
          >
            Hide
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          onClick={() => setIsConfirmDeleteOpen(true)}
          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
        >
          Remove
        </Button>
      </div>

      {/* Review Detail Modal */}
      {isDetailOpen && (
        <ReviewDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          review={review}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleRemoveConfirm}
        title="Are you sure you want to remove this review?"
        description="This action will permanently delete the customer review from the platform. This action cannot be easily undone."
        confirmText="Remove Review"
        cancelText="Cancel"
        variant="danger"
        isLoading={isRemoving}
      />
    </>
  );
}
