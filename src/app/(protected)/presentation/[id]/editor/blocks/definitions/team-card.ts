import { 
  TeamCardContent, 
  ProseMirrorDocument, 
  getDefaultHeadingContent, 
  createParagraphContent 
} from "@/types/presentation";

export const createTeamCardContent = (): TeamCardContent => ({
  type: "team-card",
  name: getDefaultHeadingContent(),
  role: createParagraphContent(),
  description: createParagraphContent(),
  avatar: "",
  socials: {},
});

export const normalizeTeamCardContent = (content: any): TeamCardContent => {
  return {
    type: "team-card",
    name: content?.name ?? getDefaultHeadingContent(),
    role: content?.role ?? createParagraphContent(),
    description: content?.description ?? createParagraphContent(),
    avatar: content?.avatar ?? "",
    socials: content?.socials ?? {},
  };
};
