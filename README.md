This is a function to help run tests in Google Apps Script projects.

# How to use
1. Set up constants for each of the testing functions
```
const {describe, test, expect} = MyTest
```
2. Identify the function you want to test
```
// This is the function we will test
function returnsTwo(){
  return 2
}
```
3. Create a function that contains your tests
```
/**
 * @param {() => number} fn
 */
function testReturnsTwo(fn = returnsTwo){
  describe(fn.name, () => {
    test("Should return two", () => {
      expect(fn()).toEqual(2)
    })
  })
}
```
4. Run your function
```
testReturnsTwo()
```

By default, only descriptions and failed test results are logged. The default logging functions are is console.log and console.warn. The logging functions can be changed via arguments to describe and test.

Please note the following:
  - The description is always logged (first argument of the describe function).
  - If your test fails, an error will be thrown. The error will be logged along with: the test's name (i.e. first argument of the test function), the value passed into the expect function, and the expeced value.
  - Passing tests will only log the test name.
