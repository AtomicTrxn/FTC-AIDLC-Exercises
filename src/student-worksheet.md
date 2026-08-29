---
kind: worksheet
kicker: AI-DLC WORKING SESSION · STUDENT WORKSHEET
title: Give the Arm Something
title2: New to Do
---

@eyebrow AI-DLC WORKING SESSION · STUDENT WORKSHEET

@h1 Give the Arm Something New to Do

@p The arm is already built, already wired, and already running under closed-loop control. Your job is not to build a mechanism. It is to decide **what the arm should be able to do that it can't do yet** — and then take that objective through the five phases of AI-DLC until it works on the bench.

@p **The objective is yours to choose.** This worksheet does not tell you what to build, and two teams working from it should end up with two genuinely different behaviours on the robot. What it gives you instead is a way of looking at the problem, four principles to hold onto while you solve it, and a process that keeps you honest.

@table
@th Your name | Teammates | Date
@tr [blank:2] | [blank:2] | [blank:2]
@end

@h3 How to read this worksheet

@p **Steps 1–3 are prescriptive.** They are pure setup — clone the code, sync it, confirm the toolchain. There is one right way to do them and following the instructions exactly is the fastest path. They are the only steps here that work that way.

@p **The codebase walkthrough is delivered live**, from the front, between Step 3 and Step 4. You don't read the code alone. What you do is fill in the capture sheet on the page after Step 3 — everything on it is something a later step needs from you.

@p **Everything from Step 4 on is a lens, not a recipe.** Those steps give you things to think about, questions worth arguing about, and a description of what you should end up holding — not a numbered list of keystrokes. If two teams produce the same artifact from Step 8, one of them didn't think hard enough.

@p **YOU'RE DONE WHEN** closes every step. That part is not negotiable — don't move on until you can tick it.

@rule The one rule that never bends
You are working in your team's real competition code. **Nothing you add may change how an existing mechanism behaves.** Read anything, add anything, call anything — but if the arm does something different when nobody has pressed your new control, you have broken the robot for everyone else. Work on a branch. Keep your changes additive.
@end

// THE FOUR TENETS
@pagebreak

@eyebrow The lens

@h2 Four things this exercise is really about

@p Your objective is the vehicle. These four ideas are the cargo. They reappear in every step from here on, marked with a ◆ so you can see which one is in play. The first three separate code that works on the bench from code that survives a match. The fourth is about how you work at all.

@tenet 1 | Loop time
@tline What it is | The robot runs one loop, over and over, for the whole match, and every mechanism shares it. Time you spend is time nobody else gets.
@tline Why you care | A slow loop doesn't crash. It makes the robot feel vague — the driver presses something and it happens a moment later than it should. That gap between a sensor reading a value and a motor acting on it is lag, and lag is almost always someone's extra work inside the loop.
@tline Your job | Know what your addition costs. Measure it — a guess is not a number.
@end

@tenet 2 | Separation of duties
@tline What it is | Every class and every method has one job. Wrappers talk to hardware. State machines decide. The OpMode runs the loop. Nothing reaches across those lines.
@tline Why you care | When something misbehaves you want to test **one method at a time**. That is only possible if the method's behaviour depends on what you pass in and its own fields — not on a value something else changed somewhere else. Code that can't be reasoned about alone can't be debugged alone.
@tline On globals | A shared, mutable value is not automatically wrong — but it should be a decision you can defend, not a convenience you reached for. The `public static` fields in this codebase are nearly all tunable constants, exposed on purpose so they can be adjusted live. That is intentional. A variable you made global because passing it was annoying is not.
@tline Your job | Keep every variable in the smallest scope that works. If you can't test a method by handing it inputs, it is doing too much.
@end

// TENETS, CONTINUED
@pagebreak

@eyebrow The lens, continued

