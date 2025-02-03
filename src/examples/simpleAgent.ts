import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOllama } from "@langchain/ollama";
import { CompiledStateGraph, MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import MermaidGraph from "../MermaidGraph";

export function simpleAgent(): CompiledStateGraph<any, any>{
  // Define the tools for the agent to use
  const agentTools = [new TavilySearchResults({ maxResults: 3 })];
  const agentModel = new ChatOllama({
    model: process.env.MODEL_NAME,
    temperature: parseFloat(process.env.TEMPERATURE ?? '0.1'),
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

export async function executeSimpleAgent(){
  // Create a simple agent
  const agent = simpleAgent();

  // Draw the agent graph
  await MermaidGraph.drawMermaidByConsole(agent);

  // Draw the agent graph as an image
  await MermaidGraph.drawMermaidAsImage(agent);
  
  // Now it's time to use!
  const agentFinalState = await agent.invoke(
    { messages: [new HumanMessage("what is the current weather in sf")] },
    { configurable: { thread_id: "42" } },
  );

  console.log(
    agentFinalState.messages[agentFinalState.messages.length - 1].content,
  );

  const agentNextState = await agent.invoke(
    { messages: [new HumanMessage("what about ny")] },
    { configurable: { thread_id: "42" } },
  );

  console.log(
    agentNextState.messages[agentNextState.messages.length - 1].content,
  );
}