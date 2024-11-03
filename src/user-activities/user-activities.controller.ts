import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserActivitiesService } from './user-activities.service';
import { RegistertUserActivityDto, UserActivityResponseDto } from './dto/update-user-activity.dto';
import { CurrentUser } from 'src/main/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('user-activities')
@Controller('user-activities')
export class UserActivitiesController {
  constructor(private readonly userActivitiesService: UserActivitiesService) {}

  @Post()
  public async create(
    @CurrentUser() user: any,
    @Body() createUserActivityDto: RegistertUserActivityDto,
  ): Promise<UserActivityResponseDto> {
    const reponse = await this.userActivitiesService.create(
      user.payload.id,
      createUserActivityDto,
    );
    console.log('RESPONSE', reponse);
    return reponse;
  }

  @Patch(':id')
  public async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateUserActivityDto: RegistertUserActivityDto,
  ): Promise<UserActivityResponseDto> {
    return this.userActivitiesService.update(
      +id,
      user.payload.id,
      updateUserActivityDto,
    );
  }

  @Get()
  findAll() {
    return this.userActivitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userActivitiesService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userActivitiesService.remove(+id);
  }
}
