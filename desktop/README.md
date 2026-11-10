# macOS window application

This local application has its own macOS window, menu and Dock identity. Ordarc includes its built interface and serves only those assets on loopback; it does not need a terminal or an external browser to stay open. It uses the system WebKit engine rather than shipping another browser runtime.

From this source checkout, using the installed Node version and macOS command-line tools:

```sh
npm run build
python3 desktop/build_app.py --output /a/new/output/directory
```

Open `Ordarc.app` from that directory or copy it to `~/Applications`. The builder refuses to replace an existing application and requires committed source. `--preview` explicitly marks a working-tree review build.

Records stay in this application's WebKit storage. Existing browser records remain in their browser; use the existing JSON export/import flow when moving records. Import loads a draft and does not overwrite saved notes. Keep the same application identifier and configured loopback port across upgrades so the storage origin stays stable.

The window provides file selection, download destination selection, ordinary copy/paste and JavaScript confirmation dialogs. Closing or reloading checks the page's existing unsaved-edit guard. `Command-S` saves the current record.

The built-in `--smoke-check /private/result.json --snapshot /private/view.png` creates an isolated, nonpersistent WebKit session, reports only bounded window/page metadata and exits. It does not read the normal application's saved records. Native local asset checks:

```sh
xcrun swiftc -swift-version 5 desktop/LocalWebServer.swift desktop/tests/ServerTests.swift -o /tmp/ordarc-server-checks
/tmp/ordarc-server-checks
```

Build outputs, private runtime state, credentials and user records do not belong in Git. Locally built applications use an ad-hoc signature; this is a local macOS build, not a notarized redistribution release.