@tenet 3 | Data and logging
@tline What it is | Watching the arm move tells you **that** something is wrong. It almost never tells you **why**.
@tline Why you care | You are writing math and logic with edge cases in it — comparisons, tolerances, ordering, timing. Those failures are invisible from across the room. A sequence that stalls looks identical whether the boolean never went true, went true one loop too early, or went true and got overwritten. Only the numbers tell you which.
@tline Your job | **Instrument before you debug.** Log the values your decision depends on, not just the state you landed in — if you branch on `position > TOLERANCE`, log the position **and** the tolerance. When your sequence misbehaves, the answer should already be on the screen.
@end

@tenet 4 | Using AI responsibly and effectively
@tline What it is | AI is a tool that can accelerate this work. It does not replace the thinking. The five phases you're walking are how the industry actually builds with AI right now — and notice that four of them happen before anyone writes a line of code.
@tline Why you care | Design and planning matter **exactly as much** when AI writes the code as when you write it by hand. Arguably more: AI will produce a large amount of confident, plausible, wrong code very quickly, and it will do it fastest when you haven't told it what you actually want.
@tline The failure mode | Code that compiles, looks reasonable, and nobody understands or intended. It comes from skipping the design and asking for the answer. That's not fast — it just moves the debugging to later, when it's more expensive and you have less time.
@tline Your job | Do the design work. Then use AI to move faster **inside** it. Every line you ship should be traceable to a row in your own state table, and you should be able to explain it without the AI in the room.
@end

@box How the first three fight each other — and what to do about it
Logging costs loop time. Splitting a class in two costs a little indirection. You will hit moments where these tenets pull in different directions, and the answer is never to quietly abandon one. Log at `DEBUG` so it can be switched off. Measure the cost so you know what you're trading. And if a separation genuinely costs too much, say so out loud with a number attached rather than skipping it silently. Engineering is the trade, not the absence of one.
@end

// AI WALKTHROUGH
@pagebreak

@eyebrow Tenet 4, in detail

@h2 AI accelerates the work. It doesn't replace the thinking.

@p Look at the shape of this session: **four of the five phases happen before anyone writes code.** That is not old-fashioned. It is precisely how building with AI works when it works — you do the deciding, then AI helps you execute what you decided, faster than you could have alone.

@p The table below is what that looks like phase by phase. In each one AI does a real job, and in each one something stays yours. The boundary is the interesting part, and arguing about it is part of the exercise.

@table
@th Phase | What AI is good at here | What stays yours
@tr **1 · Intent** | Interviewing you. Asking what you left out. Turning a rambling explanation into a tight paragraph. | Deciding which problem is worth solving at all.
@tr **2 · Elaborate** | Proposing slices. Spotting acceptance criteria that can't actually be checked. | Deciding what's in scope and what you're saying no to.
@tr **3 · Design** | Formalising your sketch into a table. Finding transitions you never gave an exit condition. | The design itself. Ask it to **critique**, not to decide.
@tr **4 · Verify** | Playing reviewer. “What did we miss?” “What breaks on real hardware?” | The go / no-go. It advises; you decide.
@tr **5 · Bolt** | Anything from answering questions to writing whole classes — see the table below. | Understanding every line that ships.
@end

// THE DIAL
@pagebreak

@eyebrow Tenet 4, continued

@h2 Where you spend the speed

@p Once the design is done, you get to choose how much of the typing you hand over. All three positions below are used in industry, by good engineers, on real code — none is cheating and none is the “right” answer.

@p What this choice is **not** is a choice about how much thinking to skip. Every position below assumes you already have a state table you believe in. **Pick one deliberately before you start Step 11**, and be ready to say why.

@table
@th Position | What it looks like | What it costs you
@tr **1 · Ask only** | You write every line. AI answers questions about the codebase, about Java, about what a method does. | Slowest. You will learn the most and finish the least.
@tr **2 · Piece by piece** | You own the design and the file. You ask for one case or one method at a time, and check each against your state table before asking for the next. | Moderate. The most common professional pattern, and the one this worksheet is built around.
@tr **3 · Draft and review** | AI writes the class from your state table. You read every line and own what ships. | Fastest — and only safe if your table is genuinely good and you actually read the output.
@end

