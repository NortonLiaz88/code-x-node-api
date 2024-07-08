import { ApiProperty } from '@nestjs/swagger';


export class UserStrictResponseDto {
  @ApiProperty({ example: 1, description: 'The unique identifier of the user' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  email: string;

  @ApiProperty({ example: 'username', description: 'The username of the user' })
  username: string;

  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  name: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
  lastName: string;

  @ApiProperty({ example: '1234567890', description: 'The phone number of the user' })
  phoneNumber: string;

  @ApiProperty({ example: 100, description: 'The number of diamonds the user has' })
  diamonds: number;

  @ApiProperty({ example: 200.5, description: 'The experience points the user has' })
  experience: number;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'The date the user was created' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'The date the user was last updated' })
  updatedAt: Date;
}
