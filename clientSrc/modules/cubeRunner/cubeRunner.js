const moduleExporter = require("../../../seedSrc/module.js");

/**
 * Name: 
 *      CubeRunner
 * 
 * Description:
 *      A simple module for testing the Seed system as a game. 
 *      Users run around and cannot run through walls.
 *      
 * State Changing Functions:
 *      move(xOffset, yOffset)
 *      
 * Getters:
 *      getPosition(publicKey)
 *      getAllPositions()
 *      
 *  Module-Data:
 *      walls : mapping(x => mapping ( y : true ))
 *      
 *  User-Data:
 *      x : number
 *      y : number
 */

 let cubeRunnerModule = null;

module.exports = {
    getModule : function() {
        if (cubeRunnerModule == null) {
            cubeRunnerModule = moduleExporter.createModule({
                module : "CubeRunner", 
                initialData : initialCubeRunnerState,
                initialUserData : initialUserState,
                functions : {
                    move : move,
                    teleport : teleport,
                    getPosition : getPosition,
                    getAllPositions : getAllPositions,
                    getAllWalls : getAllWalls
                }
            });
        }
        return cubeRunnerModule;
    }
 }

/*  ### Seed's Initial Variable State ### */
let initialCubeRunnerState = { 
    walls : { 
        "3" : { "5" : true, "6" : true, "7" : true }, //Creates walls at (-4,-1),(-4,0) and (-4,1)
    }
}

/*  ### Each Seed User's Initial Variable State ### */
let initialUserState = {
    x : 0, // Starts all users at x of 0
    y : 0  // Starts all users at y of 0
}

/*  
    ################################
    ### State Changing Functions ###
    ################################ 
*/

/**
 * Moves the sneder on the x or y as dictated by the parameters
 * 
 * args:
 *      xOffset : number
 *      yOffset : number
 * 
 * changes:
 *      Changes the x or y position of the sender
 * 
 * @param {Container} container - Container object that holds read-only data
 * @param {ChangeContext} changeContext - Write-Only object to hold changes to module and userData state
 */
let move = function(container, changeContext) {
    let gameData = container.getModuleData();
    let userData = container.getSenderData();
    let walls = gameData["walls"];

    let xOffset = container.args.xOffset;
    let yOffset = container.args.yOffset;

    // If we are moving no more than 1 space, and its EITHER horizontally or vertically
    if (Math.abs(xOffset) + Math.abs(yOffset) == 1 && (Math.abs(xOffset) == 1 || Math.abs(yOffset) == 1 )) {
        // If we are moving horizontally and there is a wall on that side, do not move in that direction 
        if (Math.abs(xOffset) > 0 && walls[userData.x + xOffset] && walls[userData.x + xOffset][userData.y]) {
            return changeContext;
        }
        // If we are moving vertically and there is a wall on that side, do not move in that direction 
        if (Math.abs(yOffset) > 0 && walls[userData.x] && walls[userData.x][userData.y + yOffset]) {
            return changeContext;
        }
    }
    if (xOffset == -1) {
        changeContext.subtract(1, { user : container.sender, key : "x" });
    } else if (xOffset == 1) {
        changeContext.add(1, { user : container.sender, key : "x" });
    } else if (yOffset == -1) {
        changeContext.subtract(1, { user : container.sender, key : "y" });
    } else if (yOffset == 1) {
        changeContext.add(1, { user : container.sender, key : "y" });
    }
    return changeContext;
}

/**
 * Teleports the sender forward a given amount
 * 
 * args:
 *      x : number
 *      y : number
 * 
 * changes:
 *      Changes the x or y position of the sender
 * 
 * @param {Container} container - Container object that holds read-only data
 * @param {ChangeContext} changeContext - Write-Only object to hold changes to module and userData state
 */
let teleport = function(container, changeContext) {
    let gameData = container.getModuleData();
    let userData = container.getSenderData();

    let x = container.args.x;
    let y = container.args.y;

    changeContext.add(x, { user : container.sender, key : "x" });
    changeContext.add(y, { user : container.sender, key : "y" });
    
    return changeContext;
}

/*  
    #########################
    ### Read-Only Getters ###
    #########################
*/

/**
 * Gets the x and y position of a user
 * 
 * args:
 *      user - Who we are getting the x and y position of
 * 
 * @param {*} container - Container object that holds read-only data
 */
let getPosition = function(container) {
    let userData = container.getUserData(container.args.user);
    if (userData) {
        return { x : userData.x, y : userData.y };
    }
}

/**
 * Gets the x and y positions of every user who has used the module before
 * 
 * @param {*} container - Container object that holds read-only data
 */
let getAllPositions = function(container) {
    return JSON.stringify(container.getModuleData().userData);
}

/**
 * Gets the x and y positions of every wall in the module
 * 
 * @param {*} container - Container object that holds read-only data
 */
let getAllWalls = function(container) {
    return JSON.stringify(container.getModuleData().walls);
}