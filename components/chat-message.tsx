import { Button } from "@/components/ui/button";

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

interface ChatMessageProps {
	message: Message;
	onChipClick?: (text: string) => void;
}

export function ChatMessage({ message, onChipClick }: ChatMessageProps) {
	const isUser = message.role === "user";

	return (
		<div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
			<div className={`rounded-lg p-4 max-w-[80%] ${isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
				{message.content && <div className="whitespace-pre-wrap">{message.content}</div>}

				{/* Display chip buttons if available */}
				{message.richContent?.map((content, i) => (
					<div key={i} className="mt-3">
						{content.type === "chips" && (
							<div className="flex flex-wrap gap-2 mt-2">
								{content.options?.map((option, j) => (
									<Button key={j} variant="outline" size="sm" onClick={() => onChipClick?.(option.text)} className="mt-1">
										{option.text}
									</Button>
								))}
							</div>
						)}
					</div>
				))}

				<div className="text-xs opacity-50 mt-1">{message.timestamp.toLocaleTimeString()}</div>
			</div>
		</div>
	);
}
