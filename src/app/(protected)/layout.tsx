import { AuthCheckProvider } from "@/components/providers/auth-check.provider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthCheckProvider>{children}</AuthCheckProvider>;
}
