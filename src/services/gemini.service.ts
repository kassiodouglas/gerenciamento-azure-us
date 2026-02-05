import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedTask } from '../types';
import { GeminiConfigService } from '../app/core/config/gemini-config.service';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private configService = inject(GeminiConfigService);
  private _ai?: GoogleGenAI;

  private get ai(): GoogleGenAI {
    const apiKey = this.configService.config().apiKey;
    if (!this._ai || this._ai['apiKey'] !== apiKey) {
      this._ai = new GoogleGenAI({ apiKey: apiKey });
    }
    return this._ai;
  }

  constructor() {}

  async generateTasks(storyTitle: string, storyDescription: string): Promise<GeneratedTask[]> {
    const prompt = `
      Você é um Desenvolvedor Agile especialista.
      Título da User Story: ${storyTitle}
      Descrição: ${storyDescription}
      
      Por favor, sugira de 3 a 5 sub-tarefas técnicas distintas necessárias para completar esta User Story.
      Responda em Português (PT-BR).
      Foque em tarefas de codificação, testes e configuração.
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
                title: { type: Type.STRING, description: "Título da tarefa" },
                description: { type: Type.STRING, description: "Breve descrição do que precisa ser feito" },
                activity: { type: Type.STRING, description: "Tipo de atividade, ex: Desenvolvimento, Design, Testes" }
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
      Refine a seguinte descrição de User Story para ser mais profissional, clara e seguir o formato padrão "Como um... eu quero... para que..." se possível.
      Responda em Português (PT-BR).
      Mantenha as tags HTML se presentes ou retorne texto simples com markdown.
      
      Descrição Atual:
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
    const apiKey = this.configService.config().apiKey;
    if (!apiKey) return 'API Key do Gemini não configurada. Verifique as configurações.';

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
