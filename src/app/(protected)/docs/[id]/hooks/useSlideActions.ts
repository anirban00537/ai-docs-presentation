"use client";

import { useAppDispatch } from "@/store/hooks";
import { 
  addSlide as addSlideAction, 
  deleteSlide as deleteSlideAction, 
  replaceSlideWithServerData,
  Slide
} from "@/store/slices/slidesSlice";
import { useAddSlide, useDeleteSlide } from "@/hooks/use-presentation";
import { convertReduxSlideToApi } from "@/lib/editor/adapters";
import { toast } from "sonner";
import { nanoid } from "nanoid";

/**
 * Hook for explicit slide structural actions (add, delete).
 * Handles both Redux state and immediate API calls.
 */
export function useSlideActions(presentationId: string | null) {
  const dispatch = useAppDispatch();
  const addSlideMutation = useAddSlide();
  const deleteSlideMutation = useDeleteSlide();

  const handleAddSlide = async (afterSlideId?: string) => {
    if (!presentationId) return;

    const tempId = `temp-${nanoid()}`;
    
    // 1. Dispatch Redux action (optimistic UI)
    dispatch(addSlideAction({ afterSlideId, id: tempId }));
    
    try {
      const response = await addSlideMutation.mutateAsync({
        presentationId,
        payload: {
          data: { 
            rows: [{ 
              id: nanoid(), 
              blocks: [{ id: nanoid(), type: "prosemirror", content: {} }] 
            }] 
          },
        },
      });

      if (response.success && response.data) {
        const serverSlide: Slide = {
          id: response.data.id,
          rows: response.data.data?.rows || [],
          accent: response.data.data?.accent,
        };

        dispatch(replaceSlideWithServerData({
          clientId: tempId,
          serverSlide,
        }));
      }
    } catch (error) {
      console.error("Failed to add slide:", error);
      toast.error("Failed to save new slide");
      // Revert optimistic update
      dispatch(deleteSlideAction(tempId));
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!presentationId) return;

    try {
      // 1. Dispatch Redux action
      dispatch(deleteSlideAction(slideId));

      // 2. Call API
      await deleteSlideMutation.mutateAsync({
        presentationId,
        slideId,
      });
    } catch (error) {
      console.error("Failed to delete slide:", error);
      toast.error("Failed to delete slide from server");
      // Ideally we should revert the Redux state here, 
      // but redo/undo handles some of this.
    }
  };

  return {
    handleAddSlide,
    handleDeleteSlide,

    isDeleting: deleteSlideMutation.isPending,
    isAdding: addSlideMutation.isPending,
  };
}
