import { Controller, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CurrentUser } from 'src/main/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  
  @Get('/me')
  async findActiveUserCourses(
    @CurrentUser() user: any
  ) {
    return this.profileService.getProfile(user.payload.id);
  }


}
