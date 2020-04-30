import { Octokit } from '@octokit/rest';
import differenceWith from 'lodash/differenceWith';
import concat from 'lodash/concat';
import isEqual from 'lodash/isEqual';
import { ListMembersResponseType, ListPendingInvitationsResponseType } from './octokitTypes';
import { MemberRole, OrganizationMember } from './organizationMember';
import { AddOrUpdateMembershipResult } from './githubOrgOperationResults/addOrUpdateMembershipResult';
import { RemoveMembershipResult } from './githubOrgOperationResults/removeMembershipResult';
import {GithubOrganizationOperationResults} from "./githubOrgOperationResults/GithubOrganizationOperationResults";

export default class GithubOrganization {
  private name: string;
  private github: Octokit;
  private currentMembers: OrganizationMember[] | undefined;

  constructor(name: string, github: Octokit) {
    this.name = name;
    this.github = github;
    this.currentMembers = undefined;
  }

  async inviteNewMembers(allMembers: OrganizationMember[]): Promise<GithubOrganizationOperationResults> {
    await this.listMembers();

    const newOrModifiedMembers = differenceWith(allMembers, this.currentMembers || [], isEqual);

    const results = new GithubOrganizationOperationResults();
    for (const member of newOrModifiedMembers) {
      const addOrUpdateMembershipResult = await this.github.orgs.addOrUpdateMembership({
        org: this.name,
        username: member.login,
        role: member.role,
      });

      results.add(
        new AddOrUpdateMembershipResult(
          addOrUpdateMembershipResult.data.user.login,
          addOrUpdateMembershipResult.data.state,
          addOrUpdateMembershipResult.data.role,
        ),
      );
    }

    return results;
  }

  async removeMembers(allMembers: OrganizationMember[]): Promise<GithubOrganizationOperationResults> {
    await this.listMembers();

    const removedMembers = differenceWith(this.currentMembers || [], allMembers, (first, second) => first.login === second.login);

    const results = new GithubOrganizationOperationResults();
    for (const member of removedMembers) {
      await this.github.orgs.removeMembership({
        org: this.name,
        username: member.login,
      });

      results.add(new RemoveMembershipResult(member.login));
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
