import 'dotenv/config';
import { simpleAgent } from './agent';
import { HumanMessage } from '@langchain/core/messages';

console.log('BASE_URL_OLLAMA', process.env.BASE_URL_OLLAMA);
console.log('TAVILY_API_KEY', process.env.TAVILY_API_KEY);
console.log('LANGCHAIN_API_KEY', process.env.LANGCHAIN_API_KEY);
console.log('LANGCHAIN_TRACING_V2', process.env.LANGCHAIN_TRACING_V2);
console.log('LANGCHAIN_PROJECT', process.env.LANGCHAIN_PROJECT);

async function main() {
  const agent = simpleAgent();

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