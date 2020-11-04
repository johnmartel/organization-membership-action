import some from 'lodash/some';
import { EventPayloads } from '@octokit/webhooks';
import { Octokit } from '@octokit/rest';
import { CompareCommitsResponseType } from './octokitTypes';

export default class PushPayload {
  private payload: EventPayloads.WebhookPayloadPush;

  constructor(payload: EventPayloads.WebhookPayloadPush) {
    this.payload = payload;
  }

  get organizationLogin(): string {
    return this.payload.repository.owner.login;
  }

  isDefaultBranch(): boolean {
    return this.payload.ref === `refs/heads/${this.payload.repository.default_branch}`;
  }

  isOrganizationOwned(): boolean {
    return this.payload.repository.owner.type.toLowerCase() === 'organization';
  }

  async fileWasModified(
    filename: string,
    repo: {
      owner: string;
      repo: string;
    },
    github: Octokit,
  ): Promise<boolean> {
    const response: CompareCommitsResponseType = await github.repos.compareCommits({
      base: this.payload.before,
      head: this.payload.after,
      owner: repo.owner,
      repo: repo.repo,
    });

    return some(response.data.files, ['filename', filename]);
  }
}
