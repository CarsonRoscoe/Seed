console.log("seedSrc npm hit");

const cryptographyExporter = require("./cryptography.js");

const cryptographyHelper = cryptographyExporter.newCryptographyHelper();
const cryptographyUnitTests = cryptographyExporter.newCryptographyUnitTests();

//cryptographyUnitTests.RunTests();

console.log("Test Complete");

const vmExporter = require("./virtualMachine.js");

let svm = vmExporter.createVirtualMachine();
let mathModule = vmExporter.createModule({module : "math", version : "1.0.0"});
let multiply = {
    function : "multiply",
    version : "1.0.0",
    invoke : function (a, b) {
        return a * b;
    }
}

class UserData extends Storage {
    constructor() {
        this.data = {};
    }

    set(info) {
        if (info.variable != null && info.value != null) {
            this.data[info.variable] = info.value;
        }
    }

    get(info) {
        if (info.variable != null) {
            return this.data[info.variable];
        } else {
            return null;
        }
    }
}

class ModuleData extends Storage {
    constructor() {
        this.userData = {};
        this.data = {};
    }


    addUser(publicKey) {
        if (this.userData[publicKey] == null) {
            this.userData[publicKey] = {}
        }
    }

    set(info) {
        if (info.user != null) {
            if (this.userData[info.user] != null) {
                this.userData[info.user].set(info);
            }
        } else if (info.variable != null && info.value != null) {
            this.data[info.variable] = info.value;
        }
    }

    get(info) {
        if (info.user != null) {
            if (info.variable != null) {
                return this.userData[info.user].get(info);
            }
            return this.userData[info.user];
        }
    }
}

class Ledger {
    constructor() {
        this.modules = {};
    }

    add(info) {
        if (info.module != null) {
            if (this.modules[info.module] == null) {

            }
        }
    }

    get(info) {
        let module = info.module;
        let use = info.use;
        let variable = info.variable;
    }
}

let testModule = vmExporter.createModule({module : "seed", version : "1.0.0"});
let updateX = {
    function : "updateX",
    version : "1.0.0",
    invoke : function (info) {
        let sender = info.sender;
        let ledger = info.ledger;
        let xValue = ledger.get({ module : info.module, user : sender, variable : "x" });
        ledger.update({ module : info.module, user : sender, x : xValue + 1 });
    }
}

let leanMultiplyHash = cryptographyHelper.SHA256(multiply.function + multiply.version);
let fullMultiplyHash = cryptographyHelper.SHA256(multiply.invoke.toString() + multiply.function + multiply.version);

mathModule.addFunction(multiply);
mathModule.addFunction(updateX);

svm.addModule(mathModule);

let multiply2 = svm.getFunction({module : "math", function : "multiply", version : "1.0.0"});

let leanInfoValidation = svm.isFunctionLeanInfoCorrect({ module : "math", function : "multiply", version : "1.0.0"}, leanMultiplyHash);
let fullValidation = svm.isFunctionCorrect({module : "math", function : multiply.function, version : multiply.version}, fullMultiplyHash);

if (leanInfoValidation && fullValidation) {
    let answer = multiply.invoke(5, 10);
    console.log("math.multipl version 1.0 says 5*10=" + answer);
} else {
    console.log("Failed: " + leanInfoValidation + " " + fullValidation);
}