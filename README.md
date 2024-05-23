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

By default, only descriptions and failed test results are logged. The default logging function is console.log, but this can be changed via the third argument to describe and/or test. 

Please note the following:
  - The description is always logged (first argument of the describe function)
  - If your test fails, an error will be thrown. That error will be logged along with the first argument of the test function.
  - Passing tests will not log anything (i.e. no test name will be logged)
