import {
  CloudWatchClient,
  MetricDatum,
  PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch'

const StatusCheckFailed = 'StatusCheckFailed'
const Players = 'Players'

export type PutMetricDataInput = {
  region: string
  time: Date
  failed: number
  playersCount: number
  namespace: string
  dimensionServerName: null | string
  dimensionTarget: string
}

export const putMeticData = async (props: PutMetricDataInput) => {
  const {
    region,
    time,
    failed,
    playersCount,
    namespace,
    dimensionServerName,
    dimensionTarget,
  } = props
  const client = new CloudWatchClient({ region: region })

  const datum: MetricDatum[] = []

  // StatusCheckFailed
  datum.push({
    MetricName: StatusCheckFailed,
    Timestamp: time,
    Value: failed,
    Dimensions: [{ Name: 'Target', Value: dimensionTarget }],
  })
  if (dimensionServerName) {
    datum.push({
      MetricName: StatusCheckFailed,
      Timestamp: time,
      Value: failed,
      Dimensions: [{ Name: 'ServerName', Value: dimensionServerName }],
    })
    datum.push({
      MetricName: StatusCheckFailed,
      Timestamp: time,
      Value: failed,
      Dimensions: [
        { Name: 'Target', Value: dimensionTarget },
        { Name: 'ServerName', Value: dimensionServerName },
      ],
    })
  }

  // Players
  if (playersCount !== -1) {
    datum.push({
      MetricName: Players,
      Timestamp: time,
      Value: playersCount,
      Dimensions: [{ Name: 'Target', Value: dimensionTarget }],
    })
    if (dimensionServerName) {
      datum.push({
        MetricName: Players,
        Timestamp: time,
        Value: playersCount,
        Dimensions: [{ Name: 'ServerName', Value: dimensionServerName }],
      })
      datum.push({
        MetricName: Players,
        Timestamp: time,
        Value: playersCount,
        Dimensions: [
          { Name: 'Target', Value: dimensionTarget },
          { Name: 'ServerName', Value: dimensionServerName },
        ],
      })
    }
  }

  const command = new PutMetricDataCommand({
    MetricData: datum,
    Namespace: namespace,
  })
  const response = await client.send(command)
  return response
}
