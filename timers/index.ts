
import { ITimer, TimersManager } from "./timerManager";


// Usage

const manager = new TimersManager({
	timersDelay: {
		min: 0,
		max: 5_000
	},
	exitDelay: 10_000,
	exitCallback: () => {
		const message = 'All timers stopped successfully';
		const collorCode = 2; // [0;7]
		const colloredMessage = `\x1b[3${collorCode}m${message}\x1b[0m`;
		console.log(colloredMessage, '\n', manager.getLogs());
	}
});

const t1: ITimer = {
	name: 't1',
	delay: 1_000,
	interval: false,
	job: (a, b) => a * b
};

const t2: ITimer = {
	name: 't2',
	delay: 2_000,
	interval: false,
	job: (a, b, c) => a * b * c
};

const t3: ITimer = {
	name: 't3',
	delay: 3_000,
	interval: true,
	job: () => null
};

const t4: ITimer = {
	name: 't4',
	delay: 5_000,
	interval: false,
	job: () => {
		throw new Error('Test');
	}
};

manager.add(t1, 2, 3);
manager.add(t2, 1, 2, 3);
manager.add(t3);
manager.add(t4);

manager.start();

setTimeout(() => {
	manager.pause(t1);
}, 500);

setTimeout(() => {
	manager.resume(t1);
}, 3_000);
