import { ApiProperty } from "@nestjs/swagger";

export class UpdateAccountDTO {
  @ApiProperty()
  username: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  soundEffects: boolean;
  @ApiProperty()
  hapticFeedback: boolean;
  @ApiProperty()
  notifications: boolean;
  @ApiProperty()
  animations: boolean;
}
