# Working on anproto

Read `WORK_ORDER.md` and the current README before changing this project. Preserve original signed records and distinguish implemented behavior from planned work.

## Git synchronization — standing instruction

Ev explicitly requested on 30 October 2026 that local work and GitHub stay synchronized. Sync is part of completing authorized work; do not wait for a separate push request.

- At session start, inspect `git status`, the current branch, remotes, and upstream. Fetch `origin` and compare local and remote commits before editing. Read incoming changes and updated agent/work-order instructions.
- Preserve uncommitted work before integrating incoming commits. Fast-forward when possible; otherwise reconcile both histories and resolve conflicts deliberately. Never discard local work, overwrite another agent's commits, or force-push to make a branch appear current.
- Use this repository's established default branch and upstream. Keep related repositories coordinated, but inspect each independently; do not blindly stage unrelated changes, secrets, identity backups, generated state, or private research data.
- Run checks appropriate to the reconciled changes and update work orders/handoffs to match observed behavior. Commit completed work in focused commits and push the intended branch to GitHub before finishing a change session, unless Ev explicitly asks to keep it local.
- Fetch again before pushing. If GitHub advanced, integrate the new commits, rerun affected checks, and retry a normal push. After pushing, verify the local HEAD equals the intended GitHub branch tip and inspect the remaining worktree status. Report the commit, branch, checks, and any remaining changes or divergence automatically.
- If authentication, network access, conflicts, failing checks, or unfinished work prevent synchronization, preserve the work and report the exact blocker. Do not claim synchronization from an attempted push or a stale remote-tracking ref. Clearly label any intentionally preserved unfinished checkpoint.
- A GitHub push is source synchronization, not permission to deploy services, publish public test messages, send email, or change production data. Existing release and publication rules still apply. Do not install background auto-pull jobs; sync at session boundaries and coordinated handoffs.
