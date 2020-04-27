export class RemoveMembershipResult {
  readonly login: string;

  constructor(login: string) {
    this.login = login;
  }

  toString(): string {
    return `"${this.login}" was removed`;
  }
}
