import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { CompiledStateGraph, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import MermaidGraph from "../MermaidGraph";

export async function agentBehavior(): Promise<CompiledStateGraph<any, any, any, any, any, any>> {
  // Define the tools for the agent to use
  const tools = [new TavilySearchResults({ maxResults: 3 })];
  const toolNode = new ToolNode(tools);

  // Create a model and give it access to the tools
  const model = new ChatOllama({
    model: process.env.MODEL_NAME,
    temperature: parseFloat(process.env.TEMPERATURE ?? '0.1'),
    baseUrl: process.env.BASE_URL_OLLAMA,
  }).bindTools(tools);
  
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

export async function executeAgentBehavior() {
  // Create a agent behavior
  const agent = await agentBehavior();

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