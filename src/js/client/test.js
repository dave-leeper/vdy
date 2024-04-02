/**
 * Asserts that a condition is truthy. 
 * Logs the assertion result and optionally throws an error on failure.
 * 
 * @param {boolean} passed - Whether the assertion passed
 * @param {string} [description] - Optional description of the assertion
 * @param {Object[]} [results] - Optional array to log assertion results to 
 * @param {boolean} [optionalThrowOnError=false] - Whether to throw an error on failure
 */
const assert = (passed, description, results, optionalThrowOnError) => {
  if (description && results) { results.push({ description, passed: !!passed }) }
  if (!!passed || !optionalThrowOnError) { return }
  if (results) { throw results }
  else if (description) { throw new Error(description) }
  else { throw new Error(`Assert failed.`) }
}
/**
 * Runs a test function and returns a test result tree node.
 * 
 * Executes the test's `before()` hook, measures the test duration, 
 * collects assertion results, determines if the test passed,
 * and executes the `after()` hook.
 * 
 * The returned test result node contains the test name, duration, 
 * results, pass/fail status, failed assertion count, and a method
 * to retrieve just the failed assertions.
 *
 * @param {Object} t - The test object with name, test function, etc.
 * @returns {Object} The test result tree node
*/
const test = async (t) => {
  if (t.before) { t.before() }

  const testNode = new TreeNode(t.name)
  const start = Date.now()
  const testResults = await t.test()
  const duration = Date.now() - start
  let testFailCount = 0

  for (let loop = 0; loop < testResults.length; loop++) {
    const result = testResults[loop]

    if (!result.passed) { testFailCount++ }
  }
  testNode.name = t.name
  testNode.description = t.description
  testNode.results = testResults
  testNode.duration = duration
  testNode.passed = (0 === testFailCount)
  testNode.failCount = testFailCount
  testNode.getFailedAsserts = () => {
    let failedAsserts = []

    if (testNode.passed) { return failedAsserts }
    for (let result of testNode.results) {
      if (result.passed) { continue }
      failedAsserts.push(result)
    }
    return failedAsserts
  }

  if (t.after) { t.after() }
  return testNode
}
/**
 * Runs a test suite containing multiple test cases.
 * 
 * Executes any `before()` hook on the suite, runs each test case, 
 * collects results, determines if the suite passed, executes any `after()` hook,
 * and returns a test suite result tree.
 * 
 * The returned suite result contains the suite name, description, all test cases,
 * total failed assertions count, pass/fail status, and a method to get just 
 * the failed assertions across all test cases.
 * 
 * An optional view builder callback can be passed in to format the results.
 */
const suite = async (tests, optionalViewBuilder) => {
  if (tests.before) { tests.before() }

  let suiteTree = new Tree(tests.name)
  let suiteFailCount = 0

  suiteTree.name = tests.name
  suiteTree.description = tests.description
  suiteTree.passed = true
  suiteTree.type = `SUITE`
  for (let loop = 0; loop < tests.tests.length; loop++) {
    const t = tests.tests[loop]
    const testNode = await test(t)

    suiteTree.addNode(testNode)
    suiteFailCount += testNode.failCount
  }
  suiteTree.passed = (0 === suiteFailCount)
  suiteTree.failCount = suiteFailCount
  suiteTree.getFailedAsserts = () => {
    let failedAsserts = []

    if (0 === suiteTree.failCount) { return failedAsserts }
    for (let test of suiteTree.nodes) {
      if (test.passed) { continue }

      const failed = test.getFailedAsserts()

      failedAsserts = failedAsserts.concat(failed)
    }
    return failedAsserts
  }

  if (tests.after) { tests.after() }
  optionalViewBuilder && optionalViewBuilder(suiteTree)

  return suiteTree
}

/**
 * Simulates a keyboard event on the given element.
 * 
 * @param {HTMLElement} element - The element to dispatch the event on.
 * @param {string} event - The type of event to dispatch.
 * @param {string} key - The key value of the KeyboardEvent.
 * @param {boolean} [ctrlKey=false] - Whether the control key is pressed. 
 * @param {boolean} [altKey=false] - Whether the alt key is pressed.
 * @param {boolean} [shiftKey=false] - Whether the shift key is pressed.
 * @param {boolean} [metaKey=false] - Whether the meta key is pressed.
 */
const simulateKey = (element, event, key, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false) => {
  const keyEvent = new KeyboardEvent(event, { key, ctrlKey, altKey, shiftKey, metaKey })

  element.dispatchEvent(keyEvent)
}
/**
 * Simulates a keydown event on the given element.
 * 
 * @param {HTMLElement} element - The element to dispatch the event on. 
 * @param {string} key - The key value of the KeyboardEvent.
 * @param {boolean} [ctrlKey=false] - Whether the control key is pressed.
 * @param {boolean} [altKey=false] - Whether the alt key is pressed. 
 * @param {boolean} [shiftKey=false] - Whether the shift key is pressed.
 * @param {boolean} [metaKey=false] - Whether the meta key is pressed.
 */
const simulateKeydown = (element, key, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false) => { simulateKey(element, `keydown`, key, ctrlKey, altKey, shiftKey, metaKey) }
/** 
 * Simulates a keyup event on the given element.
 *
 * @param {HTMLElement} element - The element to dispatch the event on.
 * @param {string} key - The key value of the KeyboardEvent. 
 * @param {boolean} [ctrlKey=false] - Whether the control key is pressed.
 * @param {boolean} [altKey=false] - Whether the alt key is pressed.
 * @param {boolean} [shiftKey=false] - Whether the shift key is pressed. 
 * @param {boolean} [metaKey=false] - Whether the meta key is pressed.
 */
const simulateKeyup = (element, key, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false) => { simulateKey(element, `keyup`, key, ctrlKey, altKey, shiftKey, metaKey) }
/**
 * Simulates a keypress event on the given element.
 * 
 * @param {HTMLElement} element - The element to dispatch the event on.
 * @param {string} key - The key value of the KeyboardEvent.
 * @param {boolean} [ctrlKey=false] - Whether the control key is pressed.
 * @param {boolean} [altKey=false] - Whether the alt key is pressed. 
 * @param {boolean} [shiftKey=false] - Whether the shift key is pressed.
 * @param {boolean} [metaKey=false] - Whether the meta key is pressed.
 */
const simulateKeypress = (element, key, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false) => { simulateKey(element, `keypress`, key, ctrlKey, altKey, shiftKey, metaKey) }

const TestMsgs = {
    GET_TEST_DOM_ELEMENT: `GET_TEST_DOM_ELEMENT`
}
/**
 * Gets the test DOM element by sending a message and awaiting the result.
 */
const getTestDOMElement = async () => {
  const callResults = await Queue.call(TestMsgs.GET_TEST_DOM_ELEMENT, null)

  return callResults
}

