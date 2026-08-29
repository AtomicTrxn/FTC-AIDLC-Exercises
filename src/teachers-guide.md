---
kind: guide
kicker: AI-DLC × INTO THE DEEP · TEACHER'S GUIDE · 2-HOUR SESSION
title: Give the Arm Something
title2: New to Do
dek: "The arm arrives already built. Students don't construct a mechanism — they decide **what it should be able to do that it can't do yet**, and carry that objective through five phases of AI-DLC. Every team chooses a different objective; every team is held to the same four engineering tenets and the same guardrails."
chips: "Session=120 min; Setup=+20 min; Walkthrough=20 min, live; Team=3–6 students; Bench OpMode=TeleopWithoutDriving"
pairactive: Teacher's Guide
pair: "→ Student Worksheet — 16 steps, separate handout"
footer: "Reviewed against `Into_The_Deep-master`: `Core/`, `Teleop/Monkeys_Limb/`, `Teleop/monkeypaw/`, `Teleop/Wrappers/`, the eight test classes and both gradle dependency files. FTC SDK 10.2.0, FTCLib 2.1.1, JUnit 5.10.3, Mockito 5.13.0 — verified against the repository rather than assumed. Every method named in the worked objective was confirmed to exist. Source of truth for this document is `src/teachers-guide.md`."
---

@eyebrow AI-DLC × INTO THE DEEP · TEACHER'S GUIDE · 2-HOUR SESSION

@h1 Give the Arm Something New to Do

@p The arm arrives already built. Students don't construct a mechanism — they decide **what it should be able to do that it can't do yet**, and carry that objective through five phases of AI-DLC. Every team chooses a different objective; every team is held to the same four engineering tenets and the same guardrails.

@nav
@item #howto | How to use this guide
@item #tenets | The four tenets
@item #ai | AI, done well
@item #glance | Session shape
@item #walkthrough | The live walkthrough
@item #objective | Worked objective
@item #code | Fallback code
@item #prompts | Example prompts
@item #facilitation | Where teams stick
@item #appendix | Review findings
@end

@table
@th Session | Setup | Team | Codebase | Bench OpMode
@tr 120 min | +20 min | 3–6 students | `Into_The_Deep` | `TeleopWithoutDriving`
@end

@box Paired handout
**Student Worksheet — Give the Arm Something New to Do.** Sixteen numbered steps. Steps 1–3 are setup and deliberately prescriptive. Between Step 3 and Step 4 sits a **capture sheet, not a step** — the page they fill in while someone walks the codebase from the front. Everything from Step 4 on gives them a lens and questions rather than instructions, and Steps 4–5 are where they choose an objective and pressure-test it against fixed guardrails.
@end

// HOW TO USE
@pagebreak

@eyebrow Read this first

@anchor howto

@h2 How to use this guide

@p This is one fully worked objective, carried through all five phases, so you have something rehearsed to demo and a fallback if a team stalls. **It is not the objective students should produce.** Pick something else to demo if you like — what matters is that they see the shape of the work, not this particular answer.

@p The worksheet deliberately withholds the specificity you have here. Where you have a state table, they have four blank rows and a rule that column three must name a real method. Where you have code, they have three constraints and a question about scope. That gap is the exercise.

@p **The codebase orientation is no longer theirs to do.** Earlier versions of the worksheet had students read the code themselves across four steps. That block is now a twenty-minute walkthrough delivered live, and the worksheet carries only a capture sheet against it. See _The live walkthrough_ below for what that talk has to leave them holding — later steps depend on it, so it is a contract, not a tour.

@rule The single biggest risk to this session
Students working in the real competition repository can break the robot for everyone. The worksheet's one hard rule is that **nothing they add may change existing behaviour when their control isn't pressed** — additive only, on a branch. Say it out loud at kickoff, and check it at the Phase 4 gate. `B`, the right bumper and `start` are the only unbound controls on either gamepad; everything else is taken.
@end

// BLOCK ALIGNMENT
@pagebreak

@eyebrow Read this first, continued

@h3 Where your blocks and their steps line up

@table
@th Your block | Steps | What you're watching for
@tr Block 0 — Setup | 1 – 3 | Green Gradle sync, everyone on their own branch, nobody editing `master`
@tr Codebase walkthrough (live) | capture sheet | Pens moving. A blank vocabulary table now is a stalled team at Phase 3
@tr Choose an objective | 4 – 5 | Five guardrails ticked honestly — this is where you intervene, not later
@tr Phase 1 — Intent | 6 | A loop-time number, and a non-goals row that actually says no to something
@tr Phase 2 — Elaborate | 7 | Criteria you could check by hand; one story about observability
@tr Phase 3 — Design | 8 – 9 | Every arrow labelled with a boolean that exists
@tr Phase 4 — Verify | 10 | Unticked boxes fixed or cut — and a written decision about AI use
@tr Phase 5 — Bolt | 11 – 14 | Write, instrument, run, measure — in that order
@tr Stretch | 15 | Only for teams already demoing
@tr Wrap & retro | 16 | A measured number, one thing the log revealed, and whether the AI split was right
@end

