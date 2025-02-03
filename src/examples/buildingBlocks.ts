import { tool } from "@langchain/core/tools";
import { ChatOllama } from '@langchain/ollama';
import { z } from "zod";

export async function buildingBlocks() {

  const llm = new ChatOllama({
      model: process.env.MODEL_NAME,
      temperature: parseFloat(process.env.TEMPERATURE ?? '0.1'),
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
