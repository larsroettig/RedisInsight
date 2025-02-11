/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon'

import {
  cachedIcons,
  parseInfoRawResponse,
  parseSearchRawResponse,
  parseAggregateRawResponse
} from './utils'
import { Command } from './constants'
import { TableInfoResult, TableResult } from './components'

interface Props {
  command: string,
  response: any,
  status: string
}

// This is problematic for some bundlers and/or deployments,
// so a method exists to preload specific icons an application needs.
appendIconComponentCache(cachedIcons)

const App = (props: Props) => {
  const { command = '', response = [], status = '' } = props

  if (status === 'fail') {
    return <div className="responseFail">{response}</div>
  }

  const commandUpper = command.toUpperCase()

  if (commandUpper.startsWith(Command.Info)) {
    const result = parseInfoRawResponse(response)
    return <TableInfoResult query={command} result={result} />
  }

  if (commandUpper.startsWith(Command.Aggregate)) {
    const [matched, ...arrayResponse] = response
    globalThis.PluginSDK?.setHeaderText?.(`Matched:${matched}`)

    const result = parseAggregateRawResponse(arrayResponse)
    return <TableResult query={command} result={result} matched={matched} />
  }

  if (commandUpper.startsWith(Command.Search)) {
    const [matched, ...arrayResponse] = response
    globalThis.PluginSDK?.setHeaderText?.(`Matched:${matched}`)

    const result = parseSearchRawResponse(command, arrayResponse)
    return <TableResult query={command} result={result} matched={matched} />
  }

  return null
}

export default App
