import {
  CloudWatchClient,
  MetricDatum,
  PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch'

export type PutMetricDataInput = {
  region: string
  metricName: string
  time: Date
  value: number
  namespace: string
  dimensionServerName: null | string
  dimensionTarget: string
}

export const putMeticData = async (props: PutMetricDataInput) => {
  const {
    region,
    metricName,
    time,
    value,
    namespace,
    dimensionServerName,
    dimensionTarget,
  } = props
  const client = new CloudWatchClient({ region: region })

  const datum: MetricDatum[] = [
    {
      MetricName: metricName,
      Timestamp: time,
      Value: value,
      Dimensions: [{ Name: 'Target', Value: dimensionTarget }],
    },
  ]
  if (dimensionServerName) {
    datum.push({
      MetricName: metricName,
      Timestamp: time,
      Value: value,
      Dimensions: [{ Name: 'ServerName', Value: dimensionServerName }],
    })
    datum.push({
      MetricName: metricName,
      Timestamp: time,
      Value: value,
      Dimensions: [
        { Name: 'Target', Value: dimensionTarget },
        { Name: 'ServerName', Value: dimensionServerName },
      ],
    })
  }

  const command = new PutMetricDataCommand({
    MetricData: datum,
    Namespace: namespace,
  })
  const response = await client.send(command)
  return response
}
