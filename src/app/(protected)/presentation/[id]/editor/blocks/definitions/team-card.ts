import { ProseMirrorDocument, getDefaultHeadingContent, createParagraphContent } from "./common";

export interface TeamCardContent {
  name: ProseMirrorDocument;
  role: ProseMirrorDocument;
  description?: ProseMirrorDocument;
  avatar?: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export const createTeamCardContent = (): TeamCardContent => ({
  name: getDefaultHeadingContent(),
  role: createParagraphContent(),
  description: createParagraphContent(),
  avatar: "",
  socials: {},
});

export const normalizeTeamCardContent = (content: any): TeamCardContent => {
  return {
    name: content?.name ?? getDefaultHeadingContent(),
    role: content?.role ?? createParagraphContent(),
    description: content?.description ?? createParagraphContent(),
    avatar: content?.avatar ?? "",
    socials: content?.socials ?? {},
  };
};
