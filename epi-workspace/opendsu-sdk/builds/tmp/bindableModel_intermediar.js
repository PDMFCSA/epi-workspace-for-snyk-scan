global.bindableModelLoadModules = function(){ 

	if(typeof $$.__runtimeModules["overwrite-require"] === "undefined"){
		$$.__runtimeModules["overwrite-require"] = require("overwrite-require");
	}

	if(typeof $$.__runtimeModules["queue"] === "undefined"){
		$$.__runtimeModules["queue"] = require("queue");
	}

	if(typeof $$.__runtimeModules["soundpubsub"] === "undefined"){
		$$.__runtimeModules["soundpubsub"] = require("soundpubsub");
	}

	if(typeof $$.__runtimeModules["psk-bindable-model"] === "undefined"){
		$$.__runtimeModules["psk-bindable-model"] = require("psk-bindable-model");
	}
};
if (false) {
	bindableModelLoadModules();
}
global.bindableModelRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("bindableModel");
}
