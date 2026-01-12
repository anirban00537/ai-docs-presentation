"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useShareInfo, useEnableShare, useDisableShare } from "@/hooks/use-share";
import { IconCopy, IconCheck, IconShare, IconPlayerPlay } from "@tabler/icons-react";
import { toast } from "sonner";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presentationId: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  open,
  onOpenChange,
  presentationId,
}) => {
  const { data: shareInfo, isLoading } = useShareInfo(presentationId);
  const enableShareMutation = useEnableShare();
  const disableShareMutation = useDisableShare();
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const shareEnabled = shareInfo?.shareEnabled || false;

  useEffect(() => {
    if (shareEnabled && typeof window !== "undefined") {
      const baseUrl = window.location.origin;
      // Use the same URL as the current page
      setShareUrl(window.location.href);
    }
  }, [shareEnabled]);

  const handleToggleShare = async (enabled: boolean) => {
    if (enabled) {
      await enableShareMutation.mutateAsync(presentationId);
    } else {
      await disableShareMutation.mutateAsync(presentationId);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleCopyViewLink = () => {
    if (!shareUrl) return;
    handleCopyLink();
  };

  const handleCopyPresentLink = () => {
    if (!shareUrl) return;
    const presentUrl = `${shareUrl}?mode=present`;
    navigator.clipboard.writeText(presentUrl).then(() => {
      setCopied(true);
      toast.success("Present link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconShare size={20} />
            Share Presentation
          </DialogTitle>
          <DialogDescription>
            Generate a shareable link that allows anyone to view or present your presentation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Toggle Share */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="share-toggle" className="text-base font-medium">
                Enable sharing
              </Label>
              <p className="text-sm text-muted-foreground">
                Create a public link to share your presentation
              </p>
            </div>
            <Switch
              id="share-toggle"
              checked={shareEnabled}
              onCheckedChange={handleToggleShare}
              disabled={isLoading || enableShareMutation.isPending || disableShareMutation.isPending}
            />
          </div>

          {/* Share URL */}
          {shareEnabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <IconCheck size={16} className="text-green-600" />
                    ) : (
                      <IconCopy size={16} />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can view your presentation
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Label>Quick Actions</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCopyViewLink}
                  >
                    <IconShare size={16} className="mr-2" />
                    Copy View Link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCopyPresentLink}
                  >
                    <IconPlayerPlay size={16} className="mr-2" />
                    Copy Present Link
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!shareEnabled && (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Enable sharing to generate a shareable link
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
