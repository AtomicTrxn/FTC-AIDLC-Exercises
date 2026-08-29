---
kind: guide
kicker: AI-DLC × INTO THE DEEP · TEACHER'S GUIDE · 2-HOUR SESSION
title: Give the Arm Something
title2: New to Do
dek: "The arm arrives already built. Students don't construct a mechanism — they decide **what it should be able to do that it can't do yet**, and carry that objective through five phases of AI-DLC. Every team chooses a different objective; every team is held to the same four engineering tenets and the same guardrails."
chips: "Session=120 min; Setup=+20 min; Team=3–6 students; Codebase=Into_The_Deep; Bench OpMode=TeleopWithoutDriving"
pairactive: Teacher's Guide
pair: "→ Student Worksheet — 21 steps, separate handout"
footer: "Reviewed against `Into_The_Deep-master`: `Core/`, `Teleop/Monkeys_Limb/`, `Teleop/monkeypaw/`, `Teleop/Wrappers/`, the eight test classes and both gradle dependency files. FTC SDK 10.2.0, FTCLib 2.1.1, JUnit 5.10.3, Mockito 5.13.0 — verified against the repository rather than assumed. Every method named in the worked objective was confirmed to exist. Source of truth for this document is `src/teachers-guide.md`."
---

*AI-DLC × INTO THE DEEP · TEACHER'S GUIDE · 2-HOUR SESSION*

# Give the Arm Something New to Do

The arm arrives already built. Students don't construct a mechanism — they decide **what it should be able to do that it can't do yet**, and carry that objective through five phases of AI-DLC. Every team chooses a different objective; every team is held to the same four engineering tenets and the same guardrails.

**On this page**

- How to use this guide
- The four tenets
- AI, done well
- Session shape
- What the arm is
- Worked objective
- Fallback code
- Example prompts
- Where teams stick
- Review findings

| Session | Setup | Team | Codebase | Bench OpMode |
|---|---|---|---|---|
| 120 min | +20 min | 3–6 students | `Into_The_Deep` | `TeleopWithoutDriving` |

> **Paired handout**
>
> **Student Worksheet — Give the Arm Something New to Do.** Twenty-one numbered steps. Steps 1–4 are setup and deliberately prescriptive; everything after that gives them a lens and questions rather than instructions. Steps 9–10 are where they choose an objective and pressure-test it against fixed guardrails.

*Read this first*

## How to use this guide

This is one fully worked objective, carried through all five phases, so you have something rehearsed to demo and a fallback if a team stalls. **It is not the objective students should produce.** Pick something else to demo if you like — what matters is that they see the shape of the work, not this particular answer.

The worksheet deliberately withholds the specificity you have here. Where you have a state table, they have four blank rows and a rule that column three must name a real method. Where you have code, they have three constraints and a question about scope. That gap is the exercise.

> **The single biggest risk to this session**
>
> Students working in the real competition repository can break the robot for everyone. The worksheet's one hard rule is that **nothing they add may change existing behaviour when their control isn't pressed** — additive only, on a branch. Say it out loud at kickoff, and check it at the Phase 4 gate. `B`, the right bumper and `start` are the only unbound controls on either gamepad; everything else is taken.

### Where your blocks and their steps line up

| Your block | Steps | What you're watching for |
|---|---|---|
| Block 0 — Setup | 1 – 4 | Green Gradle sync, everyone on their own branch, nobody editing `master` |
| Learn the arm | 5 – 8 | They can name real methods, and they found the missing loop-time technique |
| Choose an objective | 9 – 10 | Five guardrails ticked honestly — this is where you intervene, not later |
| Phase 1 — Intent | 11 | A loop-time number, and a non-goals row that actually says no to something |
| Phase 2 — Elaborate | 12 | Criteria you could check by hand; one story about observability |
| Phase 3 — Design | 13 – 14 | Every arrow labelled with a boolean that exists |
| Phase 4 — Verify | 15 | Unticked boxes fixed or cut — and a written decision about AI use |
| Phase 5 — Bolt | 16 – 19 | Write, instrument, run, measure — in that order |
| Stretch | 20 | Only for teams already demoing |
| Wrap & retro | 21 | A measured number, one thing the log revealed, and whether the AI split was right |

<!-- ================= TENETS ================= -->

*The spine of the session*

## The four tenets — and how to teach them

*Objectives vary by team. These don't. Each tenet appears in the worksheet marked with a ◆, and each has a moment in the session where it stops being advice and becomes something students have to do. Those moments are where your attention is worth most.*

