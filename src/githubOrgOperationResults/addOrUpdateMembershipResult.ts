import { Signale } from 'signale';
import { OperationResult } from './githubOrganizationOperationResults';

export class AddOrUpdateMembershipSuccess implements OperationResult {
  readonly login: string;
  readonly state: string;
  readonly role: string;

  constructor(login: string, state: string, role: string) {
    this.login = login;
    this.state = state;
    this.role = role;
  }

  printResult(logger: Signale): void {
    logger.complete(`"${this.login}" was ${this.state === 'pending' ? 'added' : 'updated'} with role "${this.role}"`);
  }

  hasError(): boolean {
    return false;
  }
}

export class AddOrUpdateMembershipFailure implements OperationResult {
  readonly login: string;
  readonly role: string;
  readonly message: string;

  constructor(login: string, role: string, message: string) {
    this.login = login;
    this.role = role;
    this.message = message;
  }

  printResult(logger: Signale): void {
    logger.error('"%s" could not be added/updated with role "%s": %s', this.login, this.role, this.message);
  }

  hasError(): boolean {
    return true;
  }
}
