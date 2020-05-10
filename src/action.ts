import * as core from '@actions/core';
import { Toolkit } from 'actions-toolkit';
import * as Webhooks from '@octokit/webhooks';
import PushPayload from './pushPayload';
import GithubOrganization from './githubOrganization';
import MembersFile from './membersFile';

export default async function (tools: Toolkit): Promise<void> {
  try {
    tools.log('Verify if organization membership file was modified');

    const payloadWrapper: PushPayload = new PushPayload(tools.context.payload as Webhooks.WebhookPayloadPush);
    const membersFileModified: boolean = await payloadWrapper.fileWasModified(
      MembersFile.FILENAME,
      tools.context.repo,
      tools.github,
    );

    if (!membersFileModified) {
      tools.exit.success(`"${MembersFile.FILENAME}" not modified, this is ok, nothing to do`);
    } else {
      const organizationName = payloadWrapper.organizationLogin;
      tools.log('%s was modified, modifying %s membership...', MembersFile.FILENAME, organizationName);
      const membersFile = new MembersFile(tools.getFile(MembersFile.FILENAME));
      const organization = new GithubOrganization(organizationName, tools.github);

      tools.log('Invite new members or update existing members');
      const addOrUpdateMembershipResults = await organization.inviteNewMembers(membersFile.allMembers);
      addOrUpdateMembershipResults.printResults(tools.log);

      tools.log('Remove members');
      const removeMembershipResults = await organization.removeMembers(membersFile.allMembers);
      removeMembershipResults.printResults(tools.log);

      if (addOrUpdateMembershipResults.hasErrors() || removeMembershipResults.hasErrors()) {
        tools.exit.failure('Completed with errors, see the logs above');
      } else {
        tools.exit.success('Completed!');
      }
    }
  } catch (error) {
    tools.log.error(error.message, error);
    if (error.errors) {
      tools.log.error(error.errors);
    }

    core.setFailed(`An error occurred while modifying organization membership\n\n${error.message}`);
    tools.exit.failure();
  }
}