@rule The line that doesn't move, whatever position you pick
**You have to be able to explain every line you ship.** “The AI wrote it” is not an explanation, and it is not an answer you can give a teammate at a competition when the arm does something surprising. If you can't explain it you haven't finished — turn it down a notch and do that part again. That is the whole difference between using AI well and generating something nobody owns.
@end

// SESSION MAP
@pagebreak

@eyebrow Before you begin

@h2 The whole session, at a glance

@p Steps 1–3 are setup. Do them before the session if your mentor asks — the first Gradle sync is mostly waiting, and doing it in advance buys the team back twenty minutes of build time.

@table
@th Steps | Block | Time
@tr 1 – 3 | **Setup** — clone the robot code, sync, confirm the toolchain | 20 min
@tr — | **Codebase walkthrough** — delivered live. Fill in the capture sheet as it goes. | 20 min
@tr 4 – 5 | **Choose your objective** — and check it against the guardrails | 10 min
@tr 6 | **Phase 1 — Plan Intent** | 10 min
@tr 7 | **Phase 2 — Elaborate** | 10 min
@tr — | Break | 5 min
@tr 8 – 9 | **Phase 3 — Design** | 15 min
@tr 10 | **Phase 4 — Verify** | 5 min
@tr 11 – 14 | **Phase 5 — Bolt** — write it, instrument it, run it, measure it | 35 min
@tr 15 | Stretch — one unit test (only if you finish early) | —
@tr 16 | **Wrap, demo, retro** | 10 min
@end

@box What you need before Step 1
Android Studio installed. Git installed. The URL of your team's `Into_The_Deep` repository — ask your mentor. An internet connection for Steps 1 and 2. Access to the robot, or at least the arm on a bench, for Steps 13–14.
@end

// STEP 1
@pagebreak

@step 1 | Clone the robot code and branch | 5 MIN · SETUP

@p You are not starting from an empty project. The arm you're working with is about two thousand lines of code that already exists, and you need all of it.

@dothis
- Open a terminal (Mac: Terminal. Windows: Git Bash) and go to where you keep projects.
- Clone your team's `Into_The_Deep` repository — ask your mentor for the URL.
- **Immediately make a branch with your name on it.** Everything you do this session happens there, never on `master`.

@code TERMINAL
cd ~/AndroidStudioProjects
git clone <your team's Into_The_Deep URL>
cd Into_The_Deep
git checkout -b aidlc-<your-name>
@end

@done `git status` says you are on your own branch, and the folder contains `TeamCode` and `FtcRobotController`.

// STEP 2
@pagebreak

@step 2 | Open it and let Gradle sync | 10 MIN · MOSTLY WAITING

@dothis
- In Android Studio choose **File → Open**, then select the `Into_The_Deep` folder itself — not a file inside it.
- If Android Studio offers to install a missing SDK component or Gradle version, accept it.
- Wait for the status bar to say the sync finished. This is the slowest step of the session.
- Don't start editing while it syncs. Red errors before the sync finishes are almost always not real.

@done Gradle sync completes with no errors, and you can expand `TeamCode → java → org.firstinspires.ftc.teamcode` in the Project pane.

// STEP 3
@pagebreak

@step 3 | Confirm your toolchain and find the bench OpMode | 5 MIN · SETUP

@p This project already declares everything you need — FTCLib for `GamepadEx` and PID control, JUnit and Mockito for tests. You are not adding dependencies; you are confirming they resolve. Then find the one file your work will end up in, so you aren't hunting for it later under time pressure.

