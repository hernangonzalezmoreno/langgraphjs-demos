import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { CompiledStateGraph, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import MermaidGraph from "../../MermaidGraph/MermaidGraph";

export async function agentBehavior(llm: BaseChatModel): Promise<CompiledStateGraph<any, any, any, any, any, any>> {
  // Define the tools for the agent to use
  const tools = [new TavilySearchResults({ maxResults: 3 })];
  const toolNode = new ToolNode(tools);

  // Create a model and give it access to the tools
  if(!llm.bindTools) throw new Error("The model does not support bindTools");
  const model = llm.bindTools(tools);
  
  // Define the function that determines whether to continue or not
  function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1] as AIMessage;

    // If the LLM makes a tool call, then we route to the "tools" node
    if (lastMessage.tool_calls?.length) {
      return "tools";
    }
    // Otherwise, we stop (reply to the user) using the special "__end__" node
    return "__end__";
  }

  // Define the function that calls the model
  async function callModel(state: typeof MessagesAnnotation.State) {
    const response = await model.invoke(state.messages);

    // We return a list, because this will get added to the existing list
    return { messages: [response] };
  }

  // Define a new graph
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
    .addNode("tools", toolNode)
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue);

  // Finally, we compile it into a LangChain Runnable.
  const app = workflow.compile();
  return app;
}

export async function executeAgentBehavior(llm: BaseChatModel) {
  // Create a agent behavior
  const agent = await agentBehavior(llm);

  // Draw the agent graph
  await MermaidGraph.drawMermaidByConsole(agent);

  // Draw the agent graph as an image
  await MermaidGraph.drawMermaidAsImage(agent);
  
  // Now it's time to use!
  const agentFinalState = await agent.invoke(
    { messages: [new HumanMessage("what is the weather in sf")] },
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