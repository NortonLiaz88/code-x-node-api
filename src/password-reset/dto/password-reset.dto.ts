import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MaxLength } from 'class-validator';
import { IsAppPassword } from 'src/main/dto/auth/password-rules';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ana@example.com' })
  @IsEmail()
  email: string;
}

export class NewPasswordDto {
  @ApiProperty({
    minLength: 6,
    maxLength: 32,
    description: 'At least 6 characters and one number, like at login',
  })
  @IsAppPassword()
  @MaxLength(32)
  password: string;
}

export class ResetPasswordDto extends NewPasswordDto {
  @ApiProperty({ description: 'The token from the reset link' })
  @IsString()
  @Length(1, 200)
  token: string;
}