### Tenet 1 — Loop time

**The idea:** One loop, shared by every mechanism, running the whole match. Time you spend is time nobody else gets. A slow loop doesn't crash — it makes the robot feel vague, which is much harder for a student to diagnose than a failure.

**Their moment:** Step 7 they find three defences already in the code and discover the fourth is missing. Step 19 they add it back with `System.nanoTime()`.

**What to watch for:** A team that reports “0 ms” and moves on. The existing `loopTimer` resolves to whole milliseconds and their addition costs far less than one, so a millisecond timer teaches them nothing. Push them to nanoseconds — this is the difference between a measurement and a shrug.

### Tenet 2 — Separation of duties

**The idea:** One job per class, one job per method. Wrappers touch hardware; state machines decide; the OpMode runs the loop. The payoff is that you can reason about — and test — one method at a time.

**Their moment:** Step 6 they read `ArmFSM` and `ArmMotorsWrapper` side by side. Step 16 they write a coordinator that gives orders through existing methods and touches no hardware at all.

**On globals:** Worth being precise with students rather than absolutist. This codebase is full of `public static` fields, and they are nearly all deliberate — tunable constants exposed for live adjustment. The rule isn't “no globals”, it's **“no globals you can't defend.”** A student who makes a field global because passing it was tedious has made a different decision than the one this code made, and should be able to say why.

### Tenet 3 — Data and logging

**The idea:** Watching tells you **that** something is wrong. Only data tells you **why**. Students are writing comparisons, tolerances and ordering — and every one of those failure modes looks identical from across the room.

**Their moment:** Step 8 they read `Logger` and its three levels. Step 17 — placed before the first run on purpose — they instrument their own code. Step 18 says read the log before changing any code.

**What to watch for:** The instinct to debug by changing something and running it again. When a team is on their fourth guess, ask them what's on the screen. If the answer is “the state”, ask what value the failing comparison was made from. That question usually ends the guessing.

**Why the ordering matters:** Step 17 comes before Step 18 on purpose. Instrumenting after something breaks costs the same five minutes but under time pressure, and by then they've usually already changed three things.

### Tenet 4 — Using AI responsibly and effectively

**The idea:** AI is a tool that accelerates the work. It does not replace the thinking. Point at the shape of the session when you teach this: **four of the five phases happen before anyone writes code**, and that is not nostalgia — it is what makes the fifth phase fast instead of expensive.

**Say this plainly:** Design and planning matter exactly as much when AI writes the code as when they write it by hand. Arguably more, because AI will produce a large amount of confident, plausible, wrong code very quickly — and fastest of all when nobody has told it what they actually want.

**The failure mode:** Code that compiles, looks reasonable, and nobody understands or intended. It comes from skipping the design and asking for the answer. It isn't fast; it moves the debugging to later, when there is less time and more of it to unpick.

**Their moment:** Step 15, at the Verify gate — design already done — they choose how much of the typing to hand over, and write down why. At the retro they say whether it was right.

**What to watch for:** Not which position they picked. Whether they can explain the code they shipped. That is the only signal that separates using AI well from generating something nobody owns.

> **Teach the conflict, not just the rules**
>
> Logging costs loop time. Separation costs indirection. Students will hit a moment where two tenets pull opposite ways, and the useful lesson is that engineering is the trade rather than the absence of one. The codebase already models the good answer: `Logger` buffers all loop and flushes once, so rich diagnostics cost almost nothing — and the level switches from a gamepad button so debug output can ship without ever reaching the driver.

<!-- ================= AI DONE WELL ================= -->

*Tenet 4, in detail*

## AI accelerates the work. It doesn't replace the thinking.

Worth walking through at kickoff, and worth being explicit about **why the session is shaped the way it is**: four phases of deciding before one phase of building. In each phase there is something AI does well and something that stays theirs, and the boundary is the interesting part.

| Phase | What AI is good at here | What stays theirs |
|---|---|---|
| **1 · Intent** | Interviewing them. Asking what they left out. Turning a rambling explanation into a tight paragraph. | Deciding which problem is worth solving at all. |
| **2 · Elaborate** | Proposing slices. Spotting acceptance criteria that can't actually be checked. | Deciding what's in scope and what they're saying no to. |
| **3 · Design** | Formalising a sketch into a table. Finding transitions with no exit condition. | The design itself. They ask it to critique, not to decide. |
| **4 · Verify** | Playing reviewer — “what did we miss?”, “what breaks on hardware?” | The go / no-go. It advises; they decide. |
| **5 · Bolt** | Anything from answering questions to writing whole classes — the dial. | Understanding every line that ships. |