@dothis
- Open `TeamCode/build.gradle` and find the three lines below in the `dependencies` block. **Do not change them.**
- Choose **Build → Make Project** and confirm it succeeds.
- Open any file under `Teleop/Monkeys_Limb/` and check the `com.arcrobotics.ftclib` imports aren't underlined in red.
- Open `Core/TeleopWithoutDriving.java` and leave it open. That is the limb-only bench OpMode, and it is where your work goes in Step 13 — **not** `MainTeleop`, which is the competition OpMode.

@code TeamCode/build.gradle — already present
implementation 'org.ftclib.ftclib:core:2.1.1'
testImplementation "org.junit.jupiter:junit-jupiter:5.10.3"
testImplementation "org.mockito:mockito-core:5.13.0"
@end

@done **Build → Make Project** succeeds, no FTCLib import is red, and `Core/TeleopWithoutDriving.java` is open on your screen.

// CAPTURE SHEET
@pagebreak

@eyebrow Codebase walkthrough · 20 min · led from the front

@h2 Capture sheet — what to write down while you watch

@p You are not reading the codebase alone; someone is walking you through it. **This page is your job during that walkthrough.** Every box below feeds a later step, and a blank box is a step you'll be guessing at with the clock running.

@h3 Where things live

@table
@th Folder | What's in it
@tr `Core/` | `HWMap` (all the hardware), `Logger` (all the telemetry), and the OpModes that run the loop
@tr `Teleop/Monkeys_Limb/` | Shoulder and extending arm — `ShoulderFSM`, `ArmFSM`, and `LimbFSM` which coordinates them
@tr `Teleop/monkeypaw/` | The hand — elbow, wrist, deviator, finger, and `MonkeyPawFSM` which coordinates those
@tr `Teleop/Wrappers/` | The only classes in the whole project allowed to talk to motors and servos
@end

@h3 The arm's vocabulary

@tenettag Separation of duties

@p The classes talk to each other in two kinds of sentence. **Questions** are boolean methods with SHOUTING names that report what is true right now — `AT_INTAKE()`, `GRIPPED()`. **Orders** are methods that ask for something to start happening — `retract()`, `moveToIntakeAngle()`. There are roughly sixty of them.

@p **This is the single most important thing you take off this page.** Whatever you choose in Step 4 has to be built out of motions the arm **already has**, so the size of your vocabulary is the size of what you're able to imagine. Note the class each one came from — you'll need to spell them exactly in Step 9.

@table
@th Questions the arm can answer | Orders the arm can obey
@tr [blank:2] | [blank:2]
@tr [blank:2] | [blank:2]
@tr [blank:2] | [blank:2]
@end

@p **Aim for at least six questions and four orders, each with its class.**

// CAPTURE SHEET, CONTINUED
@pagebreak

@eyebrow Codebase walkthrough · capture sheet, continued

@h3 How the loop is kept fast

@tenettag Loop time

@p Three of these defences are in the code. **One is missing**, and in Step 14 you add it back starting with your own code.

@table
@th The technique | Where it is — or “missing”
@tr Hardware readings fetched in one batch per loop instead of one trip per request | [blank:2]
@tr A wrapper has one method that really reads, and a cheap one that returns what was already read | [blank:2]
@tr Telemetry collected all loop but sent to the Driver Station exactly once | [blank:2]
@tr Each mechanism's own cost measured separately, so nobody has to guess which one is slow | [blank:2]
@end

@h3 How the robot tells you what it's doing

@tenettag Data and logging

@p `log()` doesn't send anything; it only buffers. A single `print()` at the bottom of the loop does the actual send — that's how the robot affords rich diagnostics without paying for them over and over. There are three levels, and the level switches on a gamepad button **live**, so deep diagnostics can ship without cluttering the driver's screen.

@table
@th Question | Your answer
@tr Name the three log levels. Which will your own diagnostics use, and why? | [blank:2]
@tr Two values — not states — you'd want on screen if your objective misbehaved. | [blank:2]
@end

@h3 Two things that will bite you in Phase 5

