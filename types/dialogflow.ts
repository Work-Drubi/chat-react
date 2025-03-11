export interface DialogflowRequest {
	query: string;
	sessionId: string;
}

export interface DialogflowResponse {
	text: string;
	intent?: string;
	parameters?: Record<string, any>;
	error?: string;
}

export interface DialogflowMessage {
	id: string;
	content: string;
	role: "user" | "assistant";
	timestamp: Date;
}
