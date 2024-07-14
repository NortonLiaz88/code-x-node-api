import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsStrongPassword, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'jhonDoe@domain.com',
  })
  @IsEmail()
  email: string;


  @ApiProperty({
    example: '123456',
  })
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  password: string;
}
