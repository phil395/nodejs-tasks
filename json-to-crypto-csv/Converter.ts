import { Duplex } from 'node:stream';
import { EOL } from 'node:os';

export class Converter {
	private data: string = '';
	private stream = new Duplex({
		defaultEncoding: 'utf8',
		write: (chunk, _, next) => {
			this.data += chunk;
			next();
		},
		read() { }
	});

	constructor(
		private delimiter: ',' | ';' = ','
	) {
		this.stream.on('finish', () => this.exec());
		this.handleError();
	}

	getStream() {
		return this.stream;
	}

	private parseJson() {
		try {
			const data = JSON.parse(this.data) as unknown;

			if (Array.isArray(data)) {
				return data as Record<string, unknown>[];
			}

			throw new Error();
		} catch (error) {
			throw 'Invalid JSON file. It must be an array';
		}
	}

	private constructKeys(collection: Record<string, unknown>[]): Set<string> {
		const keys = new Set<string>();

		for (const entry of collection) {
			const entryKeys = Object.keys(entry);
			for (const key of entryKeys) {
				keys.add(key);
			}
		}

		return keys;
	}

	private makeCsv(
		collection: ReturnType<typeof this.parseJson>,
		keys: ReturnType<typeof this.constructKeys>
	) {
		const ks = [...keys];

		let value = '';
		const header = ks.toString();
		value += header + EOL;

		for (const entry of collection) {
			let entryValue = '';

			for (let i = 0; i < ks.length; i++) {
				const key = ks[i];
				const value = entry[key] ?? null;
				const isLastKey = i === ks.length - 1;
				const lastChar = isLastKey ? EOL : this.delimiter;
				entryValue += '"' + value + '"' + lastChar;
			}

			value += entryValue;
		}

		return value;
	}

	private exec() {
		const collection = this.parseJson();
		const keys = this.constructKeys(collection);
		const csv = this.makeCsv(collection, keys);

		this.stream.push(csv);
		return this.getStream();
	}

	private handleError(): void {
		this.stream.on('error', (err) => {
			console.log(err);
		});
	}
}
