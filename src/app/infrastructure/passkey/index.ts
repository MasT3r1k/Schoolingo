import { Injectable } from "@angular/core";

@Injectable()
export class Passkey {
  async isSupported(): Promise<boolean> {
    if (
      typeof PublicKeyCredential === 'undefined' ||
      typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function'
    ) { return false }

    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch { return false }
  }
}

export function base64urlToBuffer(base64url: unknown): Uint8Array {
  if (typeof base64url !== 'string') {
    throw new TypeError('Expected base64url string, but got: ' + typeof base64url);
  }

  const padding = '='.repeat((4 - base64url.length % 4) % 4);
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + padding;
  const raw = atob(base64);
  return new Uint8Array([...raw].map(char => char.charCodeAt(0)));
}