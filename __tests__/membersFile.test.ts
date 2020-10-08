import 'jest-extended';
import { Signale } from 'signale';
import MembersFile from '../src/membersFile';
import { MemberRole, OrganizationMember } from '../src/organizationMember';
import { EMPTY_FILE, INVALID_FILE, VALID_FILE, VALID_FILE_WITH_EMPTY_MEMBERS } from './fixtures/membersFiles';

describe('MembersFile test suite', () => {
  const log = new Signale();

  describe('allMembers property', () => {
    describe('given valid file contents', () => {
      it('should contain all members defined in file', () => {
        const membersFile = new MembersFile(VALID_FILE, log);

        expect(membersFile.allMembers).toEqual([
          new OrganizationMember('johnmartel', MemberRole.ADMIN),
          new OrganizationMember('sebasrobert', MemberRole.MEMBER),
        ]);
      });
    });

    describe('given invalid file contents', () => {
      it('should be an empty array', () => {
        const membersFile = new MembersFile(INVALID_FILE, log);

        expect(membersFile.allMembers).toBeEmpty();
      });
    });
  });

  describe('isEmpty', () => {
    describe('given a file with members', () => {
      it('should return false', () => {
        const membersFile = new MembersFile(VALID_FILE, log);

        expect(membersFile.isEmpty()).toBe(false);
      });
    });

    describe('given an empty members array', () => {
      it('should return false', () => {
        const membersFile = new MembersFile(VALID_FILE_WITH_EMPTY_MEMBERS, log);

        expect(membersFile.isEmpty()).toBe(true);
      });
    });

    describe('given an empty file', () => {
      it('should return false', () => {
        const membersFile = new MembersFile(EMPTY_FILE, log);

        expect(membersFile.isEmpty()).toBe(true);
      });
    });
  });
});
