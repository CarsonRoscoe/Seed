/******************
 * cuberRunner/index.js *
 ******************
 * 
 * The JavaScript loaded into the CuberRunner DApp.
 * 
 * Communicates with the SeedHLAPI to use the "CuberRunner" module move users around.
 * This allows users to move freely, except with regards to walls, which they will collide with
 * and be unable to move around
 */

const ipc = require('electron').ipcRenderer;
const { PromiseIpc } = require('electron-promise-ipc');
const promiseIpc = new PromiseIpc({ maxTimeoutMs: 2000 });
const seedHLAPI = require("../../seedHLAPI.js").getSeedHLAPI(promiseIpc);

/**
 * 
 */
function move(xOffset, yOffset) {
    seedHLAPI.createAndPropagateTransaction("CubeRunner", "move", { xOffset : xOffset, yOffset : yOffset }, 4).then((result) => {
    });
}

/**
 * 
 */
function teleport(xOffset, yOffset) {
    seedHLAPI.createAndPropagateTransaction("CubeRunner", "teleport", { x : xOffset, y : yOffset }, 4).then((result) => {
    });
}

/**
 * Begins a cycle of walking right, up, left, down, on repeat
 */
function cycle() {
    // Move right
    setTimeout(() => {
        setInterval(() => {
            seedHLAPI.createAndPropagateTransaction("CubeRunner", "move", { xOffset : 1, yOffset : 0 }, 4);
        }, 10000);
    }, 2500);
    // Move up
    setTimeout(() => {
        setInterval(() => {
            seedHLAPI.createAndPropagateTransaction("CubeRunner", "move", { xOffset : 0, yOffset : -1 }, 4);
        }, 10000);
    }, 5000);
    // Move left
    setTimeout(() => {
        setInterval(() => {
            seedHLAPI.createAndPropagateTransaction("CubeRunner", "move", { xOffset : -1, yOffset : 0 }, 4);
        }, 10000);
    }, 7500);
    // Move down
    setTimeout(() => {
        setInterval(() => {
            seedHLAPI.createAndPropagateTransaction("CubeRunner", "move", { xOffset : 0, yOffset : 1 }, 4);
        }, 10000);
    }, 10000);
    
}

/**
 * Wraps the JavaScript drawing logic for drawing rectangles
 * 
 * @param {*} x - x position in game world to draw at
 * @param {*} y - y position in game work to draw at
 * @param {*} color - the color to draw
 * @param {*} fillFlag - whether or not to fill the rectangle
 */
function drawRectJavaScript(x, y, color, fillFlag) {
    let javascript = "";
    x *= 10;
    y *= 10;

    javascript += "ctx.beginPath();";
    javascript += "ctx.rect(" + x + ", " + y + ", 10, 10);"
    if (fillFlag) {
        javascript += "ctx.fillStyle = \"" + color + "\";"
        javascript += "ctx.fill();"
    } else {
        javascript += "ctx.strokeStyle = \"" + color + "\";"
        javascript += "ctx.stroke();"
    }

    return javascript;
}

/**
 * Does a full refresh on the screen. To be called on first connection,
 * or on reloading all data (for example, when requesting all data from a RelayNode)
 */
function fullRefresh() {
    seedHLAPI.getter("CubeRunner", "getAllPositions", {}).then((allPositionsJSON) => {
        let allPositions = JSON.parse(allPositionsJSON);
        let users = Object.keys(allPositions);
        let javascript = "";
        javascript += "var canvas = document.getElementById(\"myCanvas\");"
        javascript += "var ctx = canvas.getContext(\"2d\");"
        javascript += "ctx.clearRect(0, 0, canvas.width, canvas.height);"

        for(let i = 0; i < users.length; i++) {
            let user = users[i];
            let position = allPositions[user];
            let rgb = numberToRGB(hashCode(user));
            javascript += drawRectJavaScript(position.x, position.y, rgb);
        }

        return seedHLAPI.getter("CubeRunner", "getAllWalls", {}).then((allWallsJSON) => {
            let allWalls = JSON.parse(allWallsJSON);
            let xPositions = Object.keys(allWalls);
            for(let xi = 0; xi < xPositions.length; xi++) {
                let x = xPositions[xi];
                let yPositions = Object.keys(allWalls[x]);
                for(let yi = 0; yi < yPositions.length; yi++) {
                    let y = yPositions[yi];
                    javascript += drawRectJavaScript(x, y, "gray", true);
                }
            }
            ipc.send("executeJavaScript", "CubeRunner", javascript);
        }).error((e) => {
            console.info("Error on fetching wall data", e);
        });
    }).error((e) => {
        console.info("Error on fetching player positions", e);
    });
}

/**
 * Takes any arbitrary string and gets a hashcode for it.
 * Based on Java's hashcode algorithm
 * 
 * @param {*} string - A string to fetch the hashcode of
 */
function hashCode(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
       hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

/**
 * Takes any number, such as a hashcode, and creates a RGB value from it
 * 
 * @param {*} number - A number to turn into a RGB value 
 */
function numberToRGB(number){
    let rgbPreSplice = (number & 0x00FFFFFF).toString(16).toUpperCase();
    return "#" + ("00000".substring(0, 6 - rgbPreSplice.length) + rgbPreSplice);
}

setInterval(() => {
    fullRefresh();
}, 150);