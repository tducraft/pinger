import { ping } from 'minecraft-server-ping'
import { IMinecraftData } from 'minecraft-server-ping/dist/interfaces'

export type PingerInput = {
  domain: string
  port: string | number
  timeout: number
}

export type PingerOutput = {
  isSuccess: boolean
  body?: IMinecraftData
  error: null | Error
}

export const pinger = async ({
  domain,
  port,
  timeout,
}: PingerInput): Promise<PingerOutput> => {
  try {
    const data = await ping(domain, Number(port), { timeout })
    return {
      isSuccess: true,
      body: data,
      error: null,
    }
  } catch (err) {
    return {
      isSuccess: false,
      body: undefined,
      error: err,
    }
  }
}
