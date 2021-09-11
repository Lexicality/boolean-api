# boolean-api

A nodeJS API for <https://booleans.io/> with ES6 and promise support!

## Usage

```javascript
import { createBoolean } from "booleans.io";

let mybool = createBoolean(false);

mybool.get().then(alert);
```

## Advanced usage

```javascript
import { Boolean } from "booleans.io";
import $ from "jquery";

let featureflag = Boolean("50741f52-9b64-4ee1-a2d6-67ee1a60807c");

mybool.if(
	() => {
		$("#epic-feature").text("YEAAHHHHH");
	},
	() => {
		// :(
		$("#epic-feature").remove();
	},
);
```

## Typescript Support

```javascript
/// <reference path="../node_modules/booleans.io/index.d.ts" />
import createBoolean = require('booleans.io');
var myBool: Boolean = createBoolean(true);

myBool.set(false);
```

## API

-   `Get()`
-   `Set(bool)`
-   `Toggle()`
-   `Destroy()`
-   `If(callback, callback)`
