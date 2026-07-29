---
name: rust
description: >
  Idiomatic Rust - ownership at API boundaries, type-driven design, error handling with thiserror/anyhow,
  iterators and combinators, module and workspace layout, testing tiers, and the cargo toolchain. Use when
  writing, reviewing, or refactoring any Rust code, especially code drifting toward other-language shapes
  (clone-to-appease-the-borrow-checker, `Rc<RefCell<_>>` object graphs, traits with one implementor,
  stringly-typed APIs) - even if the user never says "idiomatic". Follows the Let's Get Rusty curriculum
  and the Rust API Guidelines.
license: Apache-2.0
---

# Idiomatic Rust

Rust's compiler is the cheapest reviewer you have. Idiomatic Rust is code that **moves invariants into
types** so the compiler checks them, then gets out of the way. The common failure mode (and the LLM
default) is fighting the borrow checker with `.clone()` and `Rc<RefCell<_>>` until it compiles, which
trades a compile error for a runtime panic. When the borrow checker complains, the ownership model is
usually wrong - not the checker.

## Ownership at the API boundary

Take the most general thing that works, return something owned. Deref coercion means a `&str` parameter
accepts `&String`, `&str`, and `String` derefs alike, while a `&String` parameter accepts only one of them
and adds a pointer hop.

| Don't take | Take    |
| ---------- | ------- |
| `&String`  | `&str`  |
| `&Vec<T>`  | `&[T]`  |
| `&PathBuf` | `&Path` |
| `&Box<T>`  | `&T`    |

Rules of thumb:

- **Borrow if you only read it; take it owned if you store it.** A function that stashes its argument in a
  struct should take `String`, not `&str` - taking `&str` and calling `.to_owned()` inside just hides the
  allocation from the caller (C-CALLER-CONTROL).
- **Return owned values.** Returning `&T` from a method ties the caller's hands to your lifetime.
- **`Cow<'_, str>`** when you usually borrow but occasionally must allocate.
- **`impl AsRef<Path>`** for path-ish arguments; `impl Into<String>` when you'll own it either way.

## `.clone()` is a decision, not an escape hatch

Cloning to silence a borrow error is the most common Rust anti-pattern. Reach for these first:

```rust
use std::mem;

// Move a field out of a &mut without cloning it.
fn promote(user: &mut User) {
    *user = match user {
        User::Reader { name } => User::Writer { name: mem::take(name) },
        User::Writer { name } => User::Admin { name: mem::take(name) },
        User::Admin { .. } => return,
    };
}
```

`mem::take` / `mem::replace` for moving out of a `&mut`, a narrower scope or an inner block to end a borrow
early, `split_at_mut` for two disjoint `&mut` into one slice, and restructuring so the data has one owner.
Clone when the copy is genuinely cheap or genuinely needed - and know which it is.

## Make illegal states unrepresentable

- **Newtypes over primitives** - `UserId(u32)`, `Meters(f64)`. Two adjacent `u32` parameters are a bug
  waiting for an argument swap (C-NEWTYPE).
- **Enums over `bool` flags and sentinel values.** `fn render(&self, mode: Mode)` beats
  `fn render(&self, compact: bool)` (C-CUSTOM-TYPE). `Option<T>` and `Result<T, E>` are enums - use them
  instead of `-1`, empty string, or a nullable field.
- **Private fields plus a validating constructor**, or `TryFrom` for fallible construction. A public field
  is a permanent promise (C-STRUCT-PRIVATE).
- **Builder for many optional settings**, so callers don't read a wall of positional arguments
  (C-BUILDER):

```rust
let server = Server::new("localhost".into(), 8080)
    .timeout(Duration::from_secs(2))
    .tls(cert)
    .build();
```

- **Derive the common traits eagerly** - `Debug` on everything public, plus `Clone`, `Copy`, `Default`,
  `PartialEq`/`Eq`, `Hash`, `PartialOrd`/`Ord` where they make sense (C-COMMON-TRAITS, C-DEBUG). Gate serde
  behind a feature: `#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]`.

## Errors: enum in a library, `anyhow` in a binary

**Library:** a concrete error enum, so callers can match on the variant they care about. `thiserror`
generates the `Display` and `From` boilerplate:

```rust
#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("reading {path}")]
    Io { path: PathBuf, #[source] source: std::io::Error },
    #[error("port {0} is out of range")]
    BadPort(u32),
}
```

**Binary / application:** `anyhow::Result<T>` plus `.context("...")` at each layer. Never expose `anyhow`
in a public library signature - it erases the type the caller needs.

- **`?` everywhere**, with `From` (or `#[from]`) doing the conversion. `map_err` when the conversion is
  local and one-off.
- **Keep the chain.** Attach the cause as `#[source]`; never `format!("{e}")` into a `String` error - that
  throws away everything below the top frame.
