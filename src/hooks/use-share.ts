import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  enableShare,
  disableShare,
  getShareInfo,
  getSharedPresentation,
  getSharedPresentationSlides,
  type ShareInfo,
  type SharedPresentation,
  type Slide,
} from "@/services/presentation";
import { toast } from "sonner";

export const useShareInfo = (presentationId: string) => {
  return useQuery({
    queryKey: ["share-info", presentationId],
    queryFn: () => getShareInfo(presentationId),
    enabled: !!presentationId,
    select: (response) => response.data,
  });
};

export const useEnableShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (presentationId: string) => enableShare(presentationId),
    onSuccess: (response, presentationId) => {
      queryClient.invalidateQueries({ queryKey: ["share-info", presentationId] });
      toast.success("Share link generated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to enable sharing");
    },
  });
};

export const useDisableShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (presentationId: string) => disableShare(presentationId),
    onSuccess: (response, presentationId) => {
      queryClient.invalidateQueries({ queryKey: ["share-info", presentationId] });
      toast.success("Sharing disabled successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to disable sharing");
    },
  });
};

export const useSharedPresentation = (token: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["shared-presentation", token],
    queryFn: () => getSharedPresentation(token),
    enabled: enabled && !!token,
    select: (response) => response.data,
    retry: false,
  });
};

export const useSharedPresentationSlides = (token: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["shared-presentation-slides", token],
    queryFn: () => getSharedPresentationSlides(token),
    enabled: enabled && !!token,
    select: (response) => response.data,
    retry: false,
  });
};
