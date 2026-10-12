import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CourseLevel, Knowledge } from '@prisma/client';
import { AddUserDto } from './add-user.dto';
import { courseLevelFor } from 'src/data/usecases/user/add-user/course-level';

const signUp = (overrides: Record<string, unknown> = {}) => ({
  email: 'ana@example.com',
  username: 'ana.souza',
  password: 'segredo123',
  profile: {
    programmingLanguage: 'Python',
    knowledge: 'BEGINNER',
    interests: ['ALGORITHMS', 'LOOPS'],
    motivation: 'Quero entender como os programas funcionam.',
  },
  ...overrides,
});

const errorsFor = async (body: object) => {
  const dto = plainToInstance(AddUserDto, body);
  const errors = await validate(dto);
  const paths: string[] = [];
  const walk = (list: typeof errors, prefix: string) =>
    list.forEach((e) => {
      const path = prefix ? `${prefix}.${e.property}` : e.property;
      if (e.constraints) paths.push(path);
      walk(e.children ?? [], path);
    });
  walk(errors, '');
  return { dto, paths };
};

describe('AddUserDto', () => {
  it('accepts steps 1 to 5 without a schedule', async () => {
    const { paths } = await errorsFor(signUp());

    expect(paths).toEqual([]);
  });

  it('turns a single interest from older app builds into a list', async () => {
    const { dto, paths } = await errorsFor(
      signUp({
        profile: {
          programmingLanguage: 'Python',
          knowledge: 'NOVICE',
          interests: 'ALGORITHMS',
          destination: 'ACADEMIC',
        },
      }),
    );

    expect(paths).toEqual([]);
    expect(dto.profile.interests).toEqual(['ALGORITHMS']);
  });

  it('names the fields that are wrong', async () => {
    const { paths } = await errorsFor(
      signUp({
        phoneNumber: '12ab',
        profile: {
          programmingLanguage: 'Python',
          knowledge: 'EXPERT',
          interests: [],
          motivation: 'x'.repeat(501),
        },
      }),
    );

    expect(paths.sort()).toEqual([
      'phoneNumber',
      'profile.interests',
      'profile.knowledge',
      'profile.motivation',
    ]);
  });

  it('accepts a phone number with or without the plus sign', async () => {
    for (const phoneNumber of ['+5592991234567', '92991234567']) {
      const { paths } = await errorsFor(signUp({ phoneNumber }));
      expect(paths).toEqual([]);
    }
  });

  it('asks for every schedule field the database needs', async () => {
    const { paths } = await errorsFor(
      signUp({
        schedule: {
          goalCount: 3,
          goalFrequency: 1,
          days: ['MONDAY'],
          timeSlot: 'MORNING',
          remind: true,
        },
      }),
    );

    expect(paths.sort()).toEqual([
      'schedule.color',
      'schedule.icon',
      'schedule.name',
    ]);
  });
});

describe('courseLevelFor', () => {
  it('starts each knowledge level in the matching course level', () => {
    expect(courseLevelFor(Knowledge.NOVICE)).toBe(CourseLevel.beginner);
    expect(courseLevelFor(Knowledge.BEGINNER)).toBe(CourseLevel.beginner);
    expect(courseLevelFor(Knowledge.MIDDLE)).toBe(CourseLevel.intermediate);
    expect(courseLevelFor(Knowledge.PROFICIENT)).toBe(CourseLevel.advanced);
  });
});
