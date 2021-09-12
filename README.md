# boolean-api

A Javascript API for <https://booleans.io/>

## Example

```javascript
import { createBoolean, createToken } from "booleans.io";

// ...

let token = await createToken();
console.log(`BOOLEANS_IO_AUTH_TOKEN="${token}"`); // Save this somewhere!

// ...

let mybool = await createBoolean(token, {
	value: false,
	label: "My Special Bool",
});
console.log(`MY_BOOL_ID="${mybool.id}"`); // Save this somewhere too!

console.log(mybool.value);
await mybool.toggle();
console.log(mybool.value);
```

## Front-end usage

```javascript
import { ReadOnlyBool } from "booleans.io";
import $ from "jquery";

const MY_FEATURE_FLAG = "838e10b9-2d24-409d-ade9-6cd9f00ab0be";

async function checkFeature() {
	let flag = ReadOnlyBool(MY_FEATURE_FLAG);
	await flag.fetch();

	if (flag.value) {
		$("#epic-feature").text("YEAAHHHHH");
	} else {
		// :(
		$("#epic-feature").remove();
	}
}
```
