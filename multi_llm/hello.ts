import { Squid } from '@squidcloud/client'
import 'dotenv/config'

interface ModelConfig {
  name: string;
  model: string;
  agentId: string;
}

async function main() {
  const squid = new Squid({
    appId: process.env.SQUID_APP_ID!, 
    region: process.env.SQUID_REGION! as 'us-east-1.aws' | 'ap-south-1.aws' | 'us-central1.gcp',
    environmentId: process.env.SQUID_ENVIRONMENT_ID! as 'dev' | 'prod',
    apiKey: process.env.SQUID_API_KEY!,           
    squidDeveloperId: process.env.SQUID_DEVELOPER_ID!
  });

  // Squid AIでサポートされているモデル名（型定義から確認済み）
  const modelsToTest = [
    // OpenAI
    'gpt-4o',
    'gpt-4o-mini',
    'o3',
    'o3-mini',
    // Gemini
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    // Anthropic
    'claude-3-7-sonnet-latest',
    'claude-opus-4-20250514',
    'claude-sonnet-4-20250514',
    // Grok
    'grok-3',
    'grok-3-mini',
  ];

  // 有効なモデルをテストして確認
  const validModels: ModelConfig[] = [];
  
  console.log('🔍  Testing available models...\n');
  
  for (let i = 0; i < modelsToTest.length; i++) {
    const modelName = modelsToTest[i];
    const testAgentId = `test-agent-${i}`;
    
    try {
      await squid.ai().agent(testAgentId).upsert({
        options: {
          model: modelName,
        },
        isPublic: true,
      });
      
      validModels.push({
        name: modelName.toUpperCase(),
        model: modelName,
        agentId: `agent-${modelName.replace(/[.-]/g, '-')}`
      });
      
      console.log(`✅  ${modelName} - Available`);
      
      // テスト用エージェントを削除
      try {
        await squid.ai().agent(testAgentId).delete();
      } catch (deleteError) {
        console.log(`⚠️  Failed to delete test agent ${testAgentId}`);
      }
      
    } catch (error) {
      console.log(`❌  ${modelName} - Not available`);
    }
  }
  
  console.log(`\n📊  Found ${validModels.length} available models\n`);
  
  const models: ModelConfig[] = validModels;

  const instruction = `
    You are helpful assistant. 
    Please reply in Japanese. 
  `;

  const userPrompt = 'Hello! What is the highest mountain in Japan? Please reply in English';
  
  // 各モデルでの実行回数
  const executionCount = 3;

  console.log('🔧  Setting up agents for different models...\n');

  // Setup agents for each model
  for (const config of models) {
    console.log(`📡  Setting up agent '${config.agentId}' with model '${config.model}'...`);
    await squid.ai().agent(config.agentId).upsert({
      options: {
        model: config.model,
      },
      isPublic: true,
    });
    await squid.ai().agent(config.agentId).updateInstructions(instruction);
  }

  console.log(`\n🚀  Executing prompt ${executionCount} times across all models...\n`);

  // Execute the same prompt multiple times for each model
  const allResponses: Array<{ config: ModelConfig; responses: string[]; errors: any[] }> = [];

  for (const config of models) {
    console.log(`📡  Testing ${config.name} - ${executionCount} times...`);
    const agent = squid.ai().agent(config.agentId);
    const responses: string[] = [];
    const errors: any[] = [];

    // Execute the prompt multiple times for this model
    for (let i = 1; i <= executionCount; i++) {
      try {
        console.log(`  📤  ${config.name} - Attempt ${i}/${executionCount}`);
        const response = await agent.ask(userPrompt);
        responses.push(response);
      } catch (error) {
        console.log(`  ❌  ${config.name} - Attempt ${i}/${executionCount} failed:`, error);
        errors.push(error);
      }
    }

    allResponses.push({ config, responses, errors });
    console.log(`  ✅  ${config.name} completed (${responses.length}/${executionCount} successful)\n`);
  }

  // Display results
  console.log(`📊  Comparison Results (${executionCount} attempts per model):\n`);
  console.log('='.repeat(80));
  
  allResponses.forEach(({ config, responses, errors }) => {
    console.log(`\n🤖  ${config.name} (${config.model}) - ${responses.length}/${executionCount} successful:`);
    console.log('='.repeat(50));
    
    responses.forEach((response, index) => {
      console.log(`\n📝  Response ${index + 1}:`);
      console.log('-'.repeat(30));
      console.log(response);
      console.log('-'.repeat(30));
    });
    
    if (errors.length > 0) {
      console.log(`\n⚠️  Errors (${errors.length}):`);
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    console.log('='.repeat(50));
  });

  // 使用したエージェントを削除
  console.log('\n🧹  Cleaning up agents...\n');
  const cleanupPromises = models.map(async (config) => {
    try {
      await squid.ai().agent(config.agentId).delete();
      console.log(`✅  Deleted agent: ${config.agentId}`);
    } catch (error) {
      console.log(`⚠️  Failed to delete agent: ${config.agentId}`);
    }
  });

  await Promise.allSettled(cleanupPromises);
  console.log('\n✨  Cleanup completed!');
}

main().catch(console.error);