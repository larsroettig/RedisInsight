import { multilineCommandToOneLine, removeMonacoComments } from 'uiSrc/utils'

describe('removeMonacoComments', () => {
  const cases = [
    // Multiline command with comments
    [
      'set\r\n  foo // key name\r\n  // comment line\r\n  bar // key value',
      'set\r\n  foo \r\n  bar'
    ],
    // Multiline command with comments slashes in the double quotes
    [
      'set\r\n  foo "// key name"\r\n  // comment line\r\n // key value',
      'set\r\n  foo "// key name"'
    ],
    // Multiline command with comments slashes in the single quotes
    [
      "set\r\n  foo '// key name'\r\n  // comment line\r\n // key value",
      "set\r\n  foo '// key name'"
    ],
    // Multiline command with comments slashes in the apostrophes
    [
      'set\r\n  foo `// key name`\r\n  // comment line\r\n // key value',
      'set\r\n  foo `// key name`'
    ],
    // Multiline command with comments
    [
      'set\n  foo // key name\n  // comment line\n  bar // key value',
      'set\n  foo \n  bar'
    ],
    // Multiline command with comments and single-line command
    [
      '// comment line\nset\n foo\n bar\nget foo',
      'set\n foo\n bar\nget foo'
    ]
  ]
  test.each(cases)(
    'given %p as argument, returns %p',
    (arg: string, expectedResult) => {
      const result = removeMonacoComments(arg)
      expect(result).toEqual(expectedResult)
    }
  )
})

describe('multilineCommandToOneLine', () => {
  const cases = [
    // Multiline command and indent with single space
    [
      'set\r\n foo\r\n bar',
      'set foo bar'
    ],
    // Multiline command and indent with multiple spaces
    [
      'set\n    foo\n    bar',
      'set foo bar'
    ],
    // Multiline command with quotes
    [
      '"hset test2\n \'http://\' \'http://123\'\n \'test//test\' \'test//test\'"',
      '"hset test2 \'http://\' \'http://123\' \'test//test\' \'test//test\'"'
    ],
  ]
  test.each(cases)(
    'given %p as argument, returns %p',
    (arg: string, expectedResult) => {
      const result = multilineCommandToOneLine(arg)
      expect(result).toEqual(expectedResult)
    }
  )
})
