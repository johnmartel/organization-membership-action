import { GetResponseTypeFromEndpointMethod } from '@octokit/types';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit();
export type CompareCommitsResponseType = GetResponseTypeFromEndpointMethod<typeof octokit.repos.compareCommits>;
