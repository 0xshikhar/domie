export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Completely standalone - no Domanzo branding, header, or footer
  return <>{children}</>;
}
