export const metadata = { title: "Design Balance MVP" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto' }}>{children}</body>
    </html>
  );
}
