/******************
 * transaction.js *
 ******************
 * 
 * Exports the creation of transactions.
 * 
 * Transaction:
 *      Transaction Hash
 *      Sender Address
 *      Execution:
 *          ModuleName
 *          FunctionName
 *          Arguments
 *          ModuleChecksum
 *          FunctionChecksum
 *          ChangeSet
 *      Trusted Transactions:
 *          Transaction Hash
 *          Module Checksum
 *          Function Checksum
 *          ChangeSet
 *      Signature
 * 
 * Exported Functions:
 *      createTransaction(children, updateData)
 *          - Creates a new transaction object
 *      
 */

module.exports = {
    createNewTransaction : function(sender, execution, trustedTransactions ) {
        console.log(cryptoExporter);
        let cryptoHelper = cryptoExporter.newCryptoHelper();
        let svm = svmExporter.getVirtualMachine();

        let moduleUsed = svm.getModule({ module : execution.moduleName });

        if (moduleUsed != undefined) {
            let functionHash = moduleUsed.functionHashes[execution.functionName];
            if (functionHash != undefined) {
                execution.moduleChecksum = cryptoHelper.hashToChecksum(moduleUsed.fullHash());
                execution.functionChecksum = cryptoHelper.hashToChecksum(functionHash);

                var transaction = new Transaction(sender, execution, trustedTransactions);
                transaction.updateHash();
                return transaction;
            } else {
                throw new Error("Error creating new transaction. Function used not found");
            }
        } else {
            throw new Error("Error creating new transaction. Module used not found");
        }
        return undefined;
    },
    createExistingTransaction : function(sender, execution, trustedTransactions, transactionHash, transactionSignature ) {
        let cryptoHelper = cryptoExporter.newCryptoHelper();
        let svm = svmExporter.getVirtualMachine();

        let moduleUsed = svm.getModule({ module : execution.moduleName });

        if (moduleUsed != undefined) {
            let functionHash = moduleUsed.functionHashes[execution.functionName];
            if (functionHash != undefined) {
                execution.moduleChecksum = cryptoHelper.hashToChecksum(moduleUsed.fullHash());
                execution.functionChecksum = cryptoHelper.hashToChecksum(functionHash);

                return new Transaction(sender, execution, trustedTransactions, transactionHash, transactionSignature);
            } else {
                throw new Error("Error creating new transaction. Function used not found");
            }
        } else {
            throw new Error("Error creating new transaction. Module used not found");
        }
        return undefined;
    },
    isTransactionValid: function(transaction) {
        let validator = new TransactionValidator();

        //Prove the Transaction.Sender, Transaction.Execution and Transaction.ValidatedTransactions are the content that creates the Transaction.TransactionHash
        let rule1 = validator.doesFollowRule1(transaction);

        //Prove that the Transaction.Sender is a valid public key, and therefore was derived from a valid private key
        let rule2 = validator.doesFollowRule2(transaction);

        //Prove that the Transaction.Sender is the public key consenting to the transaction
        let rule3 = validator.doesFollowRule3(transaction);

        //Prove that the Transaction.ValidatedTransactions is using verifiable data that other users have verified, while still being new-enough that its in the DAG still. If we don't have these Hash's, this is an indicator that
        //we may have differing versions of history, OR that we simply do not know of these transactions yet
        let rule4 = validator.doesFollowRule4(transaction);

        //Prove that this new Transaction and its validate transactions do not create a cycle in the DAG
        let rule5 = validator.doesFollowRule5(transaction);

        //Prove that we agree on the module code being executed, so we're using the same versions
        let rules6And7 = validator.doesFollowRules6And7(transaction)

        //Prove that, when we simulate the execution, we get the same ChangeSet (Prove their statement of change was right)
        let rule8 = validator.doesFollowRule8(transaction);

        //Prove that their Transaction.ValidatedTransactions.ChangeSets aggree with the transactions they're validatings results.
        //NOTE: If they didn't agree, they shouldn't have mentioned them. We only submit validated transactions we agree with. Ones we disagree with are simply ignored, never referenced, and therefore never validated
        let rule9 = validator.doesFollowRule9(transaction);

        let rule10 = validator.doesFollowRule10(transaction);

        return rule1 && rule2 && rule3 && rule4 && rule5 && rules6And7 && rule8 && rule9;
    
        /*
            NOTES:
            Breaking rule4 may mean its too new or too old. It can still be "Proper", we just can't validate it. Wait a bit then retry in case its just too new
            Breaking rule10 may mean they are too recent and just need more time. This is fully "Proper"
        */
        
        
    }
 }

 const cryptoExporter = require("./helpers/cryptoHelper.js");
 const svmExporter = require("./virtualMachine/virtualMachine.js");
 const accountExporter = require("./account.js");
 const conformHelper = require("./helpers/conformHelper.js");


class TransactionValidator {
    //Prove the Transaction.Sender, Transaction.Execution and Transaction.ValidatedTransactions are the content that creates the Transaction.TransactionHash
    doesFollowRule1(transaction) {
        let dataToHash = transaction.getHashableData();
        let cryptoHelper = cryptoExporter.newCryptoHelper();
        let hash = cryptoHelper.sha256(dataToHash);
        return hash == transaction.transactionHash;
    }

    //Prove that the Transaction.Sender is a valid public key, and therefore was derived from a valid private key
    doesFollowRule2(transaction) {
        let cryptoHelper = cryptoExporter.newCryptoHelper();
        return cryptoHelper.isPublicKeyValid(transaction.sender);
    }

    //Prove that the Transaction.Sender is the public key consenting to the transaction
    doesFollowRule3(transaction) {
        let account = accountExporter.newAccount( { publicKey : transaction.sender, network : "00" });
        return account.verifySignature(transaction.signature, transaction.transactionHash);
    }

