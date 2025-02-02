import 'dotenv/config';
import inquirer from 'inquirer';
import { 
  executeSimpleAgent,
  executeAgentBehavior,
  buildingBlocks,
  promptChaining,
  parallelization,
  routing
} from './examples';

console.log('BASE_URL_OLLAMA', process.env.BASE_URL_OLLAMA);
console.log('TAVILY_API_KEY', process.env.TAVILY_API_KEY);
console.log('LANGCHAIN_API_KEY', process.env.LANGCHAIN_API_KEY);
console.log('LANGCHAIN_TRACING_V2', process.env.LANGCHAIN_TRACING_V2);
console.log('LANGCHAIN_PROJECT', process.env.LANGCHAIN_PROJECT);

enum ExampleOptions {
  SIMPLE_AGENT = 'Simple agent',
  AGENT_BEHAVIOR = 'Agent behavior',
  BUILDING_BLOCKS = 'Building blocks',
  PROMPT_CHAINING = 'Prompt chaining',
  PARALLELIZATION = 'Parallelization',
  ROUTING = 'Routing',
}

async function main() {
  console.log();
  console.log('====================');
  console.log();

  const userResponse = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedExample',
      message: 'Elija el ejemplo que desea ejecutar:',
      choices: Object.values(ExampleOptions),
    },
  ]);

  switch (userResponse.selectedExample) {
    case ExampleOptions.SIMPLE_AGENT:
      await executeSimpleAgent();
      break;
    case ExampleOptions.AGENT_BEHAVIOR:
      await executeAgentBehavior();
      break;
    case ExampleOptions.BUILDING_BLOCKS:
      await buildingBlocks();
      break;
    case ExampleOptions.PROMPT_CHAINING:
      await promptChaining();
      break;
    case ExampleOptions.PARALLELIZATION:
      await parallelization();
      break;
    case ExampleOptions.ROUTING:
      await routing();
      break;
  }
}

main();