### Where they spend the speed

Once the design is done, students choose how much of the typing to hand over. All three positions are used in industry by good engineers on real code. Your job is not to push them toward a position — it is to make the choice conscious, and to be clear that this is a choice about **typing, not about thinking**. Every position below assumes a state table they believe in.

| Position | What it looks like | Who it suits, and what it costs |
|---|---|---|
| **1 · Ask only** | They write every line; AI answers questions about the codebase and about Java. | A student new to Java, or one who wants the reps. Slowest — expect less finished at demo, and say that's fine. |
| **2 · Piece by piece** | They own the design and the file, ask for one case at a time, and check each against their state table before asking for the next. | Most teams. The pattern the worksheet is built around, and the closest to normal professional practice. |
| **3 · Draft and review** | AI writes the class from their state table; they read every line and own what ships. | A strong team with a genuinely good table. Fastest, and the position where the guardrail below does all the work. |

> **The line that doesn't move**
>
> **They have to be able to explain every line they ship.** “The AI wrote it” is not an explanation, and it is not an answer they can give a teammate at a competition when the arm does something surprising. If a team can't explain their own code at the demo, the useful response isn't a lecture — it's “turn it down a notch and do that method again.” That single question is the difference between deliberate work and slop, and it is worth asking every team at least once.

<!-- ================= SESSION AT A GLANCE ================= -->

*Session at a glance*

## Ten blocks — 20 minutes of setup, then two hours

**Block 0 is setup**, and it's the one to move out of the session if you possibly can. Unlike a bare SDK it's short — the project already declares FTCLib 2.1.1, JUnit 5.10.3 and Mockito 5.13.0, so students confirm rather than configure.

| Stage | Time |
|---|---|
| 0 · Setup | 20 min |
| Learn arm | 20 min |
| Choose | 10 min |
| 1 · Intent | 10 min |
| 2 · Elab | 10 min |
| Break | 5 min |
| 3 · Design | 15 min |
| 4 · Ver | 5 min |
| 5 · Bolt | 35 min |
| Wrap | 10 min |

| Time | Block | Steps | Deliverable |
|---|---|---|---|
| −0:20 | Block 0 — Setup (ideally before the session) | 1–4 | Green sync, everyone on a branch |
| 0:00–0:20 | Learn the arm — vocabulary, structure, the tenets in the wild | 5–8 | A list of real methods; the missing technique found |
| 0:20–0:30 | Choose an objective and check the guardrails | 9–10 | One sentence, five boxes ticked |
| 0:30–0:40 | Phase 1 — Plan Intent | 11 | Intent with a loop-time number |
| 0:40–0:50 | Phase 2 — Elaborate | 12 | Stories with hand-checkable criteria |
| 0:50–0:55 | Break | — | — |
| 0:55–1:10 | Phase 3 — Design | 13–14 | Sequence, state table, one ADR |
| 1:10–1:15 | Phase 4 — Verify | 15 | Go / no-go checklist |
| 1:15–1:50 | Phase 5 — Bolt | 16–19 | Coordinator written, instrumented, running, measured |
| 1:50–2:00 | Wrap, demo, retro | 21 | Parking lot for next session |

### What will go wrong in Block 0

| What you'll see | What it actually is |
|---|---|
| Gradle sync fails instantly, before downloading anything | They opened a subfolder instead of the repo root. Close and re-open the top `Into_The_Deep` folder. |
| Someone is editing `master` | The branch step got skipped. Catch this in the first ten minutes — much easier to fix before there are changes. |
| Build fails with a JDK or Java-version error | An Android Studio configuration problem, not a code problem — handle it yourself rather than letting a student guess at settings. |
| Everything is just very slow | Normal for a first sync. Send them to read Step 5 on someone else's machine while it finishes. |

<!-- ================= THE ARM ================= -->

*Orientation*

## What the arm actually is

*Worth knowing before you plan the room: this is not a motor and a servo. It is a five-degree-of-freedom limb with a gripper, already under closed-loop control, already coordinated by a two-level state machine.*

| Part | Hardware | Coordinated by |
|---|---|---|
| Monkey's Limb | Shoulder pivot (`PM`) plus a three-motor extension stage (`AM1`–`AM3`), positioned in centimetres by a `PIDFController` | `ShoulderFSM`, `ArmFSM` |
| Monkey's Paw | Elbow, wrist flex, wrist deviation and finger servos (`ES`, `WFS`, `WDS`, `FS`), three closed-loop against analog encoders | `ElbowFSM`, `WristFSM`, `DeviatorFSM`, `FingerFSM` |
| Whole limb | — | `LimbFSM` over the first pair, `MonkeyPawFSM` over the second |

