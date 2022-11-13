import { InputLogEvent } from '@aws-sdk/client-cloudwatch-logs'
import { CronJob } from 'cron'
import { IMinecraftData } from 'minecraft-server-ping/dist/interfaces'
import {
  AWSRegion,
  cronSchedule,
  cwLogGroupName,
  cwNamespace,
  cwServerName,
  domain,
  port,
  target,
  timeout,
} from './util/dotenv'
import { log } from './util/logs'
import { putMeticData } from './util/metric'
import { pinger } from './util/pinger'

type LogFormat = {
  timestamp?: number
  message: string
  isSuccess?: boolean
  body?: IMinecraftData
}
const createLogEvent = (props: LogFormat): InputLogEvent => {
  const { timestamp, message, ..._props } = props
  return {
    message: JSON.stringify({
      message,
      target,
      ..._props,
    }),
    timestamp: timestamp ?? Date.now(),
  }
}

console.log('Config', {
  AWSRegion,
  cronSchedule,
  cwNamespace,
  cwServerName,
  domain,
  port,
  target,
  timeout,
})

log({
  region: AWSRegion,
  target: target,
  serverName: cwServerName,
  logGroupName: cwLogGroupName,
  logEvents: [createLogEvent({ message: 'Server Start' })],
}).catch(console.error)

const cronTime = cronSchedule
const onTick = async () => {
  const logEvents: InputLogEvent[] = []

  try {
    const time = new Date()
    const result = await pinger({ domain, port, timeout })
    // console.log(JSON.stringify(result, null, 2))
    const players = result.body?.players.online ?? -1
    const response = await putMeticData({
      region: AWSRegion,
      time: time,
      failed: result.isSuccess ? 0 : 1,
      playersCount: players,
      namespace: cwNamespace,
      dimensionServerName: cwServerName,
      dimensionTarget: target,
    })
    const success = result.isSuccess ? 'Success' : 'Failed'
    const _log = `[JOB] Time=${time.toISOString()}, Target=${target}, Players=${players}, Status=${success}`
    console.log(_log)
    const message = result.isSuccess
      ? 'OK'
      : `Error: ${result.error?.message || 'Unknown Error'}`
    logEvents.push(
      createLogEvent({
        message: message,
        isSuccess: result.isSuccess,
        body: result.body,
      })
    )
  } catch (err) {
    console.error(err)
    logEvents.push(createLogEvent({ message: `Error: ${err.message}` }))
  }
  try {
    // Log Flush
    await log({
      region: AWSRegion,
      target: target,
      serverName: cwServerName,
      logGroupName: cwLogGroupName,
      logEvents,
    })
  } catch (err) {
    console.error('[LogStreamError]', err)
  }
  // job.stop()
}
const onComplete = () => {
  console.log('Cron stopped.')
}
const isStart = true
const timezone = 'Etc/UTC'
const job = new CronJob(cronTime, onTick, onComplete, isStart, timezone)
