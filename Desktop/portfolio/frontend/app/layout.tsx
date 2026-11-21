import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anil Ghode | Junior Software Developer & AI/Backend Engineer",
  description:
    "Portfolio of Anil Ghode. Junior Software Developer & AI/Backend Engineer from Manipal Institute of Technology (ECE '28). Specializing in FastAPI, Distributed Systems, PyTorch, LangChain, React Native, and Real-Time Architectures.",
  keywords: [
    "Anil Ghode",
    "Software Developer",
    "AI Engineer",
    "Backend Engineer",
    "Manipal Institute of Technology",
    "FastAPI",
    "PostgreSQL",
    "PyTorch",
    "LangChain",
    "React Three Fiber",
    "Next.js Portfolio",
  ],
  authors: [{ name: "Anil Ghode", url: "https://github.com/AGmitmanipal" }],
  creator: "Anil Ghode",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://anilghode.dev",
    title: "Anil Ghode | Junior Software Developer & AI/Backend Engineer",
    description:
      "Engineering scalable backends, real-time distributed microservices, and autonomous agentic AI systems.",
    siteName: "Anil Ghode Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anil Ghode | Junior Software Developer & AI/Backend Engineer",
    description:
      "Engineering scalable backends, real-time distributed microservices, and autonomous agentic AI systems.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark scroll-smooth`}
    >
      <body className="min-h-screen bg-[#090d16] text-slate-100 font-sans antialiased selection:bg-purple-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
