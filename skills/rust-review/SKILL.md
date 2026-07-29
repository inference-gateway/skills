---
name: rust-review
description: >
  Review Rust code - a diff, a pull request, or a file - in priority order: panics and unsoundness first,
  then error handling, ownership, API design against the Rust API Guidelines, and only then style. Use when
  asked to review, critique, or audit Rust code, when triaging a Rust pull request, or when a crate is
  clippy-clean but you still do not trust it. Prescribes running fmt, clippy, tests, and miri before
  reading, so the review spends its attention on what the tools cannot see.
license: Apache-2.0
---

# Rust Review

Use this skill when reviewing Rust - a working diff, a PR, or a file someone asked you to look at.

## Rule zero: run the tools before you read

Anything a machine finds is not worth a human comment. Run what the project has configured, and say in the
review what you could not run:

```sh
cargo fmt --all --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-features
cargo doc --no-deps          # broken intra-doc links surface here
cargo miri test              # if the diff touches unsafe
cargo audit                  # if the diff touches Cargo.toml
```

For a focused pass, `cargo clippy -- -W clippy::pedantic` on the changed files surfaces real issues among
the noise. A review that says "tests pass" when miri was never run on new `unsafe` is overstating its
evidence.

## Then read, in this priority order

Comment on the first category that fires. Do not bury an unsoundness bug under naming nits.

### 1. Panics and unsoundness

- `unwrap()` / `expect()` on anything reachable from untrusted input, a network response, or a file. Ask
  what makes it impossible; if there's an answer, it belongs in the `expect` message.
- Indexing and slicing: `v[i]`, `&s[a..b]` (byte offsets - panics mid-UTF-8), `.first()`/`.last()` assumed
  non-empty. `get()` returns an `Option` for a reason.
- Integer overflow: **panics in debug, wraps in release.** Money, sizes, indices, and counters from input
  need `checked_*` / `saturating_*` / `wrapping_*` chosen deliberately.
- `as` casts that truncate or change sign (`u64 as u32`, `i64 as usize`); prefer `TryFrom`.
- `unsafe` without a `// SAFETY:` comment stating the invariant, `transmute`, raw pointer arithmetic,
  `unsafe impl Send`/`Sync` without an argument. Is the safe wrapper actually sound for _every_ input?
- A panic (or `unwrap`) inside `Drop`, or across an `extern "C"` boundary.
- `RefCell::borrow_mut` reachable twice on one path - a runtime panic where a compile error used to be.

### 2. Error handling

- Swallowed failures: `let _ = fallible()`, `.ok()` discarding an error, `unwrap_or_default()` where the
  default is indistinguishable from success.
- Lost context: an error converted to `String`, or a new error built without `#[source]`/`.context()`, so
  the cause chain stops here.
- `anyhow::Error` in a **public library** signature - callers can no longer match on the failure.
- `?` widening into an error type so coarse that every caller must string-match to recover.
- Error types that don't implement `std::error::Error` + `Display` + `Debug`, or whose `Display` leaks
  secrets, paths, or a whole SQL query (C-GOOD-ERR).

### 3. Ownership, lifetimes, and allocation

- `.clone()` that exists to appease the borrow checker. Ask what the ownership _should_ be:
  `mem::take`/`mem::replace`, a tighter scope, `split_at_mut`, or one clear owner.
- `Arc<Mutex<T>>` around something with exactly one owner; `Rc<RefCell<T>>` used to build an object graph
  that a plain index or ID would model better; `Rc` cycles that never drop.
- `&String` / `&Vec<T>` / `&PathBuf` parameters where `&str` / `&[T]` / `&Path` accept strictly more.
- `Box<dyn Trait>` where a generic would monomorphize, and vice versa - `dyn` is for genuine heterogeneity.
- `'static` bounds forced by a design that could have used `std::thread::scope` or a borrow.
- Hot-path allocation: `to_string()`/`to_owned()` on an argument that's only read, `collect()` into a `Vec`
  that's immediately iterated, `format!` concatenation in a loop, `Vec::push` in a loop without
  `with_capacity`.

### 4. API design (public surface)

Against the [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/checklist.html):

- Naming: `snake_case`/`CamelCase`/`SCREAMING_SNAKE` (C-CASE); `as_` (cheap borrow), `to_` (expensive),
  `into_` (consuming) used correctly (C-CONV); `iter`/`iter_mut`/`into_iter` (C-ITER).
- Missing derives - every public type should have `Debug` (C-DEBUG); `Clone`/`Default`/`PartialEq` where
  they apply (C-COMMON-TRAITS). Types `Send`/`Sync` where possible (C-SEND-SYNC).
- Public struct fields that lock in a representation (C-STRUCT-PRIVATE); a public enum that should be
  `#[non_exhaustive]`.
- `bool` or bare `Option` arguments where an enum would say what the call means (C-CUSTOM-TYPE); two
  adjacent same-typed parameters begging for a newtype (C-NEWTYPE).
- Missing `#[must_use]` on a function whose return value must not be dropped; out-parameters instead of a
  return value (C-NO-OUT).
- Semver: does this change a signature, add a public field, add a variant to a non-`#[non_exhaustive]`
  enum, or bump a public dependency's major version?
- Trait with exactly one implementor and no test fake - dead flexibility; so is a generic parameter with
  one instantiation and a config knob nothing sets.

### 5. Concurrency

If the change touches threads, tasks, channels, or atomics, review it with **`rust-concurrency`**: blocking
the executor, a guard held across `.await`, `select!` cancellation safety, detached tasks whose failures
vanish, unbounded channels, and lock ordering.

### 6. Tests and documentation

- Does the change include a test that fails without it? For a bug fix, does the test reproduce the original
  bug?
- Boundaries: empty input, single element, max value, non-ASCII strings, `None`, the error path. Error
  paths are the most commonly untested code in a Rust diff.
- `#[should_panic]` without `expected = "..."` passes on the wrong panic; a leftover `#[ignore]`; a test
  that depends on wall-clock time, network, or thread scheduling.
- Public items without rustdoc; missing `# Errors` / `# Panics` / `# Safety` sections (C-FAILURE); doc
  examples using `unwrap` instead of `?` (C-QUESTION-MARK).

## Writing the review

- One finding per comment, anchored at `file:line`, stating the concrete failure - the input, interleaving,
  or release-mode behaviour that produces the wrong result - not a guideline code.
- Separate "this is a bug" from "I would write this differently", and don't let the second crowd out the
  first.
- If a suggestion is taste and the codebase is internally consistent, drop it. Consistency with the
  surrounding code beats consistency with any style guide.
- If you could not verify a suspicion (no repro, miri not run), say it is a suspicion.

## Sources

Checklist references (`C-*`) are from the
[Rust API Guidelines](https://rust-lang.github.io/api-guidelines/checklist.html). Anti-patterns
cross-checked against [rust-unofficial/patterns](https://github.com/rust-unofficial/patterns) and the
[clippy lint index](https://rust-lang.github.io/rust-clippy/master/); topic coverage follows the
[Let's Get Rusty learning guide](https://github.com/letsgetrusty/learn) (MIT - referenced, not reproduced).
For the practices being reviewed against, see `rust`; for threading and async review, see
`rust-concurrency`.
