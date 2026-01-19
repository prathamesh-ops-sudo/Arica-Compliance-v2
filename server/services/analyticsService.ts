import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { config } from '../config';

const client = new DynamoDBClient({ region: config.awsRegion });
const docClient = DynamoDBDocumentClient.from(client);

export type AnalyticsEventType = 'analysis_run' | 'pdf_generated' | 'login' | 'signup' | 'questionnaire_submitted';

interface AnalyticsEvent {
  orgId: string;
  timestamp: string;
  eventType: AnalyticsEventType;
  userId?: string;
  metadata?: Record<string, unknown>;
  ttl?: number;
}

interface UsageStats {
  orgId: string;
  totalAnalyses: number;
  totalPdfs: number;
  totalLogins: number;
  totalQuestionnaires: number;
  lastActivity?: string;
}

export const analyticsService = {
  async trackEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'ttl'>): Promise<void> {
    if (!config.dynamodbAnalyticsTable) {
      console.log('Analytics tracking skipped: table not configured');
      return;
    }

    const timestamp = new Date().toISOString();
    const ttl = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

    try {
      await docClient.send(
        new PutCommand({
          TableName: config.dynamodbAnalyticsTable,
          Item: {
            orgId: event.orgId,
            timestamp,
            eventType: event.eventType,
            userId: event.userId,
            metadata: event.metadata || {},
            ttl,
          },
        })
      );
      console.log(`Analytics event tracked: ${event.eventType} for org ${event.orgId}`);
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  },

  async getUsageStats(orgId: string): Promise<UsageStats> {
    if (!config.dynamodbAnalyticsTable) {
      return {
        orgId,
        totalAnalyses: 0,
        totalPdfs: 0,
        totalLogins: 0,
        totalQuestionnaires: 0,
      };
    }

    try {
      const result = await docClient.send(
        new QueryCommand({
          TableName: config.dynamodbAnalyticsTable,
          KeyConditionExpression: 'orgId = :orgId',
          ExpressionAttributeValues: {
            ':orgId': orgId,
          },
        })
      );

      const events = result.Items || [];
      
      const stats: UsageStats = {
        orgId,
        totalAnalyses: events.filter((e) => e.eventType === 'analysis_run').length,
        totalPdfs: events.filter((e) => e.eventType === 'pdf_generated').length,
        totalLogins: events.filter((e) => e.eventType === 'login').length,
        totalQuestionnaires: events.filter((e) => e.eventType === 'questionnaire_submitted').length,
      };

      if (events.length > 0) {
        const sortedEvents = events.sort((a, b) => 
          new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime()
        );
        stats.lastActivity = sortedEvents[0].timestamp as string;
      }

      return stats;
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return {
        orgId,
        totalAnalyses: 0,
        totalPdfs: 0,
        totalLogins: 0,
        totalQuestionnaires: 0,
      };
    }
  },

  async getRecentEvents(orgId: string, limit: number = 50): Promise<AnalyticsEvent[]> {
    if (!config.dynamodbAnalyticsTable) {
      return [];
    }

    try {
      const result = await docClient.send(
        new QueryCommand({
          TableName: config.dynamodbAnalyticsTable,
          KeyConditionExpression: 'orgId = :orgId',
          ExpressionAttributeValues: {
            ':orgId': orgId,
          },
          ScanIndexForward: false,
          Limit: limit,
        })
      );

      return (result.Items || []) as AnalyticsEvent[];
    } catch (error) {
      console.error('Failed to get recent events:', error);
      return [];
    }
  },
};
