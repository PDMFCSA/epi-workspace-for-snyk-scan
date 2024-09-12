global.versionLessBootLoadModules = function(){ 

	if(typeof $$.__runtimeModules["versionLessBoot"] === "undefined"){
		$$.__runtimeModules["versionLessBoot"] = require("opendsu/bootScripts/browser/versionless");
	}

	if(typeof $$.__runtimeModules["opendsu"] === "undefined"){
		$$.__runtimeModules["opendsu"] = require("opendsu");
	}

	if(typeof $$.__runtimeModules["fast-svd"] === "undefined"){
		$$.__runtimeModules["fast-svd"] = require("fast-svd");
	}

	if(typeof $$.__runtimeModules["pskcrypto"] === "undefined"){
		$$.__runtimeModules["pskcrypto"] = require("pskcrypto");
	}

	if(typeof $$.__runtimeModules["crypto"] === "undefined"){
		$$.__runtimeModules["crypto"] = require("pskcrypto");
	}
};
if (true) {
	versionLessBootLoadModules();
}
global.versionLessBootRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("versionLessBoot");
}
