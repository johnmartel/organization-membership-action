import { Octokit } from '@octokit/rest';
import { WebhookPayloadWithRepository } from 'actions-toolkit/lib/context';
import some from 'lodash/some';
import { CompareCommitsResponseType } from './octokitTypes';
import NoRepositoryError from './errors/noRepositoryError';

export default class PushPayload {
  private payload: WebhookPayloadWithRepository;

  constructor(payload: WebhookPayloadWithRepository) {
    this.payload = payload;
  }

  get organizationLogin(): string {
    if (this.payload.repository) {
      return this.payload.repository?.owner.login;
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
