global.loaderBootLoadModules = function(){ 

	if(typeof $$.__runtimeModules["overwrite-require"] === "undefined"){
		$$.__runtimeModules["overwrite-require"] = require("overwrite-require");
	}

	if(typeof $$.__runtimeModules["opendsu"] === "undefined"){
		$$.__runtimeModules["opendsu"] = require("opendsu");
	}
};
if (true) {
	loaderBootLoadModules();
}
global.loaderBootRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("loaderBoot");
}
