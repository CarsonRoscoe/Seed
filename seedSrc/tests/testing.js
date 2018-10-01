module.exports = {
    runAllTests : function(verbose) {
        // Function used for logging internally in tests
        let log = function(param1, param2, param3) {
            if (verbose) {
                if (!param3) {
                    if (!param2) {
                        if (param1) {
                            console.log(param1);
                        }
                    } else {
                        console.info(param1, param2);
                    }
                } else {
                    console.info(param1, param2, param3);
                }
            }
        }

        unitTestingExporter.runAllUnitTests(verbose, log);
        setTimeout(() => {
            scenarioTestingExporter.runAllScenarioTests(verbose, log);
        }, 2000);
    }
}

const unitTestingExporter = require("./unitTesting.js");
const scenarioTestingExporter = require("./scenarioTesting.js");