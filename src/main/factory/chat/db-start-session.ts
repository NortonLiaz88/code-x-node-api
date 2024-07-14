import { DbStartSession } from "src/data/usecases/chat/db-start-session";
import { PrismaClientService } from "src/infra/orm/prisma/prisma-client.service";
import { ChatPostgresRepository } from "src/infra/postgresql/chat.repository";

export const makeDbStartSession = (): DbStartSession => {
    const sessionMongoRepository = new ChatPostgresRepository(new PrismaClientService());
    return new DbStartSession(sessionMongoRepository);
}