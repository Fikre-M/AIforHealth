import mongoose, { Document, Schema, Types } from 'mongoose';

export enum AIConversationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export interface IAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface IAIConversation extends Document {
  user: Types.ObjectId;
  title: string;
  messages: IAIMessage[];
  status: AIConversationStatus;
  context?: {
    symptoms?: string[];
    medicalHistory?: string[];
    currentMedications?: string[];
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const aiMessageSchema = new Schema<IAIMessage>({
  role: { type: String, required: true, enum: ['user', 'assistant', 'system'] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed, default: {} }
});

const aiConversationSchema = new Schema<IAIConversation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    messages: [aiMessageSchema],
    status: {
      type: String,
      enum: Object.values(AIConversationStatus),
      default: AIConversationStatus.ACTIVE
    },
    context: {
      symptoms: [{ type: String }],
      medicalHistory: [{ type: String }],
      currentMedications: [{ type: String }]
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc: any, ret: any) => {
        const retObj = { ...ret };
        delete retObj.__v;
        return retObj;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc: any, ret: any) => {
        const retObj = { ...ret };
        delete retObj.__v;
        return retObj;
      }
    }
  }
);

// Indexes for better query performance
aiConversationSchema.index({ user: 1, status: 1 });
aiConversationSchema.index({ updatedAt: -1 });

// Add a virtual for the latest message
aiConversationSchema.virtual('latestMessage').get(function(this: IAIConversation) {
  return this.messages && this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
});

// Pre-save hook to update the title if it's the first message
aiConversationSchema.pre('save', function(this: any, next) {
  if (this.isNew && this.messages && this.messages.length > 0 && this.title === 'New Conversation') {
    const firstMessage = this.messages[0].content;
    this.title = firstMessage.length > 30 ? 
      firstMessage.substring(0, 30) + '...' : 
      firstMessage;
  }
  next();
});

const AIAssistant = mongoose.model<IAIConversation>('AIConversation', aiConversationSchema);

export default AIAssistant;
