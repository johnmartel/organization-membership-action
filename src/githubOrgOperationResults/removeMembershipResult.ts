import { Signale } from 'signale';
import { OperationResult } from './githubOrganizationOperationResults';

export class RemoveMembershipSuccess implements OperationResult {
  readonly login: string;

  constructor(login: string) {
    this.login = login;
  }

  printResult(logger: Signale): void {
    logger.info(`"${this.login}" was removed`);
  }

  hasError(): boolean {
    return false;
  }
}

export class RemoveMembershipFailure implements OperationResult {
  readonly login: string;
  readonly message: string;

  constructor(login: string, message: string) {
    this.login = login;
    this.message = message;
  }

  printResult(logger: Signale): void {
    logger.error('"%s" could not be removed: %s', this.login, this.message);
  }

  hasError(): boolean {
    return true;
  }
}
