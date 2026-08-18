import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  compareVersions,
  profileRootFromModule,
  releaseArchiveUrl,
  releaseInfo
} from '../lib/updater.js'

test('compares stable semantic versions without lexicographic mistakes', () => {
  assert.equal(compareVersions('v1.12.0', '1.11.9'), 1)
  assert.equal(compareVersions('1.11.0', 'v1.11.0'), 0)
  assert.equal(compareVersions('1.11.0-beta.1', '1.11.0'), -1)
})

test('accepts only a stable release from the fork repository', () => {
  const info = releaseInfo({
    tag_name: 'v1.12.0',
    draft: false,
    prerelease: false,
    html_url: 'https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/releases/tag/v1.12.0',
    published_at: '2026-08-18T00:00:00Z'
  }, '1.11.0')
  assert.equal(info.updateAvailable, true)
  assert.equal(info.latestVersion, '1.12.0')
  assert.throws(() => releaseInfo({ tag_name: 'main' }, '1.11.0'), /语义版本/)
})

test('builds an archive URL pinned to the checked release tag', () => {
  assert.equal(
    releaseArchiveUrl('v1.12.0'),
    'https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.12.0.tar.gz'
  )
  assert.throws(() => releaseArchiveUrl('../main'), /无效/)
})

test('finds the DSH profile above the outer node_modules directory', () => {
  const modulePath = path.join(path.parse(process.cwd()).root, 'users', 'martin', '.dsh', 'profiles', 'web', 'node_modules', '.pnpm', 'pkg', 'node_modules', 'dsh-usage-plugin-v2', 'lib', 'updater.js')
  assert.equal(
    profileRootFromModule(pathToFileURL(modulePath).href),
    path.join(path.parse(process.cwd()).root, 'users', 'martin', '.dsh', 'profiles', 'web')
  )
})

test('finds the Harness profile above a plugins directory', () => {
  const modulePath = path.join(path.parse(process.cwd()).root, 'users', 'martin', '.dsh', 'profiles', 'web', 'plugins', 'dsh-usage-plugin-v2', 'lib', 'updater.js')
  assert.equal(
    profileRootFromModule(pathToFileURL(modulePath).href),
    path.join(path.parse(process.cwd()).root, 'users', 'martin', '.dsh', 'profiles', 'web')
  )
})

test('returns empty when no known profile marker exists', () => {
  const modulePath = path.join(path.parse(process.cwd()).root, 'tmp', 'dsh-usage-plugin-v2', 'lib', 'updater.js')
  assert.equal(profileRootFromModule(pathToFileURL(modulePath).href), '')
})
