global.testsRuntimeLoadModules = function(){ 

	if(typeof $$.__runtimeModules["overwrite-require"] === "undefined"){
		$$.__runtimeModules["overwrite-require"] = require("overwrite-require");
	}

	if(typeof $$.__runtimeModules["opendsu"] === "undefined"){
		$$.__runtimeModules["opendsu"] = require("opendsu");
	}

	if(typeof $$.__runtimeModules["acl-magic"] === "undefined"){
		$$.__runtimeModules["acl-magic"] = require("acl-magic");
	}

	if(typeof $$.__runtimeModules["cloud-enclave"] === "undefined"){
		$$.__runtimeModules["cloud-enclave"] = require("cloud-enclave");
	}

	if(typeof $$.__runtimeModules["fast-svd"] === "undefined"){
		$$.__runtimeModules["fast-svd"] = require("fast-svd");
	}

	if(typeof $$.__runtimeModules["pskcrypto"] === "undefined"){
		$$.__runtimeModules["pskcrypto"] = require("pskcrypto");
	}

	if(typeof $$.__runtimeModules["psk-cache"] === "undefined"){
		$$.__runtimeModules["psk-cache"] = require("psk-cache");
	}

	if(typeof $$.__runtimeModules["double-check"] === "undefined"){
		$$.__runtimeModules["double-check"] = require("double-check");
	}

	if(typeof $$.__runtimeModules["swarmutils"] === "undefined"){
		$$.__runtimeModules["swarmutils"] = require("swarmutils");
	}

	if(typeof $$.__runtimeModules["queue"] === "undefined"){
		$$.__runtimeModules["queue"] = require("queue");
	}

	if(typeof $$.__runtimeModules["soundpubsub"] === "undefined"){
		$$.__runtimeModules["soundpubsub"] = require("soundpubsub");
	}

	if(typeof $$.__runtimeModules["key-ssi-resolver"] === "undefined"){
		$$.__runtimeModules["key-ssi-resolver"] = require("key-ssi-resolver");
	}

	if(typeof $$.__runtimeModules["buffer-crc32"] === "undefined"){
		$$.__runtimeModules["buffer-crc32"] = require("buffer-crc32");
	}

	if(typeof $$.__runtimeModules["bar"] === "undefined"){
		$$.__runtimeModules["bar"] = require("bar");
	}

	if(typeof $$.__runtimeModules["bar-fs-adapter"] === "undefined"){
		$$.__runtimeModules["bar-fs-adapter"] = require("bar-fs-adapter");
	}

	if(typeof $$.__runtimeModules["syndicate"] === "undefined"){
		$$.__runtimeModules["syndicate"] = require("syndicate");
	}

	if(typeof $$.__runtimeModules["apihub"] === "undefined"){
		$$.__runtimeModules["apihub"] = require("apihub");
	}

	if(typeof $$.__runtimeModules["loki-enclave-facade"] === "undefined"){
		$$.__runtimeModules["loki-enclave-facade"] = require("loki-enclave-facade");
	}
};
if (false) {
	testsRuntimeLoadModules();
}
global.testsRuntimeRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("testsRuntime");
}
