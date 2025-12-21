import { TeamCardContent, ProseMirrorDocument, getDefaultHeadingContent } from "@/types/presentation";

export const createTeamCardContent = (): TeamCardContent => ({
  type: "team-card",
  name: getDefaultHeadingContent(),
  role: "",
  description: "",
  avatar: "",
  socials: {},
});

export const normalizeTeamCardContent = (content: any): TeamCardContent => {
  return {
    type: "team-card",
    name: content?.name ?? getDefaultHeadingContent(),
    role: content?.role ?? "",
    description: content?.description ?? "",
    avatar: content?.avatar ?? "",
    socials: content?.socials ?? {},
  };
};
