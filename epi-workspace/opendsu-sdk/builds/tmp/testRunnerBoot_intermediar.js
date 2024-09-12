global.testRunnerBootLoadModules = function(){ 

	if(typeof $$.__runtimeModules["overwrite-require"] === "undefined"){
		$$.__runtimeModules["overwrite-require"] = require("overwrite-require");
	}

	if(typeof $$.__runtimeModules["swarmutils"] === "undefined"){
		$$.__runtimeModules["swarmutils"] = require("swarmutils");
	}
};
if (false) {
	testRunnerBootLoadModules();
}
global.testRunnerBootRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("testRunnerBoot");
}
