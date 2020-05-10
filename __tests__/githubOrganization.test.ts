import { Octokit } from '@octokit/rest';
import nock from 'nock';
import GithubOrganization from '../src/githubOrganization';
import { GithubOrganizationOperationResults } from '../src/githubOrgOperationResults/githubOrganizationOperationResults';
import { MemberRole, OrganizationMember } from '../src/organizationMember';
import adminsList from './fixtures/adminsList.json';
import membersList from './fixtures/membersList.json';
import pendingInvitations from './fixtures/pendingInvitations.json';
import successfulAdminInvitation from './fixtures/successfulAdminInvitation.json';
import successfulMemberInvitation from './fixtures/successfulMemberInvitation.json';
import successfulMembershipUpdate from './fixtures/successfulMembershipUpdate.json';

describe('GithubOrganization test suite', () => {
  let organization: GithubOrganization;

  beforeEach(() => {
    organization = new GithubOrganization('coglinc', new Octokit());
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('inviteNewMembers', () => {
    beforeEach(() => {
      nock('https://api.github.com')
        .get('/orgs/coglinc/members?role=member')
        .reply(200, () => {
          return [];
        })
        .get('/orgs/coglinc/members?role=admin')
        .reply(200, () => {
          return [];
        });

      nock('https://api.github.com')
        .get('/orgs/coglinc/invitations')
        .reply(200, () => {
          return [];
        });
    });

    describe('given no new members', () => {
      let results: GithubOrganizationOperationResults;

      beforeEach(async () => {
        results = await organization.inviteNewMembers([]);
      });

      it('should return successful result', async () => {
        expect(results.hasErrors()).toBe(false);
      });

      it('should return empty result', () => {
        expect(results).toHaveLength(0);
      });
    });

    describe('given there are new members', () => {
      const newMember = new OrganizationMember('octocat', MemberRole.MEMBER);
      const newAdmin = new OrganizationMember('johnmartel', MemberRole.ADMIN);

      describe('given invitation success', () => {
        beforeEach(() => {
          nock('https://api.github.com')
            .put('/orgs/coglinc/memberships/johnmartel')
            .reply(200, () => {
              return successfulAdminInvitation;
            })
            .put('/orgs/coglinc/memberships/octocat')
            .reply(200, () => {
              return successfulMemberInvitation;
            });
        });

        it('should have successful results', async () => {
          const results = await organization.inviteNewMembers([newAdmin, newMember]);

          expect(results.hasErrors()).toBe(false);
          expect(results).toHaveLength(2);
        });
      });

      describe('given invitation failure', () => {
        beforeEach(() => {
          nock('https://api.github.com')
            .put('/orgs/coglinc/memberships/johnmartel')
            .reply(200, () => {
              return successfulAdminInvitation;
            })
            .put('/orgs/coglinc/memberships/octocat')
            .reply(404);
        });

        it('should have failed results', async () => {
          const results = await organization.inviteNewMembers([newAdmin, newMember]);

          expect(results.hasErrors()).toBe(true);
          expect(results).toHaveLength(2);
        });
      });
    });
  });

  describe('removeMembers', () => {
    beforeEach(() => {
      nock('https://api.github.com')
        .get('/orgs/coglinc/members?role=member')
        .reply(200, () => {
          return [];
        })
        .get('/orgs/coglinc/members?role=admin')
        .reply(200, () => {
          return [];
        });

      nock('https://api.github.com')
        .get('/orgs/coglinc/invitations')
        .reply(200, () => {
          return pendingInvitations;
        });
    });

    describe('given there are no members to remove', () => {
      let results: GithubOrganizationOperationResults;

      beforeEach(async () => {
        results = await organization.removeMembers([
          new OrganizationMember('monalisa', MemberRole.MEMBER),
          new OrganizationMember('octocat', MemberRole.ADMIN),
        ]);
      });

      it('should return successful result', async () => {
        expect(results.hasErrors()).toBe(false);
      });

      it('should return empty result', () => {
        expect(results).toHaveLength(0);
      });
    });

    describe('given there are members to remove', () => {
      describe('given removal success', () => {
        beforeEach(() => {
          nock('https://api.github.com')
            .delete(/\/orgs\/coglinc\/memberships\/.*/)
            .times(2)
            .reply(204);
        });

        it('should have successful results', async () => {
          const results = await organization.removeMembers([]);

          expect(results.hasErrors()).toBe(false);
          expect(results).toHaveLength(2);
        });
      });

      describe('given removal failure', () => {
        beforeEach(() => {
          nock('https://api.github.com')
            .delete(/\/orgs\/coglinc\/memberships\/.*/)
            .times(2)
            .reply(500);
        });

        it('should have failed results', async () => {
          const results = await organization.removeMembers([]);

          expect(results.hasErrors()).toBe(true);
          expect(results).toHaveLength(2);
        });
      });
    });
  });

  describe('when inviting and removing sequentially', () => {
    const unchangedAdmin = new OrganizationMember('johnmartel', MemberRole.ADMIN);
    const newAdmin = new OrganizationMember('sebasrobert', MemberRole.ADMIN);
    const modifiedAdmin = new OrganizationMember('jetre219', MemberRole.ADMIN);

    beforeEach(() => {
      nock('https://api.github.com')
        .get('/orgs/coglinc/members?role=member')
        .reply(200, () => {
          return membersList;
        })
        .get('/orgs/coglinc/members?role=admin')
        .reply(200, () => {
          return adminsList;
        });

      nock('https://api.github.com')
        .put('/orgs/coglinc/memberships/sebasrobert')
        .reply(200, () => {
          return successfulAdminInvitation;
        });

      nock('https://api.github.com')
        .put('/orgs/coglinc/memberships/jetre219')
        .reply(200, () => {
          return successfulMembershipUpdate;
        });

      nock('https://api.github.com')
        .get('/orgs/coglinc/invitations')
        .reply(200, () => {
          return pendingInvitations;
        });

      nock('https://api.github.com')
        .delete(/\/orgs\/coglinc\/memberships\/.*/)
        .times(2)
        .reply(204);
    });

    it('should have successful results', async () => {
      const membersInFile = [unchangedAdmin, newAdmin, modifiedAdmin];
      const invitationResults = await organization.inviteNewMembers(membersInFile);
      const removalResults = await organization.removeMembers(membersInFile);

      expect(invitationResults.hasErrors()).toBe(false);
      expect(invitationResults).toHaveLength(2);
      expect(removalResults.hasErrors()).toBe(false);
      expect(removalResults).toHaveLength(2);
    });
  });
});
