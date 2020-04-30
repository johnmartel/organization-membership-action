import { Signale } from 'signale';
import { OperationResult } from './GithubOrganizationOperationResults';

export class AddOrUpdateMembershipResult implements OperationResult {
  readonly login: string;
  readonly state: string;
  readonly role: string;

  constructor(login: string, state: string, role: string) {
    this.login = login;
    this.state = state;
    this.role = role;
  }

  printResult(logger: Signale): void {
    logger.info(`"${this.login}" was ${this.state === 'pending' ? 'added' : 'updated'} with role "${this.role}"`);
  }
}
