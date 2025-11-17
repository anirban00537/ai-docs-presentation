import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    // If there's an error getting the session, redirect to login
    console.error("Error getting session:", error);
    redirect("/login");
  }

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
