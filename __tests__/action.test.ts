import path from 'path';
import { Toolkit } from 'actions-toolkit';
import signale from 'signale';
import action from '../src/action';
import GithubOrganization from '../src/githubOrganization';
import PushPayload from '../src/pushPayload';
import {
  AddOrUpdateMembershipFailure,
  AddOrUpdateMembershipSuccess,
} from '../src/githubOrgOperationResults/addOrUpdateMembershipResult';
import { MemberRole } from '../src/organizationMember';
import {
  GithubOrganizationOperationResults,
  OperationResult,
} from '../src/githubOrgOperationResults/githubOrganizationOperationResults';
import { RemoveMembershipFailure, RemoveMembershipSuccess } from '../src/githubOrgOperationResults/removeMembershipResult';
import { VALID_FILE, VALID_FILE_WITH_EMPTY_MEMBERS } from './fixtures/membersFiles';

jest.mock('signale');
jest.mock('../src/githubOrganization');
jest.mock('../src/pushPayload');

function givenAddOrUpdateOperationsWithResults(success: boolean): void {
  let singleResult: OperationResult;

  if (success) {
    singleResult = new AddOrUpdateMembershipSuccess('jetre219', 'pending', MemberRole.MEMBER);
  } else {
    singleResult = new AddOrUpdateMembershipFailure('jetre219', MemberRole.MEMBER, 'test error');
  }

  const results = new GithubOrganizationOperationResults();
  results.add(singleResult);
  GithubOrganization.prototype.inviteNewMembers = jest.fn().mockResolvedValue(results);
}

function givenRemoveOperationsWithResults(success: boolean): void {
  let singleResult: OperationResult;

  if (success) {
    singleResult = new RemoveMembershipSuccess('octocat');
  } else {
    singleResult = new RemoveMembershipFailure('octocat', 'test error');
  }

  const results = new GithubOrganizationOperationResults();
  results.add(singleResult);
  GithubOrganization.prototype.removeMembers = jest.fn().mockResolvedValue(results);
}

describe('action test suite', () => {
  let tools: Toolkit;

  beforeEach(() => {
    Object.assign(process.env, {
      GITHUB_REPOSITORY: 'johnmartel/organization-membership-action',
      GITHUB_ACTION: 'organization-membership-action',
      GITHUB_EVENT_PATH: path.join(__dirname, 'fixtures', 'pushEventPayload.json'),
      GITHUB_WORKSPACE: path.join(__dirname, 'fixtures'),
    });

    tools = new Toolkit({
      logger: signale,
    });
    // @ts-ignore
    tools.exit.success = jest.fn();
    // @ts-ignore
    tools.exit.failure = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('given push on default branch', () => {
    it('should continue processing the event payload', async () => {
      PushPayload.prototype.isDefaultBranch = jest.fn().mockReturnValue(true);
      PushPayload.prototype.fileWasModified = jest.fn().mockResolvedValue(false);

      await action(tools);

      expect(PushPayload.prototype.fileWasModified).toHaveBeenCalled();
    });
  });

  describe('given push on any non-default branch', () => {
    it('should halt event payload processing and exit successfully', async () => {
      PushPayload.prototype.isDefaultBranch = jest.fn().mockReturnValue(false);

      await action(tools);

      expect(PushPayload.prototype.fileWasModified).not.toHaveBeenCalled();
      expect(tools.exit.success).toHaveBeenCalledWith(expect.stringContaining('Not working on default branch'));
    });
  });

  describe('given members file was not modified', () => {
    beforeEach(() => {
      PushPayload.prototype.fileWasModified = jest.fn().mockResolvedValue(false);
      PushPayload.prototype.isDefaultBranch = jest.fn().mockReturnValue(true);
    });

    it('should exit successfully', async () => {
      await action(tools);

      expect(tools.exit.success).toHaveBeenCalled();
    });
  });

  describe('given members file was modified', () => {
    beforeEach(() => {
      PushPayload.prototype.fileWasModified = jest.fn().mockResolvedValue(true);
      tools.readFile = jest.fn().mockReturnValue(VALID_FILE);
      PushPayload.prototype.isDefaultBranch = jest.fn().mockReturnValue(true);
    });

    describe('given a file with no members', () => {
      beforeEach(() => {
        tools.readFile = jest.fn().mockReturnValue(VALID_FILE_WITH_EMPTY_MEMBERS);
      });

      it('should exit with failure', async () => {
        await action(tools);

        expect(GithubOrganization.prototype.inviteNewMembers).not.toHaveBeenCalled();
        expect(GithubOrganization.prototype.removeMembers).not.toHaveBeenCalled();
        expect(tools.exit.failure).toHaveBeenCalledWith(expect.stringContaining('Empty members file'));
      });
    });

    describe('given all operations are successful', () => {
      beforeEach(() => {
        givenAddOrUpdateOperationsWithResults(true);
        givenRemoveOperationsWithResults(true);
      });

      it('should exit successfully', async () => {
        await action(tools);

        expect(GithubOrganization.prototype.inviteNewMembers).toHaveBeenCalledTimes(1);
        expect(GithubOrganization.prototype.removeMembers).toHaveBeenCalledTimes(1);
        expect(tools.exit.success).toHaveBeenCalled();
      });
    });

    describe('given add/update operations are not successful', () => {
      beforeEach(() => {
        givenAddOrUpdateOperationsWithResults(false);
        givenRemoveOperationsWithResults(true);
      });

      it('should exit with failure', async () => {
        await action(tools);

        expect(GithubOrganization.prototype.removeMembers).toHaveBeenCalledTimes(1);
        expect(tools.exit.failure).toHaveBeenCalled();
      });
    });

    describe('given removal operations are not successful', () => {
      beforeEach(() => {
        givenAddOrUpdateOperationsWithResults(true);
        givenRemoveOperationsWithResults(false);
      });

      it('should exit with failure', async () => {
        await action(tools);

        expect(GithubOrganization.prototype.inviteNewMembers).toHaveBeenCalledTimes(1);
        expect(tools.exit.failure).toHaveBeenCalled();
      });
    });

    async function runActionAndThrow(error: object): Promise<void> {
      PushPayload.prototype.fileWasModified = jest.fn().mockResolvedValue(true);
      tools.readFile = jest.fn().mockImplementation(() => {
        throw error;
      });

      await action(tools);
    }

    describe('given an unknown error occurs', () => {
      const expectedError = { message: 'test' };

      beforeEach(async () => {
        await runActionAndThrow(expectedError);
      });

      it('should log the error', () => {
        expect(tools.log.error).toHaveBeenCalledWith('test', expectedError);
      });

      it('should exit with failure', () => {
        expect(tools.exit.failure).toHaveBeenCalled();
      });
    });

    describe('given an unknown error with details occurs', () => {
      const expectedError = { message: 'test', errors: ['more details'] };

      beforeEach(async () => {
        await runActionAndThrow(expectedError);
      });

      it('should log the error', () => {
        expect(tools.log.error).toHaveBeenCalledWith('test', expectedError);
      });

      it('should log the error details', () => {
        expect(tools.log.error).toHaveBeenCalledWith(['more details']);
      });

      it('should exit with failure', () => {
        expect(tools.exit.failure).toHaveBeenCalled();
      });
    });
  });
});
