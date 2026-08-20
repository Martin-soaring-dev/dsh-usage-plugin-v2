<div align="center">

# DeepSeek Harness Usage & Cost Tracker v2

**English** · [简体中文](./README.zh.md)

[This project](https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2) · [Latest Release](https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/releases/latest) · [Original project](https://github.com/feiyang-dev/dsh-usage-plugin) · MIT License

**A reproduced and extended community edition of the original project** — preserving its complete usage and cost tracker while adding explicit credential handling, field definitions, and safety boundaries for multi-provider balance queries.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-339933)
![Platform](https://img.shields.io/badge/platform-web%20%26%20desktop-4d9fff)

</div>

---

## Part I: Why This Fork Exists and What It Changes

### Motivation

This repository reproduces and continues the work of [feiyang-dev/dsh-usage-plugin](https://github.com/feiyang-dev/dsh-usage-plugin). The original project already solved the core DeepSeek Harness problems around model-call records, token usage, peak/off-peak pricing, cache hits, calendar statistics, and data export. At the point this repository was forked, however, balance lookup was centered on DeepSeek, while real Harness installations often configure SiliconFlow, DigitalOcean, AMD GPU Cloud, and other providers together.

Those providers do not share one credential or billing model: some expose balance data to an inference API key, some require a separate account token, and some publish no balance endpoint that an inference key can call. The goal of v2 is therefore not just to add provider buttons. It preserves the original tracker while making it clear which key is used, which endpoint is queried, what each returned field means, and why a provider cannot be queried when no documented interface exists.

This project does not impersonate or replace the original. Credit for the original design, code, and contributions remains with its authors and contributors under the MIT License.

### AI Assistance and Maintenance Disclosure

This is a human–AI collaborative project. Its development, testing, debugging, documentation, release preparation, and ongoing maintenance are carried out by the project maintainer with assistance from **OpenAI Codex (ChatGPT)**. Codex has contributed to requirements analysis, code investigation and implementation, verification, troubleshooting, and documentation. The maintainer defines the goals, authorizes account- and credential-related actions, reviews the results, and remains responsible for merges, releases, and the project's final behavior. The Git history is the authoritative record of individual changes.

### What This Fork Adds

- Extends the balance page to **DeepSeek, SiliconFlow, DigitalOcean, and AMD GPU Cloud**, while retaining the original usage, cost, calendar, cache, pricing, import/export, and persistence features.
- **SiliconFlow**: reads only the configured model provider whose ID or display name is `siliconflow`, then follows that provider's `apiKeyEnv` to the saved key. Only official SiliconFlow `.cn` / `.com` hosts are accepted. The UI faithfully presents public API fields such as `totalBalance`, `chargeBalance`, and `balance`, including a genuine zero response instead of substituting a console value.
- **DigitalOcean**: explicitly requires an account-level Personal Access Token rather than a Gradient AI inference key. The page links to token creation, explains the required permission, and masks the token after saving. It queries the account Billing API and shows only current account balance and month-to-date usage—never billing-history line items. A negative account balance is rendered as available credit according to DigitalOcean's accounting semantics.
- **AMD GPU Cloud**: because no documented balance endpoint is available to its inference key, the plugin does not guess an endpoint or misuse that key as a billing credential. It links to the official console and clearly labels the limitation.
- Keeps balance requests on the Host side so plaintext credentials are not returned to the client, and adds automated contract tests for these provider rules and boundaries.

### Differences from the Original Project

“Original project” below means the baseline reproduced by this repository; upstream may continue to evolve independently.

| Area | Original project (fork baseline) | This v2 project |
| --- | --- | --- |
| Core tracker | Usage and cost statistics, peak/off-peak pricing, calendar, cache hits, price table, import/export, and persistence | Fully retained, including compatibility with existing data and UI flows |
| Balance providers | Primarily DeepSeek balance lookup | DeepSeek, SiliconFlow, and DigitalOcean; AMD GPU Cloud is explicitly console-only |
| Credential source | Primarily an inference API key | Provider-aware: SiliconFlow follows the model provider's `apiKeyEnv`; DigitalOcean stores a separate account PAT |
| Response semantics | Presents DeepSeek balance fields | Defines SiliconFlow fields and explains DigitalOcean account balance, available credit, and month-to-date usage |
| Unsupported APIs | No multi-provider support-status model | Never calls an undocumented AMD balance endpoint and explains the limitation in the UI |
| Security and verification | Retains the original Host + Client plugin architecture | Host-side balance calls, masked token storage, official-host restrictions for SiliconFlow, and provider contract tests |
| Distribution and updates | The original project is distributed through npm | This project uses GitHub Releases only, with manual check-and-install in Settings |

### New Balance Query Screenshots

#### SiliconFlow

The plugin discovers the credential from the matching model provider and explains both the public API fields and the returned value.

![SiliconFlow balance query and field definitions](./docs/assets/balance-siliconflow.png)

#### DigitalOcean

The account PAT is masked after saving. The page shows available credit, current-month usage, and query time without billing-history details.

![DigitalOcean account balance and month-to-date usage](./docs/assets/balance-digitalocean.png)

#### AMD GPU Cloud

When no public endpoint exists, the plugin states the limitation and points users to the official console for credits.

![AMD GPU Cloud console-only guidance](./docs/assets/balance-amd-gpu-cloud.png)

---

## Part II: Original Project Introduction (Reproduced and Adapted)

> The material below reproduces and preserves the original project's core introduction, installation guidance, and data documentation. Provider coverage, credential rules, and screenshots have been adapted to match this v2 implementation. For the source project and its history, see [feiyang-dev/dsh-usage-plugin](https://github.com/feiyang-dev/dsh-usage-plugin).

> ## 🔔 Important: v2 is distributed only through GitHub Releases
>
> This repository is an independent fork. It does not publish an npm package or use the upstream `@feiyang666` scope. Installations and updates come only from this repository's stable GitHub Releases.
>
> - Install this fork with: `dsh plugin --profile web add "https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz"`
> - Update it from Harness Settings → Plugin Update → Check for Updates, then restart the service completely.
> - Do not install this fork and the upstream usage plugin into the same DSH profile; both provide the same feature surface and may compete for the same routes and panels.
> - To migrate, remove the upstream package from that profile first, then install this fork.

---

### Overview

dsh-usage-plugin-v2 is a **usage & cost tracker** plugin in the DeepSeek Harness ecosystem (a DSH plugin shipped as a Host + Client two-in-one package). After installation, **"Usage & Cost"** and **"Balance Query"** tabs appear in the Web UI, right after "Conversation" and "Trace":

> Supports **Windows / macOS / Linux**: paths are handled per platform (`node:path`), and the folder picker / "reveal in file manager" use each OS's native mechanism (macOS: `osascript` / `open`; Linux: `zenity` / `xdg-open`). Balance query and export do not depend on Windows-only commands.

- **Usage & Cost**: records each model call's token usage and cache hits (input miss / cache hit / cache write / output / reasoning / finish reason), and computes cost using DeepSeek's peak/valley or base pricing (peak hours are automatically priced by Beijing time 09:00–12:00 and 14:00–18:00). Model names come from the actual request parameters, so non-DeepSeek models are shown truthfully instead of "unknown model"; models without an official price are counted as 0. The overview shows a by-model table plus a by-API-provider × model drill-down (each provider grouped with every model's calls and peak/off-peak cost split) and a grand total row.
- **Usage Calendar**: a monthly daily-usage heatmap (colored by cost or call count), hover for details including the peak/off-peak cost split, click a day for its call list and peak/off-peak totals, plus a per-day statistics table with peak cost / off-peak cost / total columns and monthly rollups.
- **Cache Hit List**: newest-first, fully scrollable, with quick filters (Today / 7 days / 30 days / All) and custom date ranges; the summary line and footer total split peak vs off-peak consumption with a grand cost total. The list is paginated (100 rows per page), so it stays smooth even with large data volumes.
- **Price Table**: the official DeepSeek API price table — base and peak/valley unit prices shown side by side (peak vs off-peak), editable in-panel and persisted to `pricing.json`, with a reset-to-default option.
- **Balance Query**: queries DeepSeek and SiliconFlow directly with their inference keys, and DigitalOcean through its account-level Billing API. SiliconFlow follows a matching custom model provider's `apiKeyEnv` and official `.cn` / `.com` base URL. AMD GPU Cloud is shown as console-only because it does not currently publish a balance endpoint for its inference key.
- **Export**: CSV / JSON / **PNG long image** (newest-first, up to the latest 2000 records, warns if exceeded; the PNG report includes peak/off-peak cost columns), to any directory (native picker), auto-opens the folder after export.
- **Import**: merge-imports JSON / CSV files, deduplicated by time.
- **Persistence**: records are written live to `<session workspace>/dsh-usage/usage-records.json` and restored on restart (cap 100000 records).
- **UI adaptation**: panel typography scales with the app's display-size setting (em-relative fonts); table wrapping and spacing are tuned so large display sizes stay readable.

#### Balance provider support

| Provider | Status | Credential | Balance details |
| --- | --- | --- | --- |
| DeepSeek | ✅ API query | `DEEPSEEK_API_KEY` | Total, topped-up, and granted balance |
| SiliconFlow | ✅ API query | `apiKeyEnv` from the model provider whose ID or display name is `siliconflow` | Public API total, charged, and legacy granted balance fields |
| DigitalOcean | ✅ Account Billing API | Save an account PAT as `DIGITALOCEAN_TOKEN` on the Balance page ([create token](https://cloud.digitalocean.com/account/api/tokens)) | Current account balance and month-to-date usage (USD), without billing history |
| AMD GPU Cloud | ℹ️ Console only | — | Check credits in [AMD Developer Cloud](https://www.amd.com/en/developer/resources/cloud-access/amd-developer-cloud.html); no public inference-key balance endpoint is documented |

The AMD entry is intentionally visible in the selector so users get a clear support status instead of a failed request to a guessed endpoint.

---

### Screenshots

#### Usage & Consumption
![Usage & Consumption](./docs/assets/usage-overview.png)

#### Balance Query
![Balance Query](./docs/assets/balance-query.png)

### DSH Plugin Marketplace Readiness

This repository is prepared to be discoverable and installable as a standard DSH bundle plugin. It declares the DSH bundle patch in `package.json`, ships `cordis.patch.yml`, exposes the browser client entry, and includes marketplace-oriented metadata/keywords.

For first installation, the canonical package source remains the stable GitHub Release tarball:

```bash
dsh plugin --profile web add "https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz"
```

After a marketplace installs the package, later upgrades can continue through **Settings → Plugin Update** using this repository's GitHub Releases. No npm publication is required by this project.

> Marketplace operators may use different discovery/indexing rules. To improve discoverability, add the GitHub repository topic `dsh-plugin` (plus optional topics such as `deepseek-harness`, `usage-tracker`, and `cost-tracker`) on the repository page.

---

### Recommended Installation

The following flow has been verified with the standard DeepSeek Harness CLI and does **not** require changing directories or knowing where DSH is installed.

1. Install the official DSH CLI globally (skip this step if `dsh --version` already works):

```bash
npm install -g @deepseek-ai/dsh
```

2. Verify the CLI:

```bash
dsh --version
```

If your shell still says that `dsh` is not recognized immediately after installation, close that terminal and open a new one, then retry.

3. Install this plugin into the default Web profile directly from the stable GitHub Release:

```bash
dsh plugin --profile web add "https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz"
```

4. Restart DeepSeek Harness:

```bash
dsh web
```

If the default Web port is already occupied, start DSH on another port, for example:

```bash
dsh web --port 3070
```

No `cd`, local installation path, YAML editing, or manual file copying is required. For another profile, replace `web` with the desired profile name. Detailed manual install / wiring / uninstall / troubleshooting follows below.

---

### What's in the package

One GitHub Release package = a **host half** (Node-side Cordis plugin: recording, billing, balance query, export, and updates — see `lib/index.js`) + a **client half** (browser-side panel — see `lib/client.js`, which talks to the host via `/usage/api`).

The package integrates with DSH through two declarations:

| Declaration | Purpose |
| --- | --- |
| `dsh.bundle.patch` (`cordis.patch.yml`) | Lets DSH recognize it as a **standard bundle plugin package**: `dsh plugin --profile <name> add <package>` installs and wires it in one command, no manual config editing |
| `dsh.client` + `exports["./client"]` | Lets the web client auto-load the browser panel at `/plugins/<package>/client.js` |

So for users, **installation is one command** — no YAML editing, no manual file copying.

---

### Installation (for users)

#### 0. Prerequisites

- DeepSeek Harness installed (`npm install -g @deepseek-ai/dsh`, or a desktop app built on it, or `npx @deepseek-ai/dsh web`).
- Option A (recommended) needs **pnpm**: `npm install -g pnpm` (or `corepack enable`).
- Make sure `dsh` is on PATH (for the desktop app, run in its bundled terminal).

#### 1. Method A (recommended): one command

```bash
dsh plugin --profile web add "https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz"
```

This does three things (all automatic):

1. Installs the package via pnpm into `~/.dsh/profiles/web` (auto-initializes the profile on first use);
2. Detects the package's `dsh.bundle` declaration and writes the package name into the profile's `dsh.profile.bundles` layer list;
3. After restart, DSH reads the package's `cordis.patch.yml` and mounts the plugin row into the app tree — **no manual config editing**.

Same for other profiles (replace `web` with your profile name, e.g. `dsh plugin --profile headless add ...`; `dsh web` equals `dsh --profile web`).

> Test a local tarball: `dsh plugin --profile web add C:\path\to\dsh-usage-plugin-v2-1.13.5.tgz`

#### 2. Method B: manual install (no pnpm / no `dsh plugin`)

Only for when you have no pnpm or want full manual control. **Do not `npm install` directly at `~/.dsh/profiles`** (that dir has no package.json; npm would treat the whole node_modules as residue and wipe it).

**B1. Use pnpm but not `dsh plugin`:**

```bash
cd ~/.dsh/profiles/web
pnpm add "https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz"
# then manually append the plugin row to web/cordis.patch.yml (see B3) and restart
```

**B2. Or use the npm client with the GitHub archive:** add a minimal package.json first (the plugin is not downloaded from the npm Registry):

```bash
cd ~/.dsh/profiles/web
# if no package.json exists there yet (only after `dsh plugin` init):
# echo '{"name":"dsh-profile-web","private":true,"dependencies":{}}' > package.json
npm install "https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz"
```

**B3. Wire it up (once, idempotent):** append to `~/.dsh/profiles/web/cordis.patch.yml`:

```yaml
- insert:
    - id: usage-plugin
      name: 'dsh-usage-plugin-v2'
      inject:
        - fs
        - webServer
        - subprocess
        - credentials
        - settings
        - sandboxPolicy
        - agents
```

Or just run the package's built-in wiring script (auto-finds the profile and appends, idempotent):

```bash
node node_modules/dsh-usage-plugin-v2/scripts/wire.js
```

> ⚠️ The `inject` list is **required**: it makes Cordis wait until `fs` / `webServer` / `subprocess` / `credentials` / `settings` / `sandboxPolicy` / `agents` are ready before activating the plugin. Without it the `/usage/api` route never registers and the panel fails with `Unexpected end of JSON input`.

#### 3. Method C: desktop app

The desktop app (e.g. [DeepSeek Harness Desktop](https://github.com/feiyang-dev/DeepSeek-Harness-Desktop)) uses the same `~/.dsh/profiles` underneath. Run Method A's command in any terminal, restart the app, and the plugin activates automatically (the app starts the same `dsh web`).

#### 4. Restart and verify

Restart the DeepSeek Harness web app (command line: kill the old process and re-run `dsh web`; desktop: fully quit and reopen). Then:

- Refresh http://127.0.0.1:3080 — after "Conversation" and "Trace", you should see **"Usage & Cost"** and **"Balance Query"** tabs; there are entries in Settings too.
- The "Usage & Cost" panel contains **Overview / Usage Calendar / Cache Hit List / Price Table** subtabs.
- Send a message and the "Usage & Cost" panel should show this call's token / cost record.

#### 5. Configuration (for balance query)

The balance panel selects credentials by provider. Add the applicable credential to the DSH credentials service before querying.

| Provider | Query source | Important note |
| --- | --- | --- |
| DeepSeek | `GET https://api.deepseek.com/user/balance` | Uses the same inference key configured for DeepSeek models |
| SiliconFlow | `GET /v1/user/info` on the matching official `.cn` / `.com` API host | Requires a model provider whose ID or display name is `siliconflow`; only that provider's `apiKeyEnv` is used, with no standalone-key fallback |
| DigitalOcean | `GET https://api.digitalocean.com/v2/customers/my/balance` | Enter an [account-level Personal Access Token](https://cloud.digitalocean.com/account/api/tokens) with `billing:read` on the Balance page; it is stored by the DSH credentials service and masked after saving |
| AMD GPU Cloud | [AMD Developer Cloud](https://www.amd.com/en/developer/resources/cloud-access/amd-developer-cloud.html) | Selecting it shows a console-only status and sends no balance request |

Open the **Balance Query** tab and select a provider. Requests run on the host side and credential values are never returned to the browser UI. For security, a SiliconFlow model credential is sent only to `api.siliconflow.cn` or `api.siliconflow.com`, never to an arbitrary custom gateway. On the DigitalOcean tab, save the account PAT and the plugin immediately queries only the balance summary endpoint; it does not request billing history or reuse an inference key.

---

### Uninstall

```bash
dsh plugin --profile web remove dsh-usage-plugin-v2
```

(Equivalent to pnpm remove; `dsh plugin` auto-removes the package name from the `dsh.profile.bundles` layer list.) Restart the app afterward.

For manual installs (Method B), do it in reverse: remove the `usage-plugin` row from `cordis.patch.yml`, then `pnpm remove` / `npm uninstall` the package, and restart.

> Upgrading from a 1.0.x manual-wiring install to 1.1.x: first remove the old `usage-plugin` row from `cordis.patch.yml` (or follow the uninstall flow), then reinstall via Method A to avoid mounting the plugin twice.

---

### Data & locations

- Records: `<session workspace>/dsh-usage/usage-records.json`
- Price config (edited & saved in the panel): `<session workspace>/dsh-usage/pricing.json`
- Default export dir: `<session workspace>/dsh-usage/{csv,json,images}/`
- Custom export dir: set in the panel's "Export target directory" or click "Choose directory…"
- Startup diagnostics (if the plugin fails to activate): `dsh-usage-boot.log` in the session workspace

---

### FAQ

| Symptom | Cause / Fix |
| --- | --- |
| Panel reports `Unexpected end of JSON input` | The plugin row is missing the `inject` list, so the route isn't registered. Add the inject list per Method B3 and restart |
| Panel blank / no top tab | Plugin not activated. Check `dsh-usage-boot.log`; confirm the `cordis.patch.yml` row exists with the correct `name` |
| Balance query reports a credential is not configured | For SiliconFlow, add/edit the model provider named `siliconflow` and save its API Key. For DigitalOcean, paste the account PAT into its Balance tab and click **Save and query** |
| SiliconFlow balance response cannot be recognized | Confirm the key can access `api.siliconflow.cn/v1/user/info`; the plugin recognizes `totalBalance`, `chargeBalance`, and `balance` |
| DigitalOcean returns 401 / 403 | Use a DigitalOcean account Personal Access Token with billing read access, not a DO AI inference key |
| AMD GPU Cloud says balance query is unsupported | This is expected: no public balance endpoint is currently documented for its inference key; view the balance in the provider console |
| Balance query network error | Ensure the selected provider's API host is reachable (`api.deepseek.com`, `api.siliconflow.cn`, or `api.digitalocean.com`); configure a proxy if needed |
| `dsh plugin` reports pnpm not found | Install pnpm: `npm install -g pnpm` |
| Update check or installation cannot connect | Confirm that `api.github.com` and `github.com` are reachable; this plugin updates only from this repository's stable Releases |
| After uninstall, still reports `Cannot find package '@feiyang666/...'` | A package reference remains in the profile. Remove the corresponding row from `cordis.patch.yml` and the package name from `dsh.profile.bundles`, then restart |

---

### Related Projects

| Project | Description | Installation |
| --- | --- | --- |
| [DeepSeek Harness Desktop](https://github.com/feiyang-dev/DeepSeek-Harness-Desktop) | Windows desktop console: install/start/stop/restart the dsh web service with one click, built-in plugin management — **install this plugin from its Recommended section** | Download the desktop app and click a few buttons |
| [Data Vault (dsh-vault)](https://github.com/feiyang-dev/dsh-vault) | Auto backup / wipe detection / one-click restore — protects chat history and workspace data | One-click from the desktop app, or `dsh plugin add @feiyang666/dsh-vault` |
| [DeepSeek-Harness](https://github.com/deepseek-ai/DeepSeek-Harness) | Official CLI / Web service | Quick start below |

#### Running DeepSeek Harness

**Quick start (via npm)**

Install Node.js, then run:

```bash
npx @deepseek-ai/dsh web
```

This command starts the Web UI at the default address http://127.0.0.1:3080. See the [Web UI Guide](https://github.com/deepseek-ai/DeepSeek-Harness) for details.

**Run from source**

To run from the repository source:

```bash
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

### Acknowledgements

- **[@liu3734](https://github.com/liu3734)**: reported and diagnosed the Windows-only path handling / spawn issues on macOS (POSIX) and proposed the cross-platform fix ([#1](https://github.com/feiyang-dev/dsh-usage-plugin/issues/1)).

### License

MIT © dsh-usage-plugin-v2
