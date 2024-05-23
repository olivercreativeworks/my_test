const MyTest = (function(){

  return {
    describe,
    test,
    expect
  }

  /**
   * @param {string} description
   * @param {() => void} fn
   * @param {(description:string) => void} loggingFn
   */
  function describe(description, fn, loggingFn = console.log) {
      loggingFn(description);
      fn();
  }
  /**
   * @param {string} testName
   * @param {() => void} fn
   * @param {(description:string) => void} onErrorLoggingFn
   * @param {(description:string) => void} onSuccessLoggingFn
   */
  function test(testName, fn, onErrorLoggingFn = console.warn, onSuccessLoggingFn = console.log) {
      const errorMessage = createMessageOnFailureOrError(testName, fn);
      if (errorMessage) {
        onErrorLoggingFn(errorMessage);
      }else{
        const successMessage = buildSuccessTestMessage(testName)
        onSuccessLoggingFn(successMessage)
      }
  }
  /**
   * @param {unknown} theValueYouGot
   */
  function expect(theValueYouGot) {
      return {
          toEqual: /** @param {unknown} theValueYouExpect */ (theValueYouExpect) => testEquality(theValueYouGot, theValueYouExpect),
          toBeNull: () => testEquality(theValueYouGot, null),
          toBeUndefined: () => testEquality(theValueYouGot, undefined)
      };
  }
  /**
   * @param {string} testName
   * @param {() => void} testFunction
   */
  function createMessageOnFailureOrError(testName, testFunction) {
      try {
          testFunction();
      }
      catch (/** @type {Error} */ err) {
          if (err instanceof FailedTestError) {
              return buildFailedTestMessage(testName, `${err.stack}`.replace(`${err.name}:`, "").trim());
          }
          else {
              return buildErrorMessage(testName, err);
          }
      }
  }
  /**
   * @param {string} testName
   * @param {string} errorMessage
   */
  function buildFailedTestMessage(testName, errorMessage) {
      return `FAILED\nTest:${testName}\n${errorMessage}`;
  }
  /**
   * @param {string} testName
   * @param {string} errorMessage
   */
  function buildSuccessTestMessage(testName) {
      return `PASSED\nTest:${testName}`;
  }
  /**
   * @param {string} testName
   * @param {string} errorMessage
   */
  function buildFailedTestMessage(testName, errorMessage) {
      return `FAILED\nTest:${testName}\n${errorMessage}`;
  }
  /**
   * @param {string} testName
   * @param {string | Error} errorMessage
   */
  function buildErrorMessage(testName, errorMessage) {
      return `ERROR\n${testName}\n${errorMessage}`;
  }
  /**
   * @param {unknown} gotResult
   * @param {unknown} expectedResult
   */
  function throwFailedTest(gotResult, expectedResult) {
      throw new FailedTestError(gotResult, expectedResult);
  }
  /**
   * @param {unknown} gotResult
   * @param {unknown} expectedResult
   */
  function testEquality(gotResult, expectedResult) {
      return areEqual(gotResult, expectedResult) ? undefined : throwFailedTest(gotResult, expectedResult);
  }
})()

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
