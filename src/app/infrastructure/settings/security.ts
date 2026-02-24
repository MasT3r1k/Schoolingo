export interface SecurityAPI {
  "2fa": boolean;
  "2fa_activated": moment.Moment;
  fastlogin: boolean;
  config: {
    min_length: number,
    max_length: number,
    require_capital: number,
    require_lowercase: number,
    require_number: number,
    require_special: number
  };
  passkeys: any[];
}

export type BackupCode = {
  code: string;
  used: boolean;
}