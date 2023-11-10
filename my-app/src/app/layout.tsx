import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SocketProvider } from "../components/socketProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Echo",
  description: "Echo is a video conferencing app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