// TENETS
@pagebreak

@eyebrow The spine of the session

@anchor tenets

@h2 The four tenets — and how to teach them

@note Objectives vary by team. These don't. Each tenet appears in the worksheet marked with a ◆, and each has a moment in the session where it stops being advice and becomes something students have to do. Those moments are where your attention is worth most.

@tenet 1 | Loop time
@tline The idea | One loop, shared by every mechanism, running the whole match. Time you spend is time nobody else gets. A slow loop doesn't crash — it makes the robot feel vague, which is much harder for a student to diagnose than a failure.
@tline Their moment | In the walkthrough they log three defences already in the code and mark the fourth “missing”. Step 14 they add it back with `System.nanoTime()`.
@tline What to watch for | A team that reports “0 ms” and moves on. The existing `loopTimer` resolves to whole milliseconds and their addition costs far less than one, so a millisecond timer teaches them nothing. Push them to nanoseconds — this is the difference between a measurement and a shrug.
@end

@tenet 2 | Separation of duties
@tline The idea | One job per class, one job per method. Wrappers touch hardware; state machines decide; the OpMode runs the loop. The payoff is that you can reason about — and test — one method at a time.
@tline Their moment | In the walkthrough they see `ArmFSM` and `ArmMotorsWrapper` side by side. Step 11 they write a coordinator that gives orders through existing methods and touches no hardware at all.
@tline On globals | Worth being precise with students rather than absolutist. This codebase is full of `public static` fields, and they are nearly all deliberate — tunable constants exposed for live adjustment. The rule isn't “no globals”, it's **“no globals you can't defend.”** A student who makes a field global because passing it was tedious has made a different decision than the one this code made, and should be able to say why.
@end

// TENETS, CONTINUED
@pagebreak

@eyebrow The spine of the session, continued

@tenet 3 | Data and logging
@tline The idea | Watching tells you **that** something is wrong. Only data tells you **why**. Students are writing comparisons, tolerances and ordering — and every one of those failure modes looks identical from across the room.
@tline Their moment | In the walkthrough they meet `Logger` and its three levels. Step 12 — placed before the first run on purpose — they instrument their own code. Step 13 says read the log before changing any code.
@tline What to watch for | The instinct to debug by changing something and running it again. When a team is on their fourth guess, ask them what's on the screen. If the answer is “the state”, ask what value the failing comparison was made from. That question usually ends the guessing.
@tline Why the ordering matters | Step 12 comes before Step 13 on purpose. Instrumenting after something breaks costs the same five minutes but under time pressure, and by then they've usually already changed three things.
@end

@tenet 4 | Using AI responsibly and effectively
@tline The idea | AI is a tool that accelerates the work. It does not replace the thinking. Point at the shape of the session when you teach this: **four of the five phases happen before anyone writes code**, and that is not nostalgia — it is what makes the fifth phase fast instead of expensive.
@tline Say this plainly | Design and planning matter exactly as much when AI writes the code as when they write it by hand. Arguably more, because AI will produce a large amount of confident, plausible, wrong code very quickly — and fastest of all when nobody has told it what they actually want.
@tline The failure mode | Code that compiles, looks reasonable, and nobody understands or intended. It comes from skipping the design and asking for the answer. It isn't fast; it moves the debugging to later, when there is less time and more of it to unpick.
@tline Their moment | Step 10, at the Verify gate — design already done — they choose how much of the typing to hand over, and write down why. At the retro they say whether it was right.
@tline What to watch for | Not which position they picked. Whether they can explain the code they shipped. That is the only signal that separates using AI well from generating something nobody owns.
@end

@box Teach the conflict, not just the rules
Logging costs loop time. Separation costs indirection. Students will hit a moment where two tenets pull opposite ways, and the useful lesson is that engineering is the trade rather than the absence of one. The codebase already models the good answer: `Logger` buffers all loop and flushes once, so rich diagnostics cost almost nothing — and the level switches from a gamepad button so debug output can ship without ever reaching the driver.
@end

// AI DONE WELL
@pagebreak

@eyebrow Tenet 4, in detail

@anchor ai

@h2 AI accelerates the work. It doesn't replace the thinking.

@p Worth walking through at kickoff, and worth being explicit about **why the session is shaped the way it is**: four phases of deciding before one phase of building. In each phase there is something AI does well and something that stays theirs, and the boundary is the interesting part.

