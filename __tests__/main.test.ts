import * as index from '../src/index'
import { loggingData } from '../src/index'
import { data } from './config'

test('test logger builds', async () => {
  const logger = await new index.Logger(data)
  while (logger.configured) {
    console.log('looping')
  } //delay to ensure logger is setup
  await logger.shutdown()
})

test('logs to console', async () => {
  let config = { console: data.console }
  const logger = new index.Logger(config)
  while (logger.configured) {
    console.log('looping')
  } //delay to ensure logger is setup
  await logger.log(new loggingData('200', 'Successfully built logging class'))
  await logger.shutdown()
})

test('logs to sentry', async () => {
  let config = { sentry: data.sentry }
  const logger = new index.Logger(config)
  while (logger.configured) {
    console.log('looping')
  } //delay to ensure logger is setup
  await logger.log(new loggingData('500', 'Successfully logged to sentry'))
  await logger.shutdown()
})

test('logs to gcp', async () => {
  let config = { gcp: data.gcp }
  const logger = new index.Logger(config)
  while (logger.configured) {
    console.log('looping')
  } //delay to ensure logger is setup
  await logger.log(new loggingData('200', 'Successfully logged to gcp'))
  await logger.shutdown()
})

test('logs to file', async () => {
  let config = { file: data.file }
  const logger = new index.Logger(config)
  while (logger.configured) {
    console.log('looping')
  } //delay to ensure logger is setup
  await logger.log(new loggingData('200', 'Successfully logged to file'))
  await logger.shutdown()
})