States are named for the game rather than the hardware — `AT_BASKET_HEIGHT`, `AT_SUBMERSIBLE_HEIGHT`, `INTAKING_SPECIMEN`, `PREPARED_TO_DEPOSIT_SAMPLE`. There are roughly sixty boolean query methods across the limb, and **that set is the vocabulary every student objective has to be written in.** Step 5 exists to make sure they have it before they start imagining.

> **Where their work goes**
>
> `Core/TeleopWithoutDriving.java` is already a limb-only bench OpMode: it calls `drive(0,0,0,0)` and has `limbFSM.updateState(...)` commented out. Students construct their coordinator there and bind it to a free control. `MainTeleop` is the competition OpMode and is not to be touched.

### Three real FSM-and-wrapper pairs to put on the projector

| Mechanism | FSM | Wrapper | What drives its transitions |
|---|---|---|---|
| Extending arm | `ArmFSM` | `ArmMotorsWrapper` | `pidfController.atSetPoint()` plus target-position predicates |
| Shoulder | `ShoulderFSM` | `ShoulderWrapper` | Angle error against a tolerance, in degrees |
| Finger | `FingerFSM` | `FingerServoWrapper` | Target angle reached — the simplest of the three, and the best one to read first |

*`ArmFSM` is the one worth reading aloud: it changes its own PID gains based on what `ShoulderFSM` reports through boolean methods. That is two mechanisms coordinating without either knowing the other's internals — tenet 2, demonstrated by their own code.*

<!-- ================= WORKED OBJECTIVE ================= -->

*The worked example in this guide*

## One objective, carried all the way through

***Safe stow.*** Press a free control and the limb returns to a known travel pose from wherever it happens to be — retracting the arm fully **before** the shoulder rotates, so an extended arm never swings.

It sits in the worksheet's **Recover** category. Choose a different category to demo if your teams are likely to gravitate here — the point is the shape, not the answer.

| Why it's a good worked example | What it demonstrates |
|---|---|
| It uses only existing motions | `armFSM.retract()`, `shoulderFSM.moveToIntakeAngle()` — no new setpoints to measure |
| It has a real ordering constraint | Retract before rotate. A sequence, not two independent commands |
| Its exit conditions already exist | `armFSM.FULLY_RETRACTED()`, `shoulderFSM.AT_INTAKE()` |
| It's visibly done | You can see it from across the room without telemetry |
| It's additive | Nothing changes unless the control is pressed |

### Phase 1 — Plan Intent

Dictate it out loud; one student types, everyone talks. Insist on the loop-time number here — retrofitting it after Phase 3 never happens.

> **Prompt:** Our arm can already retract and rotate to intake. We want one control that safely stows it from any position. Ask what you need to know, then draft a short intent with problem, success criteria and non-goals.

| Section | For this objective |
|---|---|
| Problem | Recovering to a safe travel pose takes several separate inputs, and under pressure drivers rotate an extended arm. |
| Success criteria | One press returns the limb to the travel pose from any starting position, arm before shoulder, every time. |
| Non-goals | The paw. Autonomous. Anything about what the arm was holding. (Say no to these out loud — this row is where scope creep dies.) |
| NFR — loop time | The coordinator's `updateState()` costs under ~0.2 ms, measured with `System.nanoTime()` — not with the millisecond `loopTimer`. |
| NFR — observability | At `DEBUG`, the log shows the current step and both values each transition is waiting on. |

### Phase 2 — Elaborate

Push back on anything you couldn't check by hand. “It stows properly” is not a criterion.

| Story | Acceptance criterion |
|---|---|
| Retract first | From extended, pressing the control retracts fully before the shoulder moves at all. |
| Then rotate | Once `FULLY_RETRACTED()` is true, the shoulder moves and stops at `AT_INTAKE()`. |
| Already stowed | Pressing it when already stowed does nothing and logs nothing new. |
| Observability | At `DEBUG`, the log names the current step and the value each transition is waiting on. |
| Loop-time budget | A `nanoTime` pair around `updateState()` shows the cost stays under the Phase 1 number. |

### Phase 3 — Design

On paper first. The states are easy; the exit conditions are the lesson. Every arrow must name a boolean that already exists.

