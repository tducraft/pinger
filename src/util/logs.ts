import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  DescribeLogGroupsCommand,
  DescribeLogStreamsCommand,
  InputLogEvent,
  PutLogEventsCommand,
  PutRetentionPolicyCommand,
} from '@aws-sdk/client-cloudwatch-logs'

const findLogGroup = async (
  client: CloudWatchLogsClient,
  logGroupName: string
) => {
  const command = new DescribeLogGroupsCommand({
    logGroupNamePrefix: logGroupName,
  })
  const { $metadata, logGroups } = await client.send(command)
  return (
    logGroups?.filter((stream) => stream.logGroupName === logGroupName) || []
  )
}

const createLogGroup = async (
  client: CloudWatchLogsClient,
  logGroupName: string
) => {
  const command = new CreateLogGroupCommand({ logGroupName })
  const response = await client.send(command)
  return response
}

const putRetentionPolicy = async (
  client: CloudWatchLogsClient,
  logGroupName: string
) => {
  const command = new PutRetentionPolicyCommand({
    logGroupName,
    retentionInDays: 731, // 731: 2 Years [Ref] https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cloudwatch-logs/interfaces/putretentionpolicycommandinput.html
  })
  const response = await client.send(command)
  return response
}

const findStream = async (
  client: CloudWatchLogsClient,
  logGroupName: string,
  logStreamName: string
) => {
  const command = new DescribeLogStreamsCommand({
    logGroupName,
    logStreamNamePrefix: logStreamName,
  })
  const { $metadata, logStreams } = await client.send(command)
  return (
    logStreams?.filter((stream) => stream.logStreamName === logStreamName) || []
  )
}

const createStream = async (
  client: CloudWatchLogsClient,
  logGroupName: string,
  logStreamName: string
) => {
  const command = new CreateLogStreamCommand({
    logGroupName,
    logStreamName,
  })
  const response = await client.send(command)
  return response
}

const putLog = async (
  client: CloudWatchLogsClient,
  logGroupName: string,
  logStreamName: string,
  logEvents: InputLogEvent[],
  sequenceToken?: string
) => {
  const command = new PutLogEventsCommand({
    logGroupName,
    logStreamName,
    logEvents,
    sequenceToken,
  })
  const response = await client.send(command)
  return response
}

export type LogInput = {
  region: string
  target: string
  serverName: null | string
  logGroupName: null | string
  logEvents: InputLogEvent[]
}
export const log = async (props: LogInput) => {
  const { region, target, serverName, logGroupName, logEvents } = props

  if (!logGroupName) return // No LogGroupName in .env, Do not export to CloudWatch Logs.

  const logStreamNamePrefix = target.replace(/:/g, '#') // Can not use ":" [Ref] https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-logs-logstream.html
  const logStreamName = serverName
    ? `${logStreamNamePrefix}#${serverName}`
    : logStreamNamePrefix

  const client = new CloudWatchLogsClient({ region })

  const logGroups = await findLogGroup(client, logGroupName)
  if (logGroups.length === 0) {
    await createLogGroup(client, logGroupName)
    await putRetentionPolicy(client, logGroupName)
  }

  const streams = await findStream(client, logGroupName, logStreamName)
  let sequenceToken = undefined
  if (streams.length === 0) {
    await createStream(client, logGroupName, logStreamName)
  } else {
    sequenceToken = streams[0].uploadSequenceToken
  }
  await putLog(client, logGroupName, logStreamName, logEvents, sequenceToken)
}
