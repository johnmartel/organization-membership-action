import yaml from 'js-yaml';
import { Signale } from 'signale';
import { MemberRole, OrganizationMember } from './organizationMember';

type MemberFileEntry = { login: string; role: MemberRole };
type MembersFileType = {
  members: MemberFileEntry[] | undefined;
};

export default class MembersFile {
  static readonly FILENAME: string = '.github/organization/members.yml';

  private file: MembersFileType;

  constructor(contents: string, log: Signale) {
    try {
      this.file = yaml.safeLoad(contents) as MembersFileType;
    } catch (e) {
      log.warn('Could not parse %s: %s', MembersFile.FILENAME, e.message);
      this.file = { members: [] };
    }
  }

  get allMembers(): OrganizationMember[] {
    if (!this.file?.members) {
      return [];
    }

    return this.file.members.map((member) => new OrganizationMember(member.login, member.role));
  }

  isEmpty(): boolean {
    return this.allMembers.length === 0;
  }
}
