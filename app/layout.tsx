import "./global.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Navbar } from "./components/nav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "./components/footer";
import { baseUrl } from "./sitemap";

const lora = localFont({
    src: [
        {
            path: "../public/fonts/lora/Lora-VariableFont_wght.ttf",
            weight: "400 700",
            style: "normal",
        },
        {
            path: "../public/fonts/lora/Lora-Italic-VariableFont_wght.ttf",
            weight: "400 700",
            style: "italic",
        },
    ],
    variable: "--font-lora", // 关键：启用 CSS 变量
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: "ZeroFFa",
        template: "%s | ZeroFFa",
    },
    description: "This is my portfolio.",
    openGraph: {
        title: "My Portfolio",
        description: "This is my portfolio.",
        url: baseUrl,
        siteName: "My Portfolio",
        locale: "en_US",
        type: "website",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

const cx = (...classes) => classes.filter(Boolean).join(" ");

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={cx(
                "text-black bg-white dark:text-white dark:bg-black",
                lora.variable,
            )}
        >
            <body className={cx(lora.className, "antialiased")}>
                <main className="flex-auto w-[1100] mx-auto px-10 flex flex-col">
                    <Navbar />
                    {children}
                    <Footer />
                    <Analytics />
                    <SpeedInsights />
                </main>
            </body>
        </html>
    );
}
