import * as core from '@actions/core';
import { Toolkit } from 'actions-toolkit';
import PushPayload from './pushPayload';
import GithubOrganization from './githubOrganization';
import MembersFile from './membersFile';

export default async function (tools: Toolkit): Promise<void> {
  try {
    tools.log('Verify if organization membership file was modified');

    const payloadWrapper: PushPayload = new PushPayload(tools.context.payload);
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

      tools.log('Invite new members');
      const addOrUpdateMembershipResults = await organization.inviteNewMembers(membersFile.allMembers);
      addOrUpdateMembershipResults.forEach((result) => {
        tools.log.debug(result.toString());
      });

      tools.log('Conceal existing members');
      await organization.concealPublicMembers(membersFile.privateMembers);

      tools.log('Publicize concealed members');
      await organization.deconcealPrivateMembers(membersFile.publicMembers);

      tools.log('Remove members');
      await organization.removeMembers(membersFile.allMembers);

      tools.exit.success('Completed!');
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
