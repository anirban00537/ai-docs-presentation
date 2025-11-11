import { AppSidebar } from "@/components/app-sidebar";
import Editor from "@/components/editor/editor";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Editor />
      </SidebarInset>
    </SidebarProvider>
  );
}
