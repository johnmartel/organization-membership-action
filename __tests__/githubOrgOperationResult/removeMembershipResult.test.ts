import signale from 'signale';
import { RemoveMembershipFailure, RemoveMembershipSuccess } from '../../src/githubOrgOperationResults/removeMembershipResult';

jest.mock('signale');

describe('RemoveMembershipSuccess test suite', () => {
  let operationResult: RemoveMembershipSuccess;

  beforeEach(() => {
    operationResult = new RemoveMembershipSuccess('testuser');
  });

  it('should log success', () => {
    operationResult.printResult(signale);

    expect(signale.complete).toHaveBeenCalledWith(expect.any(String), 'testuser');
  });

  it('should not be in error', () => {
    expect(operationResult.hasError()).toBe(false);
  });
});

describe('RemoveMembershipFailure test suite', () => {
  let operationResult: RemoveMembershipFailure;

  beforeEach(() => {
    operationResult = new RemoveMembershipFailure('testuser', 'an error occurred');
  });

  it('should log failure', () => {
    operationResult.printResult(signale);

    expect(signale.error).toHaveBeenCalledWith(expect.any(String), 'testuser', 'an error occurred');
  });

  it('should be in error', () => {
    expect(operationResult.hasError()).toBe(true);
  });
});
