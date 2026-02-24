export interface SchoolConfig {
  name: string;
  short_name: string;
  code: string;
  start_hour: number;
  start_minute: number;
  lesson_hour: number;
  break_time: number;
  reset_password_with_email: number; // 0 nebo 1 – můžeš nahradit boolean, pokud to interně přetypuješ
  fastlogin: number;              // 0 nebo 1 – případně boolean
  warning_absence_percent: number;
  modules: string;                // např. "-1"
  students_limit: number;         // -1 může znamenat "neomezeně"
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
  login_expires: number;
  // auth
  auth_classic: boolean;
  auth_ldap: boolean;
  auth_passkeys: boolean;
  gdpr_first_name: string;
  gdpr_last_name: string;
  gdpr_phone: string;
  gdpr_email: string;
  gdpr_mobile: string;
  gdpr_databox: string;
  gdpr_web: string;
  msg_type_noticeboard_active: boolean;
}