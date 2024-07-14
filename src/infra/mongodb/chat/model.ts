import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';


export type SessionDocument = HydratedDocument<Session>;

// interface Session {
//   id: string;
//   messages: Message[];
//   created_at: string;
// }

// interface Message {
//   role: string; // Tipicamente poderia ser um enum: 'system' | 'assistant'
//   content: string;
//   tooltip: string[] | null;
// }

@Schema({ versionKey: false, timestamps: { createdAt: 'created_at' } })
export class Session {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }] })
  messages: Message[];

  @Prop({ default: Date.now, type: Date })
  created_at: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

@Schema({ versionKey: false })
export class Message {
  @Prop({ type: String, required: true, enum: ['system', 'assistant'] })
  role: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: [String], default: null })
  tooltip: string[] | null;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
