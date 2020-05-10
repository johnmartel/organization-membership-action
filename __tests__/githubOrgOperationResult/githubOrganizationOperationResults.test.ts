import noop from 'lodash/noop';
import signale from 'signale';
import {
  GithubOrganizationOperationResults,
  OperationResult,
} from '../../src/githubOrgOperationResults/githubOrganizationOperationResults';

jest.mock('signale');

class SuccessfulOperationResult implements OperationResult {
  hasError(): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  printResult(logger: signale.Signale): void {
    noop();
  }
}

class FailedOperationResult implements OperationResult {
  hasError(): boolean {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  printResult(logger: signale.Signale): void {
    noop();
  }
}

describe('GithubOrganizationOperationResults test suite', () => {
  let results: GithubOrganizationOperationResults;

  beforeEach(() => {
    results = new GithubOrganizationOperationResults();
  });

  describe('given there are no results', () => {
    it('should print none', () => {
      results.printResults(signale);

      expect(signale.info).toHaveBeenCalledWith('None!');
    });

    it('should be empty', () => {
      expect(results).toHaveLength(0);
    });

    it('should not have error', () => {
      expect(results.hasErrors()).toBe(false);
    });
  });

  describe('given there are results', () => {
    const firstSuccess = new SuccessfulOperationResult();
    const secondSuccess = new SuccessfulOperationResult();

    beforeEach(() => {
      results.add(firstSuccess);
      results.add(secondSuccess);
    });

    it('should print each result', () => {
      const firstSpy = jest.spyOn(firstSuccess, 'printResult');
      const secondSpy = jest.spyOn(secondSuccess, 'printResult');

      results.printResults(signale);

      expect(firstSpy).toHaveBeenCalledWith(signale);
      expect(secondSpy).toHaveBeenCalledWith(signale);
    });

    it('should have length', () => {
      expect(results).toHaveLength(2);
    });

    describe('without errors', () => {
      it('should should not have error', () => {
        expect(results.hasErrors()).toBe(false);
      });
    });

    describe('with errors', () => {
      beforeEach(() => {
        results.add(new FailedOperationResult());
      });

      it('should have error', () => {
        expect(results.hasErrors()).toBe(true);
      });
    });
  });
});
