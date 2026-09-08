import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "24sEnergy — ระบบกักเก็บพลังงาน BESS, Solar PV, EV Charger",
  description: "ผู้นำด้านระบบกักเก็บพลังงาน (BESS), Solar PV, EV Charger และ EMS สำหรับอุตสาหกรรมไทย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className="h-full antialiased"
    >
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
