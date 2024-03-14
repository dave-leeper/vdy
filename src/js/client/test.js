const assert = (passed, description, results, optionalThrowOnError) => {
  if (description && results) { results.push({ description, passed: !!passed }) }
  if (!!passed || !optionalThrowOnError) { return }
  if (results) { throw results } 
  else if (description) { throw new Error(description) }
  else { throw new Error(`Assert failed.`) }
}
const test = async (t) => {
  if (t.before) { t.before() } 

  const testNode = new TreeNode(t.name)
  const start = Date.now()
  const testResults = await t.test()
  const duration = Date.now() - start
  let testFailCount = 0

  for (let loop = 0; loop < testResults.length; loop++) {
    const result = testResults[loop]

    if (!result.passed) { testFailCount++} 
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

const simulateKey = (element, event, key, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false) => {
  const keyEvent = new KeyboardEvent(event, { key, ctrlKey, altKey, shiftKey, metaKey })

  element.dispatchEvent(keyEvent)
}
const simulateKeydown = (element, key, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false) => { simulateKey(element, `keydown`, key, ctrlKey, altKey, shiftKey, metaKey) }
const simulateKeyup = (element, key, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false) => { simulateKey(element, `keyup`, key, ctrlKey, altKey, shiftKey, metaKey) }
const simulateKeypress = (element, key, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false) => { simulateKey(element, `keypress`, key, ctrlKey, altKey, shiftKey, metaKey) }

const TestMsgs = {
    GET_TEST_DOM_ELEMENT: `GET_TEST_DOM_ELEMENT`
}
const getTestDOMElement = async () => { 
  const callResults = await Queue.call(TestMsgs.GET_TEST_DOM_ELEMENT, null) 

  return callResults
}

