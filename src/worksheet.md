---
kind: worksheet
kicker: AI-DLC WORKING SESSION · WORKSHEET
title: Give the Arm Something
title2: New to Do
---

@eyebrow AI-DLC WORKING SESSION · WORKSHEET

@h1 Give the Arm Something New to Do

@p The arm is already built, wired, and running under closed-loop control. Your job is not to build a mechanism. It is to decide **what the arm should be able to do that it can't do yet** — and take that objective through the five phases of AI-DLC until it works on the bench.

@p **The objective is yours** — two teams working from this sheet should end up with two different behaviours on the robot. **YOU'RE DONE WHEN** closes every phase; don't move on until you can tick it.

@table
@th Your name | Teammates | Date
@tr [blank:2] | [blank:2] | [blank:2]
@end

@rule The one rule that never bends
**Nothing you add may change how an existing mechanism behaves.** This is your team's real competition code. Read anything, call anything — but if the arm behaves differently when nobody has pressed your new control, you have broken the robot for everyone else. Work on a branch. Stay additive.
@end

@eyebrow The method

@h2 What AI-DLC is

@p AI-DLC is how building with AI works when it works: **you do the deciding, then AI helps you execute it faster than you could alone.** Note the shape of this session — **four of the five phases happen before anyone writes code.** That isn't old-fashioned; it is what makes the fifth phase fast instead of expensive.

@p Each phase below is one step of this worksheet. In every one AI does a real job, and something stays yours — that boundary is the interesting part.

@table 1900,3900,3560
@th Phase | What AI is good at here | What stays yours
@tr **1 · Intent** | Interviewing you. Asking what you left out. Turning a rambling explanation into a tight paragraph. | Deciding which problem is worth solving at all.
@tr **2 · Elaborate** | Proposing slices. Spotting acceptance criteria that can't actually be checked. | What's in scope, and what you're saying no to.
@tr **3 · Design** | Formalising your sketch into a table. Finding transitions with no exit condition. | The design itself. Ask it to **critique**, not to decide.
@tr **4 · Verify** | Playing reviewer — "what did we miss?", "what breaks on hardware?" | The go / no-go. It advises; you decide.
@tr **5 · Bolt** | Anything from answering questions to writing whole classes. | Understanding every line that ships.
@end

// TENETS
@pagebreak

@eyebrow The lens

@h2 Four things this exercise is really about

@p Your objective is the vehicle; these four are the cargo. They reappear in every phase, marked ◆. The first three separate code that works on the bench from code that survives a match. The fourth is about how you work at all.

@tenet 1 | Loop time
@tline What it is | One loop, shared by every mechanism, all match. A slow loop doesn't crash — it makes the robot feel vague, which is far harder to diagnose than a failure.
@tline Your job | Know what your addition costs. Measure it — a guess is not a number.
@end

@tenet 2 | Separation of duties
@tline What it is | Wrappers touch hardware, state machines decide, the OpMode runs the loop. That split is what lets you test one method at a time.
@tline Your job | Keep every variable in the smallest scope that works. If you can't test a method by handing it inputs, it is doing too much.
@end

@tenet 3 | Data and logging
@tline What it is | Watching tells you **that** something is wrong, almost never **why**. A stall looks identical whether the boolean never went true, went true a loop early, or was overwritten.
@tline Your job | Instrument before you debug. Log the values your decisions are made from, not just the state you landed in.
@end

@tenet 4 | Using AI responsibly and effectively
@tline What it is | Four of the five phases happen before anyone writes code. AI produces confident, plausible, wrong code quickly — fastest when you haven't said what you actually want.
@tline Your job | Do the design, then use AI to move faster inside it. **You must be able to explain every line you ship** — "the AI wrote it" is not an explanation, and not an answer you can give at a competition.
@end

@h3 Before you start

@bullets
- A branch with your name on it, a green Gradle sync, and `Core/TeleopWithoutDriving.java` open — the bench OpMode, and where your work goes. Not `MainTeleop`.
- Your vocabulary list from the walkthrough: the **questions** the arm answers (`AT_INTAKE()`, `FULLY_RETRACTED()`) and the **orders** it obeys (`retract()`, `moveToIntakeAngle()`). Everything you build is assembled from these.
- A free control — `B`, the right bumper and `start` are unbound; everything else is taken.

@p One more thing before Phase 1: your chat doesn't know FTC or this codebase's rules yet. Paste this once, first, so every prompt below inherits it.

