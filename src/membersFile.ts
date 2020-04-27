import yaml from 'js-yaml';
import concat from 'lodash/concat';
import { OrganizationMember } from './organizationMember';

export default class MembersFile {
  static readonly FILENAME: string = '.github/organization/members.yml';

  private members: {
    public_members: OrganizationMember[];
    private_members: OrganizationMember[];
  };

  constructor(contents: string) {
    this.members = yaml.safeLoad(contents);
  }

  get publicMembers(): OrganizationMember[] {
    return this.members.public_members;
  }

  get privateMembers(): OrganizationMember[] {
    return this.members.private_members;
  }

  get allMembers(): OrganizationMember[] {
    return concat(this.publicMembers, this.privateMembers);
  }
}
