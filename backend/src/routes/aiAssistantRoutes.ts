import { Router } from 'express';
import * as aiAssistantController from '../controllers/aiAssistantController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Conversation endpoints
router.post('/conversations', aiAssistantController.createConversation);
router.get('/conversations', aiAssistantController.getConversations);
router.get('/conversations/history', aiAssistantController.getConversationHistory);
router.get('/conversations/:conversationId', aiAssistantController.getConversation);
router.post('/conversations/:conversationId/messages', aiAssistantController.sendMessage);
router.patch('/conversations/:conversationId/status', aiAssistantController.updateConversationStatus);
router.delete('/conversations/:conversationId', aiAssistantController.deleteConversation);

// Symptom checker endpoint
router.post('/symptom-checker', aiAssistantController.checkSymptoms);

export default router;
