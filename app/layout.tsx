import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "24sEnergy — ระบบกักเก็บพลังงาน โซลาร์เซลล์ และอินเวอร์เตอร์",
  description: "ผลิตภัณฑ์ระบบกักเก็บพลังงาน BESS โซลาร์เซลล์ และอินเวอร์เตอร์ สำหรับบ้าน ฟาร์ม และโรงงาน",
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
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700;800;900&display=swap" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
