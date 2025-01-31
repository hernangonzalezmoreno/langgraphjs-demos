import 'dotenv/config';
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOllama } from '@langchain/ollama';

console.log('BASE_URL_OLLAMA', process.env.BASE_URL_OLLAMA);
console.log('TAVILY_API_KEY', process.env.TAVILY_API_KEY);
console.log('LANGCHAIN_API_KEY', process.env.LANGCHAIN_API_KEY);
console.log('LANGCHAIN_TRACING_V2', process.env.LANGCHAIN_TRACING_V2);
console.log('LANGCHAIN_PROJECT', process.env.LANGCHAIN_PROJECT);

async function main() {

  const llm = new ChatOllama({
      model: 'llama3.1:8b',
      temperature: 0.1,
      baseUrl: process.env.BASE_URL_OLLAMA,
    });

  const searchQuerySchema = z.object({
    searchQuery: z.string().describe("Query that is optimized web search."),
    justification: z.string().describe("Why this query is relevant to the user's request."),
  });

  // Augment the LLM with schema for structured output
  const structuredLlm = llm.withStructuredOutput(searchQuerySchema, {
    name: "searchQuery",
  });

  // Invoke the augmented LLM
  const output = await structuredLlm.invoke(
    "How does Calcium CT score relate to high cholesterol?"
  );

  console.log('output', output);

  const multiply = tool(
    async ({ a, b }) => {
      return a * b;
    },
    {
      name: "multiply",
      description: "mutiplies two numbers together",
      schema: z.object({
        a: z.number().describe("the first number"),
        b: z.number().describe("the second number"),
      }),
    }
  );

  // Augment the LLM with tools
  const llmWithTools = llm.bindTools([multiply]);

  // Invoke the LLM with input that triggers the tool call
  const message = await llmWithTools.invoke("What is 2 times 3?");

  console.log(message.tool_calls);
  console.log(message);
}

main();