import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
import {
  compareVersions,
  profileRootFromModule,
  releaseArchiveUrl,
  releaseInfo,
  verifyProfileInstall
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
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-updater-'))
  const profile = path.join(tmp, '.dsh', 'profiles', 'web')
  fs.mkdirSync(profile, { recursive: true })
  fs.writeFileSync(path.join(profile, 'package.json'), JSON.stringify({ dependencies: { 'dsh-usage-plugin-v2': 'x' } }))
  const modulePath = path.join(profile, 'node_modules', '.pnpm', 'pkg', 'node_modules', 'dsh-usage-plugin-v2', 'lib', 'updater.js')
  assert.equal(profileRootFromModule(pathToFileURL(modulePath).href), profile)
  fs.rmSync(tmp, { recursive: true, force: true })
})

test('resolves a workspace plugins checkout back to the linked web profile', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-updater-link-'))
  const packageRoot = path.join(tmp, 'Harness', '.dsh', 'plugins', 'dsh-usage-plugin-v2')
  const profilesDir = path.join(tmp, 'home', '.dsh', 'profiles')
  const web = path.join(profilesDir, 'web')
  fs.mkdirSync(path.join(packageRoot, 'lib'), { recursive: true })
  fs.mkdirSync(web, { recursive: true })
  fs.writeFileSync(path.join(web, 'package.json'), JSON.stringify({
    dependencies: { 'dsh-usage-plugin-v2': 'link:' + packageRoot }
  }))
  const modulePath = path.join(packageRoot, 'lib', 'updater.js')
  assert.equal(profileRootFromModule(pathToFileURL(modulePath).href, { profilesDir }), web)
  fs.rmSync(tmp, { recursive: true, force: true })
})

test('does not mistake an arbitrary workspace .dsh/plugins parent for a runtime profile', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-updater-workspace-'))
  const packageRoot = path.join(tmp, 'Harness', '.dsh', 'plugins', 'dsh-usage-plugin-v2')
  fs.mkdirSync(path.join(packageRoot, 'lib'), { recursive: true })
  const modulePath = path.join(packageRoot, 'lib', 'updater.js')
  assert.equal(profileRootFromModule(pathToFileURL(modulePath).href, { profilesDir: path.join(tmp, 'none') }), '')
  fs.rmSync(tmp, { recursive: true, force: true })
})

test('verifies a fixed GitHub Release install and rejects lingering link dependencies', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-updater-verify-'))
  const profile = path.join(tmp, 'web')
  const installed = path.join(profile, 'node_modules', 'dsh-usage-plugin-v2')
  fs.mkdirSync(installed, { recursive: true })
  fs.writeFileSync(path.join(installed, 'package.json'), JSON.stringify({ version: '1.13.1' }))
  fs.writeFileSync(path.join(profile, 'package.json'), JSON.stringify({
    dependencies: {
      'dsh-usage-plugin-v2': 'https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.1.tar.gz'
    }
  }))
  assert.equal(verifyProfileInstall(profile, '1.13.1', 'v1.13.1').ok, true)
  fs.writeFileSync(path.join(profile, 'package.json'), JSON.stringify({ dependencies: { 'dsh-usage-plugin-v2': 'link:/tmp/dev' } }))
  assert.match(verifyProfileInstall(profile, '1.13.1', 'v1.13.1').error, /link:\/file:/)
  fs.rmSync(tmp, { recursive: true, force: true })
})

test('returns empty when no known profile marker exists', () => {
  const modulePath = path.join(path.parse(process.cwd()).root, 'tmp', 'dsh-usage-plugin-v2', 'lib', 'updater.js')
  assert.equal(profileRootFromModule(pathToFileURL(modulePath).href, { profilesDir: path.join(os.tmpdir(), 'missing-dsh-profiles') }), '')
})
