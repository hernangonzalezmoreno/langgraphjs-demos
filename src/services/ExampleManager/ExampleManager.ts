import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import inquirer from "inquirer";
import { 
  executeSimpleAgent,
  executeAgentBehavior,
  buildingBlocks,
  promptChaining,
  parallelization,
  routing,
  orchestratorWorker,
  evaluatorOptimizer
} from "./examples";

export enum ExampleOptions {
  SIMPLE_AGENT = 'Simple agent',
  AGENT_BEHAVIOR = 'Agent behavior',
  BUILDING_BLOCKS = 'Building blocks',
  PROMPT_CHAINING = 'Prompt chaining',
  PARALLELIZATION = 'Parallelization',
  ROUTING = 'Routing',
  ORCHESTRATOR_WORKER = 'Orchestrator-Worker',
  EVALUATOR_OPTIMIZER = 'Evaluator-optimizer',
}

export class ExampleManager {

  static async run(llm: BaseChatModel){
    console.log('\n====================\n');

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
        await executeSimpleAgent(llm);
        break;
      case ExampleOptions.AGENT_BEHAVIOR:
        await executeAgentBehavior(llm);
        break;
      case ExampleOptions.BUILDING_BLOCKS:
        await buildingBlocks(llm);
        break;
      case ExampleOptions.PROMPT_CHAINING:
        await promptChaining(llm);
        break;
      case ExampleOptions.PARALLELIZATION:
        await parallelization(llm);
        break;
      case ExampleOptions.ROUTING:
        await routing(llm);
        break;
      case ExampleOptions.ORCHESTRATOR_WORKER:
        await orchestratorWorker(llm);
        break;
      case ExampleOptions.EVALUATOR_OPTIMIZER:
        await evaluatorOptimizer(llm);
        break;
      default:
        throw new Error('Invalid example option');
    }
  }
}
