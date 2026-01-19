import { MemStorage, type IStorage } from './storage';
import { DynamoDBStorage, dynamoDBStorage, seedDynamoDBData } from './dynamodb';

const useDynamoDB = !!process.env.DYNAMODB_TABLE_NAME;

export const storage: IStorage = useDynamoDB ? dynamoDBStorage : new MemStorage();

export async function initializeStorage(): Promise<void> {
  if (useDynamoDB) {
    console.log('Using DynamoDB storage');
    await seedDynamoDBData();
  } else {
    console.log('Using in-memory storage');
  }
}

export { MemStorage, type IStorage } from './storage';
export { DynamoDBStorage } from './dynamodb';
export type { DynamoDBOrganization } from './dynamodb';
