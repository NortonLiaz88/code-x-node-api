import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import { DbStartSession } from "src/data/usecases/chat/db-start-session";
import { SessionDocument, Session } from "src/infra/mongodb/chat/model";


@Injectable()
export class ChatService {
    constructor(
        private sessionModel: Model<SessionDocument>, // Ensure type is SessionDocument if you have custom methods or properties
        @Inject() private readonly dbStartSession: DbStartSession,
    ) { }


    async startSession(profileId: number): Promise<ChatModel> {
        console.log(this.sessionModel); // Verificação de depuração
        const session = new this.sessionModel({ id: uuidv4() });
        await session.save();

        const chat = await this.dbStartSession.startSession(profileId, session.id);
        return chat;
    }
}