@prompt We're adding to a working FTC robot, so read these before you answer anything. Nothing may change how an existing mechanism behaves. This file touches no hardware. It only calls methods that already exist in the files I paste — if you need one that isn't there, say so instead of writing it. Answer from my files, not from what FTC code usually looks like.

// PHASE 1
@pagebreak

@step 1 | Phase 1: Plan Intent | 15 MIN · AI-DLC PHASE 1

@tenettag Loop time

@lens
- Objectives that work here **sequence motions the arm already has**: combine several driver actions into one, guard a motion until another part reports it's safe, or recover to a known pose. No new setpoints, no PID tuning.
- An intent says what will be true when you're finished and how you'd know — not how. If you're naming classes, you've skipped ahead.
- Write the loop-time budget **now**: a number you commit to is a constraint you design against; one you measure at the end is just a number.

@prompt Our arm can already do [paste your vocabulary list]. We want it to [your objective]. Ask me what you need to know, one question at a time. Then draft a short intent under four headings: problem statement, success criteria, non-goals, and a loop-time budget in milliseconds. Everything shares one loop, so the budget is a constraint, not a footnote.

@table
@th Question | Your answer
@tr **Objective** — one sentence: what should the arm do when you're finished, and what's slow or error-prone about doing it today? | [blank:2]
@tr **Success criteria** — what will you demonstrate, visible from across the room? | [blank:2]
@tr **Non-goals** — what are you deliberately not doing? | [blank:2]
@tr **Loop-time budget** — how many milliseconds may it cost, and how will you know? | [blank:2]
@end

@done Every teammate restates the objective the same way, every motion it needs is on your vocabulary list, and the budget row has a real number.

// PHASE 2
@pagebreak

@step 2 | Phase 2: Elaborate | 10 MIN · AI-DLC PHASE 2

@lens
- An acceptance criterion is something you check by hand for a clear yes or no. "The arm stows properly" fails that; "pressing the control while extended retracts fully before the shoulder moves" passes.
- If a story needs three other things built first, it isn't a slice — it's the whole objective in disguise. Split it. And one story must be about knowing it works **from the data**, not from watching — that's what makes Phase 5 quick instead of frantic.

@prompt Here is our intent: [paste]. Break it into three small stories, each with one acceptance criterion I could check by hand on the bench — a clear yes or no, not "works properly." One story must be about loop time, one about what we'd log.

@table
@th Story | Acceptance criterion — how you'd check it
@tr [blank:2] | [blank:2]
@tr [blank:2] | [blank:2]
@tr [blank:2] | [blank:2]
@end

@done One story is small enough to finish alone inside the build block, and one is about how you'll observe it.

// PHASE 3
@pagebreak

@step 3 | Phase 3: Design | 20 MIN · AI-DLC PHASE 3

@tenettag Separation of duties

@lens
- Name each state for what is true while the arm is in it — `RETRACTING`, not `AFTER_B_PRESSED`. A name describing the trigger will mislead you an hour from now.
- The hard part isn't the states, it's **how you know one is finished**. Every arrow needs an existing boolean behind it; one without is a bug you haven't written yet. Decide too what happens if the driver interrupts halfway.

@prompt Here is our state table: [paste], and here are the files it calls into: [paste]. For each row, quote the line where the exit-condition method is declared, or say plainly that it isn't there. Then list the transitions we have not defined at all. Stop there — the design stays ours.

@table 2100,2600,2900,1760
@th State | What it orders the arm to do | Existing boolean that ends it | Goes to
@tr [blank:2] | [blank:2] | [blank:2] | [blank:2]
@tr [blank:2] | [blank:2] | [blank:2] | [blank:2]
@tr [blank:2] | [blank:2] | [blank:2] | [blank:2]
@tr [blank:2] | [blank:2] | [blank:2] | [blank:2]
@end

@table 3120,3120,3120
@th A decision you argued about | What else you considered | What it costs you later
@tr [blank:2] | [blank:2] | [blank:2]
@end

@done Every row's third column names a real method in a real class — not "when it's ready" — you know what happens on interruption, and the decision row is filled in.

// PHASE 4
@pagebreak

@step 4 | Phase 4: Verify | 10 MIN · AI-DLC PHASE 4

@p Check the design against reality before writing code. Read each line out loud; tick it only if it's actually true. Three are the tenets as questions.

@prompt Act as a reviewer, not an author. Here is our design: [paste], and here is our checklist: [paste]. For each checklist line say pass, fail, or can't-tell-from-this, and why. Then add anything that would break on real hardware that the list doesn't ask about, including a driver interrupting halfway. Findings only; the fixing is ours.

