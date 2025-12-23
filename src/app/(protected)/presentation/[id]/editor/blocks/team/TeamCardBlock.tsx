import React, { useMemo, useCallback, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
  createTeamCardContent,
  type TeamCardContent,
} from "../definitions";
import {
  IconUser,
  IconBrandLinkedin,
  IconBrandX,
  IconWorld,
  IconUpload,
} from "@tabler/icons-react";
import { CommonCard } from "../CommonCard";

type SocialPlatform = "linkedin" | "twitter" | "website";

interface TeamCardBlockProps {
  block: Block;
  onUpdate: (content: TeamCardContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
  isEditable?: boolean;
}

export const TeamCardBlock = memo(function TeamCardBlock({
  block,
  onUpdate,
  theme,
  isEditable = true,
  readOnly = false,
}: TeamCardBlockProps) {
  const content = block.content as TeamCardContent;

  const nameDoc = useMemo(() => {
    return content?.name ?? createTeamCardContent().name;
  }, [content]);

  const roleDoc = useMemo(() => {
    return content?.role ?? createTeamCardContent().role;
  }, [content]);

  const descriptionDoc = useMemo(() => {
    return content?.description ?? createTeamCardContent().description;
  }, [content]);

  const handleNameChange = useCallback(
    (newDoc: ProseMirrorDocument) => {
      onUpdate({ ...content, name: newDoc });
    },
    [content, onUpdate]
  );

  const handleRoleChange = useCallback(
    (newDoc: ProseMirrorDocument) => {
      onUpdate({ ...content, role: newDoc });
    },
    [content, onUpdate]
  );

  const handleDescriptionChange = useCallback(
    (newDoc: ProseMirrorDocument) => {
      onUpdate({ ...content, description: newDoc });
    },
    [content, onUpdate]
  );

  const handleAvatarClick = () => {
    if (readOnly) return;
    const url = prompt("Enter avatar image URL:");
    if (url) {
      onUpdate({ ...content, avatar: url });
    }
  };

  const handleSocialClick = useCallback((platform: SocialPlatform) => {
    if (readOnly) return;
    const url = prompt(
      `Enter ${platform} URL:`,
      content.socials?.[platform] || ""
    );
    if (url !== null) {
      onUpdate({
        ...content,
        socials: { ...content.socials, [platform]: url },
      });
    }
  }, [content, onUpdate, readOnly]);

  return (
    <CommonCard theme={theme} className="w-full h-full transition-all duration-300 hover:shadow-md">
      <div 
        className="w-full h-full flex flex-col items-center gap-8 p-8 relative overflow-hidden"
        style={{ borderRadius: theme.cardBorderRadius ?? "12px" }}
      >
        {/* Minimal Gradient Background Blob */}
        <div
          className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.04] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-150"
          style={{ backgroundColor: theme.primary }}
        />

        {/* Avatar */}
        <div className="relative z-10">
          <div
            className={`w-28 h-28 rounded-3xl overflow-hidden flex items-center justify-center relative group/avatar ${!readOnly ? 'cursor-pointer hover:scale-105' : ''} transition-all duration-300 border shadow-md`}
            style={{
              backgroundColor: `${theme.primary}10`,
              borderColor: `${theme.primary}20`,
              backdropFilter: "blur(8px)"
            }}
            onClick={!readOnly ? handleAvatarClick : undefined}
          >
            {content.avatar ? (
              <img
                src={content.avatar}
                alt="Team Member"
                className="w-full h-full object-cover"
              />
            ) : (
              <IconUser
                size={40}
                strokeWidth={1.5}
                style={{ color: theme.primary, opacity: 0.5 }}
              />
            )}

            {/* Hover Overlay */}
            {!readOnly && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                <IconUpload size={24} className="text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Name & Role */}
        <div className="w-full text-center z-10">
          <div style={{ color: theme.headingColor }}>
            <ProseMirrorEditor
              key={`${block.id}-name`}
              blockId={`${block.id}-name`}
              value={nameDoc}
              onChange={handleNameChange}
              placeholder="Team Member Name"
              className="text-xl font-bold text-center tracking-tight"
              theme={theme}
              readOnly={readOnly}
            />
          </div>
          <div style={{ color: theme.primary }} className="mt-1">
            <ProseMirrorEditor
              key={`${block.id}-role`}
              blockId={`${block.id}-role`}
              value={roleDoc}
              onChange={handleRoleChange}
              placeholder="Role / Title"
              className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-60 text-center"
              theme={theme}
              readOnly={readOnly}
            />
          </div>
        </div>

        {/* Description */}
        <div className="w-full text-center px-4 z-10">
          <div style={{ color: theme.bodyColor }}>
            <ProseMirrorEditor
              key={`${block.id}-desc`}
              blockId={`${block.id}-desc`}
              value={descriptionDoc}
              onChange={handleDescriptionChange}
              placeholder="Short bio..."
              className="text-sm leading-relaxed opacity-60 text-center tracking-normal"
              theme={theme}
              readOnly={readOnly}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4 mt-auto z-10 pt-4" style={{ borderTop: `1px solid ${theme.primary}10` }}>
          {[
            { key: "linkedin", icon: IconBrandLinkedin },
            { key: "twitter", icon: IconBrandX },
            { key: "website", icon: IconWorld },
          ].map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={!readOnly ? () => handleSocialClick(key as SocialPlatform) : undefined}
              className={`p-2.5 rounded-xl transition-all border ${!readOnly ? 'hover:scale-110 cursor-pointer shadow-sm' : ''}`}
              title={key.charAt(0).toUpperCase() + key.slice(1)}
              style={{
                backgroundColor: content.socials?.[
                  key as keyof typeof content.socials
                ]
                  ? `${theme.primary}15`
                  : "transparent",
                borderColor: content.socials?.[key as keyof typeof content.socials]
                  ? `${theme.primary}25`
                  : "transparent",
                color: theme.primary,
                opacity: content.socials?.[key as keyof typeof content.socials]
                  ? 1
                  : 0.25,
              }}
            >
              <Icon size={20} />
            </button>
          ))}
        </div>
      </div>
    </CommonCard>
  );
});
