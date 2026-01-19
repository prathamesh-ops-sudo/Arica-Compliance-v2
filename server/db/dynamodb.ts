import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  ScanCommand, 
  UpdateCommand,
  DeleteCommand
} from '@aws-sdk/lib-dynamodb';
import type { 
  Organization, 
  InsertOrganization,
  User,
  InsertUser,
  UserQuestionnaireResponse,
  InsertUserQuestionnaire,
  ProviderQuestionnaireResponse,
  InsertProviderQuestionnaire
} from '@shared/schema';
import { randomUUID } from 'crypto';
import type { IStorage } from './storage';

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'AricaOrganizations';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export interface DynamoDBOrganization {
  orgId: string;
  name: string;
  complianceScore: number;
  lastScanDate: string | null;
  status: string;
  questionnaireResponses?: Record<string, unknown>;
  scanData?: Record<string, unknown>;
  analysisResult?: {
    overallScore: number;
    gaps: Array<{ control: string; description: string; severity: 'High' | 'Medium' | 'Low' }>;
    remedies: Array<{ action: string; timeline: string }>;
    stepByStepPlan: string[];
    analyzedAt: string;
  };
}

function toDynamoDBOrg(org: Organization & { questionnaireResponses?: Record<string, unknown>; scanData?: Record<string, unknown>; analysisResult?: DynamoDBOrganization['analysisResult'] }): DynamoDBOrganization {
  return {
    orgId: org.id,
    name: org.name,
    complianceScore: org.complianceScore,
    lastScanDate: org.lastScanDate,
    status: org.status,
    questionnaireResponses: org.questionnaireResponses,
    scanData: org.scanData,
    analysisResult: org.analysisResult,
  };
}

function fromDynamoDBOrg(item: DynamoDBOrganization): Organization & { questionnaireResponses?: Record<string, unknown>; scanData?: Record<string, unknown>; analysisResult?: DynamoDBOrganization['analysisResult'] } {
  return {
    id: item.orgId,
    name: item.name,
    complianceScore: item.complianceScore,
    lastScanDate: item.lastScanDate,
    status: item.status,
    questionnaireResponses: item.questionnaireResponses,
    scanData: item.scanData,
    analysisResult: item.analysisResult,
  };
}

