import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import inquirer from "inquirer";

export enum LlmProvider {
  Ollama = 'ollama',
  OpenAI = 'openai',
}

export class LlmProviderManager {
  static getLlmProvider(llmProvider: LlmProvider): BaseChatModel {
    switch (llmProvider) {
      case LlmProvider.Ollama:
        console.log('OLLAMA_BASE_URL', process.env.OLLAMA_BASE_URL);
        console.log('OLLAMA_MODEL_NAME', process.env.OLLAMA_MODEL_NAME);
        console.log('OLLAMA_TEMPERATURE', process.env.OLLAMA_TEMPERATURE);

        return new ChatOllama({
          model: process.env.OLLAMA_MODEL_NAME,
          temperature: parseFloat(process.env.OLLAMA_TEMPERATURE ?? '0.1'),
          baseUrl: process.env.OLLAMA_BASE_URL,
        });
      case LlmProvider.OpenAI:
        console.log('OPENAI_MODEL_NAME', process.env.OPENAI_MODEL_NAME);
        console.log('OPENAI_TEMPERATURE', process.env.OPENAI_TEMPERATURE);
        
        return new ChatOpenAI({
          model: process.env.OPENAI_MODEL_NAME,
          temperature: parseFloat(process.env.OPENAI_TEMPERATURE ?? '0.1'),
        });
      default:
        throw new Error(`Unsupported LLM provider: ${llmProvider}`);
    }
  }

  static async selectLlmProviderFromUser(): Promise<BaseChatModel> {
    console.log('\n====================\n');

    const userResponse = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedProvider',
        message: 'Elija el proveedor de LLM que desea utilizar:',
        choices: Object.values(LlmProvider),
      },
    ]);

    return LlmProviderManager.getLlmProvider(userResponse.selectedProvider);
  }
}