# Rate limits

Default thresholds per integration key. Limits are bucket-based
(token bucket, 1-second refill) and apply *per key*, not per IP.

## Default tiers

| Tier | Sustained req/s | Burst | Notes |
|---|---|---|---|
| `default` | 10 | 30 | every freshly minted key |
| `service` | 100 | 300 | set via `tier: "service"` when minting |
| `internal` | unlimited | — | reserved for the admin UI itself |

## Headers

Every response includes:

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1715864120
```

`X-RateLimit-Reset` is a unix timestamp (seconds) — wait until then
before issuing your next request.

## When you hit the limit

You'll get a `429 Too Many Requests`:

```json
{
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded for key od_live_xxx",
    "hint": "Wait 2s before retrying (see Retry-After header)."
  }
}
```

The response carries a `Retry-After: <seconds>` header. The TypeScript
SDK respects this automatically with exponential backoff up to 3
retries — see [TypeScript SDK](/consuming/typescript-sdk).

## Per-endpoint overrides

Some endpoints have stricter caps:

| Endpoint | Override | Reason |
|---|---|---|
| `POST /api/v1/sessions` | 2 req/s | each spawn forks a process |
| `POST /api/v1/keys` | 0.1 req/s | minting keys is rare |
| `POST /api/v1/channels/:id/send` | 5 req/s | upstream platforms rate-limit too |

## Configuring limits

To raise (or lower) the defaults globally, edit `config.toml`:

```toml
[rate_limit]
default_per_second = 20
default_burst = 60

service_per_second = 200
service_burst = 600
```

Reload with `opendray reload` — no restart needed.

<Callout type="warning">
Raising the limits doesn't bypass upstream platform limits (Telegram,
Slack, etc.). Those are enforced on the channel side and can result
in temporary bans if you exceed them.
</Callout>