> **Prompt:** Here's our sequence: idle until pressed, retract, then rotate, then stowed. Turn it into a state table, and tell us which transitions we haven't given an exit condition — don't design it for us.

| State | What it orders | Existing boolean that ends it | Goes to |
|---|---|---|---|
| `IDLE` | nothing | the control was just pressed | `RETRACTING` |
| `RETRACTING` | `armFSM.retract()` | `armFSM.FULLY_RETRACTED()` | `ROTATING` |
| `ROTATING` | `shoulderFSM.moveToIntakeAngle()` | `shoulderFSM.AT_INTAKE()` | `STOWED` |
| `STOWED` | nothing | any other driver input | `IDLE` |

*Four states is deliberately small. A team proposing eight isn't necessarily wrong — ask them which two they'd merge if they had half the time, and whether each one has a distinct exit condition or just a distinct name.*

#### Mini ADR — what to record

- **Decision:** a separate coordinator class rather than new states inside `LimbFSM`.
- **Alternatives:** adding states to `LimbFSM` — rejected, because it would change how an existing mechanism behaves and breaks the session's one hard rule. A raw `if` chain in the OpMode — rejected, state leaks between loops.
- **Consequence:** one more class to construct and update, and a clean boundary that can be tested with mocks.

### Phase 4 — Verify

Run the design past this out loud before anyone opens a file. Three of these are the tenets as questions — those are the three worth slowing down on.

- [ ] Every state has a clear way in and out. No state can trap the arm.
- [ ] Every exit condition names a method that exists, spelled as it is in the file.
- [ ] You know what happens if the driver interrupts mid-sequence.
- [ ] ◆ **Separation** — orders go only through existing methods; nothing touches hardware; nothing needs a variable from outside.
- [ ] ◆ **Data** — the values each transition waits on will be logged, at `DEBUG`.
- [ ] ◆ **Loop time** — there's a plan to measure the cost, in nanoseconds.
- [ ] Nothing changes when the new control isn't pressed.

### Phase 5 — Bolt, in four moves

The ordering matters more than the code. **Write, instrument, run, measure** — teams that run before instrumenting spend the back half of the block guessing.

| Step | Move | What good looks like |
|---|---|---|
| 16 | Write the coordinator | Compiles; imports no hardware; one transition working before the second is written |
| 17 | Instrument it | Diagnostics written and switched on **before** the first run |
| 18 | Wire it in and run | Constructed in `TeleopWithoutDriving`; read with `wasJustPressed(...)`; log read before any code changes |
| 19 | Measure the cost | A decimal number of milliseconds from `nanoTime`, beside the whole-loop number |

> **Known gotcha — button edges**
>
> `wasJustPressed(...)` works only because `readButtons()` runs at the top of the loop. It's already there. A student who reads `gamepad2.b` directly instead will restart the sequence on every loop the button is held, and the arm will appear to freeze at the first step — a symptom that looks nothing like its cause.

<!-- ================= FALLBACK CODE ================= -->

*Fallback only — hand over if a team is genuinely stuck*

## SafeStowFSM — the coordinator, as a fallback

Hand this over only if a team is genuinely stuck. It coordinates existing state machines, touches no hardware, and logs the values its transitions wait on.

```java
import static ...Logger.LogLevels.DEBUG;   // keeps the log lines short

public class SafeStowFSM {
    private enum States { IDLE, RETRACTING, ROTATING, STOWED }
    private final ArmFSM armFSM;
    private final ShoulderFSM shoulderFSM;
    private final Logger logger;
    private States state = States.IDLE;

    public SafeStowFSM(ArmFSM armFSM, ShoulderFSM shoulderFSM, Logger logger) {
        this.armFSM = armFSM;
        this.shoulderFSM = shoulderFSM;
        this.logger = logger;
    }
    // Called once per loop. Never blocks, never sleeps.
    public void updateState(boolean stowPressed, boolean anyOtherInput) {
        // Each case decides ONLY whether it is time to move on.
        switch (state) {
            case IDLE:
                if (stowPressed) state = States.RETRACTING;
                break;
            case RETRACTING:
                if (armFSM.FULLY_RETRACTED()) state = States.ROTATING;
                break;
            case ROTATING:
                if (shoulderFSM.AT_INTAKE()) state = States.STOWED;
                break;
            case STOWED:
                if (anyOtherInput) state = States.IDLE;
                break;
        }

        // The order belongs to the state, in one place — so the state
        // table and the code cannot quietly disagree.
        if (state == States.RETRACTING) armFSM.retract();
        if (state == States.ROTATING)   shoulderFSM.moveToIntakeAngle();
    }

    // A question other code can ask, not a state enum handed out.
    public boolean STOWED()  { return state == States.STOWED; }
    public boolean STOWING() { return state == States.RETRACTING || state == States.ROTATING; }

    public void log() {
        logger.log("SafeStow state", state, DEBUG);
        // The VALUES each transition waits on — not just the state.
        logger.log("  arm retracted?", armFSM.FULLY_RETRACTED(), DEBUG);
        logger.log("  arm height cm", armFSM.getCurrentHeight(), DEBUG);
        logger.log("  shoulder at intake?", shoulderFSM.AT_INTAKE(), DEBUG);
    }
}
```

