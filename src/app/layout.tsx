import type { Metadata } from "next";
import "./globals.css";

import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
	title: "Clash of Bytes - Programming Puzzles",
	description: "Solve programming puzzles in as few characters as possible",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<meta
					name="format-detection"
					content="telephone=no, date=no, email=no, address=no"
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</head>
			<body className="antialiased min-h-screen">
				<Navbar />
				<main className="container mx-auto px-4 py-8">{children}</main>
			</body>
		</html>
	);
}
