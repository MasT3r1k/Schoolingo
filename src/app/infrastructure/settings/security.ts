export interface SecurityAPI {
  "2fa": boolean;
  "2fa_activated": moment.Moment;
  fastlogin: boolean;
  passkeys: any[];
}