@table
@th Phase | What AI is good at here | What stays theirs
@tr **1 · Intent** | Interviewing them. Asking what they left out. Turning a rambling explanation into a tight paragraph. | Deciding which problem is worth solving at all.
@tr **2 · Elaborate** | Proposing slices. Spotting acceptance criteria that can't actually be checked. | Deciding what's in scope and what they're saying no to.
@tr **3 · Design** | Formalising a sketch into a table. Finding transitions with no exit condition. | The design itself. They ask it to critique, not to decide.
@tr **4 · Verify** | Playing reviewer — “what did we miss?”, “what breaks on hardware?” | The go / no-go. It advises; they decide.
@tr **5 · Bolt** | Anything from answering questions to writing whole classes — the dial. | Understanding every line that ships.
@end

// THE DIAL
@pagebreak

@eyebrow Tenet 4, continued

@h3 Where they spend the speed

@p Once the design is done, students choose how much of the typing to hand over. All three positions are used in industry by good engineers on real code. Your job is not to push them toward a position — it is to make the choice conscious, and to be clear that this is a choice about **typing, not about thinking**. Every position below assumes a state table they believe in.

@table
@th Position | What it looks like | Who it suits, and what it costs
@tr **1 · Ask only** | They write every line; AI answers questions about the codebase and about Java. | A student new to Java, or one who wants the reps. Slowest — expect less finished at demo, and say that's fine.
@tr **2 · Piece by piece** | They own the design and the file, ask for one case at a time, and check each against their state table before asking for the next. | Most teams. The pattern the worksheet is built around, and the closest to normal professional practice.
@tr **3 · Draft and review** | AI writes the class from their state table; they read every line and own what ships. | A strong team with a genuinely good table. Fastest, and the position where the guardrail below does all the work.
@end

@rule The line that doesn't move
**They have to be able to explain every line they ship.** “The AI wrote it” is not an explanation, and it is not an answer they can give a teammate at a competition when the arm does something surprising. If a team can't explain their own code at the demo, the useful response isn't a lecture — it's “turn it down a notch and do that method again.” That single question is the difference between deliberate work and slop, and it is worth asking every team at least once.
@end

// SESSION AT A GLANCE
@pagebreak

@eyebrow Session at a glance

@anchor glance

@h2 Ten blocks — 20 minutes of setup, then two hours

@p **Block 0 is setup**, and it's the one to move out of the session if you possibly can. Unlike a bare SDK it's short — the project already declares FTCLib 2.1.1, JUnit 5.10.3 and Mockito 5.13.0, so students confirm rather than configure.

@p **Block 1 is the live codebase walkthrough**, presented from the front. It is the only block students don't drive themselves, and the only one where their worksheet is a capture sheet rather than a set of steps.

@timeline
@seg 20 | 20 min | 0 · Setup | c4
@seg 20 | 20 min | Walkthrough | c1
@seg 10 | 10 min | Choose | c3
@seg 10 | 10 min | 1 · Intent | c2
@seg 10 | 10 min | 2 · Elab | c3
@seg 5 | 5 min | Break | c4
@seg 15 | 15 min | 3 · Design | c2
@seg 5 | 5 min | 4 · Ver | c6
@seg 35 | 35 min | 5 · Bolt | c5
@seg 10 | 10 min | Wrap | c7
@end

@table
@th Time | Block | Steps | Deliverable
@tr −0:20 | Block 0 — Setup (ideally before the session) | 1–3 | Green sync, everyone on a branch, bench OpMode open
@tr 0:00–0:20 | Codebase walkthrough — delivered live from the front | capture sheet | A list of real methods; the missing technique marked
@tr 0:20–0:30 | Choose an objective and check the guardrails | 4–5 | One sentence, five boxes ticked
@tr 0:30–0:40 | Phase 1 — Plan Intent | 6 | Intent with a loop-time number
@tr 0:40–0:50 | Phase 2 — Elaborate | 7 | Stories with hand-checkable criteria
@tr 0:50–0:55 | Break | — | —
@tr 0:55–1:10 | Phase 3 — Design | 8–9 | Sequence, state table, one ADR
@tr 1:10–1:15 | Phase 4 — Verify | 10 | Go / no-go checklist
@tr 1:15–1:50 | Phase 5 — Bolt | 11–14 | Coordinator written, instrumented, running, measured
@tr 1:50–2:00 | Wrap, demo, retro | 16 | Parking lot for next session
@end

// BLOCK 0 TROUBLE
@pagebreak

@eyebrow Session at a glance, continued

@h3 What will go wrong in Block 0

@table
@th What you'll see | What it actually is
@tr Gradle sync fails instantly, before downloading anything | They opened a subfolder instead of the repo root. Close and re-open the top `Into_The_Deep` folder.
@tr Someone is editing `master` | The branch step got skipped. Catch this in the first ten minutes — much easier to fix before there are changes.
@tr Build fails with a JDK or Java-version error | An Android Studio configuration problem, not a code problem — handle it yourself rather than letting a student guess at settings.
@tr Everything is just very slow | Normal for a first sync. Nothing after Step 3 needs their own machine until Phase 5, so let it run and start the walkthrough on time.
@end

