import { AccountManager } from './accountManager';
import { guardian } from './guardian';
import { UI } from './ui';

export interface IUser {
	name: string;
	email: string;
	password: string;
}

// Usage

const ui = new UI({
	name: 'Enter user name',
	email: 'Enter user email',
	password: 'Enter user password'
});

const accountManager = new AccountManager();

ui.run();

const a = ui.pipe(guardian).pipe(accountManager.getInput());

