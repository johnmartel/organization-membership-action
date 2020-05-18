import 'jest-extended';
import MembersFile from '../src/membersFile';
import { MemberRole, OrganizationMember } from '../src/organizationMember';
import { EMPTY_FILE, INVALID_FILE, VALID_FILE, VALID_FILE_WITH_EMPTY_MEMBERS } from './fixtures/membersFiles';

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

  describe('isEmpty', () => {
    describe('given a file with members', () => {
      beforeEach(() => {
        membersFile = new MembersFile(VALID_FILE);
      });

      it('should return false', () => {
        expect(membersFile.isEmpty()).toBe(false);
      });
    });

    describe('given an empty members array', () => {
      beforeEach(() => {
        membersFile = new MembersFile(VALID_FILE_WITH_EMPTY_MEMBERS);
      });

      it('should return false', () => {
        expect(membersFile.isEmpty()).toBe(true);
      });
    });

    describe('given an empty file', () => {
      beforeEach(() => {
        membersFile = new MembersFile(EMPTY_FILE);
      });

      it('should return false', () => {
        expect(membersFile.isEmpty()).toBe(true);
      });
    });
  });
});
