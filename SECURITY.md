# Security policy

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub: open the repository's **Security** tab and click **Report a vulnerability**. Include the affected version or commit, steps to reproduce, and the impact you expect.

Please don't post vulnerabilities in YouTube comments, public issues, pull requests, or discussions. A public report puts everyone running the project at risk before a fix exists.

Only the `main` branch is supported. This is a volunteer-run project, so responses and fixes are best effort and come with no guaranteed timeline.

## Deploying safely

- **Never expose it on a public URL without authentication.** The server listens on `127.0.0.1` by default. If you set `HOST=0.0.0.0` or put it behind a proxy, add HTTPS and an authentication layer you trust, keep `DEV_LOGIN` off, and set `ALLOWED_EMAILS` so only people you choose can create accounts.
- **Keep keys server-side.** `XAI_API_KEY`, `ORGO_API_KEY` and `COMPOSIO_API_KEY` belong only in the server's `.env`. Never put them in frontend code, commits, issues, or logs. The browser only ever receives short-lived voice session secrets.
- **Set spend limits.** Configure usage or spend caps with xAI, Orgo, and Composio. Every signed-in user can start model calls, VMs, and app actions billed to your accounts.
- **Use the narrowest Orgo key, never an account-wide one.** Use computer-scoped keys for anything that drives an existing computer (scripts, demos, recordings). This app creates a computer per user, so its server needs a key scoped to `ORGO_WORKSPACE_ID` and nothing wider. Rotate any key you suspect was exposed.
- **Never show keys on screen or in recordings.** Hide `.env`, terminals, and provider dashboards before streaming, recording, or taking screenshots. If a key appears on screen, rotate it right away; deleting the video is not enough.
- **Supervise your Bots.** Bots act on real accounts with your connected apps, browser sessions, and a root shell. Content they read (emails, web pages, event payloads) can try to steer them, so review approval requests carefully and don't grant "Always allow" for actions you wouldn't want triggered by a stranger.
