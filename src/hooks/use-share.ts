import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  enableShare,
  disableShare,
  getShareInfo,
  getSharedDoc,
  getSharedDocCards,
  type ShareInfo,
  type SharedDoc,
  type Card,
} from "@/services/docs";
import { toast } from "sonner";

export const useShareInfo = (docId: string) => {
  return useQuery({
    queryKey: ["share-info", docId],
    queryFn: () => getShareInfo(docId),
    enabled: !!docId,
    select: (response) => response.data,
  });
};

export const useEnableShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docId: string) => enableShare(docId),
    onSuccess: (response, docId) => {
      queryClient.invalidateQueries({ queryKey: ["share-info", docId] });
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
    mutationFn: (docId: string) => disableShare(docId),
    onSuccess: (response, docId) => {
      queryClient.invalidateQueries({ queryKey: ["share-info", docId] });
      toast.success("Sharing disabled successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to disable sharing");
    },
  });
};

export const useSharedDoc = (token: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["shared-doc", token],
    queryFn: () => getSharedDoc(token),
    enabled: enabled && !!token,
    select: (response) => response.data,
    retry: false,
  });
};

export const useSharedDocCards = (token: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["shared-doc-cards", token],
    queryFn: () => getSharedDocCards(token),
    enabled: enabled && !!token,
    select: (response) => response.data,
    retry: false,
  });
};
