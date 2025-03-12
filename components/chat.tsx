"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessage } from "@/components/chat-message";
import Image from "next/image";

type Message = {
	id: string;
	content: string;
	role: "user" | "assistant";
	timestamp: Date;
};

export function Chat() {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			content: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
			role: "assistant",
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const hasUserMessages = messages.some((message) => message.role === "user");
	const isChatMode = hasUserMessages;

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		if (isChatMode) {
			scrollToBottom();
		}
	}, [scrollToBottom, isChatMode]);

	type RichContentOption = {
		text: string;
		mode?: string;
	};

	type RichContent = {
		type: string;
		options?: RichContentOption[];
	};

	type Message = {
		id: string;
		content: string;
		role: "user" | "assistant";
		timestamp: Date;
		richContent?: RichContent[];
	};
	const handleChipClick = (text: string) => {
		// Create a new user message with the selected option
		const userMessage: Message = {
			id: Date.now().toString(),
			content: text,
			role: "user",
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setIsLoading(true);

		// Send the chip text as a user message
		fetch("/api/dialogflow", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				text: text,
				project_id: "proyectos-3-451417",
				location_id: "us-central1",
				agent_id: "3d637c97-1656-4b8c-802e-47bf3555c1e1",
				language_code: "es",
				session_id: "10ssdd",
			}),
		})
			.then((response) => {
				if (!response.ok) throw new Error(`Error: ${response.status}`);
				return response.json();
			})
			.then((data) => {
				if (data.responses && Array.isArray(data.responses) && data.responses.length > 0) {
					const assistantMessages = data.responses
						.map((response, index) => {
							if (response.payload?.richContent?.[0]) {
								return {
									id: (Date.now() + index + 1).toString(),
									content: response.text || "",
									role: "assistant" as const,
									timestamp: new Date(Date.now() + index * 100),
									richContent: response.payload.richContent[0],
								};
							}

							if (response.text) {
								return {
									id: (Date.now() + index + 1).toString(),
									content: response.text,
									role: "assistant" as const,
									timestamp: new Date(Date.now() + index * 100),
								};
							}

							return null;
						})
						.filter(Boolean);

					setMessages((prev) => [...prev, ...assistantMessages]);
				} else {
					const fallbackMessage: Message = {
						id: (Date.now() + 1).toString(),
						content: "Lo siento, no pude procesar tu solicitud.",
						role: "assistant",
						timestamp: new Date(),
					};

					setMessages((prev) => [...prev, fallbackMessage]);
				}
			})
			.catch((error) => {
				console.error("Error calling Dialogflow API:", error);

				const errorMessage: Message = {
					id: (Date.now() + 1).toString(),
					content: "Lo siento, ocurrió un error al procesar tu mensaje.",
					role: "assistant",
					timestamp: new Date(),
				};

				setMessages((prev) => [...prev, errorMessage]);
			})
			.finally(() => {
				setIsLoading(false);
			});
	};
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;

		// Add user message
		const userMessage: Message = {
			id: Date.now().toString(),
			content: input,
			role: "user",
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			// Send message to Dialogflow API through our proxy
			const response = await fetch("/api/dialogflow", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					text: input,
					project_id: "proyectos-3-451417",
					location_id: "us-central1",
					agent_id: "3d637c97-1656-4b8c-802e-47bf3555c1e1",
					language_code: "es",
					session_id: "10ssdd",
				}),
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}

			const data = await response.json();

			// Process each response as a separate message
			if (data.responses && Array.isArray(data.responses) && data.responses.length > 0) {
				// Create a new message for each response
				const assistantMessages = data.responses
					.map((response, index) => {
						// For responses with rich content/chips
						if (response.payload?.richContent?.[0]) {
							return {
								id: (Date.now() + index + 1).toString(),
								content: response.text || "",
								role: "assistant" as const,
								timestamp: new Date(Date.now() + index * 100),
								richContent: response.payload.richContent[0],
							};
						}

						// For text-only responses
						if (response.text) {
							return {
								id: (Date.now() + index + 1).toString(),
								content: response.text,
								role: "assistant" as const,
								timestamp: new Date(Date.now() + index * 100),
							};
						}

						return null;
					})
					.filter(Boolean);

				// Add all assistant messages to the message list
				setMessages((prev) => [...prev, ...assistantMessages]);
			} else {
				// Fallback message if no responses
				const fallbackMessage: Message = {
					id: (Date.now() + 1).toString(),
					content: "Lo siento, no pude procesar tu solicitud.",
					role: "assistant",
					timestamp: new Date(),
				};

				setMessages((prev) => [...prev, fallbackMessage]);
			}
		} catch (error) {
			console.error("Error calling Dialogflow API:", error);

			// Add error message as assistant response
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: "Lo siento, ocurrió un error al procesar tu mensaje.",
				role: "assistant",
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	if (!isChatMode) {
		return (
			<div className="flex flex-col h-screen">
				<ChatHeader />
				<div className="flex-1 flex flex-col items-center justify-center p-4">
					<Image src="/el_salvador_bandera.svg" alt="Logo" width={150} height={150} className="pb-12" />
					<div className="w-full max-w-2xl mx-auto mb-8 text-center">
						<h2 className="text-2xl font-bold text-primary mb-2">Generador de Presupuestos Gubernamentales</h2>
						<p className="text-muted-foreground">Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?</p>
					</div>
					<div className="w-full max-w-2xl">
						<form onSubmit={handleSubmit} className="flex space-x-2">
							<Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1" disabled={isLoading} autoFocus />
							<Button type="submit" size="icon" disabled={isLoading}>
								<Send className="h-4 w-4" />
							</Button>
						</form>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col  h-screen">
			<ChatHeader />
			<div className="flex flex-col h-screen w-full max-w-4xl mx-auto">
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{messages.map((message) => (
						<ChatMessage key={message.id} message={message} onChipClick={handleChipClick} />
					))}
					{isLoading && (
						<div className="flex items-center space-x-2 text-muted-foreground">
							<div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
							<div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
							<div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }}></div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
				<div className="border-t bg-background p-4">
					<form onSubmit={handleSubmit} className="flex space-x-2">
						<Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1" disabled={isLoading} />
						<Button type="submit" size="icon" disabled={isLoading}>
							<Send className="h-4 w-4" />
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