@bullets
- `wasJustPressed(...)` works only because `readButtons()` runs at the top of the loop — it's already there. Read `gamepad2.b` directly instead and your sequence restarts on every loop the button is held.
- There is exactly one `telemetry.update()` in the whole loop, at the bottom, inside `Logger.print()`. Never add a second one.

@done The vocabulary table has at least six questions and four orders with their classes, the fourth loop-time row says “missing”, and you can say why `print()` is called only once.

// STEP 4
@pagebreak

@step 4 | Choose your objective | 5 MIN · THIS ONE IS YOURS

@p Here is the decision the rest of the session hangs on. You are choosing **something the arm should be able to do that it can't do today** — not a mechanism, not a part.

@p The five directions below are categories, not answers. Each contains many possible objectives; the example is only there to show the shape. Invent your own if you'd rather.

@table
@th Direction | The shape of it | One example of many
@tr **Combine** | One press runs a sequence the driver currently does in several separate steps | One control that both retracts and re-centres, instead of two
@tr **Guard** | Refuse or delay a motion until another part of the arm reports it's safe | Don't let the shoulder swing while the arm is extended
@tr **Recover** | Get back to a known-good pose from wherever the arm happens to be | A panic control that safely stows the whole limb
@tr **Surface** | Make something the driver currently can't see, visible | One readiness indicator instead of five separate numbers
@tr **Measure** | Add the per-mechanism timing your capture sheet showed is missing | Time each FSM separately and surface the worst one
@end

@table
@th Question | Your answer
@tr In one sentence: what should the arm be able to do when you're finished? | [blank:2]
@tr Which existing questions and orders will it need? | [blank:2]
@end

@done You have one sentence, and every teammate says the same one.

// STEP 5
@pagebreak

@step 5 | Check it against the guardrails | 5 MIN · THIS ONE IS NOT

@p Your objective is your choice. Whether it **fits this session** is not. Read each line out loud and tick it only if it's actually true. If you can't tick all five, shrink the objective or change direction — two minutes here saves twenty later.

@check **Built from what exists.** Every motion it needs is already a method on your capture sheet. You are not adding hardware, tuning a PID, or measuring a new setpoint.
@check **Visibly done.** You can tell from across the room whether it worked, without reading telemetry. You'll still log — but the demo shouldn't need it.
@check **Worth doing.** It either replaces at least two driver actions with one, or it prevents something that currently goes wrong.
@check **Additive only.** If nobody presses your new control, the robot behaves exactly as it does today.
@check **Has a free control.** `B`, the right bumper and `start` are unbound. Everything else on both gamepads is already taken.

@table
@th Question | Your answer
@tr Which control will trigger it? | [blank:2]
@tr If you had to shrink this objective by half, what would you cut first? | [blank:2]
@end

@done All five boxes are ticked. A box you can't tick means the objective changes — not that you carry on and hope.

// STEP 6
@pagebreak

@step 6 | Phase 1: Plan Intent | 10 MIN · AI-DLC PHASE 1

@tenettag Loop time

@p Write down what you're building and why, before anything else. This is the document you and your AI assistant keep returning to. One person types while everyone talks.

@lens
- An intent is not a design. It says what should be true when you're finished and how you'd know — not how you'll get there. If you catch yourself naming classes, you've skipped ahead.
- With an arm this capable, the **non-goals** row does more work than any other. It is very easy to specify half a match. Write what you're not doing before you get attached to the idea.
- The loop-time budget belongs here, not at the end. A number you commit to now is a constraint you design against; a number you measure at the end is just a number.

@prompt Our robot arm can already do [the methods from your capture sheet]. We want it to [your objective]. Ask me what you need to know, then draft a short intent doc with a problem statement, success criteria and non-goals.