- **`unwrap` / `expect` only** in tests, in `main`, and where a genuine invariant holds - and then use
  `expect` with a message that states _why_ it cannot fail, not what failed.
- **`panic!` is for bugs, `Result` is for expected failure.** Anything reachable from untrusted input is
  expected failure.
- Document the failure modes: rustdoc `# Errors` and `# Panics` sections (C-FAILURE).

## Iterators and combinators over index loops

```rust
// parse what parses, drop the rest
let scores: Vec<f32> = raw.iter().filter_map(|s| s.parse().ok()).collect();

// all-or-nothing: the first Err short-circuits
let ports: Result<Vec<u16>, _> = raw.iter().map(|s| s.parse::<u16>()).collect();
```

`Option` is an iterator of 0 or 1: `vec.extend(maybe_item)`, `iter.chain(maybe.iter())`, and `.flatten()`
to drop the `None`s. Prefer `?`, `ok_or`, `unwrap_or_default`, `and_then`, `map_or_else` to a `match` that
only reshapes. Iterators are lazy and zero-cost - the loop you write by hand is rarely faster and always
longer.

## Traits: generics by default, `dyn` when you need a collection

Static dispatch (`impl Trait`, `<T: Trait>`) is the default: monomorphized, inlinable, no vtable. Reach for
`Box<dyn Trait>` when you genuinely need heterogeneity (`Vec<Box<dyn Animal>>`) or a compile-time-unknown
implementor at a plugin boundary. `impl Trait` in argument position for simple bounds, in return position
to hide an iterator or future type.

**Do not add a trait with one implementor.** That's an interface habit from another language; the concrete
type is the API. Introduce the trait when the second implementor appears (a test fake counts, a
hypothetical does not).

## Project structure

- `src/lib.rs` holds the logic; `src/main.rs` is a thin shell that parses arguments and calls into the
  library. This is what makes the crate testable and reusable.
- A module is `foo.rs` (plus `foo/` for its children) - the 2018+ layout, no `mod.rs` needed.
- **Default to `pub(crate)`.** Every `pub` item is a semver commitment.
- One crate until a piece has an independent consumer or an independently useful compile time; then a
  **workspace** with a shared `[workspace.dependencies]`.
- **Cargo features are additive** - a feature may turn things on, never off, and the crate must compile
  with any subset. Test with `--no-default-features` and `--all-features`.
- Fill in `Cargo.toml` metadata (description, license, repository, keywords, categories) and pin an MSRV
  with `rust-version` (C-METADATA).

## Testing

| Tier        | Where                    | Sees                      |
| ----------- | ------------------------ | ------------------------- |
| Unit        | `#[cfg(test)] mod tests` | private items             |
| Integration | `tests/*.rs`             | the public API only       |
| Doc test    | `///` examples           | the public API, as a user |
| Bench       | `benches/` (criterion)   | whatever you measure      |

- Doc examples are compiled and run - they are the tests that cannot rot. Use `?` in them, not `unwrap`
  (C-QUESTION-MARK).
- Table-drive with a slice of `(input, expected)` tuples rather than copy-pasting `#[test]` bodies.
- `#[should_panic(expected = "...")]` needs the `expected` string, or it passes on the wrong panic.
- Reach for `insta` (snapshots) or `proptest` (properties) when a case list stops being enough - not
  before.

## Toolchain: let the tools find it first

```sh
cargo fmt --all                          # never argue about style
cargo clippy --all-targets -- -D warnings
cargo test --all-features
cargo doc --no-deps                      # broken intra-doc links are warnings
```

Pin the toolchain in `rust-toolchain.toml`, and put `-D warnings` **in CI**, not `#![deny(warnings)]` in
the source - a source-level deny turns any new upstream lint into a broken build for everyone downstream.
Add `cargo audit` / `cargo deny` for supply chain, `cargo machete` for unused dependencies.

## `unsafe` is a last resort with a proof obligation

Keep it to the smallest possible block inside a module that exposes a safe API, write a `# Safety` doc
comment stating the invariant the caller must uphold (C-FAILURE), and run `cargo miri test` over anything
that touches raw pointers. `unsafe` does not silence the borrow checker - it only permits five extra
operations, and you now own the proof.

## Sources

Topic coverage and worked examples follow the [Let's Get Rusty learning guide](https://github.com/letsgetrusty/learn)
(MIT - referenced, not reproduced) and its pattern repos (`borrowed_arguments`, `avoiding_allocations`,
`builder_pattern`, `common-traits`, `iterating_over_option`). Checklist references (`C-*`) are from the
[Rust API Guidelines](https://rust-lang.github.io/api-guidelines/checklist.html); idioms and anti-patterns
cross-checked against [rust-unofficial/patterns](https://github.com/rust-unofficial/patterns). Pairs with
**rust-concurrency** and **rust-review**.
