interface IArgsParser {
	getArgs(): Record<string, string | true>;
}

export class ArgsParser implements IArgsParser {
	private args: ReturnType<IArgsParser['getArgs']> = {};

	constructor() {
		this.exec();
	}

	private parseKey(s: string | undefined): string | null {
		if (s?.startsWith('--')) return s.substring(2);
		if (s?.startsWith('-')) return s.substring(1);
		return null;
	}

	private exec(): void {
		const { argv } = process;
		for (let i = 2; i < argv.length; i++) {
			const s = argv[i];
			const key = this.parseKey(s);
			if (!key) continue;
			const next = argv[i + 1];
			const nextKey = this.parseKey(next);
			let value
			if (nextKey || !next) { 
				value = true as const
			} else {
				i++;
				value = next.normalize()
			}
			this.args[key] = value;
		}
	}

	getArgs(): ReturnType<IArgsParser['getArgs']> {
		return this.args;
	}
}
