
/**
 * Runs test scenarios to be called by the clientSrc/wallet.js files for testing the internal seedSrc code.
 * 
 * Unit testing is great, however these are to test scenarios.
 * 
 * Exports:
 *    runAllScenarioTests()
 * 
 * Tests:
 *    1) A custom module can be created inline, invoked by a user, and have the proper effects occur
 *    2) The Seed module can be created with the base world having proper data
 *    3) The Seed module can be created, with many transfers between users, ending with proper balances
 *    4) The Seed module can be created, approving balances, and sending on others behalfs
 *    5) The Seed module can be created, with users burning currency, and the total supply being affected
 *    6) The Seed module can be created, with callbacks hooked-up, which change values. The end values should match expected ones.
 *    7) The Seed module can be created, with a complex system of transfers/approvals/burning occurs, and callbacks working as intended
 *    8) The Seed module can be created, with a user forging a malcious transaction, which fails to be added
 *    9) The Seed module can be created, with a user forging history, but a transaction refutes it. After rechecking, forger is removed, and refuter is accepted
 */

const virtualMachineExporter = require("../virtualMachine/virtualMachine.js");
const moduleExporter = require("../module.js");
const seedExporter = require("../../clientSrc/modules/seed/seed.js");
const relayExporter = require("../../clientSrc/modules/relay/relay.js");
const moduleTester = require("./moduleTester.js");
const transactionExporter = require("../transaction.js");
const entanglementExporter = require("../entanglement.js");
const ledgerExporter = require("../ledger.js");
const messagingExporter = require("../messaging.js");
const squasherExporter = require("../squasher.js");

