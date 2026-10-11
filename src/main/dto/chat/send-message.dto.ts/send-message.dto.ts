import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @IsUUID()
  @ApiProperty()
  referenceId: string;

  @IsString()
  @ApiProperty()
  message: string;
}
