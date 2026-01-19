import { storage } from '../db/storage';
import type { 
  InsertUserQuestionnaire, 
  UserQuestionnaireResponse,
  InsertProviderQuestionnaire,
  ProviderQuestionnaireResponse 
} from '@shared/schema';

export const questionnaireService = {
  async getUserResponses(): Promise<UserQuestionnaireResponse[]> {
    return storage.getUserQuestionnaireResponses();
  },

  async createUserResponse(data: InsertUserQuestionnaire): Promise<UserQuestionnaireResponse> {
    return storage.createUserQuestionnaireResponse(data);
  },

  async getProviderResponses(): Promise<ProviderQuestionnaireResponse[]> {
    return storage.getProviderQuestionnaireResponses();
  },

  async createProviderResponse(data: InsertProviderQuestionnaire): Promise<ProviderQuestionnaireResponse> {
    return storage.createProviderQuestionnaireResponse(data);
  },
};
