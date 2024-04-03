import * as core from '@actions/core'
import * as p from 'path'
import {
  checkKey,
  checkPaths,
  exec,
  getCacheBase,
  getCachePath
} from '../utils/cache'

async function run(): Promise<void> {
  try {
    /* 
      clean up caches
    */
    const cacheBase = core.getState('cache-base')
    const cleanKey = core.getInput('clean-key')
    const CLEAN_TIME = 7

    if (cleanKey) {
      await exec(
        `/bin/bash -c "find ${cacheBase} -maxdepth 1 -name '${cleanKey}*' -type d -atime +${CLEAN_TIME} -exec rm -rf {} +"`
      )
    }
  } catch (error) {
    if (error instanceof Error) core.warning(error.message)
  }

  try {
    const key = core.getInput('key')
    const base = core.getInput('base')
    const path = core.getInput('path')
    const cacheBase = getCacheBase(base)
    const cachePath = getCachePath(key, base)

    checkKey(key)
    checkPaths([path])

    await exec(`mkdir -p ${cacheBase}`)
    const find = await exec(
      `find ${cacheBase} -maxdepth 1 -name ${key} -type d`
    )
    const cacheHit = find.stdout ? true : false

    if (cacheHit === true) {
      const cp = await exec(
        `cp -rf ${p.join(cachePath, path.split('/').slice(-1)[0])} ./${path}`
      )

      core.debug(cp.stdout)
      if (cp.stderr) core.error(cp.stderr)
      if (!cp.stderr) core.info(`Cache restored with key ${key}`)
    } else {
      core.info(`Cache not found for ${key}`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