@table
@th Question | Your answer
@tr **Problem** — what does the driver have to do today that's slow, awkward, or easy to get wrong? | [blank:2]
@tr **Success criteria** — what will you demonstrate at the end? | [blank:2]
@tr **Non-goals** — what are you deliberately not doing? | [blank:2]
@tr **Loop-time budget** — how many milliseconds may your addition cost, and how will you know? | [blank:2]
@end

@done Every teammate can restate the goal in their own words, and the loop-time row has an actual number in it.

// STEP 7
@pagebreak

@step 7 | Phase 2: Elaborate | 10 MIN · AI-DLC PHASE 2

@p Break the intent into a few small slices, each of which you could build and check on its own.

@lens
- An acceptance criterion is something you could test by hand and get a clear yes or no from. “The arm stows properly” fails that test. “Pressing the control while extended retracts the arm fully before the shoulder starts moving” passes it.
- If a story can't be checked without building three other things first, it isn't a slice — it's the whole objective wearing a disguise. Split it.
- One story should be about how you'll know it's working **from the data**, not from watching. That story is what makes Step 12 quick instead of frantic.

@prompt Break this intent into 3–4 small stories, each with an acceptance criterion I could check by hand on the bench. Include one about loop time and one about what we'd log.

@table
@th Story | Acceptance criterion — how you'd check it
@tr [blank:2] | [blank:2]
@tr [blank:2] | [blank:2]
@tr [blank:2] | [blank:2]
@tr [blank:2] | [blank:2]
@end

@done At least one story is small enough to finish alone inside the build block, and one is about how you'll observe it.

// STEP 8
@pagebreak

@step 8 | Phase 3a: Design the sequence | 8 MIN · AI-DLC PHASE 3

@tenettag Separation of duties

@p You are not designing a mechanism. You are designing **a sequence of moves the arm already knows how to make**, with a rule for when each one is finished. Do this on paper, before Android Studio.

@lens
- Name each step for what is true while the arm is in it — `RETRACTING`, not `AFTER_B_PRESSED`. A name that describes the trigger instead of the condition will mislead you an hour from now.
- The hard part is not the steps. It is **how you know a step is finished.** Every arrow needs an existing boolean behind it — which is why the vocabulary on your capture sheet mattered. An arrow with no boolean is a bug you haven't written yet.
- Decide what happens if the driver interrupts halfway. Every real sequence gets interrupted, and “we didn't think about it” means the arm does whatever it happens to do.
- Decide what **other** code should be able to ask about your work. One or two boolean methods, named like the ones on your capture sheet, is usually right.

@prompt Here's the sequence we sketched: [describe]. Turn it into a state diagram, and tell us which transitions we haven't defined an exit condition for — don't design it for us.

@h3 Sketch your steps and arrows here

@sketch One box per step. One arrow per change. Label every arrow with the boolean that makes it happen.

// STEP 9
@pagebreak

@step 9 | Phase 3b: Write it down properly | 7 MIN · AI-DLC PHASE 3

@p Turn the sketch into a table. A row you can't fill is a step you haven't finished designing. The third column matters most — it has to name a real method you could go and look at.

@table
@th State | What it orders the arm to do | Existing boolean that ends it | Goes to
@tr [blank:2] | [blank:2] | [blank:2] | [blank:2]
@tr [blank:2] | [blank:2] | [blank:2] | [blank:2]
@tr [blank:2] | [blank:2] | [blank:2] | [blank:2]
@tr [blank:2] | [blank:2] | [blank:2] | [blank:2]
@end

@h3 One decision worth writing down

@p Pick something your team actually argued about — how many states, what happens on interruption, whether to expose a boolean or let others read your state. Write down what you chose, what else you considered, and what it will cost you later. That's an ADR, and it's how a team remembers **why** six months from now.

@table
@th What you decided | What else you considered | What it costs you later
@tr [blank:2] | [blank:2] | [blank:2]
@end

@done Every row's third column names a real method in a real class — not “when it's ready”.

// STEP 10
@pagebreak

