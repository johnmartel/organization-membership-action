export default class NoRepositoryError extends Error {
  constructor() {
    super('No repository defined in event payload');
  }
}
