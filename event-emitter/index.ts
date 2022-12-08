import EventEmitter from "events";
import crypto from 'crypto';

const enum Events {
	Add = 'add',
	Get = 'get',
	Withdraw = 'withdraw',
	Send = 'send',
	ChangeLimit = 'changeLimit'
}

type EventsArgsMap = {
	[Events.Add]: [id: string, ammount: number],
	[Events.Get]: [id: string, callback: (balance: number) => void],
	[Events.Withdraw]: [id: string, ammount: number];
	[Events.Send]: [senderId: string, recipientId: string, ammount: number];
	[Events.ChangeLimit]: [id: string, newLimit: IUser['limit']];
};

interface IUser {
	id: string;
	name: string;
	balance: number;
	// limit Validator
	limit: (ammount: number, currentBalance: number, updatedBalance: number) => boolean;
}

interface IFindUser {
	field: Extract<keyof IUser, 'id' | 'name'>;
	value: string;
	handleError?: boolean;
}

type ReturnFindedUser<T> = T extends { handleError: false; } ? IUser | undefined : IUser;


class Bank {
	private users: IUser[] = [];

	private isValidNewUser(newUser: Omit<IUser, 'id'>) {
		const existingUser = this.findUser({ field: 'name', value: newUser.name, handleError: false });
		if (existingUser || newUser.balance <= 0) {
			return false;
		}
		return true;
	}


	private findUser<T extends IFindUser>({ field, value, handleError = true }: T): ReturnFindedUser<T> {
		const user = this.users.find(user => user[field] === value);
		if (handleError) {
			if (!user) throw new Error(`User "${value}" not found`);
			return user as ReturnFindedUser<T>;
		}

		return user as ReturnFindedUser<T>;
	}

	private withdrawCheck(user: IUser, ammount: number) {
		const currentBalance = user.balance;
		if (ammount <= 0 || currentBalance < ammount) throw new Error('Incorrect withdrawal amount');

		const updatedBalance = currentBalance - ammount;

		if (user.limit(ammount, currentBalance, updatedBalance)) {
			return { status: 'ok' };
		}
		throw new Error('Withdrawal operation does not meet the established limits');
	}


	// Busines logic

	public register(newUser: Omit<IUser, 'id'>) {
		if (this.isValidNewUser(newUser)) {
			const id = crypto.randomUUID();
			this.users.push({
				...newUser,
				id
			});
			return id;
		}
		throw new Error('Not a valid new user');
	}

	protected add(...[id, ammount]: EventsArgsMap[Events.Add]) {
		if (ammount <= 0) throw new Error('Incorrect deposit amount');
		const user = this.findUser({ field: 'id', value: id });
		user.balance += ammount;
		return { status: 'ok' };
	}


	protected get(...[id, callback]: EventsArgsMap[Events.Get]) {
		const user = this.findUser({ field: 'id', value: id });
		callback(user.balance);
	}

	protected withdraw(...[id, ammount]: EventsArgsMap[Events.Withdraw]) {
		const user = this.findUser({ field: 'id', value: id });
		this.withdrawCheck(user, ammount);
		user.balance -= ammount;
		return { status: 'ok' };
	}

	protected send(...[senderId, recipientId, ammount]: EventsArgsMap[Events.Send]) {
		this.withdraw(senderId, ammount);
		try {
			this.add(recipientId, ammount);
		} catch (error) {
			// if recipient does not exist, we return the money to the sender
			this.add(senderId, ammount);
			throw error;
		}
		return { status: 'ok' };
	}

	protected changeLimit(...[id, newLimit]: EventsArgsMap[Events.ChangeLimit]) {
		const user = this.findUser({ field: 'id', value: id });
		user.limit = newLimit;
	}
}


export class BankEventsEmmitter extends Bank {
	protected ee = new EventEmitter;

	constructor() {
		super();
		this.ee.on(Events.Add, this.add.bind(this));
		this.ee.on(Events.Get, this.get.bind(this));
		this.ee.on(Events.Withdraw, this.withdraw.bind(this));
		this.ee.on(Events.Send, this.send.bind(this));
		this.ee.on(Events.ChangeLimit, this.changeLimit.bind(this));

		this.ee.on('error', (error: Error) => console.log(error.message));
	}

	emit<T extends Events>(event: T, ...args: EventsArgsMap[T]) {
		try {
			this.ee.emit(event, ...args);
		} catch (error) {
			this.ee.emit('error', error);
		}
	}
}


// Usage

const bank = new BankEventsEmmitter();

// 1

const id = bank.register({
	name: 'Vasya',
	balance: 100,
	limit: (amount) => amount <= 30
});

bank.emit(Events.Add, id, 100);
bank.emit(Events.Withdraw, id, 30);


// 2

const id2 = bank.register({
	name: 'Kolya',
	balance: 100,
	limit: (amount) => amount <= 30
});


// 

bank.emit(Events.Send, id, id2, 40);	// Err: 'Withdrawal operation does not meet the established limits'
bank.emit(Events.ChangeLimit, id, (ammount, currentBalance) => ammount < 50 && currentBalance > 100);
bank.emit(Events.Send, id, id2, 40);

bank.emit(Events.Get, id, (balance) => {
	console.log(`У меня есть ${balance}`);
});

bank.emit(Events.Get, id2, (balance) => {
	console.log(`У меня есть ${balance}`);
});

