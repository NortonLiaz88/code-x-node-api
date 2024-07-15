import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import { DbStartSession } from "src/data/usecases/chat/db-start-session";
import { Session, SessionDocument } from "src/infra/mongodb/chat/model";
import { RemoteSendMessage } from "src/data/usecases/chat/http-send-mesage";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<Session>,// Ensure type is SessionDocument if you have custom methods or properties
        @Inject() private readonly dbStartSession: DbStartSession,
        @Inject() private readonly httpSendMessage: RemoteSendMessage,
    ) { }


    async startSession(profileId: number): Promise<ChatModel> {
        console.log(this.sessionModel); // Verificação de depuração
        const session = new this.sessionModel({ id: uuidv4() });
        const data = await session.save();
        console.log('SAVED DATA', data)

        const chat = await this.dbStartSession.startSession(profileId, session.id);
        return chat;
    }

    async sendMessage(profileId: number, chatId: string, message: string): Promise<any> {
        const chat = await this.httpSendMessage.sendMessage(profileId, chatId, message);
        return chat;
    }
}