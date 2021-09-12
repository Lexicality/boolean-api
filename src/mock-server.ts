/*
   Copyright 2020 Lex Robinson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
import { rest, RestRequest } from "msw";
import { setupServer } from "msw/node";
import { URL } from "url";
import { IBoolean, IBooleanInit } from "./types";

const API_URL = "https://api.booleans.io/";

function url(path: TemplateStringsArray): string {
	// https://github.com/mswjs/msw/pull/406#issuecomment-708519619 🙄
	let url = new URL(API_URL);
	url.pathname = path[0];
	return url.toString();
}

function getDate() {
	return new Date().toISOString();
}

let lastID = 0;

function getID(): string {
	lastID++;
	return lastID.toFixed(0);
}

function checkAuth(req: RestRequest) {
	if (
		!req.headers.has("Authorization") ||
		!req.headers.get("Authorization").startsWith("Token ")
	) {
		throw new Error("Request must be authenticated!");
	}
}

let bools = new Map<string, IBoolean>();

function getBool(id: string): IBoolean {
	if (!bools.has(id)) {
		throw new Error(`Unknown bool ${id}!`);
	}
	return bools.get(id);
}

interface BoolParams {
	id: string;
}

export const server = setupServer(
	rest.post(url`/tokens`, (req, res, ctx) =>
		res(ctx.json({ token: getID() })),
	),
	rest.post<IBooleanInit>(url`/`, (req, res, ctx) => {
		let id = getID();
		let now = getDate();
		let { value, label } = req.body;
		if (typeof value != "boolean") {
			value = false;
		}
		if (typeof label != "string") {
			label = null;
		}
		let bool: IBoolean = {
			id,
			value,
			label,
			created_at: now,
			updated_at: now,
		};
		bools.set(id, bool);
		return res(ctx.json(bool));
	}),
	rest.get(url`/`, (req, res, ctx) => {
		checkAuth(req);
		res(ctx.json(Array.from(bools.values())));
	}),
	rest.get<any, any, BoolParams>(url`/:id`, (req, res, ctx) => {
		return res(ctx.json(getBool(req.params.id)));
	}),
	rest.patch<IBooleanInit, any, BoolParams>(url`/:id`, (req, res, ctx) => {
		checkAuth(req);
		let { value, label } = req.body;
		let bool = getBool(req.params.id);
		if (typeof value == "boolean") {
			bool.value = value;
		}
		if (typeof label == "string") {
			bool.label = label;
		}
		bool.updated_at = getDate();
		bools.set(bool.id, bool);
		return res(ctx.json(bool));
	}),
	rest.delete<any, any, BoolParams>(url`/:id`, (req, res, ctx) => {
		checkAuth(req);
		let bool = getBool(req.params.id);
		bools.delete(bool.id);
		return res(ctx.status(204));
	}),
);

export function resetStorage() {
	lastID = 0;
	bools.clear();
}
