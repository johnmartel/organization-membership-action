import { Octokit } from '@octokit/rest';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';
import { ListMembersResponseType } from './octokitTypes';
import { OrganizationMember } from './organizationMember';
import { AddOrUpdateMembershipResult } from './githubOrgOperationResults/addOrUpdateMembershipResult';

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

    const newOrModifiedMembers = differenceWith(allMembers, this.currentMembers || [], isEqual);
    const promises = newOrModifiedMembers.map((member) =>
      this.github.orgs.addOrUpdateMembership({
        org: this.name,
        username: member.login,
        role: member.role,
      }),
    );

    const addOrUpdateMembershipResult = await Promise.all(promises);

    return addOrUpdateMembershipResult.map(
      (result) => new AddOrUpdateMembershipResult(result.data.user.login, result.data.state, result.data.role),
    );
  }

  async concealPublicMembers(privateMembers: OrganizationMember[]): Promise<void> {
    await this.listMembers();
  }

  async deconcealPrivateMembers(publicMembers: OrganizationMember[]): Promise<void> {
    await this.listMembers();
  }

  async removeMembers(allMembers: OrganizationMember[]): Promise<void> {
    await this.listMembers();
  }

  private async listMembers(): Promise<void> {
    if (this.currentMembers === undefined) {
      const response: ListMembersResponseType = await this.github.orgs.listMembers({ org: this.name });
      this.currentMembers = response.data.map((member) => new OrganizationMember(member.login, member.site_admin));
    }
  }
}
