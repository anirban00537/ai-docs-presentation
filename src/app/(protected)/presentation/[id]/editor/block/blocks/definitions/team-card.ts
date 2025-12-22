import { TeamCardContentSchema, type TeamCardContent, getDefaultHeadingContent } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const createTeamCardContent = (): TeamCardContent => ({
  type: "team-card",
  name: getDefaultHeadingContent(),
  role: "Team Member",
  description: "Description about the team member.",
  avatar: "",
  socials: {},
});

export const normalizeTeamCardContent = (content: any): TeamCardContent => {
  if (!content || typeof content !== "object") return createTeamCardContent();

  const name = isLegacyProseMirrorFormat(content.name)
    ? normalizeToMarkdown(content.name)
    : typeof content.name === "string"
    ? content.name
    : getDefaultHeadingContent();

  const role = isLegacyProseMirrorFormat(content.role)
    ? normalizeToMarkdown(content.role)
    : typeof content.role === "string"
    ? content.role
    : "Team Member";

  const description = isLegacyProseMirrorFormat(content.description)
    ? normalizeToMarkdown(content.description)
    : content.description;

  const result = TeamCardContentSchema.safeParse({
    ...content,
    name,
    role,
    description,
  });

  if (result.success) {
    return result.data;
  }

  return createTeamCardContent();
};
