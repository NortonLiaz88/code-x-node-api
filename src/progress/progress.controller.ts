import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/main/decorators/current-user.decorator';

@ApiBearerAuth()
@ApiTags('progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  create(@Body() createProgressDto: any) {
    return this.progressService.create(createProgressDto);
  }

  @Get()
  findAll() {
    return this.progressService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.progressService.findOne(+id);
  }

  @Get('/calendar/:month')
  getActivityMonthCalendar(
    @CurrentUser() currentUser: any,
    @Param('month') month: string,
  ) {
    console.log(currentUser);
    console.log(month);
    return this.progressService.getActivityMonthCalendar(
      currentUser.payload.id,
      +month,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProgressDto: any) {
    return this.progressService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.progressService.remove(+id);
  }
}
