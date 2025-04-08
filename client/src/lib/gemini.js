// client/src/lib/gemini.js
import { HarmBlockThreshold, HarmCategory, GoogleGenerativeAI } from "@google/generative-ai";

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Use environment variable - don't hardcode the API key
const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro", 
  safetySettings 
});

export default model;
