import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsAppPassword } from 'src/main/dto/auth/password-rules';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Digite a senha atual.' })
  currentPassword: string;

  @ApiProperty({ example: 'novaSenha1' })
  @IsAppPassword()
  newPassword: string;
}
