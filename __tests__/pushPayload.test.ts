import { Octokit } from '@octokit/rest';
import cloneDeep from 'lodash/cloneDeep';
import nock from 'nock';
import PushPayload from '../src/pushPayload';
import MembersFile from '../src/membersFile';
import pushEventPayload from './fixtures/pushEventPayload.json';
import commitComparisonWithMembersFile from './fixtures/commitComparisonWithMembersFile.json';
import commitComparisonWithoutMembersFile from './fixtures/commitComparisonWithoutMembersFile.json';

describe('PushPayload test suite', () => {
  let payload: PushPayload;

  describe('when reading organizationLogin', () => {
    beforeEach(() => {
      payload = new PushPayload(pushEventPayload);
    });

    it('should return the login of the repository owner', () => {
      expect(payload.organizationLogin).toEqual('coglinc');
    });
  });

  describe('when verifying if members file was modified', () => {
    const repo = { owner: 'coglinc', repo: '.github' };
    const github = new Octokit();

    beforeEach(() => {
      payload = new PushPayload(pushEventPayload);
    });

    afterEach(() => {
      nock.cleanAll();
    });

    describe('given file was modified', () => {
      it('should return true', async () => {
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
        payload = new PushPayload(pushEventPayload);

        expect(payload.isDefaultBranch()).toBe(true);
      });
    });

    describe('given push to any non-default branch', () => {
      it('should return false', () => {
        const pushToFeatureBranchEventPayload = cloneDeep(pushEventPayload);
        pushToFeatureBranchEventPayload.ref = 'refs/heads/feature/test';
        payload = new PushPayload(pushToFeatureBranchEventPayload);

        expect(payload.isDefaultBranch()).toBe(false);
      });
    });
  });
});
