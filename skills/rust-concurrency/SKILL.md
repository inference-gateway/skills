---
name: rust-concurrency
description: >
  Concurrent and async Rust - `Send`/`Sync`, scoped threads, `Arc<Mutex<_>>` discipline, channels, rayon,
  and the tokio rules that the compiler cannot check for you (blocking the executor, holding a lock across
  `.await`, cancellation safety, structured shutdown). Use when adding threads, tasks, channels, or atomics,
  when a future never completes or a task silently disappears, when choosing between threads/rayon/async,
  or when reviewing code that shares mutable state. Includes verification with miri, loom, and ThreadSanitizer.
license: Apache-2.0
---

# Rust Concurrency

Use this skill when writing, reviewing, or debugging concurrent or async Rust.

Rust's type system eliminates data races. It does **not** eliminate deadlocks, livelocks, task leaks,
starved executors, lost cancellation, or logic that is simply wrong when interleaved. "It compiles" is a
much weaker statement in concurrent code than sequential code - budget review attention accordingly.

## Design the sharing away first

- **Transfer ownership instead of sharing it.** A value `move`d into a thread or task needs no
  synchronization at all. This is the option the borrow checker rewards.
- **Prefer message passing.** One channel with a documented protocol is reviewable; a graph of
  `Arc<Mutex<_>>` reachable from four tasks is not.
- **Prefer immutability.** `Arc<T>` with no interior mutability is `Sync` for free and needs no lock.
- **Ask whether you need concurrency at all.** Rayon's `par_iter()` turns a data-parallel loop into a
  parallel one in one line and beats a hand-rolled thread pool on both risk and usually speed.

## `Send` and `Sync`

`Send` = safe to move to another thread. `Sync` = `&T` is safe to share, i.e. `T: Sync` iff `&T: Send`.
Both are auto traits: derived structurally, so a single `Rc` or raw pointer field silently un-`Send`s a
whole type and the error surfaces far from the cause.

Assert the property you depend on at compile time, next to the type:

```rust
fn assert_send_sync<T: Send + Sync>() {}

#[test]
fn user_is_send_sync() {
    assert_send_sync::<User>();
}
```

`unsafe impl Send`/`Sync` is a claim that you have manually verified what the compiler could not. Write the
argument in a `// SAFETY:` comment or don't write the impl.

## Threads

- **`std::thread::scope`** (1.63+) lets threads borrow from the stack, so scoped work needs neither
  `'static`, nor `Arc`, nor a clone. Use it unless the thread must outlive the frame.
- `JoinHandle::join` returns `Result` - `Err` means that thread **panicked**. Silently `unwrap`ping it
  turns a worker panic into a confusing parent panic; ignoring it loses the failure entirely.
- A detached thread with no shutdown signal is a leak. Every spawn needs a documented way to stop.
- **Rayon** for CPU-bound data parallelism (`par_iter`, `par_bridge`, `join`). Do not hand-roll a pool.

## Shared state

```rust
let total = Arc::new(Mutex::new(0));
// ...
{
    let mut guard = total.lock().expect("worker panicked while holding the lock");
    *guard += partial;                     // guard dropped here, before the next await/IO
}
```

- **Keep the critical section tiny** - no I/O, no `.await`, no callback into unknown code, no allocation
  you did not budget for.
- **`lock()` returns `Result`** because of poisoning: a panic while holding the lock marks it. Treat that
  as a real failure signal rather than reflexively `unwrap`ping. `parking_lot::Mutex` drops poisoning (and
  is faster) if you don't want the semantics.
- **Guard lifetimes bite.** A guard in a `match`/`if let` scrutinee lives for the whole arm - the classic
  self-deadlock. Bind it to a `let` and scope it.
- **Two locks means a documented global lock order**, taken the same way everywhere. Rust will not catch
  the inversion.
- **`RwLock`** only when reads dominate _and_ are long; otherwise a `Mutex` is faster and has no writer
  starvation question.
- **Atomics** for a counter or a flag, not for an invariant spanning two variables. Default to
  `Ordering::SeqCst`; anything weaker needs a written justification and a loom test.
- **`Rc`/`RefCell` are single-threaded.** `RefCell` moves borrow checking to runtime - a violation is a
  panic, not a compile error.

## Channels