*◆ Data and logging*

> **Why the `log()` method looks like that**
>
> It logs `armFSM.getCurrentHeight()` as well as `FULLY_RETRACTED()`. That extra line is the whole tenet in miniature: when the sequence stalls in `RETRACTING`, the boolean alone tells a student only that it hasn't finished. The height tells them whether the arm is moving and stopped short, never moved at all, or is oscillating around the tolerance — three different bugs that look identical from across the room.

### Wiring it into TeleopWithoutDriving.java

```java
// with the other FSM constructions, inside the try block:
SafeStowFSM safeStowFSM = new SafeStowFSM(armFSM, shoulderFSM, logger);

// in the while (opModeIsActive()) loop:
long t0 = System.nanoTime();                    // TENET 1 — measure it
safeStowFSM.updateState(
    gamePad2.wasJustPressed(GamepadKeys.Button.B),
    gamePad2.wasJustPressed(GamepadKeys.Button.A)
);
double stowMs = (System.nanoTime() - t0) / 1_000_000.0;

// inside the existing log() method — NOT a new telemetry.update():
safeStowFSM.log();
logger.log("SafeStow ms", stowMs, Logger.LogLevels.DEBUG);
```

> **Two things students get wrong here**
>
> They add a `telemetry.update()` of their own — there is exactly one in the loop, at the bottom, inside `Logger.print()`, and adding a second is the fastest way to make the whole robot laggy. And they use the millisecond `loopTimer` instead of `nanoTime`, read `0`, and conclude their code is free.

<!-- ================= EXAMPLE PROMPTS ================= -->

*Tenet 4 in practice*

## Example prompts to demonstrate

*Read these aloud, project them, or hand them out — but demonstrate at least the first two live at kickoff. Students copy what they see modelled far more readily than what they are told.*

The wording matters less than the shape, and the shape is consistent: **give it the real files, ask for one thing, and ask it to find gaps rather than to decide.** Point that out once and most teams will start writing their own good prompts by Phase 3.

### Orientation — Steps 5 to 8

These are the ones worth demonstrating live, because they show AI being used to read code faster rather than to write it. That framing sets up the whole session.

| Step and purpose | Prompt |
|---|---|
| **Step 5** — build the vocabulary.<br>*Listen for: a list, not a summary.* | `Here are LimbFSM.java and MonkeyPawFSM.java. List every public method that returns a boolean, grouped by which part of the arm it describes. Do not summarise the classes — I want the vocabulary.` |
| **Step 6** — see the separation.<br>*Listen for: it points at real lines.* | `Here are ArmFSM.java and ArmMotorsWrapper.java. Explain the division of responsibility between these two classes, then point to any line in either file that seems to cross it.` |
| **Step 7** — find the missing technique.<br>*Listen for: it names the absent one.* | `Here are MainTeleop.java, HWMap.java and Logger.java. Find every technique in these files that exists to keep the loop fast, naming the file and method for each. Then tell me which common loop-time technique is NOT present.` |
| **Step 8** — understand the logger.<br>*Listen for: the cost question.* | `Here is Logger.java and one FSM log() method. Explain the three levels and when I would use each. What does it cost to call log() a hundred times in one loop, and why?` |

### Choosing an objective — Steps 9 and 10

Note what the first prompt does **not** ask for: it asks for options, not a recommendation. The choice stays with the team, and saying that out loud is worth thirty seconds.

| Step and purpose | Prompt |
|---|---|
| **Step 9** — generate options.<br>*Listen for: five distinct ideas, no code.* | `Our arm can already do these things: [paste the Step 5 list]. Suggest five different capabilities it does not have yet that could be built by sequencing only those existing methods. Do not write code. For each, say which methods it would use.` |
| **Step 10** — test against guardrails.<br>*Listen for: a specific failing constraint.* | `Here is our objective: [objective]. Check it against these five constraints: [paste the guardrails]. Which does it fail, and what is the smallest change that would make it pass?` |

