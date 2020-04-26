import core from '@actions/core';
import { Toolkit } from 'actions-toolkit';
import PushPayload from './pushPayload';

const MEMBERS_FILENAME = './github/organization/members.yml';

export default async function (tools: Toolkit): Promise<void> {
  tools.log.debug(tools.context.payload);

  try {
    const payloadWrapper: PushPayload = new PushPayload(tools.context.payload);
    const membersFileModified: boolean = await payloadWrapper.fileWasModified(MEMBERS_FILENAME, tools.context.repo, tools.github);
    tools.log.info('members file modified: ', membersFileModified);

    if (!membersFileModified) {
      tools.log.info('"%s" not modified, this is ok, nothing to do, exiting...', MEMBERS_FILENAME);
      tools.exit.neutral();
    } else {
      // TODO extract organization login
      // TODO fetch organization members
      // TODO use lodash to find added/updated/removed membership
      // TODO make appropriate modifications
      tools.exit.success('Completed!');
    }
  } catch (error) {
    tools.log.error(error.message);
    if (error.errors) {
      tools.log.error(error.errors);
    }

    core.setFailed(`An error occurred while modifying organization membership\n\n${error.message}`);
    tools.exit.failure();
  }
}