// THE ARM
@pagebreak

@eyebrow Briefing for whoever presents it

@anchor walkthrough

@h2 The live walkthrough — 20 minutes, and what it owes the room

@note This block is delivered from the front. Students are not reading the code alone; their worksheet carries a capture sheet instead of steps. That makes the talk a **contract**: three specific things have to come out of it, because Steps 4 through 14 assume students are holding them.

@h3 What the walkthrough must leave them holding

@table
@th They must leave with | Why — the step that breaks without it
@tr **Vocabulary.** At least six boolean questions and four orders, each named with its class, spelled correctly | Step 4 (choose an objective) and Step 9, whose state table must name real methods
@tr **The missing loop-time technique.** Three defences are in the code; per-mechanism timing is not | Step 14, where they add it back — and the _Measure_ objective direction in Step 4
@tr `Logger`'s three levels — that `log()` only buffers, and that one `print()` at the bottom does the send | Step 12, where they instrument at `DEBUG` before the first run
@end

@note Two gotchas are also worth saying out loud, because they cost teams the back half of the Bolt block: `wasJustPressed(...)` depends on `readButtons()` at the top of the loop, and there is exactly one `telemetry.update()` in the whole loop. Both are on the capture sheet, but they land better said than read.

// WALKTHROUGH BACKGROUND
@pagebreak

@eyebrow Briefing, continued

@h3 Background for the presenter

@note This is not a motor and a servo. It is a five-degree-of-freedom limb with a gripper, already under closed-loop control, already coordinated by a two-level state machine.

@table
@th Part | Hardware | Coordinated by
@tr Monkey's Limb | Shoulder pivot (`PM`) plus a three-motor extension stage (`AM1`–`AM3`), positioned in centimetres by a `PIDFController` | `ShoulderFSM`, `ArmFSM`
@tr Monkey's Paw | Elbow, wrist flex, wrist deviation and finger servos (`ES`, `WFS`, `WDS`, `FS`), three closed-loop against analog encoders | `ElbowFSM`, `WristFSM`, `DeviatorFSM`, `FingerFSM`
@tr Whole limb | — | `LimbFSM` over the first pair, `MonkeyPawFSM` over the second
@end

@p States are named for the game rather than the hardware — `AT_BASKET_HEIGHT`, `AT_SUBMERSIBLE_HEIGHT`, `INTAKING_SPECIMEN`, `PREPARED_TO_DEPOSIT_SAMPLE`. There are roughly sixty boolean query methods across the limb, and **that set is the vocabulary every student objective has to be written in.** Getting it onto their capture sheet is the single highest-value thing the walkthrough does — the size of their vocabulary is the size of what they can imagine at Step 4.

@box Where their work goes
`Core/TeleopWithoutDriving.java` is already a limb-only bench OpMode: it calls `drive(0,0,0,0)` and has `limbFSM.updateState(...)` commented out. Students construct their coordinator there and bind it to a free control. `MainTeleop` is the competition OpMode and is not to be touched. Step 3 has them open that file and leave it open, so show it on the projector by name rather than assuming they'll find it at Step 13.
@end

// FSM PAIRS
@pagebreak

@eyebrow Briefing, continued

@h3 Three real FSM-and-wrapper pairs to put on the projector

@note Read one pair properly rather than three quickly. The finger is the shortest and the clearest; the arm is the one that shows two mechanisms coordinating.

@table
@th Mechanism | FSM | Wrapper | What drives its transitions
@tr Extending arm | `ArmFSM` | `ArmMotorsWrapper` | `pidfController.atSetPoint()` plus target-position predicates
@tr Shoulder | `ShoulderFSM` | `ShoulderWrapper` | Angle error against a tolerance, in degrees
@tr Finger | `FingerFSM` | `FingerServoWrapper` | Target angle reached — the simplest of the three, and the best one to read first
@end

@note `ArmFSM` is the one worth reading aloud: it changes its own PID gains based on what `ShoulderFSM` reports through boolean methods. That is two mechanisms coordinating without either knowing the other's internals — tenet 2, demonstrated by their own code.

// WORKED OBJECTIVE
@pagebreak

@eyebrow The worked example in this guide

@anchor objective

@h2 One objective, carried all the way through

@p **Safe stow.** Press a free control and the limb returns to a known travel pose from wherever it happens to be — retracting the arm fully **before** the shoulder rotates, so an extended arm never swings.

@p It sits in the worksheet's **Recover** category. Choose a different category to demo if your teams are likely to gravitate here — the point is the shape, not the answer.