### The five phases

One prompt per phase, each modelling the boundary from the walkthrough table: AI drafts and challenges, the team decides.

| Phase and purpose | Prompt |
|---|---|
| **Phase 1** — let it interview them.<br>*The one-question-at-a-time rule is what makes this work.* | `I want to add a capability to our robot arm: [one sentence]. Before you write anything, interview me about it — one question at a time, waiting for my answer. When you have enough, draft a short intent with a problem statement, success criteria and non-goals.` |
| **Phase 2** — make criteria testable.<br>*Listen for: it admits when it cannot describe a test.* | `Here are our acceptance criteria: [paste]. For each one, describe exactly how I would test it by hand, on a bench, with the robot on blocks. If you cannot describe a test for one, say so plainly rather than inventing one.` |
| **Phase 3** — critique, do not design.<br>*The strongest prompt in the session.* | `Here is our state table: [paste]. For each row, check whether the exit condition names a method that actually exists in the files I gave you. List any that do not. Then list the transitions we have not defined at all.` |
| **Phase 3b** — find the interruption cases. | `Here is our sequence: [paste]. What happens if the driver presses a different control halfway through? Enumerate the cases we have not handled. Do not fix them.` |
| **Phase 4** — make it a reviewer.<br>*Listen for: a list of gaps, not a rewrite.* | `Act as a reviewer, not an author. Here is our design: [paste]. What would break on real hardware, and what did we leave undefined? List what is missing. Do not fix anything.` |

> **The phrase to teach them**
>
> Three of the prompts above end with some version of **do not fix it, just tell me what is missing.** That single habit is most of what separates a team who stays the author of their design from a team who ends up reviewing something they did not write. Say it once at kickoff and again at the Phase 3 gate.

### Phase 5 — one prompt per dial position

These are the same task at three settings. Showing all three side by side makes the dial concrete in a way the table alone does.

| Position | Prompt |
|---|---|
| **1 · Ask only**<br>*They write the code; AI explains the codebase.* | `I am writing a class that calls armFSM.retract(). Explain what that method actually does, whether it blocks, and how I would know when it has finished. Do not write my class.` |
| **2 · Piece by piece**<br>*The scoping words are what make this safe.* | `Here is my state table and my class so far: [paste]. Add ONLY the RETRACTING case, matching row two of the table exactly. Do not add other cases, do not refactor what is there, and do not add fields I have not declared.` |
| **3 · Draft and review**<br>*The last sentence is the entire safety mechanism.* | `Here is my state table and an existing FSM from our codebase showing the conventions we follow: [paste both]. Write the class. Then list every assumption you made that is not written in my state table.` |

### Instrumenting and debugging — Steps 17 and 18

| Step and purpose | Prompt |
|---|---|
| **Step 17** — decide what to log before writing it.<br>*Listen for: values, not just states.* | `Here is my updateState method: [paste]. For each transition, tell me which values I would need on screen to diagnose it stalling there. Do not write the logging code yet — just tell me what I would need to see.` |
| **Step 18** — debug from data, not guesses.<br>*The constraint in the first sentence is the lesson.* | `Here is my log output and my state table: [paste both]. The sequence stalls in RETRACTING. Based only on these numbers, what are the possible causes, ranked by likelihood? Do not suggest changes yet.` |

### Weak prompt, strong prompt

Worth putting on the board. Every pair below is the same intent — the right-hand version is scoped, grounded in real files, and asks for gaps rather than answers.

| Instead of | Ask this |
|---|---|
| `Write me a state machine for stowing the arm.` | `Here is my state table. Add only the ROTATING case, matching row three exactly.` |
| `Is this design good?` | `Which rows of this table name a method that does not exist in the files I gave you?` |
| `Fix my bug.` | `Here is my log and my state table. Based only on this data, rank the possible causes.` |
| `How should I build this?` | `Here is how I plan to build it. What have I not accounted for?` |
| `Explain this codebase.` | `In these two files, what is the division of responsibility, and which line crosses it?` |

> **What all the strong prompts have in common**
>
> They hand over the **real files** rather than describing them. They ask for **one thing**. They set a **boundary** — only this case, only these numbers, do not fix it. And several of them invite the answer *nothing is wrong* or *I cannot tell*, which is what makes the answer worth something when it does find a gap.

<!-- ================= FACILITATION ================= -->

*Facilitator notes*

## Where teams get stuck, and what to say

