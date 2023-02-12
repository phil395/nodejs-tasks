import * as Readline from 'readline/promises';

interface IInquirer<T extends readonly string[]> {
	getAnswers(): Promise<IAnswers<T>>;
}

export interface IQuestion {
	key: string;
	question: string;
}

interface IInquirerData extends IQuestion {
	answer: string;
}

type IAnswers<T extends readonly string[]> = Record<T[number], string>

export class Inquirer<T extends readonly string[]> implements IInquirer<T> {
	private rl = Readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	private data: IInquirerData[] = [];

	constructor(
		private questions: IQuestion[]
	) { }

	private async exec() {
		for (const q of this.questions) {
			const answer = await this.rl.question(q.question + ': ');
			this.data.push({ ...q, answer: answer.normalize() });
		}
	}

	private formatAnswers(): IAnswers<T> {
		return this.data.reduce((res, { key, answer }) => {
			res[key as T[number]] = answer
			return res
		}, {} as IAnswers<T>)
	}

	async getAnswers(): Promise<IAnswers<T>> {
		await this.exec();
		return this.formatAnswers();
	}
}

