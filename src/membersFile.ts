import yaml from 'js-yaml';
import { MemberRole, OrganizationMember } from './organizationMember';

type MemberFileEntry = { login: string; role: MemberRole };

export default class MembersFile {
  static readonly FILENAME: string = '.github/organization/members.yml';

  private file: {
    members: MemberFileEntry[] | undefined;
  };

  constructor(contents: string) {
    this.file = yaml.safeLoad(contents);
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
