import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOllama } from "@langchain/ollama";
import { CompiledStateGraph, MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export default function simpleAgent(): CompiledStateGraph<any, any>{
  // Define the tools for the agent to use
  const agentTools = [new TavilySearchResults({ maxResults: 3 })];
  const agentModel = new ChatOllama({
    model: 'llama3.1:8b',
    temperature: 0.1,
    baseUrl: process.env.BASE_URL_OLLAMA,
  });

  // Initialize memory to persist state between graph runs
  const agentCheckpointer = new MemorySaver();
  const agent = createReactAgent({
    llm: agentModel,
    tools: agentTools,
    checkpointSaver: agentCheckpointer,
  });
  return agent;
}