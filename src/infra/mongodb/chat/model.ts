import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Tutor chat sessions. The tutor service (code-x-ai) owns this collection:
 * the API creates the empty session when a chat starts, the tutor appends
 * every message. Both must point at the same database, see
 * TUTOR_SESSIONS_CONNECTION.
 */
export const TUTOR_SESSIONS_CONNECTION = 'tutor-sessions';
export const DEFAULT_TUTOR_SESSIONS_DB = 'codex';

export const tutorSessionsDbName = (): string =>
  process.env.TUTOR_SESSIONS_DB || DEFAULT_TUTOR_SESSIONS_DB;

export type SessionDocument = HydratedDocument<Session>;

@Schema({ versionKey: false, _id: false })
export class Message {
  @Prop({ type: String, required: true, enum: ['system', 'user', 'assistant'] })
  role: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: [String], default: null })
  tooltip: string[] | null;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema({
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: false },
  collection: 'sessions',
})
export class Session {
  @Prop({ type: String, required: true })
  id: string;

  // Embedded, as the tutor writes them.
  @Prop({ type: [MessageSchema], default: [] })
  messages: Message[];

  @Prop({ default: Date.now, type: Date })
  created_at: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
