import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import { Language, CourseLevel } from '@prisma/client';

@Injectable()
export class ActivityService implements OnModuleInit {
  private readonly logger = new Logger(ActivityService.name);
  
  private readonly languages: Language[] = [
    Language.Python,
    Language.Java,
    Language.CPlusPlus,
    Language.JavaScript,
    Language.Ruby,
    Language.R,
    Language.CSharp,
    Language.Kotlin,
    Language.PHP,
    Language.TypeScript,
    Language.Rust,
    Language.Perl,
  ];

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly prisma: PrismaClientService,
  ) {}

  async onModuleInit() {
    await this.syncActivitiesWithMongo();
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async syncActivitiesWithMongo() {
    for (const language of this.languages) {
      const collectionName = language.toLowerCase(); // Nome da coleção no MongoDB

      // Obtém as atividades CodeOrganization, MultipleChoiceExercise, e CodeCompletionExercise
      const codeOrgActivities = await this.getActivitiesFromCollection(collectionName, 'code_organization');
      const multipleChoiceActivities = await this.getActivitiesFromCollection(collectionName, 'multiple_choice');
      const codeCompletionActivities = await this.getActivitiesFromCollection(collectionName, 'code_completion_exercise');
      this.logger.log(`Atividades encontradas para ${language}: ${codeOrgActivities.length} CodeOrganization, ${multipleChoiceActivities.length} MultipleChoice, ${codeCompletionActivities.length} CodeCompletion`);
      // Processa cada tipo de atividade para criar ou sincronizar com o Prisma
      await this.processActivities(codeOrgActivities, language, 'code_organization');
      await this.processActivities(multipleChoiceActivities, language, 'multiple_choice');
      await this.processActivities(codeCompletionActivities, language, 'code_completion_exercise');
    }
  }

  // Função para buscar documentos de um tipo específico em uma coleção de linguagem
  private async getActivitiesFromCollection(collectionName: string, documentType: string) {
    const model = this.connection.collection(collectionName);
    const activities = await model.find({ template_name: documentType }).toArray(); // Assume que há um campo "type" que identifica o documento
    return activities;
  }

  // Processa e sincroniza atividades com o banco de dados Prisma
  private async processActivities(activities, language: Language, activityType: string) {
    for (const activity of activities) {
      const referenceId = activity._id.toString();
      const level = this.getCourseLevel(activity.level); // Mapeia o nível para o enum CourseLevel

      // Encontra o curso correspondente no Prisma
      const course = await this.prisma.course.findFirst({
        where: { language, level },
      });

      if (!course) {
        this.logger.warn(`Curso não encontrado para ${language} e nível ${level}`);
        continue;
      }

      // Verifica se a atividade já existe no banco de dados
      const existingActivity = await this.prisma.activity.findUnique({ where: { referenceId } });

      if (!existingActivity) {
        await this.prisma.activity.create({
          data: {
            name: activity.question,
            description: `${activityType} - ${language}`,
            referenceId,
            course: { connect: { id: course.id } },
            finished: false,
          },
        });
        this.logger.log(`Atividade sincronizada para ${course.name}: ${activity.question}`);
      } else {
        this.logger.log(`Atividade já sincronizada: ${activity.question}`);
      }
    }
  }

  // Mapeia o nível de dificuldade para o enum CourseLevel do Prisma
  private getCourseLevel(level: string): CourseLevel {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return CourseLevel.beginner;
      case 'intermediate':
        return CourseLevel.intermediate;
      case 'advanced':
        return CourseLevel.advanced;
      default:
        return CourseLevel.beginner;
    }
  }
}
