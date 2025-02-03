import { ChatOllama } from '@langchain/ollama';
import { StateGraph, Annotation } from "@langchain/langgraph";
import MermaidGraph from '../MermaidGraph';

export async function parallelization() {
  const llm = new ChatOllama({
    model: process.env.MODEL_NAME,
    temperature: parseFloat(process.env.TEMPERATURE ?? '0.1'),
    baseUrl: process.env.BASE_URL_OLLAMA,
  });

  // Graph state
  const StateAnnotation = Annotation.Root({
    topic: Annotation<string>,
    joke: Annotation<string>,
    story: Annotation<string>,
    poem: Annotation<string>,
    combinedOutput: Annotation<string>,
  });

  // Nodes
  // First LLM call to generate initial joke
  async function callLlm1(state: typeof StateAnnotation.State) {
    const msg = await llm.invoke(`Write a joke about ${state.topic}`);
    return { joke: msg.content };
  }

  // Second LLM call to generate story
  async function callLlm2(state: typeof StateAnnotation.State) {
    const msg = await llm.invoke(`Write a story about ${state.topic}`);
    return { story: msg.content };
  }

  // Third LLM call to generate poem
  async function callLlm3(state: typeof StateAnnotation.State) {
    const msg = await llm.invoke(`Write a poem about ${state.topic}`);
    return { poem: msg.content };
  }

  // Combine the joke, story and poem into a single output
  async function aggregator(state: typeof StateAnnotation.State) {
    const combined = `Here's a story, joke, and poem about ${state.topic}!\n\n` +
      `STORY:\n${state.story}\n\n` +
      `JOKE:\n${state.joke}\n\n` +
      `POEM:\n${state.poem}`;
    return { combinedOutput: combined };
  }

  // Build workflow
  const parallelWorkflow = new StateGraph(StateAnnotation)
    .addNode("callLlm1", callLlm1)
    .addNode("callLlm2", callLlm2)
    .addNode("callLlm3", callLlm3)
    .addNode("aggregator", aggregator)
    .addEdge("__start__", "callLlm1")
    .addEdge("__start__", "callLlm2")
    .addEdge("__start__", "callLlm3")
    .addEdge("callLlm1", "aggregator")
    .addEdge("callLlm2", "aggregator")
    .addEdge("callLlm3", "aggregator")
    .addEdge("aggregator", "__end__")
    .compile();

  // Draw the agent graph
  MermaidGraph.drawMermaidAsImage(parallelWorkflow);

  // Invoke
  const result = await parallelWorkflow.invoke({ topic: "cats" });
  console.log(result.combinedOutput);
}
