import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const getFlashModel = () => genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
export const getFlashLiteModel = () => genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" }); 