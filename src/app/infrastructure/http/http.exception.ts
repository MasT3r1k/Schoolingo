export class HttpException extends Error {
	constructor(
		public override readonly message: string,
		public readonly statusCode: number,
	) {
		super(message);
	}
}