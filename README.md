# langgraphjs-demos

This project implements all the examples from the [LangGraphJS Workflows Tutorials](https://langchain-ai.github.io/langgraphjs/tutorials/workflows/).

## Overview

LangGraphJS is a powerful library for building and managing complex workflows with language models. This project aims to provide practical implementations of the tutorials available on the LangGraphJS documentation site.

## Examples Implemented

The following examples from the LangGraphJS tutorials are implemented in this project:

- **Simple Agent**: A basic example of creating an agent with LangGraphJS.
- **Agent Behavior**: Demonstrates how to define and manage agent behavior.
- **Building Blocks**: Shows the fundamental building blocks of a LangGraphJS workflow.
- **Prompt Chaining**: Illustrates how to chain prompts together to create more complex workflows.
- **Parallelization**: Explains how to run tasks in parallel using LangGraphJS.
- **Routing**: Demonstrates how to route tasks based on structured output.
- **Orchestrator-Worker**: Demonstrates parallel task processing where an orchestrator divides work, workers execute concurrently, and a synthesizer combines the results.

## Getting Started

To get started with this project, follow these steps:

1. **Clone the repository**:
  ```bash
  git clone https://github.com/hernangonzalezmoreno/langgraphjs-demos.git
  cd langgraphjs-demos
  ```

2. **Ensure you are using Node.js v20**:
  This project has been tested with Node.js v20.18.1. You can use [nvm](https://github.com/nvm-sh/nvm) to install and use the correct version:
  ```bash
  nvm install 20.18.1
  nvm use 20.18.1
  ```

3. **Install dependencies**:
  ```bash
  yarn install
  ```

4. **Set up environment variables**:
  Create a `.env` file in the root directory by copying the `.env.example` file:
  ```bash
  cp .env.example .env
  ```
  Then fill in your environment variables in the `.env` file. See `.env.example` for all available configuration options.

5. **Run the examples**:
  ```bash
  yarn start
  ```

## Usage

After setting up the environment variables and installing the dependencies, you can run the examples by executing the main script. The script will prompt you to select an example to run.

## Contributing

Contributions are welcome! If you have any improvements or new examples to add, please open a pull request.
