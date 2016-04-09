/// <reference path="typings/tsd.d.ts" />
import request = require('request-promise');

interface IBooleanResult {
	id: string;
	val: boolean;
}

function jsonPls(res: string): any {
	return JSON.parse(res);
}

function resultToCallback(res: IBooleanResult): boolean {
	return res.val;
}

const APIURL = 'https://api.booleans.io';
//const APIURL = 'http://posttestserver.com/post.php?dir=myself';

export type BooleanCallback = (result: boolean) => void;

/**
 * Utility class for accessing your remote booleans
 */
export class Boolean {
	constructor(private _id: string) {
	}

	get id(): string {
		return this._id;
	}

	/**
	 * Primary setting interface.
	 * @param value Your desired value
	 * @returns A promise confirming your set
	 */
	public set(value: boolean): Promise<boolean> {
		this.sanityCheck();
		return request({
				uri: `${APIURL}/${this.id}`,
				method: 'PUT',
				form: {
					val: value
				}
			})
			.then(jsonPls)
			.then(resultToCallback);
	}

	/**
	 * Primary getting interface
	 * @returns A promise with the boolean's value
	 */
	public get(): Promise<boolean> {
		this.sanityCheck();
		return request(`${APIURL}/${this.id}`).then(jsonPls).then(resultToCallback);
	}

	/**
	 * Easy toggle action
	 * @return A promise telling you what you just set the boolean to
	 */
	public toggle(): Promise<boolean> {
		this.sanityCheck();
		return request({
				uri: `${APIURL}/${this.id}`,
				method: 'PUT'
			})
			.then(jsonPls)
			.then(resultToCallback);
	}

	/**
	 * Deletes the remote boolean and invalidates this reference to it
	 * @return Utility promise
	 */
	public destroy(): Promise<void> {
		this.sanityCheck();
		return request({
				uri: `${APIURL}/${this.id}`,
				method: 'DELETE'
			})
			.then(() => {
				this._id = '';
			});
	}

	/**
	 * Easy shortcut for if statements
	 * @param onTrue Callback if the boolean is true
	 * @param onFalse Callback if the boolean is false
	 * @return Utility promise
	 */
	public if(onTrue: BooleanCallback, onFalse: BooleanCallback): Promise<void> {
		return this.get()
			.then((res) => {
				if (res) {
					onTrue(res);
				} else {
					onFalse(res);
				}
			});
	}

	private sanityCheck() {
		if (!this.id) {
			throw new Error("Invalid boolean!");
		}
	}
}

export function createBoolean(initialValue: boolean = false): Promise<Boolean> {
		return request({
				uri: APIURL,
				method: 'POST',
				form: {
					val: initialValue
				}
			})
		.then(jsonPls)
		.then((res: IBooleanResult) => new Boolean(res.id));
}

export default createBoolean;