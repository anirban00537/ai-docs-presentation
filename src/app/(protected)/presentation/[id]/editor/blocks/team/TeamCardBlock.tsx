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
    <CommonCard theme={theme} className="w-full h-full p-6">
      <div className="w-full h-full flex flex-col items-center relative group transition-all">
        {/* Avatar */}
        <div className="relative mb-5">
          <div
            className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center relative group/avatar ${!readOnly ? 'cursor-pointer hover:scale-105' : ''} transition-all`}
            style={{
              backgroundColor: `${theme.primary}15`,
              border: `3px solid ${theme.primary}20`,
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
                size={32}
                style={{ color: theme.primary, opacity: 0.4 }}
              />
            )}

            {/* Hover Overlay */}
            {!readOnly && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                <IconUpload size={20} className="text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Name & Role */}
        <div className="w-full text-center space-y-1 mb-3">
          <div style={{ color: theme.headingColor }}>
            <ProseMirrorEditor
              key={`${block.id}-name`}
              blockId={`${block.id}-name`}
              value={nameDoc}
              onChange={handleNameChange}
              placeholder="Team Member Name"
              className="text-lg font-bold text-center"
              theme={theme}
              readOnly={readOnly}
            />
          </div>
          <div style={{ color: theme.primary }}>
            <ProseMirrorEditor
              key={`${block.id}-role`}
              blockId={`${block.id}-role`}
              value={roleDoc}
              onChange={handleRoleChange}
              placeholder="Role / Title"
              className="text-xs font-medium uppercase tracking-wider opacity-70 text-center"
              theme={theme}
              readOnly={readOnly}
            />
          </div>
        </div>

        {/* Description */}
        <div className="w-full text-center mb-4 px-2">
          <div style={{ color: theme.bodyColor }}>
            <ProseMirrorEditor
              key={`${block.id}-desc`}
              blockId={`${block.id}-desc`}
              value={descriptionDoc}
              onChange={handleDescriptionChange}
              placeholder="Short bio..."
              className="text-sm leading-relaxed opacity-60 text-center"
              theme={theme}
              readOnly={readOnly}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-2 mt-auto">
          {[
            { key: "linkedin", icon: IconBrandLinkedin },
            { key: "twitter", icon: IconBrandX },
            { key: "website", icon: IconWorld },
          ].map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={!readOnly ? () => handleSocialClick(key as SocialPlatform) : undefined}
              className={`p-2 rounded-lg transition-all ${!readOnly ? 'hover:scale-105 cursor-pointer' : ''}`}
              title={key.charAt(0).toUpperCase() + key.slice(1)}
              style={{
                backgroundColor: content.socials?.[
                  key as keyof typeof content.socials
                ]
                  ? `${theme.primary}15`
                  : "transparent",
                color: theme.primary,
                opacity: content.socials?.[key as keyof typeof content.socials]
                  ? 1
                  : 0.3,
              }}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>
    </CommonCard>
  );
});
