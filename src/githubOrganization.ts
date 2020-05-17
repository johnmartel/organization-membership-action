import { Octokit } from '@octokit/rest';
import differenceWith from 'lodash/differenceWith';
import concat from 'lodash/concat';
import isEqual from 'lodash/isEqual';
import { ListMembersResponseType, ListPendingInvitationsResponseType } from './octokitTypes';
import { MemberRole, OrganizationMember } from './organizationMember';
import {
  AddOrUpdateMembershipFailure,
  AddOrUpdateMembershipSuccess,
} from './githubOrgOperationResults/addOrUpdateMembershipResult';
import { RemoveMembershipFailure, RemoveMembershipSuccess } from './githubOrgOperationResults/removeMembershipResult';
import { GithubOrganizationOperationResults } from './githubOrgOperationResults/githubOrganizationOperationResults';

export default class GithubOrganization {
  private readonly name: string;
  private readonly github: Octokit;
  private currentMembers: OrganizationMember[] | undefined;

  constructor(name: string, github: Octokit) {
    this.name = name;
    this.github = github;
    this.currentMembers = undefined;
  }

  async inviteNewMembers(allMembers: OrganizationMember[]): Promise<GithubOrganizationOperationResults> {
    await this.listMembers();

    const newOrModifiedMembers = differenceWith(allMembers, this.currentMembers as OrganizationMember[], isEqual);

    const results = new GithubOrganizationOperationResults();
    for (const member of newOrModifiedMembers) {
      try {
        const addOrUpdateMembershipResult = await this.github.orgs.addOrUpdateMembership({
          org: this.name,
          username: member.login,
          role: member.role,
        });

        results.add(
          new AddOrUpdateMembershipSuccess(
            addOrUpdateMembershipResult.data.user.login,
            addOrUpdateMembershipResult.data.state,
            addOrUpdateMembershipResult.data.role,
          ),
        );
      } catch (error) {
        results.add(new AddOrUpdateMembershipFailure(member.login, member.role, error.message));
      }
    }

    return results;
  }

  async removeMembers(allMembers: OrganizationMember[]): Promise<GithubOrganizationOperationResults> {
    await this.listMembers();

    const removedMembers = differenceWith(
      this.currentMembers as OrganizationMember[],
      allMembers,
      (first, second) => first.login === second.login,
    );

    const results = new GithubOrganizationOperationResults();
    for (const member of removedMembers) {
      try {
        await this.github.orgs.removeMembership({
          org: this.name,
          username: member.login,
        });

        results.add(new RemoveMembershipSuccess(member.login));
      } catch (error) {
        results.add(new RemoveMembershipFailure(member.login, error.message));
      }
    }

    return results;
  }

  private async listMembers(): Promise<void> {
    if (this.currentMembers === undefined) {
      const admins = await this.listMembersWithRole(MemberRole.ADMIN);
      const members = await this.listMembersWithRole(MemberRole.MEMBER);

      const invitationsResponse: ListPendingInvitationsResponseType = await this.github.orgs.listPendingInvitations({
        org: this.name,
      });
      const pendingInvitations = invitationsResponse.data
        .filter((invitee) => ['direct_member', 'admin'].includes(invitee.role))
        .map((invitee) => new OrganizationMember(invitee.login, invitee.role === 'admin' ? MemberRole.ADMIN : MemberRole.MEMBER));

      this.currentMembers = concat(admins, members, pendingInvitations);
    }
  }

  private async listMembersWithRole(role: MemberRole): Promise<OrganizationMember[]> {
    const response: ListMembersResponseType = await this.github.orgs.listMembers({
      org: this.name,
      role,
    });

    return response.data.map((member) => new OrganizationMember(member.login, role));
  }
}
