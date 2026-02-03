import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedTask } from '../types';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
  }

  async generateTasks(storyTitle: string, storyDescription: string): Promise<GeneratedTask[]> {
    const prompt = `
      You are an expert Agile Developer.
      User Story Title: ${storyTitle}
      Description: ${storyDescription}
      
      Please suggest 3 to 5 distinct technical sub-tasks required to complete this User Story.
      Focus on coding, testing, and configuration tasks.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Title of the task" },
                description: { type: Type.STRING, description: "Brief description of what needs to be done" },
                activity: { type: Type.STRING, description: "Type of activity e.g. Development, Design, Testing" }
              },
              required: ["title", "description"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) return [];
      return JSON.parse(text) as GeneratedTask[];
    } catch (e) {
      console.error('Gemini Error:', e);
      return [];
    }
  }

  async refineDescription(currentDesc: string): Promise<string> {
    const prompt = `
      Refine the following User Story description to be more professional, clear, and follow standard "As a... I want... So that..." format if possible.
      Keep HTML tags if present or return plain text with markdown.
      
      Current Description:
      ${currentDesc}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || currentDesc;
    } catch (e) {
      console.error(e);
      return currentDesc;
    }
  }

  async summarizeDescription(description: string): Promise<string> {
    const prompt = `
      Forneça um resumo executivo e conciso da seguinte User Story em português (PT-BR).
      Destaque o objetivo principal e os pontos chave.
      Use bullet points se necessário.
      
      Descrição:
      ${description}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || 'Não foi possível gerar um resumo.';
    } catch (e) {
      console.error(e);
      return 'Erro ao gerar resumo via IA.';
    }
  }
}