@check Every state has a way in **and** out. No state can trap the arm forever.
@check Every exit condition names a method that exists — spelling checked against the file.
@check You know what happens if the driver presses something else mid-sequence.
@check ◆ **Separation** — orders go only through existing methods; nothing touches a motor or servo.
@check ◆ **Data** — you know which values you'll log, including the ones decisions are made from.
@check ◆ **Loop time** — you have a plan to measure the cost, in nanoseconds. Nothing changes when your control isn't pressed, and the team agrees this is buildable in the time left.

@done Every box ticked, and anything you couldn't tick fixed or cut out loud.

// PHASE 5
@pagebreak

@step 5 | Phase 5: Bolt | 40 MIN · AI-DLC PHASE 5

@h3 ◆ First decision of this phase: set your dial

@p Tenet 4. Choose how much of the typing you hand over. All three are used in industry, by good engineers, on real code — none is cheating, and each assumes a state table you believe in. This is a choice about **typing, not thinking**.

@table 1700,4260,3400
@th Position | What it looks like here | What it costs you
@tr **1 · Ask only** | You write every line. AI answers questions about the codebase, about Java, about what a method does. | Slowest. You learn the most and finish the least.
@tr **2 · Piece by piece** | You ask for one `case` or one method at a time, and check it against your state table before asking for the next. | Moderate. The common professional pattern, and the one this worksheet is built around.
@tr **3 · Draft and review** | AI writes the class from your state table. You read every line and own what ships. | Fastest — safe only if your table is good and you actually read the output.
@end

@p If you set your dial to position 3

@prompt Here is our state table and the file it goes in: [paste]. Write the whole FSM class from the table — every case, nothing the table doesn't call for. Then list, line by line, anything you had to decide that the table didn't tell you.

@table 4200,5160
@th Question | Your answer
@tr Which position, and why is it right for this objective and the time you have left? | [blank:2]
@end

@tenettag Data and logging

@p Then four moves, in this order: **write, instrument, run, measure.** Teams that run before instrumenting spend the back half of the block guessing.

@lens
- **Write.** Take the FSMs plus the `Logger` in the constructor. Make `updateState(...)` a `switch` where each case decides **only** whether to move on; after the switch, give the order belonging to the current state — in one place, so table and code can't disagree.
- **Instrument, before you run.** Log the state _and_ the values transitions depend on: if a step ends when a boolean goes true, log that boolean and what it's computed from. Log at `DEBUG`, inside the OpMode's existing `log()`.
- **Run.** Construct it with the other FSMs inside the `try` block; call `updateState(...)` once per loop, reading your control with `wasJustPressed(...)` — which works only because `readButtons()` runs at the top. **Read your log before changing code.**
- **Measure.** `System.nanoTime()` either side of the call; subtract, divide by a million. `loopTimer` reports whole milliseconds, so it would show `0` and teach you nothing. **"0 ms" is not a measurement.**

@rule Three rules for this file
**No hardware.** If you typed `DcMotor`, `Servo` or `hardwareMap`, it belongs elsewhere. • **Nothing that blocks.** Never `sleep()` — start a timer and check it on later loops. • **Ask, don't reach.** Call the other FSMs' boolean methods; don't read their state enums, and don't add a `telemetry.update()` — there is exactly one in the loop and it isn't yours.
@end

@prompt Here is my state table and my class so far: [paste]. Add ONLY the case for [name one state from your table], matching that row exactly. Do not add other cases, refactor what is there, or add fields I have not declared. If the row names a method that isn't in what I pasted, stop and say so rather than inventing one.

// PHASE 5, PAGE 2 — the build fills a page on its own, so measuring and the
// wrap carry over. The seam is deliberate: building is 40 minutes at the
// bench, measuring and the wrap are done together once it runs.
@pagebreak

@h2 Phase 5, continued: measure it, then wrap up

@p Your control works. Now put a number on what it cost, and read your log before you say what happened.

@table
@th Question | Your answer
@tr What did the log tell you that watching it didn't? | [blank:2]
@tr Your cost per loop, beside the whole loop's time | [blank:2]
@tr Did you meet your Phase 1 budget? If not, where did it go? | [blank:2]
@end

@done Pressing your control does what Phase 1's success criteria said, and your cost is a measured number with units.

@h3 Wrap — demo on the bench, then fill this in as a team

@p Say what it does before you press anything. Then: your measured number, one thing the log showed that watching didn't, and whether your dial was set right.

@table
@th What worked | What you'd do differently | Parking lot
@tr [blank:2] | [blank:2] | [blank:2]
@end
