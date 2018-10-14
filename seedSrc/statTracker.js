/**
 * Helps record stats 
 */

module.exports = {
    addTransactionToEntanglement : function(dataSize) {
        console.info("Adding Transaction To Stats: ", dataSize);
        stats.totalTransactionCount++;
        stats.entanglementTransactionCount++;
        stats.rawStorage += dataSize;
        stats.squashedStorage += dataSize;
        console.info(stats);
    },
    squashTransactions : function(transactionCount, sizeBeforeSquashing, sizeAfterSquashing) {
        console.info("Squashing Transactions To Stats: ", transactionCount, sizeBeforeSquashing, sizeAfterSquashing);
        stats.entanglementTransactionCount -= transactionCount;
        stats.blockchainTransactionCount += transactionCount;
        stats.squashedStorage -= sizeBeforeSquashing;
        stats.squashedStorage += sizeAfterSquashing;
        console.info(stats);
    },
    isTracking : function() {
        return true;
    },
    getStats : function() {
        return stats;
    }
}

let stats = {
    totalTransactionCount : 0,
    entanglementTransactionCount : 0,
    blockchainTransactionCount : 0,
    rawStorage : 0,
    squashedStorage : 0
}