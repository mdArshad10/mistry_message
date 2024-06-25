import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey: string = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return Response.json(
        {
          success: false,
          message: "invalid API key provided",
        },
        { status: 401 }
      );
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(messages);
    console.log(result.response.text());

    return Response.json({ success: true, message: result }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    console.log("some error on generating messsage, ", error.message);
    return Response.json(
      { success: false, message: error.message },
      { status: 404 }
    );
  }
}
