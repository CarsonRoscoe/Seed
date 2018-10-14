/***************
 * launcher.js *
 ***************
 * 
 * The JavaScript loaded into the Seed DApp Launcher
 * 
 * Buttons in the launcher can be clicked to launch a DApp.
 * There is also a button to run the unit tests
 */

const ipc = require('electron').ipcRenderer;

/**
 * Notifies the Main process through IPC that a module/DApp should be launched
 * 
 * @param {*} moduleName - Name of the module to launch
 * @param {*} htmlFile  - HTML file name of the DApp's source code
 */
function launch(moduleName, htmlFile) {
    ipc.send('launchModule', moduleName, "modules/" + moduleName.toLowerCase() + "/" + htmlFile);
}

/**
 * Gets notified by the main process when the Seed stats get changed
 */
ipc.on("reloadSeedStats", (event, stats) => {
    let javascript = "";
    javascript += getChangeInnerHTMLJavaScript("totalTransactionCount", stats.totalTransactionCount);
    javascript += getChangeInnerHTMLJavaScript("entanglementTransactionCount", stats.entanglementTransactionCount);
    javascript += getChangeInnerHTMLJavaScript("blockchainTransactionCount", stats.blockchainTransactionCount);
    javascript += getChangeInnerHTMLJavaScript("rawStorage", stats.rawStorage);
    javascript += getChangeInnerHTMLJavaScript("squashedStorage", stats.squashedStorage);
    ipc.send("executeJavaScript", "Launcher", javascript);
});

/**
 * Creates the JavaScript which modifies the innerHTML variable of any given element.
 * 
 * @param {*} elementID - Which element to change the "innerHTML" of
 * @param {*} value  - What to change the "innerHTML" value to
 */
function getChangeInnerHTMLJavaScript(elementID, value) {
    return "document.getElementById(\"" + elementID + "\").innerHTML = " + value + ";";
}