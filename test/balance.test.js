import test from 'node:test'
import assert from 'node:assert/strict'
import { getBalanceProvider, parseBalanceResponse, providerList } from '../lib/balance.js'

test('lists every balance provider and defaults to DeepSeek', () => {
  assert.deepEqual(providerList().map((p) => p.id), [
    'deepseek', 'siliconflow', 'digitalocean', 'amd-gpu-cloud'
  ])
  assert.equal(getBalanceProvider().id, 'deepseek')
  assert.equal(getBalanceProvider('unknown'), null)
})

test('normalizes DeepSeek balance response', () => {
  const res = parseBalanceResponse('deepseek', JSON.stringify({
    is_available: true,
    balance_infos: [{
      currency: 'CNY', total_balance: '12.34', granted_balance: '2.34', topped_up_balance: '10.00'
    }]
  }))
  assert.equal(res.ok, true)
  assert.equal(res.totalBalance, '12.34')
  assert.equal(res.isAvailable, true)
  assert.equal(res.infos[0].toppedUpBalance, '10.00')
  assert.deepEqual(res.details.map((d) => d.value), ['10.00', '2.34'])
})

test('normalizes researched SiliconFlow user info fields', () => {
  const res = parseBalanceResponse('siliconflow', JSON.stringify({
    code: 20000,
    data: { balance: '3.25', chargeBalance: '8.75', totalBalance: '12.00' }
  }))
  assert.equal(res.ok, true)
  assert.equal(res.currency, 'CNY')
  assert.equal(res.totalBalance, '12.00')
  assert.deepEqual(res.details.map((d) => d.value), ['8.75', '3.25'])
})

test('normalizes DigitalOcean account billing balance', () => {
  const res = parseBalanceResponse('digitalocean', JSON.stringify({
    month_to_date_balance: '23.44',
    account_balance: '12.23',
    month_to_date_usage: '11.21',
    generated_at: '2019-07-09T15:01:12Z'
  }))
  assert.equal(res.ok, true)
  assert.equal(res.currency, 'USD')
  assert.equal(res.totalBalance, '12.23')
  assert.deepEqual(res.details.map((d) => d.value), ['11.21', '23.44'])
})

test('rejects API errors and unrecognized response shapes', () => {
  assert.match(parseBalanceResponse('siliconflow', '{"code":401,"message":"bad key"}').error, /bad key/)
  assert.match(parseBalanceResponse('digitalocean', '{}').error, /account_balance/)
  assert.match(parseBalanceResponse('deepseek', 'not json').error, /无法解析/)
})
