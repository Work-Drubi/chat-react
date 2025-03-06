"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessage } from "@/components/chat-message";

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

	// Verificar si hay mensajes del usuario para determinar si estamos en modo chat
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

		// Simulate AI response after a delay
		setTimeout(() => {
			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: `Gracias por tu mensaje. Estoy aquí para ayudarte con cualquier consulta sobre El Salvador o cualquier otro tema.`,
				role: "assistant",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, assistantMessage]);
			setIsLoading(false);
		}, 1000);
	};

	// Renderizar la vista centrada (estilo inicial de ChatGPT)
	if (!isChatMode) {
		return (
			<div className="flex flex-col h-screen">
				<ChatHeader />
				<div className="flex-1 flex flex-col items-center justify-center p-4">
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

	// Renderizar la vista de chat completa
	return (
		<div className="flex flex-col h-screen">
			<ChatHeader />
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.map((message) => (
					<ChatMessage key={message.id} message={message} />
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
	);
}