export class DynamoDBStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private userQuestionnaireResponses: Map<string, UserQuestionnaireResponse> = new Map();
  private providerQuestionnaireResponses: Map<string, ProviderQuestionnaireResponse> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { id, ...insertUser, role: insertUser.role || 'user' };
    this.users.set(id, user);
    return user;
  }

  async getOrganizations(): Promise<Organization[]> {
    try {
      const command = new ScanCommand({
        TableName: TABLE_NAME,
      });
      const response = await docClient.send(command);
      const items = (response.Items || []) as DynamoDBOrganization[];
      return items.map(fromDynamoDBOrg);
    } catch (error) {
      console.error('Error fetching organizations from DynamoDB:', error);
      return [];
    }
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    try {
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: { orgId: id },
      });
      const response = await docClient.send(command);
      if (!response.Item) return undefined;
      return fromDynamoDBOrg(response.Item as DynamoDBOrganization);
    } catch (error) {
      console.error('Error fetching organization from DynamoDB:', error);
      return undefined;
    }
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const id = randomUUID();
    const organization: Organization = {
      id,
      name: org.name,
      complianceScore: org.complianceScore ?? 0,
      lastScanDate: org.lastScanDate ?? null,
      status: org.status ?? 'Pending',
    };

    try {
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: toDynamoDBOrg(organization),
      });
      await docClient.send(command);
      return organization;
    } catch (error) {
      console.error('Error creating organization in DynamoDB:', error);
      throw error;
    }
  }

  async updateOrganization(id: string, updates: Partial<InsertOrganization> & { questionnaireResponses?: Record<string, unknown>; scanData?: Record<string, unknown>; analysisResult?: DynamoDBOrganization['analysisResult'] }): Promise<Organization | undefined> {
    try {
      const existing = await this.getOrganization(id);
      if (!existing) return undefined;

      const updateExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, unknown> = {};

      if (updates.name !== undefined) {
        updateExpressions.push('#name = :name');
        expressionAttributeNames['#name'] = 'name';
        expressionAttributeValues[':name'] = updates.name;
      }
      if (updates.complianceScore !== undefined) {
        updateExpressions.push('complianceScore = :complianceScore');
        expressionAttributeValues[':complianceScore'] = updates.complianceScore;
      }
      if (updates.lastScanDate !== undefined) {
        updateExpressions.push('lastScanDate = :lastScanDate');
        expressionAttributeValues[':lastScanDate'] = updates.lastScanDate;
      }
      if (updates.status !== undefined) {
        updateExpressions.push('#status = :status');
        expressionAttributeNames['#status'] = 'status';
        expressionAttributeValues[':status'] = updates.status;
      }
      if (updates.questionnaireResponses !== undefined) {
        updateExpressions.push('questionnaireResponses = :questionnaireResponses');
        expressionAttributeValues[':questionnaireResponses'] = updates.questionnaireResponses;
      }
      if (updates.scanData !== undefined) {
        updateExpressions.push('scanData = :scanData');
        expressionAttributeValues[':scanData'] = updates.scanData;
      }
      if (updates.analysisResult !== undefined) {
        updateExpressions.push('analysisResult = :analysisResult');
        expressionAttributeValues[':analysisResult'] = updates.analysisResult;
      }

      if (updateExpressions.length === 0) {
        return existing;
      }

      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { orgId: id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      });

      const response = await docClient.send(command);
      if (!response.Attributes) return undefined;
      return fromDynamoDBOrg(response.Attributes as DynamoDBOrganization);
    } catch (error) {
      console.error('Error updating organization in DynamoDB:', error);
      return undefined;
    }
  }

  async getUserQuestionnaireResponses(): Promise<UserQuestionnaireResponse[]> {
    return Array.from(this.userQuestionnaireResponses.values());
  }

  async createUserQuestionnaireResponse(response: InsertUserQuestionnaire): Promise<UserQuestionnaireResponse> {
    const id = randomUUID();
    const questionnaireResponse: UserQuestionnaireResponse = { id, ...response };
    this.userQuestionnaireResponses.set(id, questionnaireResponse);
    return questionnaireResponse;
  }

  async getProviderQuestionnaireResponses(): Promise<ProviderQuestionnaireResponse[]> {
    return Array.from(this.providerQuestionnaireResponses.values());
  }

  async createProviderQuestionnaireResponse(response: InsertProviderQuestionnaire): Promise<ProviderQuestionnaireResponse> {
    const id = randomUUID();
    const questionnaireResponse: ProviderQuestionnaireResponse = { id, ...response };
    this.providerQuestionnaireResponses.set(id, questionnaireResponse);
    return questionnaireResponse;
  }
}

export async function seedDynamoDBData(): Promise<void> {
  const seedData = [
    { name: 'TechNova Solutions', complianceScore: 84, lastScanDate: '2026-01-15', status: 'Partial' },
    { name: 'FinSecure Pvt Ltd', complianceScore: 62, lastScanDate: '2026-01-10', status: 'Critical' },
    { name: 'HealthFirst Corp', complianceScore: 91, lastScanDate: '2026-01-18', status: 'Compliant' },
    { name: 'RetailMax Inc', complianceScore: 73, lastScanDate: '2026-01-12', status: 'Partial' },
    { name: 'CloudSync Systems', complianceScore: 45, lastScanDate: '2026-01-08', status: 'Critical' },
    { name: 'DataGuard Solutions', complianceScore: 88, lastScanDate: '2026-01-17', status: 'Compliant' },
    { name: 'SecureBank Financial', complianceScore: 95, lastScanDate: '2026-01-19', status: 'Compliant' },
    { name: 'MediCare Systems', complianceScore: 78, lastScanDate: '2026-01-14', status: 'Partial' },
  ];

  console.log('Checking if DynamoDB table needs seeding...');
  
  try {
    const scanCommand = new ScanCommand({
      TableName: TABLE_NAME,
      Limit: 1,
    });
    const response = await docClient.send(scanCommand);
    
    if (response.Items && response.Items.length > 0) {
      console.log('DynamoDB table already has data, skipping seed.');
      return;
    }

    console.log('Seeding DynamoDB table with initial data...');
    for (const org of seedData) {
      const id = randomUUID();
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          orgId: id,
          name: org.name,
          complianceScore: org.complianceScore,
          lastScanDate: org.lastScanDate,
          status: org.status,
        },
      });
      await docClient.send(command);
    }
    console.log('DynamoDB seeding complete.');
  } catch (error) {
    console.error('Error seeding DynamoDB:', error);
  }
}

export const dynamoDBStorage = new DynamoDBStorage();
