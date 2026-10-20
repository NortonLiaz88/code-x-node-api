import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

// RF-03: the fields a student edits. Leave a field out to keep it.
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'ana.souza', minLength: 3, maxLength: 32 })
  @IsOptional()
  @Length(3, 32, {
    message: 'O nome de usuário precisa ter de 3 a 32 caracteres.',
  })
  @Matches(/^[\w.-]+$/, {
    message: 'Use só letras, números, ponto, hífen ou sublinhado.',
  })
  username?: string;

  @ApiPropertyOptional({ example: 'ana@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+5592991234567' })
  @IsOptional()
  @Matches(/^\+?[0-9]{8,15}$/, {
    message: 'O celular precisa ter de 8 a 15 dígitos.',
  })
  phoneNumber?: string;

  // The Account accessibility switches.
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  soundEffects?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Haptic feedback' })
  @IsOptional()
  @IsBoolean()
  vibration?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Animations; off works like Reduce motion',
  })
  @IsOptional()
  @IsBoolean()
  chatAnimation?: boolean;
}