@step 10 | Phase 4: Verify before you build | 5 MIN · AI-DLC PHASE 4

@p Check the design against reality before writing code. Read each line out loud and tick it only if it's actually true. Three of these are the tenets showing up as questions.

@prompt Here's our design: [paste your state table]. What's missing, ambiguous, or likely to break on real hardware? What happens if the driver interrupts it halfway?

@check Every state has a clear way in **and** a clear way out. No state can trap the arm forever.
@check Every exit condition names a method that exists — you've checked the spelling against the file.
@check You know what happens if the driver presses something else mid-sequence.
@check ◆ **Separation** — your code gives orders only through existing methods. Nothing you're writing touches a motor or servo, and nothing needs a variable that lives outside it.
@check ◆ **Data** — you know which values you'll log, and they include the ones your decisions are made from.
@check ◆ **Loop time** — you have a plan to measure what your addition costs.
@check Nothing changes existing behaviour when your control isn't pressed.
@check The team agrees this is buildable in the time left. If not, you've said out loud what gets cut.

@h3 ◆ Set your dial before you build

@p Tenet 4. Your design is done — now decide how much of the typing you're handing over. Pick a position from the table at the front of this worksheet, write it here, and say why it's right for this objective and the time you have left.

@table
@th Question | Your answer
@tr Dial position for your Bolt stage (1 · ask only, 2 · piece by piece, 3 · draft and review) | [blank:2]
@tr Why that position, for this objective? | [blank:2]
@end

@done Every box is ticked, your dial position is written down, and anything you couldn't tick has been fixed or cut out loud.

// STEP 11
@pagebreak

@step 11 | Phase 5a: Write your coordinator | 15 MIN · AI-DLC PHASE 5

@tenettag Separation of duties

@p Your new class coordinates state machines that already exist. It gives orders and asks questions; it never touches hardware. Build one transition, check it, then write the next — don't write the whole class and then try to run it.

@lens
- Give it an enum of your states and a field holding the current one. Take the FSMs it needs, plus the `Logger`, in the constructor and store them — that way everything it depends on is visible in one place, and can be swapped for a fake later.
- Write `updateState(...)` as a `switch` where each case decides **only** whether it's time to move on. Then, after the switch, give the order that belongs to whatever state you're now in — in one place, not scattered through the cases. That way your table and your code can't quietly disagree.
- Every variable should live in the smallest scope that works. If you want a field, ask whether a parameter would do. If you want a `static`, ask what makes it different from a tunable constant.
- Add one or two boolean methods so other code can ask about you, named like the ones on your capture sheet.

@rule Three rules for this file
**No hardware.** If you typed `DcMotor`, `Servo` or `hardwareMap` here, it belongs somewhere else. • **Nothing that blocks.** Never call `sleep()` — for a step that takes time, start a timer and check it on later loops. • **Ask, don't reach.** Call the other FSMs' boolean methods. Don't read their state enums, and don't reimplement their logic.
@end

@done It compiles, imports nothing from a hardware package, and you could point at any method and say what its one job is.

// STEP 12
@pagebreak

@step 12 | Phase 5b: Instrument it before you trust it | 5 MIN · AI-DLC PHASE 5

@tenettag Data and logging

@p Do this **before** you run it, not after it misbehaves. Five minutes here is the difference between reading the answer off the screen and guessing at it with twelve minutes left.

@lens
- Log the state you're in. That's the cheap one, and on its own it is not enough.
- Log the **values your transitions depend on**. If a step ends when some boolean goes true, log that boolean **and** whatever it's computed from. When the sequence stalls you want to see the number that failed the comparison — not just that something failed.
- Log at `DEBUG` so it can be switched off from the gamepad. Diagnostics that can be switched off get to stay in the code; diagnostics that clutter the driver's screen get deleted the night before a competition.
- Add your `log()` call inside the OpMode's existing `log()` method. Do **not** add a `telemetry.update()` — there is exactly one in the loop and it isn't yours.