module.exports = {
    runAllScenarioTests : function(verbose, log) {
        console.info("#### Running All Unit Tests");

        // For each scenario to test, run the test
        for(let i = 0; i < Object.keys(scenarioTests).length; i++) {
            let scenarioTestName = Object.keys(scenarioTests)[i];
            let scenarioTest = scenarioTests[scenarioTestName];
            log("### Running Scenario Test " + scenarioTestName);
            // Clear Entanglement/Blockchain/Ledger
            let result = scenarioTest(log);
            result.endTest();
        }
        // Clear Entanglement/Blockchain/Ledger

    }
 }

 let scenarioTests = {
     /**
      * 1) A custom module can be created inline, invoked by a user, and have the proper effects occur
      */
     InlineModule_SuccessfullyCreated : function(log) {
         let tester = moduleTester.beginTest("Inline", "User1");
         // Get VM
         // Create Module with a "MoveLeft", "getX"
         // Invoke Constructor with wall's x/y placement at (-3, 0)
         // Assert Wall is at (-3,0)
         // Assert User is at (0,0)
         // Invoke MoveLeft
         // Assert User is at (-1,0)
         // Invoke MoveLeft
         // Assert User is at (-2,0)
         // Invoke MoveLeft
         // Assert User is still at (-2,0)
         // Assert Wall is still at (-3,0)
         tester.assertExpression(false, "NOT IMPLEMENTED");
         return tester;
        /**
            let vm = virtualMachineExporter.getVirtualMachine();
            vm.addModule(moduleExporter.createModule({
                module : "Game", 
                initialData : { walls : [[1, 1, 1], [0, 0, 0], [0, 0, 0]] },
                initialUserData : { x : 2, y : 1 },
                functions : {
                    moveLeft : function(container, changeContext) {
                        let gameData = container.getModuleData();
                        let userData = container.getSenderData();
                        let walls = gameData["walls"];
                        if (walls[userData.x - 1][userData.y] == 0) {
                            changeContext.subtract(1, { user : container.sender, key : "x" });
                        }
                        return changeContext;
                    },
                    getX : function(container) {
                        return container.getSenderData().x;
                    },
                    getY : function(container) {
                        return container.getSenderData().y;
                    },
                    moveRightDependantLocal : function(container, changeContext) {
                        let userX = container.getter({function : "getX"}, changeContext);
                        if (container.getModuleData()["walls"][userX + 1][container.getSenderData().y] == 0) {
                            changeContext.add(1, { user : container.sender, key : "x" });
                        }
                        return changeContext;
                    },
                    moveRightDependantGlobal : function(container, changeContext) {
                        let userX = container.getter({function : "getX"}, changeContext);
                        let isGlobalStateTrue = container.getter({ module : "Reliant", function : "doesMatchState", args : { state : "ThisIsTheState" } }, changeContext);
                        if (isGlobalStateTrue && container.getModuleData()["walls"][userX + 1][container.getSenderData().y] == 0) {
                            changeContext.add(1, { user : container.sender, key : "x" });
                        }
                        return changeContext;
                    },
                    moveUpThenLeft : function(container, changeContext) {
                        let userData = container.getSenderData();
                        if (container.getModuleData()["walls"][userData.x][userData.y + 1] == 0) {
                            changeContext.add(1, { user : container.sender, key : "y" });
                        }
                        container.invoke({ function : "moveLeft" }, changeContext);
                        return changeContext;
                    }
                }
            }));

            vm.addModule(moduleExporter.createModule({
                module : "Reliant",
                initialData : { state : "ThisIsTheState" },
                initialUserData : {},
                functions : {
                    doesMatchState : function(container) {
                        return container.getModuleData().state == container.args.state;
                    }
                }
            }));

            let tester = moduleTester.beginTest("Game", "ABC");
            
            tester.assertEqual("getX", {}, 2, "ABC should start as x position 2");
            tester.invoke("moveLeft");
            tester.assertEqual("getX", {}, 1, "ABC should have x of 1 after moving left");
            tester.invoke("moveLeft");
            tester.assertEqual("getX", {}, 1, "ABC should have x of 1 after moving left again cause they hit wall at 1");
            tester.invoke("moveRightDependantLocal");
            tester.assertEqual("getX", {}, 2, "ABC should have x of 2 after moving right");
            tester.invoke("moveLeft");
            tester.assertEqual("getX", {}, 1, "Move back to 1 so we can move right");
            tester.invoke("moveRightDependantGlobal");
            tester.assertEqual("getX", {}, 2, "ABC should have x of 2 after moving right");
            tester.invoke("moveUpThenLeft");
            tester.assertEqual("getY", {}, 2, "ABC should have y of 2 after moving up");
            tester.assertEqual("getX", {}, 1, "ABC should have x of 1 after moving left");

            tester.endTest();
         */
     },
     /**
      * 2) The Seed module can be created with the base world having proper data
      */
     SeedModule_SuccessfullyCreated : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        // Get Seed Module
        // Get VM
        // Add Seed to VM
        // Invoke Constuctor
        // Assert "SEED" is Seed.symbol
        // Assert 4 is Seed.decimals
        // Assert 1000 is Seed.totalSupply
        // Assert owner has the starting 1000 SEED
        tester.assertExpression(false, "NOT IMPLEMENTED");
        return tester;
     },
     /**
      * 3) The Seed module can be created, with many transfers between users, ending with proper balances
      */
     SeedModule_TransfersBetweenUsers : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        // Get Seed Module
        // Get VM
        // Add Seed to VM
        // Invoke Constuctor
        // User1 sends 500 Seed to User2
        // Assert User1 has 500, User2 has 500
        // User1 sends 250 Seed to User3
        // Assert User1 has 250, User3 has 250
        // User1 sends 250 Seed to User4
        // Assert User1 has 0, User4 has 250
        // User1 tries to send 50 Seed to User5, however fails
        // Assert User1 has 0, User5 has 0 (or undefined)
        // User2 sends 50 to User3
        // Assert User2 has 450, User3 has 300
        // User3 sends 150 to User5
        // Assert User3 has 150, User5 has 150
        // User3 tries to send 200 Seed to User5, however fails
        // Assert User3 has 150, User5 has 150
        // User3 tries to send 150 to User5
        // Assert User3 has 0, User5 has 300
        tester.assertExpression(false, "NOT IMPLEMENTED");
        return tester;
     },
     /**
      * 4) The Seed module can be created, approving balances, and sending on others behalfs
      */
     SeedModule_ApprovingAllowancesAndTransferingThem : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        // Get Seed Module
        // Get VM
        // Add Seed to VM
        // Invoke Constuctor
        // User1 approves User2 to send 200 Seed
        // Assert User1 has an allowance to User2 of 200 Seed
        // User2 sends 100 Seed from User1 to User3
        // Assert User1 has 900 Seed, User1 has an allowance to User2 of 100 Seed, and User3 has 100 Seed
        // User2 sends 100 Seed from User1 to User2
        // Assert User1 has 800 Seed, User1 has an allowance to User2 of 0 Seed, and User2 has 100 Seed
        // User2 tries to send 100 Seed from User1 to User2, however fails
        // Assert User1 still has 800 Seed, User2 still has 100 Seed, and the allowance is still 0
        tester.assertExpression(false, "NOT IMPLEMENTED");
        return tester;
     },
    /**
     * 5) The Seed module can be created, with users burning currency, and the total supply being affected
     */
    SeedModule_BurningCurrency : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        // Get Seed Module
        // Get VM
        // Add Seed to VM
        // Invoke Constuctor
        // Assert User1 has 1000 Seed
        // Assert the totalSupply is 1000
        // User1 burns 150 Seed
        // Assert User1 has 850 Seed
        // Assert the totalSupply is 850 Seed
        // User1 transfers 100 Seed to User2
        // Assert User1 has 750 Seed and User2 has 100 Seed
        // User2 burns 25 Seed
        // Assert User1 has 750, User2 has 75, and the totalSupply is 825
        tester.assertExpression(false, "NOT IMPLEMENTED");
        return tester;
    },
    /**
     * 6) The Seed module can be created, with callbacks hooked-up, which change values. The end values should match expected ones.
     */
    SeedModule_AppSubscriptionCallbacks : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        // Get Seed Module
        // Get VM
        // Add Seed to VM
        // Invoke Constuctor
        // Subscribe for Seed."totalSupply" changing
        // Subscribe for Seed.User1."balance" changing
        // Subscribe for Seed.burn invoking
        // Assert totalSupply is 1000
        // Assert User1 has 1000
        // User1 sends 50 Seed to User2
        // Assert subscribed changed "user1Loss" to 50
        // User1 burns 25
        // Assert subscribed changed "user1Loss" to 75
        // Assert subscribed changed "totalSupplyLoss" to 25
        // Assert subscribed changed "burned" to 25
        // Assert User1 has 925
        // Assert totalSupply has 975
        tester.assertExpression(false, "NOT IMPLEMENTED");
        return tester;
    },
    /**
     * 7) The Seed module can be created, with a complex system of transfers/approvals/burning occurs, and callbacks working as intended
     */
    SeedModule_ComplexScenario_TransfersAllowancesBurningAndSubscriptions : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        // Get Seed Module
        // Get VM
        // Add Seed to VM
        // Invoke Constuctor
        tester.assertExpression(false, "NOT IMPLEMENTED");
        /**
            console.log("### Seed Scenario Setup Test ###");
            let tester = moduleTester.beginTest("Seed", "ABC", true);
            tester.relay();
            tester.relay();
            tester.assertEqual("getBalanceOf", { owner : tester.getAccount("ABC") }, 1000, "Creator should start with 1000 SEED");
            tester.assertEqual("getSymbol", {}, "SEED", "The symbol of Seed should be \"SEED\"");
            tester.assertEqual("getDecimals", {}, 4, "Seed should have 4 decimal points");
            tester.assertEqual("getTotalSupply", {}, 1000, "1000 SEED should be in circulation upon creation");
            tester.assertEqual("getAllowance", { owner : tester.getAccount("ABC"), spender : tester.getAccount("DEF") }, undefined, "Get allowance is unset for user who has never used Seed before" );

            tester.switchUser("ABC");
            tester.createTransactionWithRelay("approve", { spender : tester.getAccount("DEF"), value : 250 });
            tester.relay();

            tester.switchUser("DEF");
            tester.createTransactionWithRelay("transferFrom", { from : tester.getAccount("ABC"), to : tester.getAccount("DEF"), value : 100 });
            tester.createTransactionWithRelay("transferFrom", { from : tester.getAccount("ABC"), to : tester.getAccount("GHI"), value : 100 });
            tester.relay();
            tester.relay();
            tester.assertEqual("getBalanceOf", { owner : tester.getAccount("ABC") }, 800, "Owner should still have 800 SEED");
            tester.assertEqual("getBalanceOf", { owner : tester.getAccount("DEF") }, 100, "DEF sent 100 SEED to himself");
            tester.assertEqual("getBalanceOf", { owner : tester.getAccount("GHI") }, 100, "GHI received 100 SEED from DEF on ABC's behalf");

            tester.switchUser("GHI");
            tester.createTransactionWithRelay("transfer", { to : tester.getAccount("ABC"), value : 50 });
            tester.relay();
            tester.relay();
            tester.assertEqual("getBalanceOf", { owner : tester.getAccount("ABC") }, 850, "ABC should have received 50 from GHI");

            tester.switchUser("DEF");
            tester.createTransactionWithRelay("burn", { value : 25 });
            tester.relay();
            tester.relay();
            tester.assertEqual("getBalanceOf", { owner : tester.getAccount("DEF") }, 75, "DEF should have 75 after burning 25, removing it from circulation");
            tester.assertEqual("getTotalSupply", {}, 975, "25 coins were burned, removed from circulation, since initial 1000 creation");

            //squasherExporter.transactionsToBlock(Object.values(entanglementExporter.getEntanglement().transactions));

            tester.endTest();
         */
        return tester;
    },
    /**
     * 8) The Seed module can be created, with a user forging a malcious transaction, which fails to be added
     */
    SeedSystem_ForgingMaliciousTransactionsFailToBeAccepted : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        // Get Seed Module
        // Get VM
        // Add Seed to VM
        // Invoke Constuctor
        // Do some legit transactions
        // User2 tries to create a "forged" transaction which modifies data after creation, fails
        // Assert the forgery changed nothing
        // User2 tries to create a "forged" transaction which modified data, then rehashes/signs it, fails
        // Assert the forgery changed nothing
        // Do something legit
        // Assert legit thing happened still
        tester.assertExpression(false, "NOT IMPLEMENTED");
        return tester;
    },
    /**
     * 9) The Seed module can be created, with a user forging history, but a transaction refutes it. After rechecking, forger is removed, and refuter is accepted
     */
    SeedSystem_ForgedHistoryCanBeRefutedAndRepaired : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        // Get Seed Module
        // Get VM
        // Add Seed to VM
        // Invoke Constuctor
        // Do some legit transactions
        // Modify a transaction currently in entanglement
        // Create a transaction whcih refutes the forged transaction
        // Assert the refuter stayed with refutee being removed
        // Assert the refuter's data changed the ledger
        // Assert the refutee's data did not change the ledger
        tester.assertExpression(false, "NOT IMPLEMENTED");
        return tester;
    }
 }