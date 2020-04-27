import MembersFile from '../src/membersFile';
import { MemberRole, OrganizationMember } from '../src/organizationMember';

const VALID_FILE = `
members:
  - login: johnmartel
    role: admin
  - login: sebasrobert
    role: member
`;

const INVALID_FILE = `
public_members:
  - login: johnmartel
    role: admin
  - login: sebasrobert
    role: member
`;

describe('MembersFile test suite', () => {
  let membersFile: MembersFile;

  describe('allMembers property', () => {
    describe('given valid file contents', () => {
      beforeEach(() => {
        membersFile = new MembersFile(VALID_FILE);
      });

      it('should contain all members defined in file', () => {
        expect(membersFile.allMembers).toEqual([
          new OrganizationMember('johnmartel', MemberRole.ADMIN),
          new OrganizationMember('sebasrobert', MemberRole.MEMBER),
        ]);
      });
    });

    describe('given invalid file contents', () => {
      beforeEach(() => {
        membersFile = new MembersFile(INVALID_FILE);
      });

      it('should be an empty array', () => {
        expect(membersFile.allMembers).toBeEmpty();
      });
    });
  });
});
