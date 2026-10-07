import { Injectable } from '@nestjs/common';
import { RegistertUserActivityDto } from './dto/update-user-activity.dto';
import { UserActivitiesRepository } from './repository/user-activities.repository';
import { ActivityService } from 'src/activity/activity.service';
import { CurrentUser } from 'src/main/decorators/current-user.decorator';
import { ProgressService } from 'src/progress/progress.service';

@Injectable()
export class UserActivitiesService {
  constructor(
    private readonly activitiesService: ActivityService,
    private readonly userActivitiesService: UserActivitiesRepository,
    private readonly progressService: ProgressService,
  ) {}

  public async create(
    userId: number,
    createUserActivityDto: RegistertUserActivityDto,
  ) {
    const { courseName, activityId, response } = createUserActivityDto;

    const activity = await this.activitiesService.getActivity(activityId);

    const activityData = await this.activitiesService.getActivityByCourse(
      courseName.toLocaleLowerCase(),
      activityId,
    );

    const userActivity = await this.userActivitiesService.saveUserActivity(
      response === activityData.answer,
      userId,
      activity.id,
    );

    const progress = await this.progressService.update(userId);

    console.log('PROGRESS', progress);
    console.log('RESPONSE', response, activityData.answer);

    return {
      ...userActivity,
      correct: response === activityData.answer,
      correctAnswer: activityData.answer,
      progress
    };
  }

  public async update(
    id: number,
    user: any,
    updateUserActivityDto: RegistertUserActivityDto,
  ) {
    const { courseName, activityId, response } = updateUserActivityDto;
    const userPayload = user.payload;

    const activityData = await this.activitiesService.getActivityByCourse(
      courseName.toLocaleLowerCase(),
      activityId,
    );

    const userActivity = await this.userActivitiesService.updateUserActivity(
      id,
      userPayload.id,
      response === activityData.answer,
    );

    const progress = await this.progressService.update(userPayload.id);
    return {
      ...userActivity,
      correct: response === activityData.answer,
      correctAnswer: activityData.answer,
    };
  }

  findAll() {
    return `This action returns all userActivities`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userActivity`;
  }

  remove(id: number) {
    return `This action removes a #${id} userActivity`;
  }
}
