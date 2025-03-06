"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function ChatHeader() {
	const { theme, setTheme } = useTheme();

	return (
		<header className="sticky top-0 z-10 border-b bg-background">
			<div className="container flex h-16 items-center justify-between">
				<div className="flex items-center gap-2">
					<Image src="/el_salvador_bandera.svg?height=32&width=32" alt="Logo" width={32} height={32} className="rounded-full" />
					<h1 className="text-xl font-bold text-primary">Chat El Salvador</h1>
				</div>
				<Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Cambiar tema">
					{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
				</Button>
			</div>
		</header>
	);
}
