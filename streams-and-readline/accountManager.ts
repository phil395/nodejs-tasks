import { Writable } from "stream";
import { IUser } from ".";
import { DB } from "./db";

export class AccountManager {
	private db = new DB;
	private ws = new Writable({
		objectMode: true,
		write: (user: IUser, encoding, next) => {
			this.newUserHandler(user);
			next();
		}
	});

	getInput() {
		return this.ws;
	}

	private newUserHandler(user: IUser) {
		const id = this.db.addUser(user);
		this.printMsg(`Created new user with id: ${id}`);
	}

	private printMsg(msg: string) {
		console.log(msg);
	}
}