@questions
- If your sequence stops on step two and never moves, what would you need on screen to know why within ten seconds?
- Are you comparing a value against a tolerance anywhere? Are both numbers on screen?

@table
@th Question | Your answer
@tr Which values will you log, and at which level? | [blank:2]
@end

@done Your diagnostics are written and switched on, before the first time you run it.

// STEP 13
@pagebreak

@step 13 | Phase 5c: Wire it in and run it | 10 MIN · AI-DLC PHASE 5

@p `Core/TeleopWithoutDriving.java` — the file you opened in Step 3 — exists to test the arm with the drivetrain switched off. That's where your work goes, not `MainTeleop`.

@lens
- Construct your coordinator where the other FSMs are constructed, inside the `try` block before `waitForStart()`, after anything it depends on.
- Call your `updateState(...)` once per loop, passing the control you chose read with `wasJustPressed(...)`. That works only because `readButtons()` runs at the top of the loop — it's already there. Reading `gamepad2.b` directly instead will restart your sequence on every loop the button is held.
- You'll notice `limbFSM.updateState(...)` is commented out in this file. If your objective needs the limb responding to the driver, uncomment it — and write that down, because it changes behaviour and someone will need to know.
- Run it on the bench with the robot safely supported. When it misbehaves, **read your log before you change any code.**

@table
@th Question | Your answer
@tr What happened the first time you ran it? | [blank:2]
@tr What did the log tell you that watching it didn't? | [blank:2]
@end

@done Pressing your control on the bench does what Step 6's success criteria said it would.

// STEP 14
@pagebreak

@step 14 | Phase 5d: Measure what it cost | 5 MIN · AI-DLC PHASE 5

@tenettag Loop time

@p Your capture sheet showed that nothing measures individual mechanisms. Now you add it back — starting with your own code.

@lens
- Capture `System.nanoTime()` immediately before your `updateState(...)` call and again immediately after. Subtract, divide by a million, and you have milliseconds as a decimal.
- The existing `loopTimer` reports whole milliseconds. Your addition almost certainly costs less than one, so a millisecond timer would report `0` and teach you nothing. **“0 ms” is not a measurement.**
- Log your number and read it next to the whole-loop number. A cost is only meaningful beside the budget it's spending.

@table
@th Question | Your answer
@tr Your coordinator's cost per loop | [blank:2]
@tr The whole loop's time | [blank:2]
@tr Did you meet your Step 6 budget? If not, where did it go? | [blank:2]
@end

@done You can state your addition's cost as a real measured number, with units.

// STEP 15
@pagebreak

@step 15 | Stretch: test it without the robot | OPTIONAL · ONLY IF YOU FINISH EARLY | optional

@p This is separation of duties paying you back. Because your coordinator only talks to other state machines, you can hand it fakes and test every branch of your logic at your desk — no robot, no Driver Station, no waiting for a deploy.

@p Look at `ArmFSMTest.java` for the pattern: `mock()` each dependency, build the class, drive one transition, then check both what it ordered and what state it reached.

@note Heads up — the existing test suite doesn't currently compile; a few tests call methods whose signatures have changed since they were written. Ask your mentor before running the whole suite.

@table
@th What you're testing | What you expect to be true afterward
@tr [blank:2] | [blank:2]
@end

@done One test passes with no robot connected.

// STEP 16
@pagebreak

@step 16 | Wrap, demo, retro | 10 MIN

@produce
- A demo of your objective on the bench — say what it does before you press anything.
- Your measured loop-time number, said out loud.
- One thing the log told you that watching the arm didn't.
- Whether your dial position was right — and what you'd set it to next time.
- The table below, filled in as a team. The parking lot matters most; it's where next session starts.

@table
@th What worked | What you'd do differently | Parking lot — for next time
@tr [blank:2] | [blank:2] | [blank:2]
@end
