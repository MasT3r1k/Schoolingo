export type IPInformation =
| {
    status: true,
    ip: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    org: string;
    postal: string;
    timezone: string;
}
| {
    status: false;
    error: string;
    country: '';
}