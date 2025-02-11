import {
  MAX_PORT_NUMBER,
  MAX_TTL_NUMBER,
  validateEmail,
  validateField,
  validatePortNumber,
  validateTTLNumber,
  validateCountNumber,
  validateScoreNumber,
  validateTTLNumberForAddKey,
  MAX_DATABASE_INDEX_NUMBER,
  validateDatabaseNumber
} from '../validations'

const text1 = '123 123 123'
const text2 = 'lorem lorem12312 lorem'
const text3 = 'мама мыла раму'
const text4 = 'euihao crhrc.hrch !@#^&*($@#$'
const text5 = 'test@test.com'
const text6 = '-2323'
const text7 = '348234'
const text8 = '34823443924234234'
const text9 = '-3482.344392424'
const text10 = '348.344392421312321312312316786724'
const text11 = '3.3.1'
const text12 = '-3-2'
const text13 = '5'

describe('Validations utils', () => {
  describe('validateField', () => {
    it('validateField should return text without empty spaces', () => {
      const expectedResponse1 = '123123123'
      const expectedResponse2 = 'loremlorem12312lorem'
      const expectedResponse3 = 'мамамылараму'
      const expectedResponse4 = 'euihaocrhrc.hrch!@#^&*($@#$'

      expect(validateField(text1)).toEqual(expectedResponse1)
      expect(validateField(text2)).toEqual(expectedResponse2)
      expect(validateField(text3)).toEqual(expectedResponse3)
      expect(validateField(text4)).toEqual(expectedResponse4)
    })
  })

  describe('validateCountNumber', () => {
    it('validateCountNumber should return only positive numbers', () => {
      const expectedResponse1 = '123123123'
      const expectedResponse2 = '12312'
      const expectedResponse4 = ''
      const expectedResponse5 = ''
      const expectedResponse6 = '2323'
      const expectedResponse7 = '348234'

      expect(validateCountNumber(text1)).toEqual(expectedResponse1)
      expect(validateCountNumber(text2)).toEqual(expectedResponse2)
      expect(validateCountNumber(text4)).toEqual(expectedResponse4)
      expect(validateCountNumber(text5)).toEqual(expectedResponse5)
      expect(validateCountNumber(text6)).toEqual(expectedResponse6)
      expect(validateCountNumber(text7)).toEqual(expectedResponse7)
    })
  })

  describe('validateTTLNumber', () => {
    it('validateTTLNumber should return only numbers between 0 and MAX_TTL_NUMBER', () => {
      const expectedResponse1 = '123123123'
      const expectedResponse2 = '12312'
      const expectedResponse4 = ''
      const expectedResponse5 = ''
      const expectedResponse6 = '2323'
      const expectedResponse7 = '348234'
      const expectedResponse8 = `${MAX_TTL_NUMBER}`

      expect(validateTTLNumber(text1)).toEqual(expectedResponse1)
      expect(validateTTLNumber(text2)).toEqual(expectedResponse2)
      expect(validateTTLNumber(text4)).toEqual(expectedResponse4)
      expect(validateTTLNumber(text5)).toEqual(expectedResponse5)
      expect(validateTTLNumber(text6)).toEqual(expectedResponse6)
      expect(validateTTLNumber(text7)).toEqual(expectedResponse7)
      expect(validateTTLNumber(text8)).toEqual(expectedResponse8)
    })
  })

  describe('validateTTLNumberForAddKey', () => {
    it('validateTTLNumberForAddKey should return only numbers between 1 and MAX_TTL_NUMBER', () => {
      expect(validateTTLNumberForAddKey('0')).toEqual('')
      expect(validateTTLNumberForAddKey('0123')).toEqual('123')
      expect(validateTTLNumberForAddKey('300')).toEqual('300')
    })
  })

  describe('validateScoreNumber', () => {
    it('validateScoreNumber should return numbers with 15 decimal places max, negative values are allowed', () => {
      const expectedResponse1 = '123123123'
      const expectedResponse2 = '12312'
      const expectedResponse6 = '-2323'
      const expectedResponse7 = '348234'
      const expectedResponse9 = '-3482.344392424'
      const expectedResponse10 = '348.344392421312321'
      const expectedResponse11 = '3.31'
      const expectedResponse12 = '-32'

      expect(validateScoreNumber(text1)).toEqual(expectedResponse1)
      expect(validateScoreNumber(text2)).toEqual(expectedResponse2)
      expect(validateScoreNumber(text6)).toEqual(expectedResponse6)
      expect(validateScoreNumber(text7)).toEqual(expectedResponse7)
      expect(validateScoreNumber(text9)).toEqual(expectedResponse9)
      expect(validateScoreNumber(text10)).toEqual(expectedResponse10)
      expect(validateScoreNumber(text11)).toEqual(expectedResponse11)
      expect(validateScoreNumber(text12)).toEqual(expectedResponse12)
    })
  })

  describe('validatePortNumber', () => {
    it('validatePortNumber should return only numbers between 0 and MAX_PORT_NUMBER', () => {
      const expectedResponse1 = `${MAX_PORT_NUMBER}`
      const expectedResponse2 = '12312'
      const expectedResponse4 = '0'
      const expectedResponse5 = '0'
      const expectedResponse6 = '2323'
      const expectedResponse7 = `${MAX_PORT_NUMBER}`
      const expectedResponse8 = `${MAX_PORT_NUMBER}`

      expect(validatePortNumber(text1)).toEqual(expectedResponse1)
      expect(validatePortNumber(text2)).toEqual(expectedResponse2)
      expect(validatePortNumber(text4)).toEqual(expectedResponse4)
      expect(validatePortNumber(text5)).toEqual(expectedResponse5)
      expect(validatePortNumber(text6)).toEqual(expectedResponse6)
      expect(validatePortNumber(text7)).toEqual(expectedResponse7)
      expect(validatePortNumber(text8)).toEqual(expectedResponse8)
    })
  })

  describe('validateDatabaseNumber', () => {
    it('validateDatabaseNumber should return only numbers between 0 and MAX_DATABASE_INDEX_NUMBER', () => {
      const expectedResponse1 = `${MAX_DATABASE_INDEX_NUMBER}`
      const expectedResponse2 = `${MAX_DATABASE_INDEX_NUMBER}`
      const expectedResponse4 = '0'
      const expectedResponse5 = '0'
      const expectedResponse6 = `${MAX_DATABASE_INDEX_NUMBER}`
      const expectedResponse7 = `${MAX_DATABASE_INDEX_NUMBER}`
      const expectedResponse8 = `${MAX_DATABASE_INDEX_NUMBER}`
      const expectedResponse13 = '5'

      expect(validateDatabaseNumber(text1)).toEqual(expectedResponse1)
      expect(validateDatabaseNumber(text2)).toEqual(expectedResponse2)
      expect(validateDatabaseNumber(text4)).toEqual(expectedResponse4)
      expect(validateDatabaseNumber(text5)).toEqual(expectedResponse5)
      expect(validateDatabaseNumber(text6)).toEqual(expectedResponse6)
      expect(validateDatabaseNumber(text7)).toEqual(expectedResponse7)
      expect(validateDatabaseNumber(text8)).toEqual(expectedResponse8)
      expect(validateDatabaseNumber(text13)).toEqual(expectedResponse13)
    })
  })

  describe('validateEmail', () => {
    it('validateEmail should return "true" only for email format text', () => {
      expect(validateEmail(text1)).toBeFalsy()
      expect(validateEmail(text2)).toBeFalsy()
      expect(validateEmail(text4)).toBeFalsy()
      expect(validateEmail(text5)).toBeTruthy()
      expect(validateEmail(text6)).toBeFalsy()
      expect(validateEmail(text7)).toBeFalsy()
      expect(validateEmail(text8)).toBeFalsy()
    })
  })
})
