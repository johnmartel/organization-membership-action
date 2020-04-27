export enum MemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export class OrganizationMember {
  readonly login: string;
  readonly role: MemberRole;

  constructor(login: string, isSiteAdmin: boolean) {
    this.login = login;
    this.role = isSiteAdmin ? MemberRole.ADMIN : MemberRole.MEMBER;
  }
}
