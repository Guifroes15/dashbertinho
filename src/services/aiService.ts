import { GoogleGenAI, Type } from "@google/genai";
import { StoreData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateActionPlan(store: StoreData, fee: number) {
  try {
    const historicalData = store.historico
      .filter(h => h.vendas >= 0)
      .map(h => ({
        mes: h.mes,
        vendas: h.vendas,
        mensagens: h.mensagens || 0,
        verba: h.verba || 0
      }));

    const prompt = `
      Você é um especialista em análise de performance de varejo digital para o grupo Aure Digital.
      Analise os resultados da loja "${store.name}" considerando um fee fixo de R$ ${fee.toLocaleString('pt-BR')} por mês.
      
      Dados Históricos:
      ${JSON.stringify(historicalData, null, 2)}

      Objetivo:
      Gere um relatório estratégico para o próximo mês em formato JSON, focando em:
      - Resumo da saúde financeira (ROI)
      - Uma sugestão estratégica principal (Ação Principal)
      - Três tarefas práticas (Checklist) para a equipe da operação executar.

      Importante: Responda apenas em JSON válido seguindo este esquema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumo: { type: Type.STRING },
            sugestaoPrincipal: { type: Type.STRING },
            tarefas: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["resumo", "sugestaoPrincipal", "tarefas"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Report error:", error);
    return null;
  }
}
