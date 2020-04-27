export class AddOrUpdateMembershipResult {
  readonly login: string;
  readonly state: string;
  readonly role: string;

  constructor(login: string, state: string, role: string) {
    this.login = login;
    this.state = state;
    this.role = role;
  }

  toString(): string {
    return `"${this.login}" was ${this.state === 'pending' ? 'added' : 'updated'} with role "${this.role}"`;
  }
}
