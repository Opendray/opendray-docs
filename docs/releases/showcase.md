# Showcase

Real teams using opendray in production. If you're using it and want
to be listed here, [open a PR](https://github.com/opendray/opendray-docs/edit/main/docs/releases/showcase.md)
adding a Card below — keep it factual (what you do + how opendray fits).

<Callout type="tip">
Looking for ideas on how teams use it? Browse the patterns under
[Real workflows](#patterns) below the showcase grid.
</Callout>

## Teams shipping with opendray

<CardGroup :cols="2">
<Card icon="🏗" title="Your team here">
This page is the social proof page. The first ten teams to ship a
production deployment get a permanent shoutout — open a PR with a
one-paragraph blurb and your logo (SVG preferred, 64×64).
</Card>
<Card icon="🌱" title="Early adopter slot">
Same as above. Reserved for the first wave of public OSS adopters.
</Card>
</CardGroup>

## Patterns {#patterns}

Even without naming names, here are the recurring workflows people
build on top of opendray:

<CardGroup :cols="2">
<Card icon="🌅" title="Pre-coffee triage">
Solo dev wakes up, opens Telegram, sees overnight Claude PRs sorted by
risk + diff size. Approves four with `y`, asks Claude to redo one,
closes one. All before opening the laptop.
</Card>
<Card icon="🛬" title="Mobile deploy gates">
On-call engineer at the airport gets a Slack ping when production
deploy needs human approval. Opens the embedded session preview,
checks the diff, approves with one tap.
</Card>
<Card icon="📚" title="Cross-project memory recall">
Polyglot codebase with shared patterns. opendray surfaces
"this is how the payments service did it" while writing the new
billing service — including the gotchas you wrote down at 2am.
</Card>
<Card icon="🧑‍🤝‍🧑" title="Pair review on Discord">
Small open-source team uses Discord threads as the "review channel."
Anyone can `/select s_42` and watch the AI work, attributing actions
back to whoever is driving.
</Card>
<Card icon="🔁" title="Long-running migrations">
Background CLI session crunching through a 200-table schema migration.
Pings WeCom group when each batch lands; on-call replies with
`continue` / `pause` / `rollback`.
</Card>
<Card icon="📓" title="Living architecture doc">
Notes vault is git-synced into the same repo. Engineers append
findings after each session; the AI reads the vault for context on
the next session. Knowledge compounds.
</Card>
</CardGroup>

## Submit your case study

Want to write a longer case study? Email `hello@opendray.dev` or
file a PR adding a markdown page under `docs/releases/showcase/`.
