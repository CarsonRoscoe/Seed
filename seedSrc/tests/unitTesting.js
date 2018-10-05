/******************
 * unitTesting.js *
 ******************
 * 
 * Exports functions related to running unit tests or creating unit tests.
 */

module.exports = {
    /**
     * Runs all modules for unit tests which are hard-coded into this function for loading.
     * Modules to test are expected to have a "runUnitTests(verbose)" function available, which
     * returns a test result object of type { fails : array, passes : number }
     * 
     * @param verbose - Whether to write extra debug lines or not
     */
    runAllUnitTests : function(verbose, log) {
        console.info("#### Running All Unit Tests");

        // Hard-Coded subsystems to test
        let subsystemUnitTests = {
            Cryptography : require("../helpers/cryptoHelper.js").getUnitTests(),
            Account : require("../account.js").getUnitTests(),
            Random : require("../helpers/random.js").getUnitTests(),
            Block : require("../block.js").getUnitTests(),
            Transaction : require("../transaction.js").getUnitTests(),
            Squasher : require("../squasher.js").getUnitTests(),
            Entanglement : require("../entanglement.js").getUnitTests(),
            Blockchain : require("../blockchain.js").getUnitTests(),
            Ledger : require("../ledger.js").getUnitTests(),
            SVM : require("../virtualMachine/virtualMachine.js").getUnitTests(),
            FileStorage : require("../storage/fileSystemInjector.js").getUnitTests(),
            LocalStorage : require("../storage/localStorageInjector.js").getUnitTests(),
            Storage : require("../storage/storage.js").getUnitTests(),
            Messaging : require("../messaging.js").getUnitTests()
        };

        let test = new Test(verbose);

        // For each subsystem of tests, run the tests
        for(let i = 0; i < Object.keys(subsystemUnitTests).length; i++) {
            let unitTestsName = Object.keys(subsystemUnitTests)[i];
            let unitTests = subsystemUnitTests[unitTestsName];
            log("### Running " + unitTestsName + " Tests");
            let keys = Object.keys(unitTests);
            for(let i = 0; i < keys.length; i++) {
                let unitTestName = keys[i];
                log("## Running Unit Test " + unitTestName);
                test.newSegment(unitTestName);
                unitTests[unitTestName](test, log);
            }
        }

        // Give a short duration of time for any async operations to finish. 
        // Async tests may fail after all tests have completed executuon.
        setTimeout(() => {
            console.info("#### Tests Complete");
            test.logState();
        }, 1000);
    },
    /**
     * Returns a few sample transactions used by tests
     */
    getTestTransactions : function() {
        return [
            {"transactionHash":"3befa8c8b749662423aa7918326917609a8d12c072412f76541f46618671c2cd","sender":"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db","execution":{"moduleName":"Seed","functionName":"constructor","args":{"initialSeed":1000},"moduleChecksum":"fd37","functionChecksum":"ddf3","changeSet":"{\"moduleData\":{\"totalSupply\":1000},\"userData\":{\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\":{\"balance\":1000}},\"user\":\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\",\"dependencies\":[]}"},"validatedTransactions":[],"signature":"3045022009b894a225d4bb36fd819cd3467f7d215747cdf37f050d54de59d2540f74255d022100a7bc30d147bccc9a0823d271cffbe9ef33ab5752f7c705704af31069d26ea7cb","timestamp":1538774871858},
            {"transactionHash":"3f46868a44e5b2c6aa11adace76119fa7e0172acf5c536c8deb201f8748aac36","sender":"04c98f4fe93a883e660b1334809245de5ff0ac4caca70e44591676b066aeb7575879ad328f9b15b101d4dde74c4266d5945c1f6b1f5065c83b7be63ceefc4028d6","execution":{"moduleName":"Relay","functionName":"relay","args":{},"moduleChecksum":"ec72","functionChecksum":"4b75","changeSet":"{\"moduleData\":{\"totalRelays\":2},\"userData\":{\"04c98f4fe93a883e660b1334809245de5ff0ac4caca70e44591676b066aeb7575879ad328f9b15b101d4dde74c4266d5945c1f6b1f5065c83b7be63ceefc4028d6\":{\"relays\":2}},\"user\":\"04c98f4fe93a883e660b1334809245de5ff0ac4caca70e44591676b066aeb7575879ad328f9b15b101d4dde74c4266d5945c1f6b1f5065c83b7be63ceefc4028d6\",\"dependencies\":[]}"},"validatedTransactions":[{"transactionHash":"3befa8c8b749662423aa7918326917609a8d12c072412f76541f46618671c2cd","moduleChecksum":"fd37","functionChecksum":"ddf3","changeSet":"{\"moduleData\":{\"totalSupply\":1000},\"userData\":{\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\":{\"balance\":1000}},\"user\":\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\",\"dependencies\":[]}"},{"transactionHash":"88ef4284580a2ad15fe702042da52334bd8be15c07b7829f550c50e30f44b4bc","moduleChecksum":"ec72","functionChecksum":"4b75","changeSet":"{\"moduleData\":{\"totalRelays\":1},\"userData\":{\"049ed80d0906ce0fe35571a5b928552fae2708ac50d12ce22c04c4427a9cd9ea6a1d2dcf76362ee534fe8f4e90567876f4bb92467b6838d8c74c1a3c82ed18b8ba\":{\"relays\":1}},\"user\":\"049ed80d0906ce0fe35571a5b928552fae2708ac50d12ce22c04c4427a9cd9ea6a1d2dcf76362ee534fe8f4e90567876f4bb92467b6838d8c74c1a3c82ed18b8ba\",\"dependencies\":[]}"}],"signature":"3046022100abbab99eef46349671acdb60fc01eb7865f799b81cc889932f17f1385d6d83ab022100c2714b71d9dbe20161adc64dbb40fe5ef7795bef18bb4d5f2d45424a15f66b2e","timestamp":1538774876105},
            {"transactionHash":"88ef4284580a2ad15fe702042da52334bd8be15c07b7829f550c50e30f44b4bc","sender":"049ed80d0906ce0fe35571a5b928552fae2708ac50d12ce22c04c4427a9cd9ea6a1d2dcf76362ee534fe8f4e90567876f4bb92467b6838d8c74c1a3c82ed18b8ba","execution":{"moduleName":"Relay","functionName":"relay","args":{},"moduleChecksum":"ec72","functionChecksum":"4b75","changeSet":"{\"moduleData\":{\"totalRelays\":1},\"userData\":{\"049ed80d0906ce0fe35571a5b928552fae2708ac50d12ce22c04c4427a9cd9ea6a1d2dcf76362ee534fe8f4e90567876f4bb92467b6838d8c74c1a3c82ed18b8ba\":{\"relays\":1}},\"user\":\"049ed80d0906ce0fe35571a5b928552fae2708ac50d12ce22c04c4427a9cd9ea6a1d2dcf76362ee534fe8f4e90567876f4bb92467b6838d8c74c1a3c82ed18b8ba\",\"dependencies\":[]}"},"validatedTransactions":[{"transactionHash":"3befa8c8b749662423aa7918326917609a8d12c072412f76541f46618671c2cd","moduleChecksum":"fd37","functionChecksum":"ddf3","changeSet":"{\"moduleData\":{\"totalSupply\":1000},\"userData\":{\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\":{\"balance\":1000}},\"user\":\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\",\"dependencies\":[]}"}],"signature":"30450220324ffd7585cb6474fa08b664b137084415d93c3ac49b9abcae62742ae2d0d3d702210094f12563eadbed37f9a7e1aaba54825f3a8d832cb8dfeb7018cff4d69d67d1d8","timestamp":1538774875040},
            {"transactionHash":"8be383500248b51ceb89af9a0772b7992aa5221b4aecee244b2f5c52e3c36081","sender":"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db","execution":{"moduleName":"Seed","functionName":"approve","args":{"spender":"04e27f7b1a3c08a218c3add342cb5d540fb58ecc5906a8e20763412abb9ebd3126fe4ff40c45bc6361e5428b0faa56fd061041072b1f27e0b574f8881c374baaa0","value":5},"moduleChecksum":"fd37","functionChecksum":"4cf0","changeSet":"{\"moduleData\":{},\"userData\":{\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\":{\"allowance\":{\"04e27f7b1a3c08a218c3add342cb5d540fb58ecc5906a8e20763412abb9ebd3126fe4ff40c45bc6361e5428b0faa56fd061041072b1f27e0b574f8881c374baaa0\":5}}},\"user\":\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\",\"dependencies\":[]}"},"validatedTransactions":[{"transactionHash":"3befa8c8b749662423aa7918326917609a8d12c072412f76541f46618671c2cd","moduleChecksum":"fd37","functionChecksum":"4cf0","changeSet":"{\"moduleData\":{\"totalRelays\":1},\"userData\":{\"043ccefd90941b150874429bf14fc21ab2cfe9821553b2b297c75c65a1c9510e559274c91c96c5887011957ec10d71abf459356ed2f0d816ec5d80b0dec0cda588\":{\"relays\":1}},\"user\":\"043ccefd90941b150874429bf14fc21ab2cfe9821553b2b297c75c65a1c9510e559274c91c96c5887011957ec10d71abf459356ed2f0d816ec5d80b0dec0cda588\",\"dependencies\":[]}"},{"transactionHash":"4be4ab53a7f9321ee211cb4987ff3d796edfed53bf4b31d376bca60745806a6f","moduleChecksum":"ec72","functionChecksum":"4b75","changeSet":"{\"moduleData\":{\"totalSupply\":1000},\"userData\":{\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\":{\"balance\":1000}},\"user\":\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\",\"dependencies\":[]}"}],"signature":"3044022076808d2610c6943aa08de15b6f72e1da31e3b291cc6f67447218195705a06329022063fad5f7ec4be787995db985a994df220eba0fcd4907c2a8d77a8f91cecfeb76","timestamp":1538782020620}
        ]
    },
    /**
     * Returns a few sample blocks used by tests
     */
    getTestBlocks : function() {
        return [
            {"generation":1,"transactions":"{\"3befa8c8b749662423aa7918326917609a8d12c072412f76541f46618671c2cd\":[\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\",\"fd37\",\"ddf3\",\"{\\\"initialSeed\\\":1000}\",\"3045022009b894a225d4bb36fd819cd3467f7d215747cdf37f050d54de59d2540f74255d022100a7bc30d147bccc9a0823d271cffbe9ef33ab5752f7c705704af31069d26ea7cb\"]}","changeSet":"{\"Seed\":{\"totalSupply\":1000,\"userData\":{\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\":{\"balance\":1000}}}}","timestamp":1538774871858,"blockHash":"eb3a56a8f01f129e545ca58bb957aff6f9a5b20fe3b662161de69c034691cbb8"},
            {"generation":1,"transactions":"{\"93f0f79237c78bc28ffdf00ced2a506be24e7b913e182fbdde817b159014c052\":[\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\",\"fd37\",\"ddf3\",\"{\\\"initialSeed\\\":1000}\",\"304502204cfc76d8dfded9b3e08eed7b06da2f7e38e344c74830569177b4a9ad8afd5fa3022100e9b1353030d239598265645f2c72103e44d1ac3571fa56c58a6968a163be0499\"],\"243cdd2f8d9b8bbfd7a38f72c9e14e80f0666d983d6d62c00a6dfa12c194e60c\":[\"04c84274423f40b7d781e720cade5897ecc019b7c81d5c41139e4a8ae629d88c97a2b2ec85c784aee4e002f85ce349f6e747ce6ea4a4de61a4a52d0cc59261c3cd\",\"ec72\",\"4b75\",\"{}\",\"30440220648e541f043b348caa4cc12f5743d0a045541a813fcc8dcd2f41ba80963f315a022021fe3e4a8058455e32f09a7a7032329fea7cf2b061cf4d5390d6806839a0e690\"],\"d271b119dccb789f7b8f84921a46e27b5ba7e3353777086b78ffd5eba64e1f46\":[\"0429f693a8f9c2f855fb3ad6d0ba4230b893b35cea29b3fc92de85b46d9d1a359328e7dad597dd24d6f0a58c2679e7f69251017c272630284dab8249c481689008\",\"ec72\",\"4b75\",\"{}\",\"3046022100cbfc9ebca26d6be8e3fa0a5530e3b477c987e2e68d5ccc9b271859428d4fe2a8022100fd158ab8d5f31956b8f74f8ad218064cccf6001ec63d2c2663d81e16db16aed8\"],\"b302d9d181cd7186171c7a7c9777c26023bb996f7dd663592e2624a7230a292a\":[\"045f75e3667c026ef977b4ee89dd92e9ee4b92b7902c7aa87f4beef8102d0c36cbbf3492df4908dcadb1e2a66a75ae33a9bc634e73ec5fc002cfb0383f398e8cc2\",\"ec72\",\"4b75\",\"{}\",\"3044022043d6c5b73eacd79c3fa105d5918e095a9ca0292e6c1f87b14d4bbc6eb3ac649f022027e388d06e5185049e3aa8750df426b2d32d3496bc3ec7a071fad4f4f109a98e\"],\"eba38477d36b64c0b85e6a729956f79d0c88860368b0748752369bf6bbf1c06d\":[\"04b68dae578b7944d82e8d313b075992d52c139468c7831b6897eb9862249c81e1c464846d14d045b195a339b414fd95a65b7d1195157cbe601aff7da72b85de76\",\"ec72\",\"4b75\",\"{}\",\"30440220719f118788b7aca8652f97d5eada89447cd3782b35d51ed23be26843df2966ad022056991be363e71f0445a1a0803236bddced2987cbd31116326185a5d05fb52dd9\"],\"8e4eba26e8382834121ce8b07bbe17abc19e6405d4c1d3cdbf93578a42e7fe18\":[\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\",\"fd37\",\"4cf0\",\"{\\\"spender\\\":\\\"04e27f7b1a3c08a218c3add342cb5d540fb58ecc5906a8e20763412abb9ebd3126fe4ff40c45bc6361e5428b0faa56fd061041072b1f27e0b574f8881c374baaa0\\\",\\\"value\\\":250}\",\"3045022075f88a65019946ff6888b4003cd40789b072ee1a5edc966644ac0bc624463f63022100a6f7ca6be7ee6b04836249734abf19dba9b114b61ca52b053e6714cc72cf6f23\"],\"78c07bec02213f58c058c578f5fd139bd36c970ee0bb70d3ba9ee0ba93057bc2\":[\"04021403d8391d58987a7463c115461745b2d21a8972313241b24e2b0e94305b3004c007424fd3d9dc6fd0348ffe1237694c2bd8fe8cc36e08769c427fdfcbd103\",\"ec72\",\"4b75\",\"{}\",\"304602210090fe89a60f5785ed9603d6729a08ec4bb390ff56ca79589c869f6c3f4a936967022100992f242587a3933f9c7f0f22d979c6dac137007be08cdb3a7b77ffe248bf3295\"],\"dd6d13e2ee45d6b0a6a772e526e09d87a1f675ee53f71eb24c3ae7b132342818\":[\"0441b1f8e74770855bd04e93ff939cd04d6c255fd6151232318de6953bf5ac9d829bf054300a00e8d16098f29925343754dc74469b27de61663f2b8e6e690bc2e7\",\"ec72\",\"4b75\",\"{}\",\"304602210092a14a5efc9562ed8cae59e0de4e115f8e164138c62ab3cad9b2bf847df5d5c902210088e6b45a5bb36da698f9da2676784d2bad0afc0577b021d41692457492065a81\"],\"0f2ab2b75513de05f3c8186e4e58dcb1a02b01a2f9c3a5b3038f4effe680bc09\":[\"04e27f7b1a3c08a218c3add342cb5d540fb58ecc5906a8e20763412abb9ebd3126fe4ff40c45bc6361e5428b0faa56fd061041072b1f27e0b574f8881c374baaa0\",\"fd37\",\"4481\",\"{\\\"from\\\":\\\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\\\",\\\"to\\\":\\\"049df4409dcaaa257135596c81268d0a28398499623af7d032709d3f17c2fa776fca25f4fbbff8175a6ab2ea0701d4c75c98ff71dcd1cf856baf673bbfb2c4e70a\\\",\\\"value\\\":100}\",\"3046022100d94f45824c30d5ca585dff3ba7b4cb644b6ff040560d1c112bda789f90205a9f022100c099572ba64e743fc4b9694164c665dabe84a005afff06e91af1c2fd3cdc1106\"]}","changeSet":"{\"Seed\":{\"totalSupply\":1000,\"userData\":{\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\":{\"balance\":900,\"allowance\":{\"04e27f7b1a3c08a218c3add342cb5d540fb58ecc5906a8e20763412abb9ebd3126fe4ff40c45bc6361e5428b0faa56fd061041072b1f27e0b574f8881c374baaa0\":150}},\"049df4409dcaaa257135596c81268d0a28398499623af7d032709d3f17c2fa776fca25f4fbbff8175a6ab2ea0701d4c75c98ff71dcd1cf856baf673bbfb2c4e70a\":{\"balance\":100}}},\"Relay\":{\"totalRelays\":11,\"userData\":{\"04c84274423f40b7d781e720cade5897ecc019b7c81d5c41139e4a8ae629d88c97a2b2ec85c784aee4e002f85ce349f6e747ce6ea4a4de61a4a52d0cc59261c3cd\":{\"relays\":1},\"0429f693a8f9c2f855fb3ad6d0ba4230b893b35cea29b3fc92de85b46d9d1a359328e7dad597dd24d6f0a58c2679e7f69251017c272630284dab8249c481689008\":{\"relays\":2},\"045f75e3667c026ef977b4ee89dd92e9ee4b92b7902c7aa87f4beef8102d0c36cbbf3492df4908dcadb1e2a66a75ae33a9bc634e73ec5fc002cfb0383f398e8cc2\":{\"relays\":2},\"04b68dae578b7944d82e8d313b075992d52c139468c7831b6897eb9862249c81e1c464846d14d045b195a339b414fd95a65b7d1195157cbe601aff7da72b85de76\":{\"relays\":2},\"04021403d8391d58987a7463c115461745b2d21a8972313241b24e2b0e94305b3004c007424fd3d9dc6fd0348ffe1237694c2bd8fe8cc36e08769c427fdfcbd103\":{\"relays\":2},\"0441b1f8e74770855bd04e93ff939cd04d6c255fd6151232318de6953bf5ac9d829bf054300a00e8d16098f29925343754dc74469b27de61663f2b8e6e690bc2e7\":{\"relays\":2}}}}","timestamp":1536110596722,"blockHash":"6dcdbda77967613fd76d2dd6ffb35bbb02818a67800786fd987121ff6ec0f575"}
        ]
    },
    /**
     * Returns a sample contructor transaction for Seed used by tests
     */
    getSeedConstructorTransaction : function() {
        return {"transactionHash":"3befa8c8b749662423aa7918326917609a8d12c072412f76541f46618671c2cd","sender":"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db","execution":{"moduleName":"Seed","functionName":"constructor","args":{"initialSeed":1000},"moduleChecksum":"fd37","functionChecksum":"ddf3","changeSet":"{\"moduleData\":{\"totalSupply\":1000},\"userData\":{\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\":{\"balance\":1000}},\"user\":\"0452c7225d98f5b07a272d8fcfd15ae29d2f555e2d1bf0b72cf325f3f9d7037006cae70fe958a6224caf5749ec6b56d0a5b27b2db6c3a0777bcb733766e61b56db\",\"dependencies\":[]}"},"validatedTransactions":[],"signature":"3045022009b894a225d4bb36fd819cd3467f7d215747cdf37f050d54de59d2540f74255d022100a7bc30d147bccc9a0823d271cffbe9ef33ab5752f7c705704af31069d26ea7cb","timestamp":1538774871858}
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
        this.passes = {};
        this.fails = {};
        this.segments = [];
        this.verbose = verbose;
        this.segmentName = "N/A";
    }

    /**
     * If the expression is true, this is a pass. Otherwise, add the fail message to the fails array
     * 
     * @param {*} expression - Expression we check for true or false
     * @param {*} failMessage - Error emssage to display on fail
     */
    assert(expression, failMessage) {
        if (expression) {
            if (!this.passes[this.segmentName]) {
                this.passes[this.segmentName] = 0;
            }
            this.passes[this.segmentName]++;
        } else {
            if (!this.fails[this.segmentName]) {
                this.fails[this.segmentName] = [];
            }
            this.fails[this.segmentName].push(this.segmentName + ":: " + failMessage);
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
            if (!this.passes[this.segmentName]) {
                this.passes[this.segmentName] = 0;
            }
            this.passes[this.segmentName]++;
            return;
        }
        if (!this.fails[this.segmentName]) {
            this.fails[this.segmentName] = [];
        }
        this.fails[this.segmentName].push(this.segmentName + ":: " + failMessage);
    }
    
    /**
     * Switches segments as a new grouping of tests is being run
     */
    newSegment(segmentName) {
        this.segments.push(segmentName);
        this.segmentName = segmentName;
    }

    /**
     * Switches segments to go back to an existing group
     */
    switchSegment(segmentName) {
        let oldSegment = this.segmentName;
        this.segmentName = segmentName;
        return oldSegment;
    }

    /**
     * Lets the execution of asserts occur after a function leaves, when an asynchronous
     * callback tries to pass/fail a test after the fact.
     */
    runAssertsFromAsync(functionToInvoke, segmentName) {
        let oldSegment = this.switchSegment(segmentName);
        functionToInvoke();
        this.switchSegment(oldSegment);
    }

    /**
     * Logs the unit tests based on the current state
     */
    logState() {
        let failedSegments = Object.keys(this.fails);
        let passedSegments = Object.keys(this.passes);

        let failed = failedSegments.length > 0;
        let passed = failedSegments.length == 0 && passedSegments.length > 1;
        let totalUnitTests = failedSegments.length + passedSegments.length;

        if (passed) {
            console.log("## Passed All " + totalUnitTests + " Unit Tests");
        } else if (failed) {
            console.log("## Unit Tests failed");
            console.log("## Passed " + passedSegments.length + " / " + totalUnitTests + " Unit Tests");
            console.log("## Failed Tests...");
            for(let i = 0; i < failedSegments.length; i++) {
                console.info("# " + (i+1) + ":", this.fails[failedSegments[i]][0]);
            }

        } else {
            console.info("## No Tests Were Ran");
        }
    }
}