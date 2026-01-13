"use client";

import React, { useState } from "react";
import {
  IconCloudCheck,
  IconDots,
  IconChevronLeft,
  IconShare,
  IconPlayerPlayFilled,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconMenu2,
  IconDownload,
  IconChevronDown,
  IconFileTypePdf,
  IconFileText,
  IconPhoto,
  IconLock,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useUndoRedo } from "@/app/(protected)/docs/[id]/hooks/useUndoRedo";
import { selectDoc } from "@/store/slices/cardsSlice";
import { selectIsSubscribed } from "@/store/slices/subscriptionSlice";
import { useAppSelector } from "@/store/hooks";
import { useEditorTheme } from "../../engine";
import { ShareModal } from "@/components/shared/ShareModal";
import { toast } from "sonner";
import { 
  exportDocToPptx, 
  exportDocToPdf,
  exportDocToPng 
} from "@/services/docs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditorHeaderProps {
  onPresentClick: () => void;
  onMenuClick?: () => void;
  isReadOnly?: boolean;
}

export const EditorHeader = ({
  onPresentClick,
  onMenuClick,
  isReadOnly = false,
}: EditorHeaderProps) => {
  const theme = useEditorTheme();
  const router = useRouter();
  const doc = useAppSelector(selectDoc);
  const isSubscribed = useAppSelector(selectIsSubscribed);
  const isDark = theme.themeType === "dark";
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const checkSubscription = () => {
    if (!isSubscribed) {
      toast.error("Upgrade to Pro to export docs", {
        action: {
          label: "Upgrade",
          onClick: () => router.push("/pricing"),
        },
      });
      return false;
    }
    return true;
  };

  const handleExportPptx = async () => {
    if (!doc?.id || isExporting) return;
    if (!checkSubscription()) return;

    try {
      setIsExporting(true);
      const blob = await exportDocToPptx(doc.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title || 'document'}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export doc to PPTX:', error);
      // TODO: Show error toast/notification
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!doc?.id || isExporting) return;
    if (!checkSubscription()) return;

    try {
      setIsExporting(true);
      const blob = await exportDocToPdf(doc.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title || 'document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export doc to PDF:', error);
      // TODO: Show error toast/notification
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPng = async () => {
    if (!doc?.id || isExporting) return;
    if (!checkSubscription()) return;

    try {
      setIsExporting(true);
      const blob = await exportDocToPng(doc.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title || 'document'}_cards.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export doc to PNG:', error);
      // TODO: Show error toast/notification
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 z-[60] w-full">
      <div
        className="relative w-full px-4 md:px-6 h-14 flex items-center justify-between"
        style={{
          backgroundColor: isDark
            ? "rgba(18, 18, 22, 0.85)"
            : "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${
            isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"
          }`,
        }}
      >
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
          >
            <IconMenu2 size={20} style={{ color: theme.bodyColor }} />
          </button>

          {!isReadOnly && (
            <button
              onClick={() => router.push("/home")}
              className="hidden sm:flex p-2 md:p-2.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 group"
            >
              <IconChevronLeft
                size={20}
                className="opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ color: theme.bodyColor }}
              />
            </button>
          )}

          <div className="hidden sm:block h-4 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />

          <div className="flex flex-col min-w-0">
            <h1
              className="text-[10px] md:text-xs font-bold tracking-tight line-clamp-1 truncate max-w-[120px] md:max-w-[300px]"
              style={{ color: theme.bodyColor }}
            >
              {doc?.title || "Untitled Document"}
            </h1>
            <div className="flex items-center gap-1 md:gap-1.5 mt-0.5">
              <IconCloudCheck size={9} className="text-emerald-500 shrink-0" />
              <span
                className="text-[9px] font-medium opacity-40 uppercase tracking-widest truncate hidden xs:inline"
                style={{ color: theme.bodyColor }}
              >
                Saved
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {!isReadOnly && (
            <>
              {/* Undo/Redo - Hidden on very small screens */}
              <div className="hidden md:flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-xl mr-1">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="p-1.5 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-20 active:scale-90"
                  title="Undo (Ctrl+Z)"
                >
                  <IconArrowBackUp
                    size={18}
                    style={{ color: theme.bodyColor }}
                  />
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="p-1.5 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-20 active:scale-90"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <IconArrowForwardUp
                    size={18}
                    style={{ color: theme.bodyColor }}
                  />
                </button>
              </div>

              <button
                onClick={() => setShareModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 text-[10px] font-semibold"
              >
                <IconShare size={14} style={{ color: theme.bodyColor }} />
                <span
                  className="hidden md:inline"
                  style={{ color: theme.bodyColor }}
                >
                  Share
                </span>
              </button>

              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    disabled={isExporting}
                    className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 text-[10px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Export doc"
                  >
                    <IconDownload size={14} style={{ color: theme.bodyColor }} />
                    <span
                      className="hidden md:inline"
                      style={{ color: theme.bodyColor }}
                    >
                      {isExporting ? 'Exporting...' : 'Export'}
                    </span>
                    <IconChevronDown size={12} style={{ color: theme.bodyColor }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleExportPptx} disabled={isExporting}>
                    <IconFileText size={16} className="mr-2" />
                    <span>Export as PPTX</span>
                    {!isSubscribed && (
                      <IconLock size={14} className="ml-auto opacity-50" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPdf} disabled={isExporting}>
                    <IconFileTypePdf size={16} className="mr-2" />
                    <span>Export as PDF</span>
                    {!isSubscribed && (
                      <IconLock size={14} className="ml-auto opacity-50" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPng} disabled={isExporting}>
                    <IconPhoto size={16} className="mr-2" />
                    <span>Export as PNG</span>
                    {!isSubscribed && (
                      <IconLock size={14} className="ml-auto opacity-50" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <button
            onClick={onPresentClick}
            className="flex items-center justify-center gap-2 p-2.5 md:px-5 md:py-2.5 rounded-xl transition-all hover:shadow-lg active:scale-95 text-[10px] font-bold leading-none shadow-sm"
            style={{
              backgroundColor: theme.primary,
              color: "#ffffff",
            }}
          >
            <IconPlayerPlayFilled size={12} className="shrink-0" />
            <span className="hidden md:inline">Present</span>
          </button>

          {!isReadOnly && (
            <>
              <div className="hidden sm:block h-4 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />

              <button className="p-2 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95">
                <IconDots size={20} style={{ color: theme.bodyColor }} />
              </button>
            </>
          )}
        </div>
      </div>

      {doc?.id && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          docId={doc.id}
        />
      )}
    </div>
  );
};
