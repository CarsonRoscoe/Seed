
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
 *    6) The Seed module can be created, with a complex system of transfers/approvals/burning occurs, and callbacks working as intended
 *    7) The Seed module can be created, with a user forging a malcious transaction, which fails to be added
 *    8) The Seed module can be created, with a user forging history, but a transaction refutes it. After rechecking, forger is removed, and refuter is accepted
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
const blockchainExporter = require("../blockchain.js");

module.exports = {
    runAllScenarioTests : function(verbose, log) {
        console.info("#### Running All Unit Tests");

        // For each scenario to test, run the test
        for(let i = 0; i < Object.keys(scenarioTests).length; i++) {
            let scenarioTestName = Object.keys(scenarioTests)[i];
            let scenarioTest = scenarioTests[scenarioTestName];
            log("### Running Scenario Test " + scenarioTestName);
            entanglementExporter.clearAll();
            blockchainExporter.clearAll();
            ledgerExporter.clearAll();
            messagingExporter.clearAll();
            let result = scenarioTest(log);
            result.endTest();
        }
        entanglementExporter.clearAll();
        blockchainExporter.clearAll();
        ledgerExporter.clearAll();
        messagingExporter.clearAll();
    }
 }

 let scenarioTests = {
     /**
      * 1) A custom module can be created inline, invoked by a user, and have the proper effects occur
      */
     InlineModule_SuccessfullyCreated : function(log) {
         let vm = virtualMachineExporter.getVirtualMachine();
         let tester = moduleTester.beginTest("Inline", "User1");

         vm.addModule(relayExporter.getModule());

         log("Creating a inline module which has a wall users cannot walk into. Users can walk left until they hit a wall.");
         vm.addModule(moduleExporter.createModule({
            module : "Inline", 
            initialData : { walls : { "-3" : { 0 : true } } }, // Only wall is at (-3,0)
            initialUserData : { x : 0, y : 0 }, // Users start at (0,0)
            functions : {
                moveLeft : function(container, changeContext) {
                    let gameData = container.getModuleData();
                    let userData = container.getSenderData();
                    let walls = gameData["walls"];
                    // If there is a wall to our users left, we cannot move left
                    if (walls[userData.x - 1] && walls[userData.x - 1][userData.y]) {
                        return changeContext;
                    }
                    // Subtract 1 from the user's X to move left
                    changeContext.subtract(1, { user : container.sender, key : "x" });
                    return changeContext;
                },
                getX : function(container) {
                    return container.getSenderData().x;
                },
                getY : function(container) {
                    return container.getSenderData().y;
                },
                hasWall : function(container) {
                    let walls = container.getModuleData()["walls"];
                    return (walls[container.args.x] && walls[container.args.x][container.args.y]); 
                }
            }
        }));


        log("Starting a user at (0,0) with a wall at (-3,0)");
        tester.assertEqual("getX", {}, 0, "User1 should start at an X position of 0");
        tester.assertEqual("getY", {}, 0, "User1 should start at an Y position of 0");
        tester.assertEqual("hasWall", { x : -3, y : 0 }, true, "Wall should have been created at position (-3,0)");
        log("Moving the user left to (-1,0)");
        tester.createTransaction("moveLeft", {});
        tester.assertEqual("getX", {}, -1, "User1 should have a X position of -1 after moving left");
        tester.assertEqual("getY", {}, 0, "User1 still be at a Y position of 0");
        log("Moving the user left to (-2,0)");
        tester.createTransaction("moveLeft", {});
        tester.assertEqual("getX", {}, -2, "User1 should have a X position of -2 after moving left");
        tester.assertEqual("getY", {}, 0, "User1 still be at a Y position of 0");
        log("Trying to move user left to (-3,0), however a wall is in the way");
        tester.createTransaction("moveLeft", {});
        tester.assertEqual("getX", {}, -2, "User1 should not have been able to move left as a wall was in -3");
        tester.assertEqual("getY", {}, 0, "User1 still be at a Y position of 0");
        tester.assertEqual("hasWall", { x : -3, y : 0 }, true, "Wall should be in original starting position");
        log("Confirming users could not walk into the wall, and were stuck at (-2,0)");
         return tester;
     },
     /**
      * 2) The Seed module can be created with the base world having proper data
      */
     SeedModule_SuccessfullyCreated : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        let vm = virtualMachineExporter.getVirtualMachine();
        vm.addModule(relayExporter.getModule());
        log("Loading Seed Module");
        vm.addModule(seedExporter.getModule());
        log("Invoking Seed Constructor");
        tester.createTransaction("constructor", { initialSeed : 1000 });
        log("Asserting Seed's data was loaded (Symbol was \"SEED\", goes to fourth decimal place, defaulted to 1000 SEED");
        tester.assertEqual("getSymbol", {}, "SEED", "The symbol of Seed should be \"SEED\"");
        tester.assertEqual("getDecimals", {}, 4, "Seed should have 4 decimal points");
        tester.assertEqual("getTotalSupply", {}, 1000, "1000 SEED should be in circulation upon creation");
        log("Asserting the initial 1000 SEED supply went to the creator")
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 1000, "Creator should start with 1000 SEED");
        return tester;
     },
     /**
      * 3) The Seed module can be created, with many transfers between users, ending with proper balances
      */
     SeedModule_TransfersBetweenUsers : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        let vm = virtualMachineExporter.getVirtualMachine();
        vm.addModule(relayExporter.getModule());
        log("Loading Seed Module");
        vm.addModule(seedExporter.getModule());
        log("Invoking Seed Constructor");
        tester.createTransaction("constructor", { initialSeed : 1000 });
        log("Asserting the initial supply was 1000 SEED, and it all went to User1");
        tester.assertEqual("getTotalSupply", {}, 1000, "1000 SEED should be in circulation upon creation");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 1000, "Creator should start with 1000 SEED");
        
        log("User1 sends 500 Seed to User2");
        tester.createTransaction("transfer", { to : tester.getAccount("User2"), value : 500 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 500, "Creator shoud have 500 SEED after sending 500");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User2") }, 500, "User2 should have 500 SEED after receiving it");

        log("User1 sends 250 Seed to User3");
        tester.createTransaction("transfer", { to : tester.getAccount("User3"), value : 250 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 250, "Creator shoud have 250 SEED after sending 500+250");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User3") }, 250, "User3 should have 250 SEED after receiving it");

        log("User1 sends 250 Seed to User4");
        tester.createTransaction("transfer", { to : tester.getAccount("User4"), value : 250 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 0, "Creator shoud have 0 SEED after sending 500+250+250");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User4") }, 250, "User4 should have 250 SEED after receiving it");

        log("User1 tries to send 50 Seed to User4, however fails as they ran out");
        tester.createTransaction("transfer", { to : tester.getAccount("User4"), value : 50 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 0, "Creator shoud have 0 SEED still cause none sent");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User4") }, 250, "User4 should still have 250 SEED as they did not receive any more");

        tester.switchUser("User2");
        log("User2 sends 50 to User3");
        tester.createTransaction("transfer", { to : tester.getAccount("User3"), value : 50 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User2") }, 450, "User2 should have 450 SEED 500-50");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User3") }, 300, "User3 should have 300 SEED as 250+50");

        tester.switchUser("User3");
        log("User3 sends 150 to User5");
        tester.createTransaction("transfer", { to : tester.getAccount("User5"), value : 150 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User3") }, 150, "User3 should have 150 SEED as 300-150");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User5") }, 150, "User5 should have received 150 SEED");

        log("User3 tries to send 200 Seed to User5, however fails as they have insufficient funds");
        // Assert User3 has 150, User5 has 150
        tester.createTransaction("transfer", { to : tester.getAccount("User5"), value : 200 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User3") }, 150, "User3 should not have sent any SEED");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User5") }, 150, "User5 should not have received any SEED");

        log("User3 sends 150 to User5");
        // Assert User3 has 0, User5 has 300
        tester.createTransaction("transfer", { to : tester.getAccount("User5"), value : 150 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User3") }, 0, "User3 should have sent the last of their SEED");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User5") }, 300, "User5 should have received another 150 SEED (150+150)");
        
        return tester;
     },
     /**
      * 4) The Seed module can be created, approving balances, and sending on others behalfs
      */
     SeedModule_ApprovingAllowancesAndTransferingThem : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        let vm = virtualMachineExporter.getVirtualMachine();
        vm.addModule(relayExporter.getModule());
        log("Loading Seed Module");
        vm.addModule(seedExporter.getModule());
        log("Invoking Seed Constructor");
        tester.createTransaction("constructor", { initialSeed : 1000 });
        log("Asserting the initial supply was 1000 SEED, and it all went to User1");
        tester.assertEqual("getTotalSupply", {}, 1000, "1000 SEED should be in circulation upon creation");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 1000, "Creator should start with 1000 SEED");
        log("User1 approves User2 to send 200 Seed");
        tester.createTransaction("approve", { spender : tester.getAccount("User2"), value : 200 });
        tester.assertEqual("getAllowance", { owner : tester.getAccount("User1"), spender : tester.getAccount("User2") }, 200, "User2's allowance should be limited at 200 SEED" );
        tester.switchUser("User2");
        log("User2 sends 100 Seed from User1 to User3");
        tester.createTransaction("transferFrom", { from : tester.getAccount("User1"), to : tester.getAccount("User3"), value : 100 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 900, "User1 should have 900 SEED as User2 sent 100 of their 1000");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User3") }, 100, "User3 should have received 100 SEED");
        tester.assertEqual("getAllowance", { owner : tester.getAccount("User1"), spender : tester.getAccount("User2") }, 100, "User2's allowance should have only 100 remaining" );
        log("User2 sends 100 Seed from User1 to User2");
        tester.createTransaction("transferFrom", { from : tester.getAccount("User1"), to : tester.getAccount("User2"), value : 100 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 800, "User1 should have 800 SEED as User2 spent the full 200 alowance");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User2") }, 100, "User2 should have received 100 SEED");
        tester.assertEqual("getAllowance", { owner : tester.getAccount("User1"), spender : tester.getAccount("User2") }, 0, "User2's allowance should be at zero as they spent it all" );
        log("User2 tries to send 100 Seed from User1 to User2, however fails as their allowance has run out");
        tester.createTransaction("transferFrom", { from : tester.getAccount("User1"), to : tester.getAccount("User2"), value : 100 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 800, "User1 should still have 800 SEED, as none should have been sent");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User2") }, 100, "User2 should still have 100 SEED, as none should have been received");
        tester.assertEqual("getAllowance", { owner : tester.getAccount("User1"), spender : tester.getAccount("User2") }, 0, "User2's allowance should still be at zero" );
        return tester;
     },
    /**
     * 5) The Seed module can be created, with users burning currency, and the total supply being affected
     */
    SeedModule_BurningCurrency : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        let vm = virtualMachineExporter.getVirtualMachine();
        vm.addModule(relayExporter.getModule());
        log("Loading Seed Module");
        vm.addModule(seedExporter.getModule());
        log("Invoking Seed Constructor");
        tester.createTransaction("constructor", { initialSeed : 1000 });
        log("Asserting the initial supply was 1000 SEED, and it all went to User1");
        tester.assertEqual("getTotalSupply", {}, 1000, "1000 SEED should be in circulation upon creation");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 1000, "Creator should start with 1000 SEED");
        log("User1 burns 150 Seed");
        tester.createTransaction("burn", { value : 150 });
        tester.assertEqual("getTotalSupply", {}, 850, "There should be 850 SEED in circulation (1000-150)");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 850, "The creator should have 850 SEED after burning 150");
        log("User1 transfers 100 Seed to User2");
        tester.createTransaction("transfer", { to : tester.getAccount("User2"), value : 100 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 750, "User1 has 750 SEED after transfering 100 from their 850");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User2") }, 100, "User2 should have received 100 SEED");
        tester.switchUser("User2");
        log("User2 burns 25 Seed");
        tester.createTransaction("burn", { value : 25 });
        tester.assertEqual("getTotalSupply", {}, 825, "There should be 825 SEED in circulation (1000-150-25)");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 750, "The creator should have 750 SEED");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User2") }, 75, "User2 should have 75 SEED after burning 25");
        return tester;
    },
    /**
     * 6) The Seed module can be created, with a complex system of transfers/approvals/burning occurs, and callbacks working as intended
     */
    SeedModule_ComplexScenario_TransfersAllowancesBurningAndSubscriptions : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        let vm = virtualMachineExporter.getVirtualMachine();
        vm.addModule(relayExporter.getModule());
        log("Loading Seed Module");
        vm.addModule(seedExporter.getModule());
        log("Invoking Seed Constructor");
        tester.createTransaction("constructor", { initialSeed : 1000 });
        log("Asserting Seed's data was loaded (Symbol was \"SEED\", goes to fourth decimal place, defaulted to 1000 SEED");
        tester.assertEqual("getSymbol", {}, "SEED", "The symbol of Seed should be \"SEED\"");
        tester.assertEqual("getDecimals", {}, 4, "Seed should have 4 decimal points");
        tester.assertEqual("getTotalSupply", {}, 1000, "1000 SEED should be in circulation upon creation");
        log("Asserting the initial 1000 SEED supply went to the creator")
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 1000, "Creator should start with 1000 SEED");
        log("User1 approves User2 for an allowance of 250");
        tester.createTransaction("approve", { spender : tester.getAccount("User2"), value : 250 });
        tester.switchUser("User2");
        log("User2 sends User2 100 SEED on User1's behalf");
        tester.createTransaction("transferFrom", { from : tester.getAccount("User1"), to : tester.getAccount("User2"), value : 100 });
        log("User2 sends User3 100 SEED on User1's behalf");
        tester.createTransaction("transferFrom", { from : tester.getAccount("User1"), to : tester.getAccount("User3"), value : 100 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 800, "Owner should still have 800 SEED");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User2") }, 100, "DEF sent 100 SEED to himself");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User3") }, 100, "GHI received 100 SEED from DEF on User1's behalf");
        tester.switchUser("User3");
        log("User3 sends User1 50 SEED");
        tester.createTransaction("transfer", { to : tester.getAccount("User1"), value : 50 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 850, "User1 should have received 50 from GHI");
        tester.switchUser("User2");
        log("User2 burns 25 SEED");
        tester.createTransaction("burn", { value : 25 });
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User2") }, 75, "DEF should have 75 after burning 25, removing it from circulation");
        tester.assertEqual("getTotalSupply", {}, 975, "25 coins were burned, removed from circulation, since initial 1000 creation");
        return tester;
    },
    /**
     * 7) The Seed module can be created, with a user forging a malcious transaction, which fails to be added
     */
    SeedSystem_ForgingMaliciousTransactionsFailToBeAccepted : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        let vm = virtualMachineExporter.getVirtualMachine();
        vm.addModule(relayExporter.getModule());
        log("Loading Seed Module");
        vm.addModule(seedExporter.getModule());
        log("Invoking Seed Constructor");
        tester.createTransaction("constructor", { initialSeed : 1000 });
        log("Asserting the initial supply was 1000 SEED, and it all went to User1");
        tester.assertEqual("getTotalSupply", {}, 1000, "1000 SEED should be in circulation upon creation");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 1000, "Creator should start with 1000 SEED");
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
     * 8) The Seed module can be created, with a user forging history, but a transaction refutes it. After rechecking, forger is removed, and refuter is accepted
     */
    SeedSystem_ForgedHistoryCanBeRefutedAndRepaired : function(log) {
        let tester = moduleTester.beginTest("Seed", "User1");
        let vm = virtualMachineExporter.getVirtualMachine();
        vm.addModule(relayExporter.getModule());
        log("Loading Seed Module");
        vm.addModule(seedExporter.getModule());
        log("Invoking Seed Constructor");
        tester.createTransaction("constructor", { initialSeed : 1000 });
        log("Asserting the initial supply was 1000 SEED, and it all went to User1");
        tester.assertEqual("getTotalSupply", {}, 1000, "1000 SEED should be in circulation upon creation");
        tester.assertEqual("getBalanceOf", { owner : tester.getAccount("User1") }, 1000, "Creator should start with 1000 SEED");
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