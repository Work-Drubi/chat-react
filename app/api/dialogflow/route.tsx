import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const response = await fetch("http://localhost:8000/dialogflow/detect-intent", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			return NextResponse.json({ error: `Error: ${response.status}` }, { status: response.status });
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error forwarding to Dialogflow:", error);
		return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
	}
}
