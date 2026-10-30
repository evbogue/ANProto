# Work order: keep authorship small and understandable

## Current priority — sustainable internet fame, 2026-10-29

Status: planned; this documentation update does not complete implementation or authorize deployment.

**Research purpose:** learn whether publishing on Ev’s own domain, with portable authorship and accessible conversations, leads to repeat recognition, relationships, collaborations, and opportunities at a sustainable cost in time.

**Shared first milestone:** a visitor reads Ev’s Wiredove posts on evbogue.com, opens a conversation, replies without leaving the site, and can reload the same conversation. The reply is also retrievable in Wiredove. Reading requires no identity setup. Validate writes with disposable identities and isolated local services before any separately authorized public release.

## Next ticket: align the public explanation with current responsibilities

ANProto authenticates statements and authorship. It does not itself guarantee distribution, storage availability, unique human identity, audience attention, or enduring fame. This is a small maintenance task; it does not block the interactive embed unless a concrete verification defect is found.

- [ ] Inspect the current mission, sandbox, README, and protocol examples. Explain the path in plain language: ANProto authenticates the contribution; AndFS identifies/verifies media bytes; Wiredove supplies publishing/conversation; evbogue.com supplies Ev’s personal home; Fame records observations.
- [ ] Reconcile the old `ROADMAP.md` with today’s repository ownership. Label historical app/APDS/mobile feature lists as historical or move them into a clearly identified archive; link current work to the responsible projects. Do not mark features complete without source evidence.
- [ ] Keep the sandbox local-only. Examples use disposable identities and must not solicit Ev’s secret key, publish automatically, or promise permanent content availability.
- [ ] If the embed or adapter exposes a genuine authentication mismatch, capture a small valid/invalid signed fixture and a focused bug before changing code. Preserve existing signed formats and exact content bytes.

**Acceptance:** a reader can distinguish signing from distribution and media retention, find the active product/research work, and understand the sandbox’s actual behavior. Verify changed local links and examples. For a protocol bug, run focused verification checks and document compatibility before adoption by clients.

**Deliver:** a modest documentation update or one evidence-backed verification ticket, with observed behavior and planned work clearly separated.

**Stop point:** the explanation and roadmap ownership agree. Additional language implementations, new social features, protocol redesign, and server-held login keys are outside this ticket. Existing historical roadmap entries are not an instruction to begin them now.

## Coordination

`../wiredove/SHARED_UI_WORK_ORDER.md` owns the shared interactive runtime; `../andfs/WORK_ORDER.md` owns byte compatibility; `../anproto-fame/WORK_ORDER.md` owns the research method. These are local workspace references, not runtime imports.
