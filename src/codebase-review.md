---
kind: review
kicker: Codebase review · exercise retrofit
title: Monkey's Limb Retrofit
dek: What the Into The Deep codebase changes about the AI-DLC arm exercise — and what changes again now that the arm arrives already built.
footer: Reviewed against `Into_The_Deep-master` as downloaded — `Core/`, `Teleop/Monkeys_Limb/`, `Teleop/monkeypaw/`, `Teleop/Wrappers/`, the eight test classes, and both gradle dependency files.
---

// NOTE: this document is a reference record of the review that produced the
// current exercise. It is not part of the session materials. The published
// web version of this review predates the markdown pipeline; regenerate it
// with `node render.js codebase-review.md --html out.html` if it needs updating.

@anchor summary
@eyebrow Short version
@h1 The architecture survived. The specifics didn't.
@lede Every structural idea the exercise teaches is still true in this codebase, and in places it is demonstrated better than it was in CenterStagev2. What went stale is every proper noun, one of the four loop-time techniques, and — the bigger shift — the entire premise that students build a mechanism.
@p Three things needed decisions rather than edits: which repository students work in, what replaces the worked example now that nobody is building an arm, and what to do about a reference test suite that no longer compiles.

@box Decided — students can't build in a bare SDK
The arm exists only inside this repository, as roughly two thousand lines of FSM across eight classes. Students now clone `Into_The_Deep` and work on a branch. Setup got shorter, not longer: FTCLib, JUnit and Mockito are already declared, so what was "add the dependency" became "confirm it resolves."
@end

@anchor versions
@eyebrow Facts
@h1 What changed between seasons
@table 3200,3080,3080
@th | CenterStagev2 | Into_The_Deep
@tr FTC SDK | 9.0.1 | 10.2.0
@tr FTCLib | 2.1.1 | 2.1.1 — unchanged
@tr JUnit / Mockito | 5.10.3 / 5.13.0 | unchanged
@tr Autonomous | RoadRunner | PedroPathing 1.0.7
@tr FSM naming | `ArmFiniteStateMachine` | `ArmFSM`
@tr Wrappers | beside their FSMs | own package, `Teleop/Wrappers/`
@tr Units | encoder ticks | centimetres, converted in the wrapper
@end

@anchor holds
@eyebrow Still holds
@h1 Nine things that carried across
@p These needed no change beyond class names. The conventions survived a whole season and a full rewrite, which is itself worth telling students.
@bullets
- **FSM + wrapper split** — wrappers now live in their own package, so the separation got more explicit, not less.
- **Boolean query methods** — still SCREAMING_CASE, still no public state enum anywhere.
- **Read once, reuse many** — `readPositionInCM()` / `getLastReadPositionInCM()`, `readPos()` / `getLastReadPos()`.
- **Manual bulk caching** — `HWMap` sets every hub to `MANUAL`; `clearCache()` runs once at loop top.
- **One `telemetry.update()`** — `Logger.log()` buffers, `Logger.print()` flushes once.
- **Non-blocking `updateState()`** — timers and thresholds throughout; no sleeps in the loop.
- **`@Config` live tuning** — gains and setpoints exposed to FTC Dashboard as before.
- **`@VisibleForTesting` constructors** — `ArmFSM` takes an injected wrapper, PIDF and timer.
- **FTCLib `GamepadEx`** — version 2.1.1, exactly what the worksheet specifies.

@anchor broke
@eyebrow Now wrong
@h1 Four things that would have failed in the room
@p Each is a place where a student follows an instruction and hits nothing, or hits something that contradicts what they were told. All four are now handled in the current materials.

@h2 1 · Per-subsystem timing is gone
@p Loop-time technique 04 described a `Timing.Timer` wrapping each FSM's `updateState()`. That was real in CenterStagev2 and does not exist here — this season measures the whole loop and nothing inside it.
@p **Resolution:** turned into an asset. Worksheet Step 7 now has students discover the technique is missing; Step 19 has them add it back for their own code.

@h2 2 · The reference test suite doesn't compile
@p `ArmFSMTest` calls `updateState(0)` against a four-argument signature. `LimbFSMTest` passes twelve arguments to a fifteen-parameter method. `ShoulderFSMTest` calls a one-parameter method with none. Of 127 `@Test` methods, 46 are live and five of the eight classes are fully commented out.
@p **Resolution:** both documents now warn about it. The teacher's guide asks for a decision before the session — fix the three signatures, or name it honestly as what happens when tests drift from the code they test.

@h2 3 · Every class name was stale
@p Nothing in the old architecture map survived verbatim. All names, packages and units are now updated against the real files.

@h2 4 · "Never hand-roll button edges" was too absolute
@p `MainTeleop` does both. FTCLib has no edge detection for analog triggers, so `leftTriggerWasJustPressed` genuinely has to be hand-rolled; the four button flags beside it do not.
@p **Resolution:** the nuance is now taught rather than the blanket rule.

@anchor reframe
@eyebrow Changes shape
@h1 A built arm makes this a different exercise
@p The five phases stayed. The work inside them moved from construction to specification, which is arguably a truer use of the method.
@bullets
- **Kickoff** — from "choose a mechanism" to "inventory what it can already do." The ~60 boolean methods are the vocabulary every objective has to be written in.
- **Phase 1** — the intent describes a capability the arm doesn't have yet, assembled from motions it already has. Non-goals matter more, not less.
- **Phase 3** — they design a coordinator, not a subsystem: a sequence expressed in existing booleans.
- **Phase 5** — they may write no wrapper at all. The wrapper lesson inverted: find where hardware calls live, and prove your new code doesn't touch them.
- **Loop time** — better, not worse. The arm already shares its loop with a drivetrain, four servo PID controllers and an IMU read.

@anchor defects
@eyebrow Unrelated to the exercise
@h1 Five things worth telling the team
@p Found while reading. None affect the session; all look like real defects.
@table 2900,6460
@th Where | What
@tr `ArmFSM.isFullyExtended()` | Compares doubles with `==` against a value computed from spool geometry, so `FULLY_EXTENDED` looks unreachable.
@tr `Logger` | `PRODUCTION()` and `DRIVER_DATA()` both return `state == DEBUG`. Harmless while nothing calls them.
@tr `build.dependencies.gradle` | Declares FTCLib core 2.0.1 while `TeamCode/build.gradle` declares 2.1.1. Gradle resolves upward so it builds — a trap for whoever changes one next.
@tr `ArmFSM.updateState()` | Runs `updatePIDF()` before `readPositionInCM()`, so that call sees the previous loop's cached position. `MainTeleop` calls `updatePID()` again later with fresh data, so it may wash out — worth tracing deliberately.
@tr `LimbFSM.updateState()` | Fifteen parameters, several passed as bare `false` at every call site. `MonkeyPawFSM.updateState()` takes eleven. Also `EXTENDED_TO_INTAKE_SPECiMEN` has a lowercase i.
@end