| What you'll see | What's actually happening | What to ask |
|---|---|---|
| An objective that needs a new setpoint or PID tuning | Guardrail one failed and nobody said so out loud | “Which method already does that? Show me the line.” |
| A state table with “when it's ready” in column three | They designed the steps but not the finishing conditions | “What would the code actually check on that loop?” |
| Debugging by changing something and re-running | Step 17 got skipped or rushed | “What's on the screen right now? What value failed the comparison?” |
| Loop time reported as 0 ms | Millisecond timer on a sub-millisecond method | “Is that a measurement, or the smallest number your timer can show?” |
| Arm freezes at the first step of the sequence | Reading the button directly instead of `wasJustPressed` | “How many times per second is that transition firing?” |
| Code has drifted from the state table | Orders scattered through the switch cases | “Where does each state's order live? Could there be two?” |
| A `public static` added for convenience | Tenet 2, and a chance for the good version of this conversation | “What makes this different from the tunable constants? Could you pass it instead?” |
| “The AI wrote the whole class at once” | Typing handed over before the design was done — this is the slop failure mode | “Walk me through line twelve. If you can't, turn it down a notch.” |

<!-- ================= STEP 20 ================= -->

*Optional · only for teams already demoing*

## Step 20 — testing without the robot

This is tenet 2 paying out: because the coordinator only talks to other state machines, every branch can be tested with mocks at a desk. `ArmFSMTest.java` shows the house pattern — `mock()` each dependency, build the class, drive one transition, check what it ordered and where it landed.

> **Know this before you send anyone to run the suite**
>
> **The existing test suite does not currently compile.** `ArmFSMTest` calls `updateState(0)` against a four-argument signature, `LimbFSMTest` passes twelve arguments to a fifteen-parameter method, and `ShoulderFSMTest` calls a one-parameter method with none. Of 127 `@Test` methods, 46 are live and five of the eight classes are fully commented out. Decide beforehand whether to fix the three signatures or to name it honestly as what happens when tests drift from the code they test — either is a good lesson, but discovering it by accident at minute 105 is not.

<!-- ================= WRAP ================= -->

*10 minutes*

## Wrap, demo, retro

Have every team demo on the bench and say what it does before pressing anything. Then ask each for three things: their measured loop-time number, one thing the log told them that watching didn't, and what's in their parking lot.

The middle one matters most. It's the question that turns tenet 3 from a rule they were told into something they experienced — and the answers are usually the best material you'll get for the next session.

#### Parking lot — where next sessions come from

- **Restore per-subsystem timing properly** across every FSM, not just the new one — the gap Step 7 exposed.
- **Fix the test suite**, then keep it green. A well-scoped AI-DLC objective in its own right.
- **Give `LimbFSM.updateState()` a command object** — fifteen parameters, several passed as bare `false` at every call site.
- **Promote a team's coordinator into `LimbFSM`** as a real state, once it has proven itself on the bench.

<!-- ================= APPENDIX ================= -->

*Appendix*

## Findings from the codebase review

Turned up while preparing this guide. None affect the session; all look like real defects worth a mentor's attention.

| Where | What |
|---|---|
| `ArmFSM.isFullyExtended()` | Compares doubles with `==` against a value computed from spool geometry, so `FULLY_EXTENDED` looks unreachable. |
| `Logger` | `PRODUCTION()` and `DRIVER_DATA()` both return `state == DEBUG`. Harmless while nothing calls them. |
| `build.dependencies.gradle` | Declares FTCLib core 2.0.1 while `TeamCode/build.gradle` declares 2.1.1. Gradle resolves upward, so it builds — but it's a trap for whoever changes one next. |
| `ArmFSM.updateState()` | Runs `updatePIDF()` before `readPositionInCM()`, so that call sees the previous loop's cached position. `MainTeleop` calls `updatePID()` again later with fresh data, so it may wash out — worth tracing deliberately. |
| `MainTeleop.triggersWasJustPressed()` | Hand-rolls edge detection for four buttons that `GamepadEx.wasJustPressed()` already handles. The two **triggers** genuinely need it — FTCLib has no analog-trigger edge detection — but the buttons duplicate work. |

*Reviewed against `Into_The_Deep-master`: `Core/`, `Teleop/Monkeys_Limb/`, `Teleop/monkeypaw/`, `Teleop/Wrappers/`, the eight test classes and both gradle dependency files. FTC SDK 10.2.0, FTCLib 2.1.1, JUnit 5.10.3, Mockito 5.13.0 — verified against the repository rather than assumed.*
