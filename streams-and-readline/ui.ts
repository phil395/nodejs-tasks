import * as Readline from 'readline/promises';
import { Readable } from 'stream';
import { IUser } from './index';

const enum Errors {
	InvalidInput = 'Invalid_input'
}

type Questions = {
	[field in keyof IUser]: string
};

export class UI {
	protected rl = Readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	protected rs = new Readable({
		objectMode: true,
		read() { }
	});
	private user = {} as IUser;

	constructor(
		public questions: Questions
	) {
		this.handleStreamsError();
	}

	public async run() {
		try {
			this.printHelloMsg();
			await this.getAnswers();
			await this.checkAnswers();
			this.pushInRS();
			this.reset();
			this.next();

		} catch (error) {
			this.handleError(error);
		}
	}

	private printHelloMsg() {
		this.rl.write('Enter the data for the new user...\n');
	}

	private async getAnswers() {
		for await (const [field, question] of Object.entries(this.questions)) {
			const currentAnswer = this.user[field as keyof IUser];
			if (currentAnswer) this.rl.write(currentAnswer);

			const answer = await this.rl.question(`${question}: `);
			this.user[field as keyof IUser] = answer;
		}
	}

	private async checkAnswers() {
		const checkLength = () => {
			const shortAnswerCondition = (answer: string) => !answer || answer.length < 3;
			const shortAnswerIsPresent = Object.values(this.user).some(shortAnswerCondition);
			if (shortAnswerIsPresent) {
				this.rl.write('The minimum length is 3 characters\n');
				throw new Error(Errors.InvalidInput);
			}
		};

		const checkByUser = async () => {
			this.rl.write(`${JSON.stringify(this.user, null, 2)}\n`);
			const lastAnswer = await this.rl.question('Is this correct data? (press "y" or "yes"): ');
			if (lastAnswer !== 'y' && lastAnswer !== 'yes') {
				throw new Error(Errors.InvalidInput);
			}
		};

		checkLength();
		await checkByUser();
	}

	private pushInRS() {
		this.rs.push(this.user);
	}

	private reset() {
		this.user = {} as IUser;
	}

	private async next() {
		const answer = await this.rl.question('Will we create another user? (press "y" or "yes"): ');
		if (answer === 'y' || answer === 'yes') {
			this.run();
			return;
		}
		this.rl.close();
	}

	public pipe<T extends NodeJS.WritableStream>(ws: T): T {
		return this.rs.pipe<T>(ws);
	}

	public unwrapRS(): Readable {
		return this.rs;
	}

	private handleError(error: unknown) {
		if (!(error instanceof Error)) throw error;
		switch (error.message) {
			case Errors.InvalidInput:
				this.run();
				break;
			default:
				throw error;
		}
	}

	private handleStreamsError() {
		this.rs.on('error', (error) => {
			console.log(error);
		});
		this.rl.on('error', (error) => {
			console.log(error);
		});
	}
}