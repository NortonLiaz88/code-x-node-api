export class UnauthorizedError extends Error {
  constructor() {
    super('Invalid Credentials');
    this.name = 'Unauthorized';
  }
}