`std::sync::mpsc` for multi-producer/single-consumer; `crossbeam-channel` for MPMC and `select!`;
`tokio::sync` for async (`mpsc`, `oneshot` for a single reply, `broadcast` for fan-out, `watch` for
latest-value-wins). Prefer **bounded** channels: an unbounded queue turns a throughput mismatch into
unbounded memory growth instead of backpressure. Both ends signal shutdown by disconnecting - `recv`
returning `Err` is the normal way a worker loop exits.

## Async

Async gives you **concurrency**, not parallelism. It is the right tool for many-waiting-on-IO, the wrong
tool for CPU-bound work.

- **Futures are inert.** A future that is never `.await`ed or spawned does nothing at all - no warning
  beyond `#[must_use]`.
- **`tokio::spawn` requires `Send + 'static`** and returns a `JoinHandle` you `.await` (not `join`).
  Dropping the handle detaches the task; the task keeps running and its `Err`/panic vanishes. Use
  **`JoinSet`** for a group so completions and failures are collected structurally.
- **Never block the executor.** A blocking file read, a `std::thread::sleep`, or a long CPU loop inside an
  async fn stalls every task on that worker thread. Use `tokio::task::spawn_blocking` for blocking IO and
  rayon (bridged with a `oneshot`) for CPU work.
- **`std::sync::Mutex` unless the guard must live across an `.await`.** A `std` guard is not `Send`, so the
  compiler will usually stop you; `tokio::sync::Mutex` is slower and exists only for that case. Better
  still: restructure so no lock is held across a suspension point.
- **`select!` requires cancellation safety.** The losing branches are dropped mid-execution; if a future
  consumed data it had not yet handed over, that data is gone. Only `.await` cancellation-safe futures
  directly in `select!` arms (`tokio` documents which are), otherwise poll a pinned future you own across
  iterations.
- **Cancellation is drop.** Everything a future needs to do on shutdown must live in a `Drop` impl or in
  code that runs before the next suspension point.
- **Timeouts on every external call** (`tokio::time::timeout`), and a real shutdown path -
  `CancellationToken` or a `watch` channel - so tasks stop on purpose rather than when the process dies.
- **Bound concurrency**: `stream.buffer_unordered(n)` or a `Semaphore`, not `n` spawned tasks per request.
- `async fn` in traits works natively (1.75+); `#[async_trait]` is still needed for `dyn` dispatch.

## Verification is not optional

Passing tests prove very little about interleavings your machine happened not to produce.

1. **`cargo miri test`** - undefined behaviour, and it explores multiple thread schedules.
2. **`loom`** - exhaustive interleaving checks for anything hand-written with atomics or lock-free
   structures. If you wrote `Ordering::Relaxed`, you owe a loom test.
3. **ThreadSanitizer** - `RUSTFLAGS="-Zsanitizer=thread" cargo +nightly test`, mandatory when `unsafe` or
   FFI is in the mix.
4. **Stress the schedule** - loop the test hundreds of times, on a loaded machine, with more threads than
   cores. Never leave a `sleep` as the synchronization mechanism in a test.
5. **`tokio-console`** for a stalled or leaked task; enable `tokio_unstable` in a debug profile.
6. **Measure.** If the parallel version isn't measurably faster on realistic data, delete the concurrency -
   you bought risk for nothing.

## Reviewing concurrent code

For each piece of shared mutable state the change touches: which lock or channel owns it, is that written
down next to the declaration, and does _every_ access path go through it? For each spawn: how does it stop,
who observes its failure, and what happens if it panics? For each `.await` inside a lock scope or a
`select!` arm: what is dropped, and is dropping it safe? A "this is only touched from one thread" answer
belongs in an assertion or a comment, because the next author will not infer it.

## Sources

Concurrency topic coverage follows the [Let's Get Rusty learning guide](https://github.com/letsgetrusty/learn)
(MIT - referenced, not reproduced). Rules cross-checked against the
[Rust Book](https://doc.rust-lang.org/book/ch16-00-concurrency.html), the
[Tokio docs](https://tokio.rs/tokio/tutorial) (blocking, `select!` cancellation safety, `spawn_blocking`),
the [Rustonomicon](https://doc.rust-lang.org/nomicon/send-and-sync.html) on `Send`/`Sync`, and
[loom](https://github.com/tokio-rs/loom). Related skills: `rust`, `rust-review`.
