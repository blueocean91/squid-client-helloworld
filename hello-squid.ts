import { Squid } from '@squidcloud/client'
import 'dotenv/config'

async function main() {
  const squid = new Squid({
    appId: process.env.SQUID_APP_ID!, 
    region: process.env.SQUID_REGION! as 'us-east-1.aws' | 'ap-south-1.aws' | 'us-central1.gcp',
    environmentId: process.env.SQUID_ENVIRONMENT_ID! as 'dev' | 'prod',
    apiKey: process.env.SQUID_API_KEY!,           
    squidDeveloperId: process.env.SQUID_DEVELOPER_ID!
  });

  const agentId = 'agent1';
  await squid.ai().agent(agentId).upsert({
        options: {
            model: 'gpt-4o',
        },
        isPublic: true,
    });
    const instruction = `
        You are helpful assistant. 
        Please reply in Japanese. 
    `;
    await squid.ai().agent(agentId).updateInstructions(instruction);
    
    const agent = squid.ai().agent(agentId);
    console.log(`📡  Connecting to agent '${agentId}' …`);
    const response = await agent.ask('Hello! What is the highest mountain in Japan?');
    console.log(`🤖  Response from agent '${agentId}': ${response}`);
}

main().catch(console.error);