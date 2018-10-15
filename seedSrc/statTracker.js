/**
 * Helps record stats 
 */
module.exports = {
    addTransactionToEntanglement : function(dataSize) {
        stats.totalTransactionCount++;
        stats.entanglementTransactionCount++;
        stats.rawStorage += dataSize;
        stats.squashedStorage += dataSize;
    },
    squashTransactions : function(transactionCount, sizeBeforeSquashing, sizeAfterSquashing) {
        console.info("Squashing Transactions To Stats: ", transactionCount, sizeBeforeSquashing, sizeAfterSquashing);
        stats.entanglementTransactionCount -= transactionCount;
        stats.blockchainTransactionCount += transactionCount;
        stats.squashedStorage -= sizeBeforeSquashing;
        stats.squashedStorage += sizeAfterSquashing;
    },
    loadBlock : function(transactionCount, blockSize) {
        stats.blockchainTransactionCount += transactionCount;
        stats.totalTransactionCount += transactionCount;
        stats.squashedStorage += blockSize;
        stats.rawStorage += blockSize;
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