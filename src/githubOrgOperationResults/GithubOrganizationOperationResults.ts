import { Signale } from 'signale';

export interface OperationResult {
  printResult(logger: Signale): void;
}

export class GithubOrganizationOperationResults {
  private results: OperationResult[];

  constructor() {
    this.results = [];
  }

  add(result: OperationResult): void {
    this.results.push(result);
  }

  printResults(logger: Signale): void {
    if (this.results.length === 0) {
      logger.info('None!');
    } else {
      this.results.forEach((result) => {
        result.printResult(logger);
      });
    }
  }
}
