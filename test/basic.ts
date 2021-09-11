/*
   Copyright 2016 Lex Robinson

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
import { Boolean, createBoolean } from "../index";
import sinon = require("sinon");
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import sinonChai = require("sinon-chai");

chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();
const { expect } = chai;

describe("construction", () => {
	it("aaa", () => {
		let newBool = createBoolean(true);

		return Promise.all([
			newBool.should.be.fulfilled,
			newBool.should.eventually.have.property("id"),
			newBool.then((bool) => bool.destroy()).should.be.fulfilled,
		]);
	});
});

describe("Basic Operations", () => {
	let bool: Boolean = null;
	const initialValue = true;

	beforeEach(() =>
		createBoolean(initialValue).then((newBool) => (bool = newBool)),
	);
	afterEach(() => {
		try {
			return bool.destroy();
		} catch (e) {
			// pass
		}
		return undefined;
	});

	it("gettage", () => {
		expect(bool).to.not.be.null;
		return bool.get().should.eventually.equal(initialValue);
	});

	it("Setting", () => {
		expect(bool).to.not.be.null;
		const value = !initialValue;
		return bool.set(value).should.eventually.equal(value);
	});

	it("Toggling", () => {
		expect(bool).to.not.be.null;
		return bool.toggle().should.eventually.equal(!initialValue);
	});

	it("Destruction", () => {
		expect(bool).to.not.be.null;

		const firstDestroy = bool.destroy();
		const secondDestroy = firstDestroy.then(() => bool.destroy());

		return Promise.all([
			firstDestroy.should.be.fulfilled,
			secondDestroy.should.be.rejected,
		]);
	});

	describe("iffage", () => {
		let onTrue: sinon.SinonSpy, onFalse: sinon.SinonSpy;
		beforeEach(() => {
			onTrue = sinon.spy();
			onFalse = sinon.spy();
		});

		it("works on true", () => {
			return bool
				.set(true)
				.then(() => bool.if(onTrue, onFalse))
				.then(() => {
					onTrue.should.have.been.called;
					onFalse.should.not.have.been.called;
				});
		});

		it("works on false", () => {
			return bool
				.set(false)
				.then(() => bool.if(onTrue, onFalse))
				.then(() => {
					onTrue.should.not.have.been.called;
					onFalse.should.have.been.called;
				});
		});
	});
});
