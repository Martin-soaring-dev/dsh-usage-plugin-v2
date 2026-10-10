import test from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import plugin from '../lib/index.js'

function collected(text) {
  return { readFrom() { return { text } } }
}

function createHost(options = {}) {
  let registration = null
  const spawnCalls = []
  const services = {
    fs: null,
    webServer: {
      register(route) { registration = route }
    },
    credentials: options.credentials || {
      async resolve() { return null },
      async describe() { return { configured: false, source: '', writable: true } }
    },
    settings: {
      get(namespace) {
        assert.equal(namespace, 'llm-pi-ai')
        return { providers: options.providers || {} }
      }
    },
    subprocess: options.upstreamBody
      ? {
          async resolveExecutable() { return 'node' },
          spawn(spawnOptions) {
            spawnCalls.push(spawnOptions)
            const response = typeof options.upstreamBody === 'function'
              ? options.upstreamBody(spawnOptions)
              : options.upstreamBody
            return {
              done: Promise.resolve({ exitCode: 0 }),
              collected: {
                stdout: collected(JSON.stringify({
                  statusCode: 200,
                  contentType: 'application/json',
                  body: JSON.stringify(response)
                })),
                stderr: collected('')
              }
            }
          }
        }
      : null,
    sandboxPolicy: null,
    agents: null
  }
  const ctx = {
    get(name) { return services[name] },
    on() {}
  }
  plugin.apply(ctx)
  assert.ok(registration, 'host should register /usage/api')

  async function call(body) {
    const req = Readable.from([JSON.stringify(body)])
    let statusCode = 0
    let headers = {}
    let raw = ''
    const res = {
      writeHead(code, nextHeaders) {
        statusCode = code
        headers = nextHeaders
      },
      end(chunk) { raw += String(chunk || '') }
    }
    await registration.handler(req, res)
    return { statusCode, headers, raw, body: JSON.parse(raw) }
  }

  return { call, spawnCalls }
}

test('SiliconFlow explains when the required model provider is missing', async () => {
  const host = createHost({ providers: {} })
  const response = await host.call({ action: 'balance', provider: 'siliconflow' })

  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['Cache-Control'], 'no-store')
  assert.equal(response.body.ok, false)
  assert.equal(response.body.errorCode, 'model-provider-missing')
  assert.match(response.body.error, /设置 → 模型/)
  assert.match(response.body.error, /siliconflow/)
})

test('SiliconFlow resolves only the matching model provider key and defines response fields', async () => {
  const resolvedNames = []
  const secret = 'temporary-siliconflow-key'
  const host = createHost({
    providers: {
      siliconflow: {
        displayName: 'SiliconFlow',
        apiKeyEnv: 'SILICONFLOW_MODEL_KEY',
        baseURL: 'https://api.siliconflow.com/v1'
      }
    },
    credentials: {
      async resolve(name) {
        resolvedNames.push(name)
        return name === 'SILICONFLOW_MODEL_KEY' ? { value: secret, source: 'file' } : null
      },
      async describe() { return { configured: true, source: 'file', writable: true } }
    },
    upstreamBody: {
      code: 20000,
      message: 'Ok',
      data: { totalBalance: '12.00', chargeBalance: '8.75', balance: '3.25' }
    }
  })
  const response = await host.call({ action: 'balance', provider: 'siliconflow' })

  assert.equal(response.body.ok, true)
  assert.deepEqual(resolvedNames, ['SILICONFLOW_MODEL_KEY'])
  assert.equal(host.spawnCalls[0].env.BALANCE_API_KEY, secret)
  assert.equal(host.spawnCalls[0].env.BALANCE_API_URL, 'https://api.siliconflow.com/v1/user/info')
  assert.deepEqual(response.body.fieldDefinitions.map((item) => item.name), [
    'totalBalance',
    'chargeBalance',
    'balance'
  ])
  assert.equal(response.raw.includes(secret), false)
})

test('DigitalOcean saves a masked PAT and queries only the billing summary', async () => {
  const secret = 'dop_v1_abcdefghijklmnopqrstuvwxyz1234567890'
  let stored = ''
  const credentials = {
    async describe(name) {
      return {
        configured: name === 'DIGITALOCEAN_TOKEN' && !!stored,
        source: stored ? 'file' : '',
        writable: true
      }
    },
    async set(name, value) {
      assert.equal(name, 'DIGITALOCEAN_TOKEN')
      stored = value
    },
    async resolve(name) {
      return name === 'DIGITALOCEAN_TOKEN' && stored
        ? { value: stored, source: 'file' }
        : null
    }
  }
  const host = createHost({
    credentials,
    upstreamBody: {
      month_to_date_balance: '-13.00',
      account_balance: '-13.00',
      month_to_date_usage: '0.00',
      generated_at: '2026-08-18T06:35:32Z'
    }
  })

  const saved = await host.call({
    action: 'saveBalanceCredential',
    provider: 'digitalocean',
    value: secret
  })
  assert.equal(stored, secret)
  assert.equal(saved.body.ok, true)
  assert.equal(saved.body.masked, '••••••••••••')
  assert.equal(saved.raw.includes(secret), false)

  const queried = await host.call({ action: 'balance', provider: 'digitalocean' })
  assert.equal(host.spawnCalls[0].env.BALANCE_API_URL, 'https://api.digitalocean.com/v2/customers/my/balance')
  assert.equal(host.spawnCalls[0].env.BALANCE_API_KEY, secret)
  assert.equal(queried.body.totalBalance, '13')
  assert.equal(queried.body.balanceLabel, '可用信用余额')
  assert.equal(queried.body.monthToDateUsage, '0.00')
  assert.deepEqual(queried.body.details.map((item) => item.label), ['本月至今使用'])
  assert.equal(queried.raw.includes(secret), false)
  assert.equal(host.spawnCalls[0].env.BALANCE_API_URL.includes('billing_history'), false)
})
