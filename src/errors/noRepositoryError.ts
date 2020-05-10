export default class NoRepositoryError extends Error {
  constructor() {
    super('No repository defined in event payload') /* istanbul ignore next */;
    this.name = 'NoRepositoryError';
    Object.setPrototypeOf(this, NoRepositoryError.prototype);
  }
}
