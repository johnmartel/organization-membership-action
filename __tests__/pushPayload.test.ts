import { Octokit } from '@octokit/rest';
import cloneDeep from 'lodash/cloneDeep';
import nock from 'nock';
import PushPayload from '../src/pushPayload';
import MembersFile from '../src/membersFile';
import pushEventPayload from './fixtures/pushEventPayload.json';
import commitComparisonWithMembersFile from './fixtures/commitComparisonWithMembersFile.json';
import commitComparisonWithoutMembersFile from './fixtures/commitComparisonWithoutMembersFile.json';

describe('PushPayload test suite', () => {
  describe('when reading organizationLogin', () => {
    it('should return the login of the repository owner', () => {
      const payload: PushPayload = new PushPayload(pushEventPayload);

      expect(payload.organizationLogin).toEqual('coglinc');
    });
  });

  describe('when verifying if members file was modified', () => {
    const repo = { owner: 'coglinc', repo: '.github' };
    const github = new Octokit();

    afterEach(() => {
      nock.cleanAll();
    });

    describe('given file was modified', () => {
      it('should return true', async () => {
        const payload: PushPayload = new PushPayload(pushEventPayload);
        nock('https://api.github.com')
          .get(/\/repos\/.*\/.*\/compare/)
          .reply(200, () => {
            return commitComparisonWithMembersFile;
          });

        const fileWasModified = await payload.fileWasModified(MembersFile.FILENAME, repo, github);

        expect(fileWasModified).toBe(true);
      });
    });

    describe('given file was not modified', () => {
      it('should return false', async () => {
        const payload: PushPayload = new PushPayload(pushEventPayload);
        nock('https://api.github.com')
          .get(/\/repos\/.*\/.*\/compare/)
          .reply(200, () => {
            return commitComparisonWithoutMembersFile;
          });

        const fileWasModified = await payload.fileWasModified(MembersFile.FILENAME, repo, github);

        expect(fileWasModified).toBe(false);
      });
    });
  });

  describe('when verifying if push is on default branch', () => {
    describe('given push to default branch', () => {
      it('should return true', () => {
        const payload: PushPayload = new PushPayload(pushEventPayload);

        expect(payload.isDefaultBranch()).toBe(true);
      });
    });

    describe('given push to any non-default branch', () => {
      it('should return false', () => {
        const pushToFeatureBranchEventPayload = cloneDeep(pushEventPayload);
        pushToFeatureBranchEventPayload.ref = 'refs/heads/feature/test';
        const payload: PushPayload = new PushPayload(pushToFeatureBranchEventPayload);

        expect(payload.isDefaultBranch()).toBe(false);
      });
    });
  });

  describe('when verifying if repository is owned by an organization', () => {
    describe('given an organization repository', () => {
      it('should return true', () => {
        const payload: PushPayload = new PushPayload(pushEventPayload);

        expect(payload.isOrganizationOwned()).toBe(true);
      });
    });

    describe('given a user repository', () => {
      it('should return false', () => {
        const pushToAUserRepositoryEventPayload = cloneDeep(pushEventPayload);
        pushToAUserRepositoryEventPayload.repository.owner.type = 'User';
        const payload: PushPayload = new PushPayload(pushToAUserRepositoryEventPayload);

        expect(payload.isOrganizationOwned()).toBe(false);
      });
    });
  });
});
