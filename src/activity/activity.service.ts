import { Injectable, Logger } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Model, Types } from "mongoose";
import { CodeOrganization, CodeOrganizationDocument, MultipleChoiceExercise, MultipleChoiceExerciseDocument, CodeCompletionExercise, CodeCompletionExerciseDocument } from "./entities/activity.entitie";
import { PrismaClientService } from "src/infra/orm/prisma/prisma-client.service";

@Injectable()
export class ActivityService {
    private readonly logger = new Logger(ActivityService.name);
    constructor(
        @InjectModel(CodeOrganization.name) private readonly codeOrgModel: Model<CodeOrganizationDocument>,
        @InjectModel(MultipleChoiceExercise.name) private readonly multipleChoiceModel: Model<MultipleChoiceExerciseDocument>,
        @InjectModel(CodeCompletionExercise.name) private readonly codeCompletionModel: Model<CodeCompletionExerciseDocument>,
        @InjectConnection() private readonly connection: Connection,
        private readonly prisma: PrismaClientService,
    ) {}

    async getActivityByCourse(course: string,id: string) {
        this.logger.debug(`Buscando atividade para ${course} com id ${id}`);
        const model = this.connection.collection(course.toLowerCase());
         // Converte `id` para ObjectId
         const objectId = new Types.ObjectId(id);
        const activity = await model.findOne({ _id: objectId }); // Retorna um único documento
        this.logger.log(`Atividade encontrada para ${course}: ${activity}`);
        return activity;
    }
}