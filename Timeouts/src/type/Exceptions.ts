export class JobRunningError extends Error {
  constructor() {
    super("Method cancelled!");
    this.name = "JobRunningError";
    Object.setPrototypeOf(this, JobRunningError.prototype);
  }
}

export class ArrayJobRunningError extends Error {
  public readonly index: number;
  constructor(index: number) {
    super(`Iterator cancelled at ${index}`);
    this.index = index;
    this.name = "ArrayJobRunningError";
    Object.setPrototypeOf(this, ArrayJobRunningError.prototype);
  }
}
