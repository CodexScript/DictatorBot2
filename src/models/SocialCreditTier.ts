export default class SocialCreditTier {
  constructor(public value: number) {
  }

  static D = 0;

  static C = 1;

  static B = 2;

  static AMINUS = 3;

  static A = 4;

  static APLUS = 5;

  static AA = 6;

  static AAA = 7;

  toString() {
    switch (this.value) {
      case SocialCreditTier.D:
        return 'D';
      case SocialCreditTier.C:
        return 'C';
      case SocialCreditTier.B:
        return 'B';
      case SocialCreditTier.AMINUS:
        return 'A-';
      case SocialCreditTier.A:
        return 'A';
      case SocialCreditTier.APLUS:
        return 'A+';
      case SocialCreditTier.AA:
        return 'AA';
      case SocialCreditTier.AAA:
        return 'AAA';
      default:
        return 'Unknown';
    }
  }
}
