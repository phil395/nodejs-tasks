import * as Readline from 'readline/promises';

interface IInquirer {
	getAnswers(): Promise<IAnswer[]>;
}

interface IQuestion {
	key: string;
	question: string;
}

interface IAnswer extends IQuestion {
	answer: string;
}

export class Inquirer implements IInquirer {
	private rl = Readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	private answers: IAnswer[] = [];

	constructor(
		private questions: IQuestion[]
	) { }

	private async exec() {
		for (const q of this.questions) {
			const answer = await this.rl.question(q.question + ': ');
			this.answers.push({ ...q, answer: answer.normalize() });
		}
	}

	async getAnswers(): Promise<IAnswer[]> {
		await this.exec();
		return this.answers;
	}
}

