import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { IsAppPassword } from './password-rules';

export class LoginDto {
  @ApiProperty({
    example: 'jhonDoe@domain.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
  })
  @IsAppPassword()
  password: string;
}
