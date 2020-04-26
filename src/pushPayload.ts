import { Octokit } from '@octokit/rest';
import { WebhookPayloadWithRepository } from 'actions-toolkit/lib/context';
import some from 'lodash/some';
import { CompareCommitsResponseType } from './types';

export default class PushPayload {
  private payload: WebhookPayloadWithRepository;

  public constructor(payload: WebhookPayloadWithRepository) {
    this.payload = payload;
  }

  public async fileWasModified(
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

    const files = response.data.files;
    files.forEach((file) => {
      console.log(file.filename);
    });

    return some(files, ['filename', filename]);
  }
}
