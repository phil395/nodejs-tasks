interface IError {
	name: string,
	message: string;
	stack?: string;
}

export interface ILog {
	name: string;
	in: any[];
	out: unknown;
	createdAt: Date;
	error?: IError;
}

interface ILogger {
	add(timerInfo: Omit<ILog, 'createdAt'>): void;
	getLogs(): ILog[];
}

export class Logger implements ILogger {
	private logs: ILog[] = [];

	public add(timerInfo: Omit<ILog, 'createdAt'>): void {
		const log: ILog = {
			name: timerInfo.name,
			in: timerInfo.in,
			out: timerInfo.out,
			createdAt: new Date()
		};

		if (timerInfo.error) {
			log.error = timerInfo.error;
		}

		this.logs.push(log);
	}

	public getLogs(): ILog[] {
		return this.logs;
	}
}