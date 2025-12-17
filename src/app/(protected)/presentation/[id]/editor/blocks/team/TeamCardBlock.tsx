import React, { useMemo, useCallback } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createTeamCardContent,
  type TeamCardContent,
} from "../definitions/team-card";
import {
  IconUser,
  IconBrandLinkedin,
  IconBrandX,
  IconWorld,
  IconUpload,
} from "@tabler/icons-react";

interface TeamCardBlockProps {
  block: Block;
  onUpdate: (content: TeamCardContent) => void;
  theme: Theme;
  placeholder?: string;
  isEditable?: boolean;
}

export const TeamCardBlock: React.FC<TeamCardBlockProps> = ({
  block,
  onUpdate,
  theme,
  isEditable = true,
}) => {
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
    (newDoc: any) => {
      onUpdate({ ...content, name: newDoc });
    },
    [content, onUpdate]
  );

  const handleRoleChange = useCallback(
    (newDoc: any) => {
      onUpdate({ ...content, role: newDoc });
    },
    [content, onUpdate]
  );

  const handleDescriptionChange = useCallback(
    (newDoc: any) => {
      onUpdate({ ...content, description: newDoc });
    },
    [content, onUpdate]
  );

  const handleAvatarClick = () => {
    const url = prompt("Enter avatar image URL:");
    if (url) {
      onUpdate({ ...content, avatar: url });
    }
  };

  const handleSocialClick = (platform: "linkedin" | "twitter" | "website") => {
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
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center rounded-2xl p-6 relative group transition-all"
      style={{
        background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.primary}03 100%)`,
      }}
    >
      {/* Avatar */}
      <div className="relative mb-5">
        <div
          className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center relative group/avatar cursor-pointer transition-all hover:scale-105"
          style={{
            backgroundColor: `${theme.primary}15`,
            border: `3px solid ${theme.primary}20`,
          }}
          onClick={handleAvatarClick}
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
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-full">
            <IconUpload size={20} className="text-white" />
          </div>
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
            onClick={() => handleSocialClick(key as any)}
            className="p-2 rounded-lg transition-all hover:scale-105"
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
  );
};
