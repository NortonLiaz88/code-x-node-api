export class InvalidFiles extends Error {
  constructor(reason: string) {
    super(`InvalidFiles: ${reason}`);
    this.name = 'InvalidFiles';
  }
}
