/**
 * Creates a wrapper around your test function. It logs the description and runs the fn (i.e your test function.) You can run multiple tests in your fn and use this describe function to group them together.
 * @param {string} description A description for a group of tests.
 * @param {() => void} fn The function that will be called to run the group of tests.
 * @param {(description:string) => void} loggingFn A function to log input description.
 */
function describe(description, fn, loggingFn = console.log) {
    loggingFn(description);
    fn();
}

/**
 * Creates a wrapper around your tests. It logs a success message if the test passes (i.e. does not throw) and logs an error message if the test fails (i.e throws an error).
 * 
 * To test a method that you expect to throw an error, set up a try catch block in your test function to catch the error and return true if the error was what you expected.
 * @param {string} testName A name or description for your test.
 * @param {() => void} fn The function that will be called to run the test.
 * @param {(description:string) => void} onErrorLoggingFn A function to log error messages.
 * @param {(description:string) => void} onSuccessLoggingFn A function to log a success message.
 */
function test(testName, fn, onErrorLoggingFn = console.warn, onSuccessLoggingFn = console.log) {
    const errorMessage = createMessageOnFailureOrError_(testName, fn);
    if (errorMessage) {
      onErrorLoggingFn(errorMessage);
    }else{
      const successMessage = buildSuccessTestMessage_(testName)
      onSuccessLoggingFn(successMessage)
    }
}

/**
 * Use this in the test function to evaluate whether your functions are returning the results you expect. Returns an object to test equality against theValueYouGot. If the test is true, the function returns undefined. If the test is false, the function throws an error.
 * @param {unknown} theValueYouGot The value you want to test.
 * @return {{toEqual:(theValueYouExpect:unknown) => void, toBeNull:() => void, toBeUndefined:() => void}}
 */
function expect(theValueYouGot) {
  return {
      toEqual: (theValueYouExpect) => testEquality_(theValueYouGot, theValueYouExpect),
      toBeNull: () => testEquality_(theValueYouGot, null),
      toBeUndefined: () => testEquality_(theValueYouGot, undefined)
  };
}

/**
 * @param {string} testName
 * @param {() => void} testFunction
 */
function createMessageOnFailureOrError_(testName, testFunction) {
    try {
        testFunction();
    }
    catch (/** @type {Error} */ err) {
        if (err instanceof FailedTestError) {
            return buildFailedTestMessage_(testName, `${err.stack}`.replace(`${err.name}:`, "").trim());
        }
        else {
            return buildErrorMessage_(testName, err);
        }
    }
}

/**
 * @param {string} testName
 * @param {string} errorMessage
 */
function buildFailedTestMessage_(testName, errorMessage) {
    return `FAILED\nTest:${testName}\n${errorMessage}`;
}

/**
 * @param {string} testName
 * @param {string} errorMessage
 */
function buildSuccessTestMessage_(testName) {
    return `PASSED\nTest:${testName}`;
}

/**
 * @param {string} testName
 * @param {string} errorMessage
 */
function buildFailedTestMessage_(testName, errorMessage) {
    return `FAILED\nTest:${testName}\n${errorMessage}`;
}

/**
 * @param {string} testName
 * @param {string | Error} errorMessage
 */
function buildErrorMessage_(testName, errorMessage) {
    return `ERROR\n${testName}\n${errorMessage}`;
}

/**
 * @param {unknown} gotResult
 * @param {unknown} expectedResult
 */
function throwFailedTest_(gotResult, expectedResult) {
    throw new FailedTestError(gotResult, expectedResult);
}

/**
 * @param {unknown} gotResult
 * @param {unknown} expectedResult
 */
function testEquality_(gotResult, expectedResult) {
    return areEqual(gotResult, expectedResult) ? undefined : throwFailedTest_(gotResult, expectedResult);
}

/**
 * @typedef {Error} FailedTestError
 */
class FailedTestError {
  // Used this as inspiration for creating my own error
  // https://humanwhocodes.com/blog/2009/03/10/the-art-of-throwing-javascript-errors-part-2/
  constructor(gotResult, expectedResult) {
    // https://stackoverflow.com/questions/8458984/how-do-i-get-a-correct-backtrace-for-a-custom-error-class-in-nodejs
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.message = `Got:${JSON.stringify(gotResult)}\nExpected:${JSON.stringify(expectedResult)}`;
    this.name = "FailedTest";
  }
}

/**
 * Tests whether two values are the same.
 * @param {unknown} x
 * @param {unknown} y
 */
function areEqual(x, y) {
    if (x === null || y === null)
        return bothValuesAreNull(x, y);
    else if (x === undefined || y === undefined)
        return bothValuesAreUndefined(x, y);
    else if (Array.isArray(x) && Array.isArray(y))
        return arrayElementsToJson(x) === arrayElementsToJson(y);
    else if (isMap(x) && isMap(y))
        return mapToJson(x) === mapToJson(y);
    else if (isObject(x) && isObject(y))
        return objectToJson(x) === objectToJson(y);
    return JSON.stringify(x) === JSON.stringify(y);
    function bothValuesAreNull(x, y) {
        return (x === null) && (y === null);
    }
    function bothValuesAreUndefined(x, y) {
        return (x === undefined) && (y === undefined);
    }
    function mapToJson(x) {
        return arrayElementsToJson(Array.from(x.entries()).sort());
    }
    function objectToJson(x) {
        if (x === null || x === undefined) {
            return x;
        }
        return JSON.stringify(Object.entries(x).sort().map(([key, val]) => [key, jsonify(val)]));
    }
    function arrayElementsToJson(x) {
        return JSON.stringify(x.map(jsonify));
    }
    function jsonify(x) {
        if (Array.isArray(x)) {
            return arrayElementsToJson(x);
        }
        else if (isObject(x)) {
            return objectToJson(x);
        }
        return JSON.stringify(x);
    }
    function isObject(x) {
        return typeof x === "object";
    }
    function isMap(x) {
        return x instanceof Map;
    }
}
