
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Interface for CodeOrganization schema document type
export type CodeOrganizationDocument = Document & CodeOrganization;

@Schema({ versionKey: false })
export class CodeOrganization {
  @Prop({ type: String, required: true, description: "Esta é o enunciado da questão" })
  question: string;

  @Prop({ type: String, required: true, description: "Este é o código criado para o exercício, deve estar em markdown" })
  code: string;

  @Prop({ type: [String], required: true, default: [] })
  code_lines: string[];
}

export const CodeOrganizationSchema = SchemaFactory.createForClass(CodeOrganization);

// Interface for MultipleChoiceExercise schema document type
export type MultipleChoiceExerciseDocument = Document & MultipleChoiceExercise;

@Schema({ versionKey: false })
export class MultipleChoiceExercise {
  @Prop({ type: String, required: true, description: "Enunciado da questão" })
  question: string;

  @Prop({ type: String, required: false, description: "Este é o código para este exercício, deve estar em formato markdown" })
  code?: string;

  @Prop({ type: String, required: true, description: "Esta é a resposta correta para este exercício" })
  answer: string;

  @Prop({
    type: {
      a: { type: String, required: true },
      b: { type: String, required: true },
      c: { type: String, required: true },
      d: { type: String, required: true }
    },
    required: true,
    description: "Esta é a lista de alternativas para este exercício."
  })
  alternatives: Record<'a' | 'b' | 'c' | 'd', string>;
}

export const MultipleChoiceExerciseSchema = SchemaFactory.createForClass(MultipleChoiceExercise);

// Interface for CodeCompletionExercise schema document type
export type CodeCompletionExerciseDocument = Document & CodeCompletionExercise;

@Schema({ versionKey: false })
export class CodeCompletionExercise {
  @Prop({ type: String, required: true, description: "Este é o enunciado da questão" })
  question: string;

  @Prop({ type: String, required: false, description: "Este é o código a ser completado. Considere que deve estar em markdown" })
  code?: string;

  @Prop({ type: String, required: true, description: "Este é o trecho correto de código que completa o código requerido" })
  answer: string;

  @Prop({
    type: {
      a: { type: String, required: true },
      b: { type: String, required: true },
      c: { type: String, required: true },
      d: { type: String, required: true }
    },
    required: true,
    description: "Esta é a lista de alternativas para este exercício, deve conter trechos de código que podem completar o código."
  })
  alternatives: Record<'a' | 'b' | 'c' | 'd', string>;
}

export const CodeCompletionExerciseSchema = SchemaFactory.createForClass(CodeCompletionExercise);
