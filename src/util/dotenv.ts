import { config } from 'dotenv'
config()

/**
 * Minecraft Ping
 */
const pingTarget = process.env.PING_TARGET || ''
if (!pingTarget) throw new Error('Missing environment variable PING_TARGET.')

export const [domain, port = '25565'] = pingTarget.split(':')
if (!domain)
  throw new Error(
    'Invalid format of environment variable TARGET (domain missing).'
  )

export const target = `${domain}:${port}`
export const timeout = Number(process.env.PING_TIMEOUT || 5 * 1000)

/**
 * AWS CloudWatch
 */
export const AWSRegion = process.env.AWS_REGION || ''
if (!AWSRegion) throw new Error('Missing environment variable AWS_REGION.')

export const cwNamespace = process.env.CLOUDWATCH_NAMESPACE || ''
if (!cwNamespace)
  throw new Error('Missing environment variable CLOUDWATCH_NAMESPACE.')

export const cwServerName = process.env.CLOUDWATCH_SERVER_NAME || null

export const cwLogGroupName = process.env.CLOUDWATCH_LOG_GROUP_NAME || null

/**
 * Cron
 */
export const cronSchedule = process.env.CRON_SCHEDULE || ''
if (!cronSchedule)
  throw new Error('Missing environment variable CRON_SCHEDULE.')
