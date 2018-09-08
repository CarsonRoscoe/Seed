/******************
 * unitTesting.js *
 ******************
 * 
 * Exports functions related to running unit tests or creating unit tests.
 * 
 */

module.exports = {
    /**
     * Runs all modules for unit tests which are hard-coded into this function for loading.
     * Modules to test are expected to have a "runUnitTests(verbose)" function available, which
     * returns a test result object of type { fails : array, passes : number }
     * 
     * @param verbose - Whether to write extra debug lines or not
     */
    runAllUnitTests : function(verbose) {
        console.info("#### Running All Unit Tests");

        let subsystemUnitTests = [
            require("../helpers/cryptoHelper.js").getUnitTests()
        ];

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

        let test = new Test(verbose);

        for(let i = 0; i < subsystemUnitTests.length; i++) {
            let unitTests = subsystemUnitTests[i];
            runBundledTests(test, unitTests, verbose, log);
        }

        console.info("#### Tests Complete");
        test.logState();
    }
}



let runBundledTests = function(test, unitTests, verbose, log) {
    let keys = Object.keys(unitTests);
    for(let i = 0; i < keys.length; i++) {
        let unitTestName = keys[i];
        log("## Running Unit Test " + unitTestName);
        unitTests[unitTestName](test, verbose, log);
    }
}

/**
 * A class which helps determine whether a Test fails or passes the tests, preparing which
 * ones failed in a list of error messages.
 */
class Test {
    /**
     * Creates the Test to be of type { passes : number, fails : array }
     * @param verbose - A flag to be set for whether to debug all lines
     */
    constructor(verbose) {
        this.passes = 0;
        this.fails = [];
        this.verbose = verbose;
    }

    /**
     * If the expression is true, this is a pass. Otherwise, add the fail message to the fails array
     * 
     * @param {*} expression - Expression we check for true or false
     * @param {*} failMessage - Error emssage to display on fail
     */
    assert(expression, failMessage) {
        if (expression) {
            this.passes++;
        } else {
            this.fails.push(failMessage);
        }
    }

    /**
     * If the first two parameters are equivalent by the double-equals tandard, this is a pass. Otherwise, add the fail message to the fails array
     * 
     * @param {*} expression - Expression we check for true or false
     * @param {*} failMessage - Error emssage to display on fail
     */
    assertAreEqual(obj1, obj2, failMessage) {
        this.assert(obj1 == obj2, failMessage);
    }

    /**
     * If the first two parameters are strictly equivalent, this is a pass. Otherwise, add the fail message to the fails array
     * 
     * @param {*} expression - Expression we check for true or false
     * @param {*} failMessage - Error emssage to display on fail
     */
    assertAreEqualStrict(obj1, obj2, failMessage) {
        this.assert(obj1 === obj2, failMessage);
    }

    /**
     * If the function throws an error, the test passed as it was expected. Otherwise, add the fail message to the fails array
     * 
     * @param {*} expression - Expression we check for true or false
     * @param {*} failMessage - Error emssage to display on fail
     */
    assertFail(failFunction, failMessage) {
        try {
            failFunction();
        } catch(e) {
            this.passes++;
            return;
        }
        this.fails.push(failMessage);
    }

    /**
     * Logs the unit tests based on the current state
     */
    logState() {
        let failed = this.fails.length > 0;
        let passed = this.fails.length == 0 && this.passes > 1;
        let totalUnitTests = this.fails.length + this.passes;

        if (passed) {
            console.log("## Passed All " + totalUnitTests + " Unit Tests");
        } else if (failed) {
            console.log("## Unit Tests failed");
            console.log("## Passed " + this.passes + " / " + totalUnitTests + " Unit Tests");
            console.log("## Failed Tests...");
            for(let i = 0; i < this.fails.length; i++) {
                console.info("# " + (i+1) + ":", this.fails[i]);
            }

        } else {
            console.info("## No Tests Were Ran");
        }
    }
}