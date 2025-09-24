import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hospital App",
  description: "Next.js + FastAPI CRUD Patients",
};

export default function RootLayout({ children }) {
  const isAuthPage =
    typeof window !== "undefined" &&
    (window.location.pathname === "/login" ||
      window.location.pathname === "/register");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable ?? ""} ${geistMono.variable ?? ""
          } antialiased`}
      >
        {!isAuthPage && <Navbar />}
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
