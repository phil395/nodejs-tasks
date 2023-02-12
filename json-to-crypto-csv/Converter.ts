import { Transform } from 'node:stream';
import { EOL } from 'node:os';
import { TransformWrap } from './Duplexable';

interface IConverter {
	getStream(): Transform;
}

export class Converter extends TransformWrap implements IConverter {

	constructor(
		private delimiter: ',' | ';' = ','
	) {
		super();
	}

	getStream(): Transform {
		return this.stream;
	}

	private parseJson(s: string) {
		try {
			const data = JSON.parse(s) as unknown;

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
	): string {
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

	protected override transform(data: string): string {
		const collection = this.parseJson(data)
		const keys = this.constructKeys(collection);
		const csv = this.makeCsv(collection, keys);
		return csv 
	}
}
