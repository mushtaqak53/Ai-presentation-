
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationParams, OutputType, GeneratedData } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const slideSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    subtitle: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          points: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "points"]
      }
    }
  },
  required: ["title", "items"]
};

const wordSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          paragraphs: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["heading", "paragraphs"]
      }
    }
  },
  required: ["title", "items"]
};

export async function generateAILogic(params: GenerationParams): Promise<GeneratedData> {
  const modelName = 'gemini-3-flash-preview';
  const isSlides = params.type === OutputType.SLIDES;
  
  const promptText = isSlides 
    ? `Create a professional PowerPoint presentation outline.
       Topic: ${params.prompt}
       Number of slides: ${params.count}
       Tone: ${params.tone}
       Language: ${params.language}
       Instructions: Include a title slide and content slides with bullet points.`
    : `Create a professional MS Word document structure.
       Topic: ${params.prompt}
       Length (Sections): ${params.count}
       Tone: ${params.tone}
       Language: ${params.language}
       Instructions: Include headings, subheadings, and detailed paragraphs.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [{ parts: [{ text: promptText }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: isSlides ? slideSchema : wordSchema,
    },
  });

  const rawJson = JSON.parse(response.text);
  return {
    ...rawJson,
    type: params.type
  };
}
