import { Octokit } from '@octokit/rest';
import some from 'lodash/some';
import * as Webhooks from '@octokit/webhooks';
import { CompareCommitsResponseType } from './octokitTypes';
import NoRepositoryError from './errors/noRepositoryError';

export default class PushPayload {
  private payload: Webhooks.WebhookPayloadPush;

  constructor(payload: Webhooks.WebhookPayloadPush) {
    this.payload = payload;
  }

  get organizationLogin(): string {
    if (this.payload.repository) {
      return this.payload.repository.owner.login;
    }

    throw new NoRepositoryError();
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
