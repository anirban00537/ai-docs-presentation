"use client";

import React from "react";
import { useSearchParams, useParams } from "next/navigation";
import { EditorThemeProvider } from "@/app/(protected)/docs/[id]/editor";
import EditorContent from "./EditorContent";

// --- Main Page Component ---
const PresentationEditorPage = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const presentationId = params?.id as string;
  const outlineId = searchParams.get("outlineId");

  return (
    <EditorThemeProvider>
      <EditorContent 
        presentationId={presentationId}
        outlineId={outlineId}
      />
    </EditorThemeProvider>
  );
};

export default PresentationEditorPage;
