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
  loginExpires: number;
}