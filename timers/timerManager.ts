import { ILog, Logger } from "./logger";

export interface ITimer {
	name: string;
	delay: number;
	interval: boolean;
	job: (...args: any[]) => unknown;
}

interface IControledTimer extends ITimer {
	jobArgs: Parameters<ITimer['job']>;
	controller?: NodeJS.Timer;
}

interface ITimersManager {
	add(timer: ITimer, ...args: Parameters<ITimer['job']>): this;
	remove(timer: ITimer | string): void;
	start(): void;
	stop(): void;
	pause(timer: ITimer | string): void;
	resume(timer: ITimer | string): void;
	getLogs(): ILog[];
}

interface ITimersManagerSettings {
	timersDelay: {
		min: number,
		max: number;
	},
	exitDelay: number,
	exitCallback: () => void;
}


export class TimersManager implements ITimersManager {
	protected timers: IControledTimer[] = [];
	protected isStarted: boolean = false;
	protected logger = new Logger();
	protected exitTime: number = 0;  // Date in ms

	constructor(
		protected settings: ITimersManagerSettings
	) { }

	// Utility methods

	protected isOk({ name, delay }: ITimer): boolean {
		const { min: minDelay, max: maxDelay } = this.settings.timersDelay;
		if (
			name.length === 0 ||
			delay < minDelay || delay > maxDelay ||
			this.isStarted ||
			this.timers.find(timer => timer.name === name)
		) {
			return false;
		}
		return true;
	}

	protected findTimer(target: ITimer | string): IControledTimer {
		const targetTimer = this.timers.find(timer => {
			return typeof target === 'object'
				? timer.name === target.name
				: timer.name === target;
		});

		if (!targetTimer) throw new Error('Timer not found');
		return targetTimer;
	}

	protected makeAndLogJob(
		jobData: Pick<IControledTimer, 'name' | 'job' | 'jobArgs'>
	): void {
		const { name, job, jobArgs } = jobData;

		const logEntry = {
			name,
			in: jobArgs.length ? jobArgs : null
		} as Parameters<typeof this.logger.add>[0];

		try {
			logEntry.out = job(...jobArgs) ?? null;
		} catch (error) {
			logEntry.out = null;
			logEntry.error = {
				name: 'Error',
				message: 'Job ended with an error',
				stack: error instanceof Error ? error.stack : undefined
			};
		} finally {
			this.logger.add(logEntry);
		}
	}

	protected startTimer(timer: IControledTimer): void {
		if (timer.controller) return;
		const { name, delay, interval, job, jobArgs } = timer;

		const setTimer = interval ? setInterval : setTimeout;

		const controller = setTimer(() => {
			this.makeAndLogJob({ name, job, jobArgs });
		}, delay);

		timer.controller = controller;
	}

	protected stopTimer(timer: IControledTimer): void {
		const { controller, interval } = timer;
		if (!controller) return;

		if (interval) clearInterval(controller);
		else clearTimeout(controller);

		delete timer.controller;
	}

	protected updateExitDelay(itemTimerDelay: number) {
		const exitTime = Date.now() + itemTimerDelay + this.settings.exitDelay;
		if (exitTime > this.exitTime) {
			this.exitTime = exitTime;
		}
	}

	protected planningExit(): void {
		const ms = this.exitTime - Date.now();
		setTimeout(() => {
			this.stop();
			this.settings.exitCallback();
		}, ms);
	}

	// Business logic

	public add(timer: ITimer, ...args: Parameters<ITimer['job']>): this {
		if (this.isOk(timer)) {

			this.timers.push({
				...timer,
				jobArgs: args
			});

			this.updateExitDelay(timer.delay);

			return this;
		}
		throw new Error('Timer failed validation');
	}

	public remove(timerName: string): void;
	public remove(timer: ITimer): void;
	public remove(target: ITimer | string): void {
		const targetTimer = this.findTimer(target);

		this.stopTimer(targetTimer);

		this.timers = this.timers.filter(timer => {
			return timer.name !== targetTimer.name;
		});
	}

	public start(): void {
		if (this.isStarted) return;
		this.timers.forEach(timer => this.startTimer(timer));
		this.isStarted = true;
		this.planningExit();
	}

	public stop(): void {
		this.timers.forEach(timer => this.stopTimer(timer));
		// this.timers.forEach(this.stopTimer.bind(this));
		this.isStarted = false;
	}

	public pause(timerName: string): void;
	public pause(timer: ITimer): void;
	public pause(target: ITimer | string): void {
		const targetTimer = this.findTimer(target);
		this.stopTimer(targetTimer);
	}

	public resume(timerName: string): void;
	public resume(timer: ITimer): void;
	public resume(target: ITimer | string): void {
		const targetTimer = this.findTimer(target);
		this.startTimer(targetTimer);
	}

	public getLogs(): ILog[] {
		return this.logger.getLogs();
	}

}


