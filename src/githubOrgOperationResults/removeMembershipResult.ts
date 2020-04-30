import { Signale } from 'signale';
import { OperationResult } from './GithubOrganizationOperationResults';

export class RemoveMembershipResult implements OperationResult {
  readonly login: string;

  constructor(login: string) {
    this.login = login;
  }

  printResult(logger: Signale): void {
    logger.info(`"${this.login}" was removed`);
  }
}
