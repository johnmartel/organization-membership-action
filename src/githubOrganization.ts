import { Octokit } from '@octokit/rest';
import differenceWith from 'lodash/differenceWith';
import concat from 'lodash/concat';
import isEqual from 'lodash/isEqual';
import { ListMembersResponseType, ListPendingInvitationsResponseType } from './octokitTypes';
import { MemberRole, OrganizationMember } from './organizationMember';
import { AddOrUpdateMembershipResult } from './githubOrgOperationResults/addOrUpdateMembershipResult';
import { RemoveMembershipResult } from './githubOrgOperationResults/removeMembershipResult';

export default class GithubOrganization {
  private name: string;
  private github: Octokit;
  private currentMembers: OrganizationMember[] | undefined;

  constructor(name: string, github: Octokit) {
    this.name = name;
    this.github = github;
    this.currentMembers = undefined;
  }

  async inviteNewMembers(allMembers: OrganizationMember[]): Promise<AddOrUpdateMembershipResult[]> {
    await this.listMembers();

    const results: AddOrUpdateMembershipResult[] = [];
    const newOrModifiedMembers = differenceWith(allMembers, this.currentMembers || [], isEqual);

    for (const member of newOrModifiedMembers) {
      const addOrUpdateMembershipResult = await this.github.orgs.addOrUpdateMembership({
        org: this.name,
        username: member.login,
        role: member.role,
      });

      results.push(
        new AddOrUpdateMembershipResult(
          addOrUpdateMembershipResult.data.user.login,
          addOrUpdateMembershipResult.data.state,
          addOrUpdateMembershipResult.data.role,
        ),
      );
    }

    return results;
  }

  async removeMembers(allMembers: OrganizationMember[]): Promise<RemoveMembershipResult[]> {
    await this.listMembers();

    const results: RemoveMembershipResult[] = [];
    const removedMembers = differenceWith(this.currentMembers || [], allMembers, (first, second) => first.login === second.login);

    for (const member of removedMembers) {
      await this.github.orgs.removeMembership({
        org: this.name,
        username: member.login,
      });

      results.push(new RemoveMembershipResult(member.login));
    }

    return results;
  }

  private async listMembers(): Promise<void> {
    if (this.currentMembers === undefined) {
      const adminsResponse: ListMembersResponseType = await this.github.orgs.listMembers({
        org: this.name,
        role: MemberRole.ADMIN,
      });
      const admins = adminsResponse.data.map((member) => new OrganizationMember(member.login, MemberRole.ADMIN));

      const membersResponse: ListMembersResponseType = await this.github.orgs.listMembers({
        org: this.name,
        role: MemberRole.MEMBER,
      });
      const members = membersResponse.data.map((member) => new OrganizationMember(member.login, MemberRole.ADMIN));

      const invitationsResponse: ListPendingInvitationsResponseType = await this.github.orgs.listPendingInvitations({
        org: this.name,
      });
      const pendingInvitations = invitationsResponse.data
        .filter((invitee) => ['direct_member', 'admin'].includes(invitee.role))
        .map((invitee) => new OrganizationMember(invitee.login, invitee.role === 'admin' ? MemberRole.ADMIN : MemberRole.MEMBER));

      this.currentMembers = concat(admins, members, pendingInvitations);
    }
  }
}
