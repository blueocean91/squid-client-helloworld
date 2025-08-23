# Squid AI Agent Demo

This is a simple demo application that creates and interacts with a Squid AI agent.

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- A Squid account with API access

## Setup

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Squid configuration:
   ```
   SQUID_APP_ID=your-app-id
   SQUID_REGION=us-east-1.aws
   SQUID_ENVIRONMENT_ID=dev
   SQUID_API_KEY=your-api-key
   SQUID_DEVELOPER_ID=your-developer-id
   ```

## Running the Application

To run the demo:

```bash
npx tsx hello-squid.ts
```

## What the Code Does

1. Creates a connection to Squid using your credentials
2. Creates/updates an AI agent with GPT-4o model
3. Sets instructions for the agent to respond in Japanese
4. Asks the agent a question about Japan's highest mountain
5. Displays the response

## Configuration

The application uses environment variables for configuration:
- `SQUID_APP_ID`: Your Squid application ID
- `SQUID_REGION`: The AWS region for your Squid instance
- `SQUID_ENVIRONMENT_ID`: Environment (dev/prod)
- `SQUID_API_KEY`: Your Squid API key for authentication
- `SQUID_DEVELOPER_ID`: Your Squid developer ID

## Troubleshooting

- **UNAUTHORIZED error**: Make sure your `SQUID_API_KEY` is correct
- **Connection issues**: Verify your `SQUID_APP_ID` and `SQUID_REGION` are correct
- **TypeScript errors**: Ensure you have `@types/node` installed