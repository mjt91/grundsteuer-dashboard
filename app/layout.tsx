import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grundsteuer Dashboard",
  description: "Property tax calculation and visualization dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