@table
@th Why it's a good worked example | What it demonstrates
@tr It uses only existing motions | `armFSM.retract()`, `shoulderFSM.moveToIntakeAngle()` — no new setpoints to measure
@tr It has a real ordering constraint | Retract before rotate. A sequence, not two independent commands
@tr Its exit conditions already exist | `armFSM.FULLY_RETRACTED()`, `shoulderFSM.AT_INTAKE()`
@tr It's visibly done | You can see it from across the room without telemetry
@tr It's additive | Nothing changes unless the control is pressed
@end

@h3 Phase 1 — Plan Intent

@p Dictate it out loud; one student types, everyone talks. Insist on the loop-time number here — retrofitting it after Phase 3 never happens.

@prompt Our arm can already retract and rotate to intake. We want one control that safely stows it from any position. Ask what you need to know, then draft a short intent with problem, success criteria and non-goals.

@table
@th Section | For this objective
@tr Problem | Recovering to a safe travel pose takes several separate inputs, and under pressure drivers rotate an extended arm.
@tr Success criteria | One press returns the limb to the travel pose from any starting position, arm before shoulder, every time.
@tr Non-goals | The paw. Autonomous. Anything about what the arm was holding. (Say no to these out loud — this row is where scope creep dies.)
@tr NFR — loop time | The coordinator's `updateState()` costs under ~0.2 ms, measured with `System.nanoTime()` — not with the millisecond `loopTimer`.
@tr NFR — observability | At `DEBUG`, the log shows the current step and both values each transition is waiting on.
@end

// WORKED OBJECTIVE, ELABORATE
@pagebreak

@eyebrow The worked example, continued

@h3 Phase 2 — Elaborate

@p Push back on anything you couldn't check by hand. “It stows properly” is not a criterion.

@table
@th Story | Acceptance criterion
@tr Retract first | From extended, pressing the control retracts fully before the shoulder moves at all.
@tr Then rotate | Once `FULLY_RETRACTED()` is true, the shoulder moves and stops at `AT_INTAKE()`.
@tr Already stowed | Pressing it when already stowed does nothing and logs nothing new.
@tr Observability | At `DEBUG`, the log names the current step and the value each transition is waiting on.
@tr Loop-time budget | A `nanoTime` pair around `updateState()` shows the cost stays under the Phase 1 number.
@end

// WORKED OBJECTIVE, CONTINUED
@pagebreak

@eyebrow The worked example, continued

@h3 Phase 3 — Design

@p On paper first. The states are easy; the exit conditions are the lesson. Every arrow must name a boolean that already exists.

@prompt Here's our sequence: idle until pressed, retract, then rotate, then stowed. Turn it into a state table, and tell us which transitions we haven't given an exit condition — don't design it for us.

@table
@th State | What it orders | Existing boolean that ends it | Goes to
@tr `IDLE` | nothing | the control was just pressed | `RETRACTING`
@tr `RETRACTING` | `armFSM.retract()` | `armFSM.FULLY_RETRACTED()` | `ROTATING`
@tr `ROTATING` | `shoulderFSM.moveToIntakeAngle()` | `shoulderFSM.AT_INTAKE()` | `STOWED`
@tr `STOWED` | nothing | any other driver input | `IDLE`
@end

@note Four states is deliberately small. A team proposing eight isn't necessarily wrong — ask them which two they'd merge if they had half the time, and whether each one has a distinct exit condition or just a distinct name.

@h3 Mini ADR — what to record

@bullets
- **Decision:** a separate coordinator class rather than new states inside `LimbFSM`.
- **Alternatives:** adding states to `LimbFSM` — rejected, because it would change how an existing mechanism behaves and breaks the session's one hard rule. A raw `if` chain in the OpMode — rejected, state leaks between loops.
- **Consequence:** one more class to construct and update, and a clean boundary that can be tested with mocks.

@h3 Phase 4 — Verify

@p Run the design past this out loud before anyone opens a file. Three of these are the tenets as questions — those are the three worth slowing down on.

@check Every state has a clear way in and out. No state can trap the arm.
@check Every exit condition names a method that exists, spelled as it is in the file.
@check You know what happens if the driver interrupts mid-sequence.
@check ◆ **Separation** — orders go only through existing methods; nothing touches hardware; nothing needs a variable from outside.
@check ◆ **Data** — the values each transition waits on will be logged, at `DEBUG`.
@check ◆ **Loop time** — there's a plan to measure the cost, in nanoseconds.
@check Nothing changes when the new control isn't pressed.

// WORKED OBJECTIVE, BOLT
@pagebreak

@eyebrow The worked example, continued

@h3 Phase 5 — Bolt, in four moves

@p The ordering matters more than the code. **Write, instrument, run, measure** — teams that run before instrumenting spend the back half of the block guessing.

