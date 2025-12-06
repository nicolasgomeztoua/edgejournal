import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "EdgeJournal - Trading Journal with AI Analytics",
	description:
		"Professional trading journal for Futures and Forex with AI-powered insights",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ClerkProvider
			appearance={{
				baseTheme: dark,
				variables: {
					colorPrimary: "#10b981",
					colorBackground: "#0f172a",
					colorInputBackground: "#1e293b",
					colorInputText: "#f8fafc",
				},
			}}
		>
			<html
				className={`${geist.variable} ${jetbrainsMono.variable}`}
				lang="en"
			>
				<body className="bg-slate-950 text-slate-100 antialiased">
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
