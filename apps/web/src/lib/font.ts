import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const appFontSans = Inter({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sans",
});
const appFontMono = Inter({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
});

export const appFontClassName = appFontSans.className;
export const fontVariables = cn(appFontSans.variable, appFontMono.variable);
