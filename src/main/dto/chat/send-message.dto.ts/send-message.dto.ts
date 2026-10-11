import { IsUUID, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @IsUUID()
  @ApiProperty()
  referenceId: string;

  @IsString()
  @ApiProperty()
  message: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    required: false,
    description:
      'Id the app gives the question. Sending the same id again returns the stored answer instead of asking the tutor twice.',
  })
  clientMessageId?: string;
}
