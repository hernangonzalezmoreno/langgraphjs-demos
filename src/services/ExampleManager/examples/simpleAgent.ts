import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { CompiledStateGraph, MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import MermaidGraph from "../../MermaidGraph/MermaidGraph";

export function simpleAgent(llm: BaseChatModel): CompiledStateGraph<any, any>{
  // Define the tools for the agent to use
  const agentTools = [new TavilySearchResults({ maxResults: 3 })];
  const agentModel = llm;

  // Initialize memory to persist state between graph runs
  const agentCheckpointer = new MemorySaver();
  const agent = createReactAgent({
    llm: agentModel,
    tools: agentTools,
    checkpointSaver: agentCheckpointer,
  });
  return agent;
}

export async function executeSimpleAgent(llm: BaseChatModel){
  // Create a simple agent
  const agent = simpleAgent(llm);

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