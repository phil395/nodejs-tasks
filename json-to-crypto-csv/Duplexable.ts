import { Duplex } from "node:stream";

export class Duplexable {
	private data: string = '';

	protected stream = new Duplex({
		defaultEncoding: 'utf8',
		write: (chunk, _, next) => {
			this.data += chunk;
			next();
		},
		read() { }
	});

	constructor() {
		this.stream.on('finish', () => this.onReceiveData());
		this.handleError();
	}

	private handleError(): void {
		this.stream.on('error', (err) => {
			console.log(err);
		});
	}

	protected onReceiveData() {
		// will be overridden
	}

	protected getReceivedData() {
		return this.data;
	}
}