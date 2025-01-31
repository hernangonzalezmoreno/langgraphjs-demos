import 'dotenv/config';
import { HumanMessage } from '@langchain/core/messages';
import MermaidGraph from './MermaidGraph';
import { agentBehavior, simpleAgent } from './agents';

console.log('BASE_URL_OLLAMA', process.env.BASE_URL_OLLAMA);
console.log('TAVILY_API_KEY', process.env.TAVILY_API_KEY);
console.log('LANGCHAIN_API_KEY', process.env.LANGCHAIN_API_KEY);
console.log('LANGCHAIN_TRACING_V2', process.env.LANGCHAIN_TRACING_V2);
console.log('LANGCHAIN_PROJECT', process.env.LANGCHAIN_PROJECT);

async function main() {
  // Create a simple agent
  // const agent = simpleAgent();

  // Or create a agent behavior
  const agent = await agentBehavior();

  // Draw the agent graph
  await MermaidGraph.drawMermaidByConsole(agent);

  // Draw the agent graph as an image
  await MermaidGraph.drawMermaidAsImage(agent);
  
  // Now it's time to use!
  const agentFinalState = await agent.invoke(
    { messages: [new HumanMessage("¿Quien es Hernan Gonzalez Moreno? Buscalo en github y en Linkedin. Dame información de él. Responde en español.")] },
    { configurable: { thread_id: "42" } },
  );

  console.log(
    agentFinalState.messages[agentFinalState.messages.length - 1].content,
  );

  const agentNextState = await agent.invoke(
    { messages: [new HumanMessage("¿Sabes donde nacio? ¿O donde estudio?")] },
    { configurable: { thread_id: "42" } },
  );

  console.log(
    agentNextState.messages[agentNextState.messages.length - 1].content,
  );
}

main();