    //Prove that the Transaction.ValidatedTransactions is using verifiable data that other users have verified, while still being new-enough that its in the DAG still. If we don't have these Hash's, this is an indicator that
    //we may have differing versions of history, OR that we simply do not know of these transactions yet
    doesFollowRule4(transaction) {
        //TODO: Create DAG and ask it if all transaction.validatedTransactions' hashes are in the DAG currently
        return true;
    }

    //Prove that this new Transaction and its validate transactions do not create a cycle in the DAG
    doesFollowRule5(transaction) {
        //TODO: Create DAG and ask it if all this transaction does not make a cycle
        return true;
    }

    //Prove that we agree on the module code being executed, so we're using the same versions
    //6) The Transaction.Execution.ModuleName and Transaction.Execution.ModuleChecksum matches the version of the module we're using
    //7) The Transaction.Execution.FunctionName and Transaction.Execution.FunctionChecksum matches the version of the function we're using
    doesFollowRules6And7(transaction) {
        let cryptoHelper = cryptoExporter.newCryptoHelper();
        let svm = svmExporter.getVirtualMachine();

        let moduleUsed = svm.getModule({ module : transaction.execution.moduleName });

        if (moduleUsed != undefined) {
            let functionHash = moduleUsed.functionHashes[transaction.execution.functionName];
            if (functionHash != undefined) {
                let moduleChecksum = cryptoHelper.hashToChecksum(moduleUsed.fullHash());
                let functionChecksum = cryptoHelper.hashToChecksum(functionHash);
                return transaction.execution.moduleChecksum == moduleChecksum && transaction.execution.functionChecksum == functionChecksum;
            }
        }
        return false;
    }

    //Prove that, when we simulate the execution, we get the same ChangeSet (Prove their statement of change was right)
    //8) SVM.Simulate(Transaction.Execution) == Transaction.Execution.ChangeSet
    doesFollowRule8(transaction) {
        let svm = svmExporter.getVirtualMachine();
        let functionToInvoke = svm.getModule({ module : transaction.execution.moduleName }).getFunctionByName(transaction.execution.functionName);
        let txHashes = [];
        for(let i = 0; i < transaction.validatedTransactions; i++) {
            txHashes.push(transaction.validatedTransactions[i].transactionHash);
        }
        let simulationInfo = { 
            module : transaction.execution.moduleName, 
            function : transaction.execution.functionName, 
            args : transaction.execution.args, 
            user : transaction.sender, 
            txHashes :  txHashes
        }
        let result = JSON.stringify(svm.simulate(simulationInfo));

        return result == transaction.execution.changeSet;
    }

    //Prove that their Transaction.ValidatedTransactions.ChangeSets aggree with the transactions they're validatings results.
    //NOTE: If they didn't agree, they shouldn't have mentioned them. We only submit validated transactions we agree with. Ones we disagree with are simply ignored, never referenced, and therefore never validated
    //9) foreach Transaction.ValidatedTransactions { SVM.DoesChangeSetMatch(ValidatedTransaction.Hash, ValidatedTransaction.ChangeSet) }
    doesFollowRule9(transaction) {
        //TODO: Be able to look at the DAG, ask for Transaction.ValidatedTransactions, and confirm their changesets match  what transaction claims they are
        return true;
    }

    //Prove that, when we simulate the execution of their validated transactions, their execution was also right (Prove their "work" was right).
    //10) SVM.WaitForValidation(Transaction.ValidatedTransactions, simulateTrustedParent : Transaction.Hash)
    doesFollowRule10(transaction) {
        //TODO: Be able to look at the DAG and check if the validatedTransactions themselves are valid yet
        return true;
    }
}

class Transaction {
    constructor(sender, execution, trustedTransactions, transactionHash, signature) {
        this.transactionHash = transactionHash;
        this.sender = sender;
        this.execution = {
            moduleName : execution.moduleName,
            functionName : execution.functionName,
            args : execution.args,
            moduleChecksum: execution.moduleChecksum,
            functionChecksum : execution.functionChecksum,
            changeSet : execution.changeSet
        };
        this.validatedTransactions = trustedTransactions;
        this.signature = signature;
    }

    updateHash() {
        let cryptoHelper = cryptoExporter.newCryptoHelper();
        this.transactionHash = cryptoHelper.sha256(this.getHashableData());
    }

    getHashableData() {
        let hashable = "";
        hashable += this.sender;
        hashable += this.execution.moduleName;
        hashable += this.execution.functionName;
        hashable += JSON.stringify(this.execution.args);
        hashable += this.execution.moduleChecksum;
        hashable += this.execution.functionChecksum;
        hashable += this.execution.changeSet;
        for(let i = 0; i < this.validatedTransactions.length; i++) {
            hashable += this.validatedTransactions[i].transactionHash;
            hashable += this.validatedTransactions[i].moduleChecksum;
            hashable += this.validatedTransactions[i].transactionChecksum;
            hashable += this.validatedTransactions[i].changeSet;
        }
        console.info("getHashableData", hashable);
        return hashable;
    }

    /*toHashableString() {
        let result = "";
        result += this.merkelDAGHash;
        result += this.work.toString();
        result += moduleName;
        result += merkelData;
        result += updateData.toString();
        return result;
    }

    getValidationInfo() {
        let result = "";
        result += this.transactionHash;
        result += "|";
        result += cryptoExporter.newCryptoHelper().sha256(this.updateData);
        result += "|";
        result += this.merkelDAGHash;
        result += "|";
        result += this.signature;
        return result;
    }*/
}
