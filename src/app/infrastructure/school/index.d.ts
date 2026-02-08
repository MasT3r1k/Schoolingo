export interface SchoolConfig {
  name: string;
  shortName: string;
  code: string;
  startHour: number;
  startMinute: number;
  lessonHour: number;
  breakTime: number;
  resetPasswordWithEmail: number; // 0 nebo 1 – můžeš nahradit boolean, pokud to interně přetypuješ
  fastlogin: number;              // 0 nebo 1 – případně boolean
  warningAbsencePercent: number;
  modules: string;                // např. "-1"
  studentsLimit: number;         // -1 může znamenat "neomezeně"
  district: string;
  breaks: {
    hour: number;
    minutes: number;
  }[];
  year: {
    start: Date;
    midterm: Date;
    end: Date;
  };
  loginExpires: number;
  // auth
  auth_classic: boolean;
  auth_ldap: boolean;
  auth_passkeys: boolean;
  gdpr_firstname: string;
  gdpr_lastname: string;
  gdpr_phone: string;
  gdpr_email: string;
  gdpr_mobile: string;
  gdpr_databox: string;
  gdpr_web: string;
}