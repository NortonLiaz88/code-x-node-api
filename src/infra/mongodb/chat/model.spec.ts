import {
  DEFAULT_TUTOR_SESSIONS_DB,
  SessionSchema,
  tutorSessionsDbName,
} from './model';

describe('tutor sessions model', () => {
  const original = process.env.TUTOR_SESSIONS_DB;

  afterEach(() => {
    if (original === undefined) delete process.env.TUTOR_SESSIONS_DB;
    else process.env.TUTOR_SESSIONS_DB = original;
  });

  it('uses the database the tutor writes to by default', () => {
    delete process.env.TUTOR_SESSIONS_DB;

    expect(DEFAULT_TUTOR_SESSIONS_DB).toBe('codex');
    expect(tutorSessionsDbName()).toBe('codex');
  });

  it('can be pointed at another database', () => {
    process.env.TUTOR_SESSIONS_DB = 'tutor';

    expect(tutorSessionsDbName()).toBe('tutor');
  });

  it('keeps messages embedded, with user, assistant and system roles', () => {
    const messages = SessionSchema.path('messages') as any;
    const role = messages.schema.path('role') as any;

    expect(messages.instance).toBe('Array');
    expect(role.enumValues).toEqual(['system', 'user', 'assistant']);
  });
});
