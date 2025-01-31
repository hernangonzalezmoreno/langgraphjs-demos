import 'dotenv/config';
import { ChatOllama } from '@langchain/ollama';
import { StateGraph, Annotation } from "@langchain/langgraph";
import MermaidGraph from './MermaidGraph';

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

  // Graph state
  const StateAnnotation = Annotation.Root({
    topic: Annotation<string>,
    joke: Annotation<string>,
    improvedJoke: Annotation<string>,
    finalJoke: Annotation<string>,
  });
  
  // Define node functions
  
  // First LLM call to generate initial joke
  async function generateJoke(state: typeof StateAnnotation.State) {
    const msg = await llm.invoke(`Write a short joke about ${state.topic}`);
    return { joke: msg.content };
  }
  
  // Gate function to check if the joke has a punchline
  function checkPunchline(state: typeof StateAnnotation.State) {
    // Simple check - does the joke contain "?" or "!"
    if (state.joke?.includes("?") || state.joke?.includes("!")) {
      return "Pass";
    }
    return "Fail";
  }
  
    // Second LLM call to improve the joke
  async function improveJoke(state: typeof StateAnnotation.State) {
    const msg = await llm.invoke(
      `Make this joke funnier by adding wordplay: ${state.joke}`
    );
    return { improvedJoke: msg.content };
  }
  
  // Third LLM call for final polish
  async function polishJoke(state: typeof StateAnnotation.State) {
    const msg = await llm.invoke(
      `Add a surprising twist to this joke: ${state.improvedJoke}`
    );
    return { finalJoke: msg.content };
  }
  
  // Build workflow
  const chain = new StateGraph(StateAnnotation)
    .addNode("generateJoke", generateJoke)
    .addNode("improveJoke", improveJoke)
    .addNode("polishJoke", polishJoke)
    .addEdge("__start__", "generateJoke")
    .addConditionalEdges("generateJoke", checkPunchline, {
      Pass: "improveJoke",
      Fail: "__end__"
    })
    .addEdge("improveJoke", "polishJoke")
    .addEdge("polishJoke", "__end__")
    .compile();
  
  // Draw the agent graph
  MermaidGraph.drawMermaidAsImage(chain);
  
  // Invoke
  const state = await chain.invoke({ topic: "cats" });
  console.log("Initial joke:");
  console.log(state.joke);
  console.log("\n--- --- ---\n");
  if (state.improvedJoke !== undefined) {
    console.log("Improved joke:");
    console.log(state.improvedJoke);
    console.log("\n--- --- ---\n");
  
    console.log("Final joke:");
    console.log(state.finalJoke);
  } else {
    console.log("Joke failed quality gate - no punchline detected!");
  }
}

main();