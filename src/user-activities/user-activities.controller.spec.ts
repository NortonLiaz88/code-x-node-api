import { Test, TestingModule } from '@nestjs/testing';
import { UserActivitiesController } from './user-activities.controller';
import { UserActivitiesService } from './user-activities.service';

describe('UserActivitiesController', () => {
  let controller: UserActivitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserActivitiesController],
      providers: [UserActivitiesService],
    }).compile();

    controller = module.get<UserActivitiesController>(UserActivitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
