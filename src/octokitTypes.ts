import { GetResponseTypeFromEndpointMethod } from '@octokit/types';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit();
export type CompareCommitsResponseType = GetResponseTypeFromEndpointMethod<typeof octokit.repos.compareCommits>;
export type ListMembersResponseType = GetResponseTypeFromEndpointMethod<typeof octokit.orgs.listMembers>;
export type ListPendingInvitationsResponseType = GetResponseTypeFromEndpointMethod<typeof octokit.orgs.listPendingInvitations>;
