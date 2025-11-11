import { AppSidebar } from "@/components/app-sidebar";
import Editor from "@/components/editor/editor";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { EditorHeader } from "@/components/editor/editor-header";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <EditorHeader />
        <Editor />
      </SidebarInset>
    </SidebarProvider>
  );
}
