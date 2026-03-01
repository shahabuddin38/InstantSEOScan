import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({apiKey: "AIzaSyBnMcvaw_wiuVxg9j3be8PIZJpINn4ICSM"});
ai.models.generateContent({model: "gemini-2.5-flash", contents: "Say hello"}).then(res => console.log("Success:", res.text)).catch(e => console.error("Error:", e));
