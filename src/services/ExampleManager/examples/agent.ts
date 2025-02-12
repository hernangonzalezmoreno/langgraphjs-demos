import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { AIMessage, SystemMessage, ToolMessage, BaseMessage, ToolMessageChunk, HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import MermaidGraph from "../../MermaidGraph/MermaidGraph";

export async function agent(llm: BaseChatModel) {
  // Check if the model supports bindTools
  if(!llm.bindTools) throw new Error("The model does not support bindTools");

  const paramsSchema = z.object({
    a: z.number().describe("first number"),
    b: z.number().describe("second number"),
  });

  // Define tools
  const multiply = tool(
    async ({ a, b }: z.infer<typeof paramsSchema>) => {
      return a * b;
    },
    {
      name: "multiply",
      description: "Multiply two numbers together",
      schema: paramsSchema,
    }
  );
  
  const add = tool(
    async ({ a, b }: z.infer<typeof paramsSchema>) => {
      return a + b;
    },
    {
      name: "add",
      description: "Add two numbers together",
      schema: paramsSchema,
    }
  );
  
  const divide = tool(
    async ({ a, b }: z.infer<typeof paramsSchema>) => {
      return a / b;
    },
    {
      name: "divide",
      description: "Divide two numbers",
      schema: paramsSchema,
    }
  );
  
  // Augment the LLM with tools
  const tools = [add, multiply, divide];
  const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));
  const llmWithTools = llm.bindTools(tools);

  // Nodes
  async function llmCall(state: typeof MessagesAnnotation.State) {
    // LLM decides whether to call a tool or not
    const result = await llmWithTools.invoke([
      new SystemMessage("You are a helpful assistant tasked with performing arithmetic on a set of inputs."),
      ...state.messages
    ]);

    return {
      messages: [result]
    };
  }

  async function toolNode(state: typeof MessagesAnnotation.State) {
    // Performs the tool call
    const results: ToolMessage[] = [];
    const lastMessage = state.messages.at(-1) as AIMessage;

    if (lastMessage?.tool_calls?.length) {
      for (const toolCall of lastMessage.tool_calls) {
        const tool = toolsByName[toolCall.name];
        if(!tool) throw new Error(`Tool ${toolCall.name} not found`);

        // Parse the arguments or throw an error
        const args = paramsSchema.parse(toolCall.args);

        const observation = await tool.invoke(args);
        results.push(
          new ToolMessage({
            content: observation,
            tool_call_id: toolCall.id ?? '',
          })
        );
      }
    }

    return { messages: results };
  }

  // Conditional edge function to route to the tool node or end
  function shouldContinue(state: typeof MessagesAnnotation.State) {
    const messages = state.messages;
    const lastMessage = messages.at(-1) as AIMessage;

    // If the LLM makes a tool call, then perform an action
    if (lastMessage?.tool_calls?.length) {
      return "Action";
    }
    // Otherwise, we stop (reply to the user)
    return "__end__";
  }

  // Build workflow
  const agentBuilder = new StateGraph(MessagesAnnotation)
    .addNode("llmCall", llmCall)
    .addNode("tools", toolNode)
    // Add edges to connect nodes
    .addEdge("__start__", "llmCall")
    .addConditionalEdges(
      "llmCall",
      shouldContinue,
      {
        // Name returned by shouldContinue : Name of next node to visit
        "Action": "tools",
        "__end__": "__end__",
      }
    )
    .addEdge("tools", "llmCall")
    .compile();
  
  // Draw the agent graph
  MermaidGraph.drawMermaidAsImage(agentBuilder);

  // Invoke
  const messages = [
    new HumanMessage("Multiply 3 and 4."),
  ];
  const result = await agentBuilder.invoke({ messages });

  console.log('\nResult:\n', result);

  const lastMessage = result.messages.at(-1) as AIMessage;
  console.log('\n', lastMessage.content);
}