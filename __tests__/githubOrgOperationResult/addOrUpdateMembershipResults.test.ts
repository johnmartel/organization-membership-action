import signale from 'signale';
import {
  AddOrUpdateMembershipFailure,
  AddOrUpdateMembershipSuccess,
} from '../../src/githubOrgOperationResults/addOrUpdateMembershipResult';

jest.mock('signale');

describe('AddOrUpdateMembershipSuccess test suite', () => {
  let operationResult: AddOrUpdateMembershipSuccess;

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('given state is pending', () => {
    beforeEach(() => {
      operationResult = new AddOrUpdateMembershipSuccess('testuser', 'pending', 'member');
    });

    it('should log "added" transaction', () => {
      operationResult.printResult(signale);

      expect(signale.complete).toHaveBeenCalledTimes(1);
      expect(signale.complete).toHaveBeenCalledWith(expect.stringContaining('testuser'));
      expect(signale.complete).toHaveBeenCalledWith(expect.stringContaining('added'));
      expect(signale.complete).toHaveBeenCalledWith(expect.stringContaining('role "member"'));
    });
  });

  describe('given state is active', () => {
    beforeEach(() => {
      operationResult = new AddOrUpdateMembershipSuccess('testuser', 'active', 'member');
    });

    it('should log "updated" transaction', () => {
      operationResult.printResult(signale);

      expect(signale.complete).toHaveBeenCalledTimes(1);
      expect(signale.complete).toHaveBeenCalledWith(expect.stringContaining('testuser'));
      expect(signale.complete).toHaveBeenCalledWith(expect.stringContaining('updated'));
      expect(signale.complete).toHaveBeenCalledWith(expect.stringContaining('role "member"'));
    });
  });

  it('should not be in error', () => {
    operationResult = new AddOrUpdateMembershipSuccess('testuser', 'active', 'member');

    expect(operationResult.hasError()).toBe(false);
  });
});

describe('AddOrUpdateMembershipFailure test suite', () => {
  let operationResult: AddOrUpdateMembershipFailure;

  beforeEach(() => {
    operationResult = new AddOrUpdateMembershipFailure('testuser', 'member', 'an error occurred');
  });

  it('should log failure', () => {
    operationResult.printResult(signale);

    expect(signale.error).toHaveBeenCalledWith(expect.any(String), 'testuser', 'member', 'an error occurred');
  });

  it('should be in error', () => {
    expect(operationResult.hasError()).toBe(true);
  });
});