@table
@th Step | Move | What good looks like
@tr 11 | Write the coordinator | Compiles; imports no hardware; one transition working before the second is written
@tr 12 | Instrument it | Diagnostics written and switched on **before** the first run
@tr 13 | Wire it in and run | Constructed in `TeleopWithoutDriving`; read with `wasJustPressed(...)`; log read before any code changes
@tr 14 | Measure the cost | A decimal number of milliseconds from `nanoTime`, beside the whole-loop number
@end

@rule Known gotcha — button edges
`wasJustPressed(...)` works only because `readButtons()` runs at the top of the loop. It's already there. A student who reads `gamepad2.b` directly instead will restart the sequence on every loop the button is held, and the arm will appear to freeze at the first step — a symptom that looks nothing like its cause.
@end

// FALLBACK CODE
@pagebreak

@eyebrow Fallback only — hand over if a team is genuinely stuck

@anchor code

@h2 SafeStowFSM — the coordinator, as a fallback

@p Hand this over only if a team is genuinely stuck. It coordinates existing state machines, touches no hardware, and logs the values its transitions wait on.

@code 
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
@end

// FALLBACK, WHY THE LOG LOOKS LIKE THAT
@pagebreak

@eyebrow Fallback only, continued

@tenettag Data and logging

@box Why the log() method looks like that
It logs `armFSM.getCurrentHeight()` as well as `FULLY_RETRACTED()`. That extra line is the whole tenet in miniature: when the sequence stalls in `RETRACTING`, the boolean alone tells a student only that it hasn't finished. The height tells them whether the arm is moving and stopped short, never moved at all, or is oscillating around the tolerance — three different bugs that look identical from across the room.
@end

// WIRING
@pagebreak

@eyebrow Fallback only, continued

@h3 Wiring it into TeleopWithoutDriving.java

@code 
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
@end

@rule Two things students get wrong here
They add a `telemetry.update()` of their own — there is exactly one in the loop, at the bottom, inside `Logger.print()`, and adding a second is the fastest way to make the whole robot laggy. And they use the millisecond `loopTimer` instead of `nanoTime`, read `0`, and conclude their code is free.
@end

// EXAMPLE PROMPTS
@pagebreak

@eyebrow Tenet 4 in practice

@anchor prompts

@h2 Example prompts to demonstrate

@note Read these aloud, project them, or hand them out — but demonstrate at least the first two live at kickoff. Students copy what they see modelled far more readily than what they are told.

@p The wording matters less than the shape, and the shape is consistent: **give it the real files, ask for one thing, and ask it to find gaps rather than to decide.** Point that out once and most teams will start writing their own good prompts by Phase 3.

@h3 During the walkthrough — filling the capture sheet

@p These are the ones worth demonstrating live, because they show AI being used to **read** code faster rather than to write it. That framing sets up the whole session, and it's the best use of the projector while the walkthrough is running — a team whose vocabulary table is thin can fill it in thirty seconds with the first prompt below rather than falling behind.

@table
@th Capture sheet box | Prompt
@tr **Vocabulary.**\n_Listen for: a list, not a summary._ | `Here are LimbFSM.java and MonkeyPawFSM.java. List every public method that returns a boolean, grouped by which part of the arm it describes. Do not summarise the classes — I want the vocabulary.`
@tr **Separation, if you demo a pair.**\n_Listen for: it points at real lines._ | `Here are ArmFSM.java and ArmMotorsWrapper.java. Explain the division of responsibility between these two classes, then point to any line in either file that seems to cross it.`
@tr **The missing technique.**\n_Listen for: it names the absent one._ | `Here are MainTeleop.java, HWMap.java and Logger.java. Find every technique in these files that exists to keep the loop fast, naming the file and method for each. Then tell me which common loop-time technique is NOT present.`
@tr **The logger.**\n_Listen for: the cost question._ | `Here is Logger.java and one FSM log() method. Explain the three levels and when I would use each. What does it cost to call log() a hundred times in one loop, and why?`
@end

// PROMPTS, CHOOSING
@pagebreak

@eyebrow Tenet 4 in practice, continued

@h3 Choosing an objective — Steps 4 and 5

@p Note what the first prompt does **not** ask for: it asks for options, not a recommendation. The choice stays with the team, and saying that out loud is worth thirty seconds.

@table
@th Step and purpose | Prompt
@tr **Step 4** — generate options.\n_Listen for: five distinct ideas, no code._ | `Our arm can already do these things: [paste the capture sheet vocabulary]. Suggest five different capabilities it does not have yet that could be built by sequencing only those existing methods. Do not write code. For each, say which methods it would use.`
@tr **Step 5** — test against guardrails.\n_Listen for: a specific failing constraint._ | `Here is our objective: [objective]. Check it against these five constraints: [paste the guardrails]. Which does it fail, and what is the smallest change that would make it pass?`
@end

// PROMPTS, PHASES
@pagebreak

@eyebrow Tenet 4 in practice, continued

@h3 The five phases

