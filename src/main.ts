import 'dotenv/config';
import { LlmProviderManager } from './services/LlmProviderManager/LlmProviderManager';
import { ExampleManager } from './services/ExampleManager/ExampleManager';

console.log('TAVILY_API_KEY', process.env.TAVILY_API_KEY);
console.log('LANGCHAIN_API_KEY', process.env.LANGCHAIN_API_KEY);
console.log('LANGCHAIN_TRACING_V2', process.env.LANGCHAIN_TRACING_V2);
console.log('LANGCHAIN_PROJECT', process.env.LANGCHAIN_PROJECT);

async function main() {
  try {
    const llm = await LlmProviderManager.selectLlmProviderFromUser();
    await ExampleManager.run(llm);
  }catch(e){
    console.error('\n[Main] Caught error:\n', e);
  }
  
  main();
}

main();