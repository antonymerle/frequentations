import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fréquentations",
  description: "Tableau de bord de fréquentations des BU UPPA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