@p One prompt per phase, each modelling the boundary from the walkthrough table: AI drafts and challenges, the team decides.

@table
@th Phase and purpose | Prompt
@tr **Phase 1** — let it interview them.\n_The one-question-at-a-time rule is what makes this work._ | `I want to add a capability to our robot arm: [one sentence]. Before you write anything, interview me about it — one question at a time, waiting for my answer. When you have enough, draft a short intent with a problem statement, success criteria and non-goals.`
@tr **Phase 2** — make criteria testable.\n_Listen for: it admits when it cannot describe a test._ | `Here are our acceptance criteria: [paste]. For each one, describe exactly how I would test it by hand, on a bench, with the robot on blocks. If you cannot describe a test for one, say so plainly rather than inventing one.`
@tr **Phase 3** — critique, do not design.\n_The strongest prompt in the session._ | `Here is our state table: [paste]. For each row, check whether the exit condition names a method that actually exists in the files I gave you. List any that do not. Then list the transitions we have not defined at all.`
@end

// PROMPTS, PHASES CONTINUED
@pagebreak

@eyebrow Tenet 4 in practice, continued

@h3 The five phases, continued

@table
@th Phase and purpose | Prompt
@tr **Phase 3b** — find the interruption cases. | `Here is our sequence: [paste]. What happens if the driver presses a different control halfway through? Enumerate the cases we have not handled. Do not fix them.`
@tr **Phase 4** — make it a reviewer.\n_Listen for: a list of gaps, not a rewrite._ | `Act as a reviewer, not an author. Here is our design: [paste]. What would break on real hardware, and what did we leave undefined? List what is missing. Do not fix anything.`
@end

@box The phrase to teach them
Three of the prompts above end with some version of **do not fix it, just tell me what is missing.** That single habit is most of what separates a team who stays the author of their design from a team who ends up reviewing something they did not write. Say it once at kickoff and again at the Phase 3 gate.
@end

// PROMPTS, DIAL
@pagebreak

@eyebrow Tenet 4 in practice, continued

@h3 Phase 5 — one prompt per dial position

@p These are the same task at three settings. Showing all three side by side makes the dial concrete in a way the table alone does.

@table
@th Position | Prompt
@tr **1 · Ask only**\n_They write the code; AI explains the codebase._ | `I am writing a class that calls armFSM.retract(). Explain what that method actually does, whether it blocks, and how I would know when it has finished. Do not write my class.`
@tr **2 · Piece by piece**\n_The scoping words are what make this safe._ | `Here is my state table and my class so far: [paste]. Add ONLY the RETRACTING case, matching row two of the table exactly. Do not add other cases, do not refactor what is there, and do not add fields I have not declared.`
@tr **3 · Draft and review**\n_The last sentence is the entire safety mechanism._ | `Here is my state table and an existing FSM from our codebase showing the conventions we follow: [paste both]. Write the class. Then list every assumption you made that is not written in my state table.`
@end

@h3 Instrumenting and debugging — Steps 12 and 13

@table
@th Step and purpose | Prompt
@tr **Step 12** — decide what to log before writing it.\n_Listen for: values, not just states._ | `Here is my updateState method: [paste]. For each transition, tell me which values I would need on screen to diagnose it stalling there. Do not write the logging code yet — just tell me what I would need to see.`
@tr **Step 13** — debug from data, not guesses.\n_The constraint in the first sentence is the lesson._ | `Here is my log output and my state table: [paste both]. The sequence stalls in RETRACTING. Based only on these numbers, what are the possible causes, ranked by likelihood? Do not suggest changes yet.`
@end

// PROMPTS, WEAK VS STRONG
@pagebreak

@eyebrow Tenet 4 in practice, continued

@h3 Weak prompt, strong prompt

@p Worth putting on the board. Every pair below is the same intent — the right-hand version is scoped, grounded in real files, and asks for gaps rather than answers.

@table
@th Instead of | Ask this
@tr `Write me a state machine for stowing the arm.` | `Here is my state table. Add only the ROTATING case, matching row three exactly.`
@tr `Is this design good?` | `Which rows of this table name a method that does not exist in the files I gave you?`
@tr `Fix my bug.` | `Here is my log and my state table. Based only on this data, rank the possible causes.`
@tr `How should I build this?` | `Here is how I plan to build it. What have I not accounted for?`
@tr `Explain this codebase.` | `In these two files, what is the division of responsibility, and which line crosses it?`
@end

@box What all the strong prompts have in common
They hand over the **real files** rather than describing them. They ask for **one thing**. They set a **boundary** — only this case, only these numbers, do not fix it. And several of them invite the answer _nothing is wrong_ or _I cannot tell_, which is what makes the answer worth something when it does find a gap.
@end

// FACILITATION
@pagebreak

@eyebrow Facilitator notes

@anchor facilitation

@h2 Where teams get stuck, and what to say

