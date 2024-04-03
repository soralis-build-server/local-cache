import * as core from '@actions/core'
import { exec, getCachePath } from '../utils/cache'

async function run(): Promise<void> {
  try {

    const key = core.getInput('key')
    const base = core.getInput('base')
    const path = core.getInput('path')
    const cachePath = getCachePath(key, base)

    await exec(`mkdir -p ${cachePath}`)
    const cp = await exec(`cp ./${path} ${cachePath}`)

    core.debug(cp.stdout)
    if (cp.stderr) core.error(cp.stderr)
    if (!cp.stderr) core.info(`Cache saved with key ${key}`)

  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
