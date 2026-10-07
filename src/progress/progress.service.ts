import { Injectable } from '@nestjs/common';
import { ProgressRepository } from './repository/progress.repository';

@Injectable()
export class ProgressService {
  constructor(private readonly progressRepository: ProgressRepository) {}
  

  public async update(userId: number) {
    return await this.progressRepository.updateUserProgress(userId);
  }

  public async findOne(userId: number) {
    return await this.progressRepository.findUserProgress(userId);
  }

  public async getActivityMonthCalendar(userId: number, month: number) {
    const calendar =  await this.progressRepository.getActivityMonthCalendar(userId, month);
    const timeSlot = await this.progressRepository.getTimeSlot(userId);
    console.log('CURRENT RESPONSE', calendar, timeSlot);
    return {
      calendar: calendar,
      ...timeSlot,
    }

  }

  create(createProgressDto: any) {
    return 'This action adds a new progress';
  }

  findAll() {
    return `This action returns all progress`;
  }

  remove(id: number) {
    return `This action removes a #${id} progress`;
  }
}