@table
@th What you'll see | What's actually happening | What to ask
@tr An objective that needs a new setpoint or PID tuning | Guardrail one failed and nobody said so out loud | “Which method already does that? Show me the line.”
@tr A vague objective, or one built on a method that doesn't exist | The capture sheet is thin — they watched the walkthrough without writing | “Read me your vocabulary list. Which line does this need?”
@tr A state table with “when it's ready” in column three | They designed the steps but not the finishing conditions | “What would the code actually check on that loop?”
@tr Debugging by changing something and re-running | Step 12 got skipped or rushed | “What's on the screen right now? What value failed the comparison?”
@tr Loop time reported as 0 ms | Millisecond timer on a sub-millisecond method | “Is that a measurement, or the smallest number your timer can show?”
@tr Arm freezes at the first step of the sequence | Reading the button directly instead of `wasJustPressed` | “How many times per second is that transition firing?”
@tr Code has drifted from the state table | Orders scattered through the switch cases | “Where does each state's order live? Could there be two?”
@tr A `public static` added for convenience | Tenet 2, and a chance for the good version of this conversation | “What makes this different from the tunable constants? Could you pass it instead?”
@tr “The AI wrote the whole class at once” | Typing handed over before the design was done — this is the slop failure mode | “Walk me through line twelve. If you can't, turn it down a notch.”
@end

// STEP 20
@pagebreak

@eyebrow Optional · only for teams already demoing

@h2 Step 15 — testing without the robot

@p This is tenet 2 paying out: because the coordinator only talks to other state machines, every branch can be tested with mocks at a desk. `ArmFSMTest.java` shows the house pattern — `mock()` each dependency, build the class, drive one transition, check what it ordered and where it landed.

@rule Know this before you send anyone to run the suite
**The existing test suite does not currently compile.** `ArmFSMTest` calls `updateState(0)` against a four-argument signature, `LimbFSMTest` passes twelve arguments to a fifteen-parameter method, and `ShoulderFSMTest` calls a one-parameter method with none. Of 127 `@Test` methods, 46 are live and five of the eight classes are fully commented out. Decide beforehand whether to fix the three signatures or to name it honestly as what happens when tests drift from the code they test — either is a good lesson, but discovering it by accident at minute 105 is not.
@end

// WRAP
@pagebreak

@eyebrow 10 minutes

@h2 Wrap, demo, retro

@p Have every team demo on the bench and say what it does before pressing anything. Then ask each for three things: their measured loop-time number, one thing the log told them that watching didn't, and what's in their parking lot.

@p The middle one matters most. It's the question that turns tenet 3 from a rule they were told into something they experienced — and the answers are usually the best material you'll get for the next session.

@h3 Parking lot — where next sessions come from

@bullets
- **Restore per-subsystem timing properly** across every FSM, not just the new one — the gap the walkthrough exposed.
- **Fix the test suite**, then keep it green. A well-scoped AI-DLC objective in its own right.
- Give `LimbFSM.updateState()` **a command object** — fifteen parameters, several passed as bare `false` at every call site.
- **Promote a team's coordinator** into `LimbFSM` as a real state, once it has proven itself on the bench.

// APPENDIX
@pagebreak

@eyebrow Appendix

@anchor appendix

@h2 Findings from the codebase review

@p Turned up while preparing this guide. None affect the session; all look like real defects worth a mentor's attention.

@table
@th Where | What
@tr `ArmFSM.isFullyExtended()` | Compares doubles with `==` against a value computed from spool geometry, so `FULLY_EXTENDED` looks unreachable.
@tr `Logger` | `PRODUCTION()` and `DRIVER_DATA()` both return `state == DEBUG`. Harmless while nothing calls them.
@tr `build.dependencies.gradle` | Declares FTCLib core 2.0.1 while `TeamCode/build.gradle` declares 2.1.1. Gradle resolves upward, so it builds — but it's a trap for whoever changes one next.
@tr `ArmFSM.updateState()` | Runs `updatePIDF()` before `readPositionInCM()`, so that call sees the previous loop's cached position. `MainTeleop` calls `updatePID()` again later with fresh data, so it may wash out — worth tracing deliberately.
@tr `MainTeleop.triggersWasJustPressed()` | Hand-rolls edge detection for four buttons that `GamepadEx.wasJustPressed()` already handles. The two **triggers** genuinely need it — FTCLib has no analog-trigger edge detection — but the buttons duplicate work.
@end

@note Reviewed against `Into_The_Deep-master`: `Core/`, `Teleop/Monkeys_Limb/`, `Teleop/monkeypaw/`, `Teleop/Wrappers/`, the eight test classes and both gradle dependency files. FTC SDK 10.2.0, FTCLib 2.1.1, JUnit 5.10.3, Mockito 5.13.0 — verified against the repository rather than assumed.
