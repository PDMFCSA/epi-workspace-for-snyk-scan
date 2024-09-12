global.iframeBootLoadModules = function(){ 

	if(typeof $$.__runtimeModules["iframeBoot"] === "undefined"){
		$$.__runtimeModules["iframeBoot"] = require("opendsu/bootScripts/browser/iframeBoot");
	}

	if(typeof $$.__runtimeModules["opendsu"] === "undefined"){
		$$.__runtimeModules["opendsu"] = require("opendsu");
	}

	if(typeof $$.__runtimeModules["swarmutils"] === "undefined"){
		$$.__runtimeModules["swarmutils"] = require("swarmutils");
	}

	if(typeof $$.__runtimeModules["pskcrypto"] === "undefined"){
		$$.__runtimeModules["pskcrypto"] = require("pskcrypto");
	}

	if(typeof $$.__runtimeModules["crypto"] === "undefined"){
		$$.__runtimeModules["crypto"] = require("pskcrypto");
	}
};
if (true) {
	iframeBootLoadModules();
}
global.iframeBootRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("iframeBoot");
}
