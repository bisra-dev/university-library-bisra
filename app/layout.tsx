import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";


const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const ibmplexsans = localFont({
  src: [
    { path: "./fonts/IBMPlexSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexSans-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/IBMPlexSans-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/IBMPlexSans-Bold.ttf", weight: "700", style: "normal" },
  ],
});

const bebasNeue = localFont({
  src: [
    { path: "./fonts/BebasNeue-Regular.ttf", weight: "400", style: "normal" },
  ],
  variable: "--bebas-neue",
});

export const metadata: Metadata = {
  title: "Bookwise",
  description: "Bookwise is a book borrowing university library management solution.",
};

const RootLayout = async ({ children }: LayoutProps<"/">) => {
  const session = await auth();
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", ibmplexsans.className, bebasNeue.variable, "font-sans", inter.variable)}
    >
      <SessionProvider session={session}>
        <body className="min-h-full flex flex-col">
          {children}
          <Toaster />
        </body>
      </SessionProvider>
    </html>
  );
};

export default RootLayout;