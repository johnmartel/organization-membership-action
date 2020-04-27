export enum MemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export class OrganizationMember {
  readonly login: string;
  readonly role: MemberRole;

  constructor(login: string, role: MemberRole) {
    this.login = login;
    this.role = role;
  }
}
