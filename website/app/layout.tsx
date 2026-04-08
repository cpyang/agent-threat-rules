import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ATR - Agent Threat Rules",
    template: "%s | ATR",
  },
  description:
    "Open-source detection rules for AI agent security threats. 108 rules, 9 categories, 99.7% precision, 96.9% SKILL.md recall. Shipped in Cisco AI Defense. MIT Licensed.",
  metadataBase: new URL("https://agentthreatrule.org"),
  openGraph: {
    title: "ATR - Agent Threat Rules",
    description:
      "We used to protect people. Now we protect agents. Open-source detection standard for AI agent threats.",
    url: "https://agentthreatrule.org",
    siteName: "ATR - Agent Threat Rules",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ATR - Agent Threat Rules",
    description:
      "We used to protect people. Now we protect agents. 108 rules, 9 categories, 96.9% SKILL.md recall.",
  },
  keywords: [
    "AI agent security",
    "MCP security",
    "prompt injection detection",
    "agent threat rules",
    "ATR",
    "OWASP agentic",
    "YARA for AI",
    "Sigma for AI agents",
    "AI security rules",
    "LLM security",
  ],
  authors: [{ name: "ATR Community" }],
  creator: "ATR Community",
  publisher: "Agent Threat Rules",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
