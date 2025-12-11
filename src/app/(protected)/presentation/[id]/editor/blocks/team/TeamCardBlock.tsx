import React, { useMemo, useCallback } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createTeamCardContent,
  type TeamCardContent,
} from "../definitions/team-card";
import { withAlpha } from "../utils";
import { User, Linkedin, Twitter, Globe, Upload } from "lucide-react";

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
    if (content?.name?.type === "doc") return content.name;
    return createTeamCardContent().name;
  }, [content]);

  const roleDoc = useMemo(() => {
    if (content?.role?.type === "doc") return content.role;
    return createTeamCardContent().role;
  }, [content]);

  const descriptionDoc = useMemo(() => {
    if (content?.description?.type === "doc") return content.description;
    return createTeamCardContent().description;
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

  // For now simple URL input or file upload placeholder
  // In a real app this would trigger a file picker
  const handleAvatarClick = () => {
    const url = prompt("Enter avatar image URL:");
    if (url) {
      onUpdate({ ...content, avatar: url });
    }
  };

  const handleSocialClick = (platform: "linkedin" | "twitter" | "website") => {
    const url = prompt(`Enter ${platform} URL:`, content.socials?.[platform] || "");
    if (url !== null) {
      onUpdate({
        ...content,
        socials: { ...content.socials, [platform]: url },
      });
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center rounded-2xl p-8 relative group transition-all duration-300"
      style={{
        backgroundColor: theme.cardBackground || withAlpha(theme.primary, 0.05),
        border: `1px solid ${withAlpha(theme.primary, 0.1)}`,
      }}
    >
      {/* Avatar Section */}
      <div className="relative mb-6">
        <div
          className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center shadow-lg relative group/avatar cursor-pointer"
          style={{ 
            border: `4px solid ${withAlpha(theme.primary, 0.2)}`,
            backgroundColor: withAlpha(theme.primary, 0.1),
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
            <User className="w-12 h-12 opacity-30" style={{ color: theme.primary }} />
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
            <Upload className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Name & Role */}
      <div className="w-full text-center space-y-2 mb-4">
        <div style={{ color: theme.headingColor }}>
          <ProseMirrorEditor
            key={`${block.id}-name`}
            blockId={`${block.id}-name`}
            value={nameDoc}
            onChange={handleNameChange}
            placeholder="Team Member Name"
            className="text-xl font-bold text-center"
          />
        </div>
        <div style={{ color: theme.bodyColor || theme.primary }}>
          <ProseMirrorEditor
            key={`${block.id}-role`}
            blockId={`${block.id}-role`}
            value={roleDoc}
            onChange={handleRoleChange}
            placeholder="Role / Title"
            className="text-sm font-medium uppercase tracking-wider opacity-70 text-center"
          />
        </div>
      </div>

      {/* Description */}
      <div className="w-full text-center mb-6 px-4">
        <div style={{ color: theme.bodyColor }}>
          <ProseMirrorEditor
            key={`${block.id}-desc`}
            blockId={`${block.id}-desc`}
            value={descriptionDoc}
            onChange={handleDescriptionChange}
            placeholder="Short bio or description..."
            className="text-sm leading-relaxed opacity-80 text-center"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="flex items-center gap-3 mt-auto">
        <button
          onClick={() => handleSocialClick("linkedin")}
          className={`p-2 rounded-full transition-colors ${content.socials?.linkedin ? 'opacity-100' : 'opacity-30 hover:opacity-100'}`}
          title="LinkedIn"
          style={{ 
            color: theme.primary,
            backgroundColor: content.socials?.linkedin ? withAlpha(theme.primary, 0.1) : 'transparent' 
          }}
        >
          <Linkedin className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleSocialClick("twitter")}
          className={`p-2 rounded-full transition-colors ${content.socials?.twitter ? 'opacity-100' : 'opacity-30 hover:opacity-100'}`}
          title="Twitter"
          style={{ 
            color: theme.primary,
            backgroundColor: content.socials?.twitter ? withAlpha(theme.primary, 0.1) : 'transparent' 
          }}
        >
          <Twitter className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleSocialClick("website")}
          className={`p-2 rounded-full transition-colors ${content.socials?.website ? 'opacity-100' : 'opacity-30 hover:opacity-100'}`}
          title="Website"
          style={{ 
            color: theme.primary,
            backgroundColor: content.socials?.website ? withAlpha(theme.primary, 0.1) : 'transparent' 
          }}
        >
          <Globe className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
