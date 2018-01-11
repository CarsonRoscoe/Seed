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

let leanMultiplyHash = cryptographyHelper.SHA256(multiply.function + multiply.version);
let fullMultiplyHash = cryptographyHelper.SHA256(multiply.invoke.toString() + multiply.function + multiply.version);

mathModule.addFunction(multiply);

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