export interface SecurityAPI {
  "2fa": boolean;
  "2fa_activated": moment.Moment;
  fastlogin: boolean;
  passkeys: any[];
}

export type BackupCode = {
  code: string;
} & ({
  used: true,
  used_at: Date
} | {
  used: false
})