import { Octokit } from '@octokit/rest';

export default class GithubOrganization {
  private name: string;
  private github: Octokit;

  public constructor(name: string, github: Octokit) {
    this.name = name;
    this.github = github;
  }

  public async fetchPublicMembers() {
    await this.github.orgs.listMembers({ org: this.name });
  }
}
