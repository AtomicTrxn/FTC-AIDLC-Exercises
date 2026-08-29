---
kind: worksheet
kicker: AI-DLC WORKING SESSION · STUDENT WORKSHEET
title: Give the Arm Something
title2: New to Do
---

*AI-DLC WORKING SESSION · STUDENT WORKSHEET*

# Give the Arm Something New to Do

The arm is already built, already wired, and already running under closed-loop control. Your job is not to build a mechanism. It is to decide **what the arm should be able to do that it can't do yet** — and then take that objective through the five phases of AI-DLC until it works on the bench.

**The objective is yours to choose.** This worksheet does not tell you what to build, and two teams working from it should end up with two genuinely different behaviours on the robot. What it gives you instead is a way of looking at the problem, four principles to hold onto while you solve it, and a process that keeps you honest.

| Your name | Teammates | Date |
|---|---|---|
|  |  |  |

### How to read this worksheet

**Steps 1–4 are prescriptive.** They are pure setup, there is one right way to do them, and following the instructions exactly is the fastest path. They are the only steps here that work that way.

**Everything after that is a lens, not a recipe.** Those steps give you things to think about, questions worth arguing about, and a description of what you should end up holding — not a numbered list of keystrokes. If two teams produce the same artifact from Step 13, one of them didn't think hard enough.

**YOU'RE DONE WHEN** closes every step. That part is not negotiable — don't move on until you can tick it.

> **The one rule that never bends**
>
> You are working in your team's real competition code. **Nothing you add may change how an existing mechanism behaves.** Read anything, add anything, call anything — but if the arm does something different when nobody has pressed your new control, you have broken the robot for everyone else. Work on a branch. Keep your changes additive.

<!-- ================= THE FOUR TENETS ================= -->

*The lens*

## Four things this exercise is really about

Your objective is the vehicle. These four ideas are the cargo. They reappear in every step from here on, marked with a ◆ so you can see which one is in play. The first three separate code that works on the bench from code that survives a match. The fourth is about how you work at all.

### Tenet 1 — Loop time

**What it is:** The robot runs one loop, over and over, for the whole match, and every mechanism shares it. Time you spend is time nobody else gets.

**Why you care:** A slow loop doesn't crash. It makes the robot feel vague — the driver presses something and it happens a moment later than it should. That gap between a sensor reading a value and a motor acting on it is lag, and lag is almost always someone's extra work inside the loop.

**Already here:** Hardware is read in one batch per loop; wrappers cache what they read; telemetry is collected all loop and sent exactly once.

**Your job:** Know what your addition costs. Measure it — a guess is not a number.

### Tenet 2 — Separation of duties

**What it is:** Every class and every method has one job. Wrappers talk to hardware. State machines decide. The OpMode runs the loop. Nothing reaches across those lines.

**Why you care:** When something misbehaves you want to test **one method at a time**. That is only possible if the method's behaviour depends on what you pass in and its own fields — not on a value something else changed somewhere else. Code that can't be reasoned about alone can't be debugged alone.

**On globals:** A shared, mutable value is not automatically wrong — but it should be a decision you can defend, not a convenience you reached for. The `public static` fields in this codebase are nearly all tunable constants, exposed on purpose so they can be adjusted live. That is intentional. A variable you made global because passing it was annoying is not.

**Your job:** Keep every variable in the smallest scope that works. If you can't test a method by handing it inputs, it is doing too much.

### Tenet 3 — Data and logging

**What it is:** Watching the arm move tells you **that** something is wrong. It almost never tells you **why**.

**Why you care:** You are writing math and logic with edge cases in it — comparisons, tolerances, ordering, timing. Those failures are invisible from across the room. A sequence that stalls looks identical whether the boolean never went true, went true one loop too early, or went true and got overwritten. Only the numbers tell you which.

**Already here:** `Logger` has three levels — `PRODUCTION`, `DEBUG`, `DRIVER_DATA` — and the level switches mid-match from a gamepad button, so deep diagnostics can ship without drowning the driver in them.

**Your job:** **Instrument before you debug.** Log the values your decision depends on, not just the state you landed in — if you branch on `position > TOLERANCE`, log the position **and** the tolerance. When your sequence misbehaves, the answer should already be on the screen.

### Tenet 4 — Using AI responsibly and effectively

**What it is:** AI is a tool that can accelerate this work. It does not replace the thinking. The five phases you're walking are how the industry actually builds with AI right now — and notice that four of them happen before anyone writes a line of code.

**Why you care:** Design and planning matter **exactly as much** when AI writes the code as when you write it by hand. Arguably more: AI will produce a large amount of confident, plausible, wrong code very quickly, and it will do it fastest when you haven't told it what you actually want.

**The failure mode:** Code that compiles, looks reasonable, and nobody understands or intended. It comes from skipping the design and asking for the answer. That's not fast — it just moves the debugging to later, when it's more expensive and you have less time.

**Your job:** Do the design work. Then use AI to move faster **inside** it. Every line you ship should be traceable to a row in your own state table, and you should be able to explain it without the AI in the room.

> **How the first three fight each other — and what to do about it**
>
> Logging costs loop time. Splitting a class in two costs a little indirection. You will hit moments where these tenets pull in different directions, and the answer is never to quietly abandon one. Log at `DEBUG` so it can be switched off. Measure the cost so you know what you're trading. And if a separation genuinely costs too much, say so out loud with a number attached rather than skipping it silently. Engineering is the trade, not the absence of one.

<!-- ================= AI WALKTHROUGH ================= -->

*Tenet 4, in detail*

## AI accelerates the work. It doesn't replace the thinking.

Look at the shape of this session: **four of the five phases happen before anyone writes code.** That is not old-fashioned. It is precisely how building with AI works when it works — you do the deciding, then AI helps you execute what you decided, faster than you could have alone.

The table below is what that looks like phase by phase. In each one AI does a real job, and in each one something stays yours. The boundary is the interesting part, and arguing about it is part of the exercise.

| Phase | What AI is good at here | What stays yours |
|---|---|---|
| **1 · Intent** | Interviewing you. Asking what you left out. Turning a rambling explanation into a tight paragraph. | Deciding which problem is worth solving at all. |
| **2 · Elaborate** | Proposing slices. Spotting acceptance criteria that can't actually be checked. | Deciding what's in scope and what you're saying no to. |
| **3 · Design** | Formalising your sketch into a table. Finding transitions you never gave an exit condition. | The design itself. Ask it to **critique**, not to decide. |
| **4 · Verify** | Playing reviewer. “What did we miss?” “What breaks on real hardware?” | The go / no-go. It advises; you decide. |
| **5 · Bolt** | Anything from answering questions to writing whole classes — see the next page. | Understanding every line that ships. |

*Tenet 4, continued*

## Where you spend the speed

Once the design is done, you get to choose how much of the typing you hand over. All three positions below are used in industry, by good engineers, on real code — none is cheating and none is the “right” answer.

What this choice is **not** is a choice about how much thinking to skip. Every position below assumes you already have a state table you believe in. **Pick one deliberately before you start Step 16**, and be ready to say why.

| Position | What it looks like | What it costs you |
|---|---|---|
| **1 · Ask only** | You write every line. AI answers questions about the codebase, about Java, about what a method does. | Slowest. You will learn the most and finish the least. |
| **2 · Piece by piece** | You own the design and the file. You ask for one case or one method at a time, and check each against your state table before asking for the next. | Moderate. The most common professional pattern, and the one this worksheet is built around. |
| **3 · Draft and review** | AI writes the class from your state table. You read every line and own what ships. | Fastest — and only safe if your table is genuinely good and you actually read the output. |

> **The line that doesn't move, whatever position you pick**
>
> **You have to be able to explain every line you ship.** “The AI wrote it” is not an explanation, and it is not an answer you can give a teammate at a competition when the arm does something surprising. If you can't explain it you haven't finished — turn it down a notch and do that part again. That is the whole difference between using AI well and generating something nobody owns.

<!-- ================= SESSION MAP ================= -->

*Before you begin*

## The whole session, at a glance

Steps 1–4 are setup. Do them before the session if your mentor asks — the first Gradle sync is mostly waiting, and doing it in advance buys the team back twenty minutes of build time.

| Steps | Block | Time |
|---|---|---|
| 1 – 4 | **Setup** — clone the robot code, sync, confirm the toolchain | 20 min |
| 5 – 8 | **Learn the arm** — its vocabulary, its structure, and how it defends the four tenets | 20 min |
| 9 – 10 | **Choose your objective** — and check it against the guardrails | 10 min |
| 11 | **Phase 1 — Plan Intent** | 10 min |
| 12 | **Phase 2 — Elaborate** | 10 min |
| — | Break | 5 min |
| 13 – 14 | **Phase 3 — Design** | 15 min |
| 15 | **Phase 4 — Verify** | 5 min |
| 16 – 19 | **Phase 5 — Bolt** — write it, instrument it, run it, measure it | 35 min |
| 20 | Stretch — one unit test (only if you finish early) | — |
| 21 | **Wrap, demo, retro** | 10 min |

> **What you need before Step 1**
>
> Android Studio installed. Git installed. The URL of your team's `Into_The_Deep` repository — ask your mentor. An internet connection for Steps 1 and 2. Access to the robot, or at least the arm on a bench, for Steps 18–19.

<!-- ================= STEPS 1-2 ================= -->

## Step 1 — Clone the robot code and branch

*5 MIN · SETUP*

You are not starting from an empty project. The arm you're working with is about two thousand lines of code that already exists, and you need all of it.

**Do this**

1. Open a terminal (Mac: Terminal. Windows: Git Bash) and go to where you keep projects.
2. Clone your team's `Into_The_Deep` repository — ask your mentor for the URL.
3. **Immediately make a branch with your name on it.** Everything you do this session happens there, never on `master`.

**TERMINAL**

```bash
cd ~/AndroidStudioProjects
git clone <your team's Into_The_Deep URL>
cd Into_The_Deep
git checkout -b aidlc-<your-name>
```

> **You're done when:** `git status` says you are on your own branch, and the folder contains `TeamCode` and `FtcRobotController`.

## Step 2 — Open it and let Gradle sync

*10 MIN · MOSTLY WAITING*

**Do this**

1. In Android Studio choose **File → Open**, then select the `Into_The_Deep` folder itself — not a file inside it.
2. If Android Studio offers to install a missing SDK component or Gradle version, accept it.
3. Wait for the status bar to say the sync finished. This is the slowest step of the session.
4. Don't start editing while it syncs. Red errors before the sync finishes are almost always not real.

> **You're done when:** Gradle sync completes with no errors, and you can expand `TeamCode → java → org.firstinspires.ftc.teamcode` in the Project pane.

<!-- ================= STEPS 3-4 ================= -->

## Step 3 — Confirm your toolchain

*5 MIN · SETUP*

This project already declares everything you need — FTCLib for `GamepadEx` and PID control, JUnit and Mockito for tests. You are not adding dependencies; you are confirming they resolve.

**Do this**

1. Open `TeamCode/build.gradle` and find the three lines below in the `dependencies` block. **Do not change them.**
2. Choose **Build → Make Project** and confirm it succeeds.
3. Open any file under `Teleop/Monkeys_Limb/` and check the `com.arcrobotics.ftclib` imports aren't underlined in red.

**TeamCode/build.gradle — already present**

```groovy
implementation 'org.ftclib.ftclib:core:2.1.1'
testImplementation "org.junit.jupiter:junit-jupiter:5.10.3"
testImplementation "org.mockito:mockito-core:5.13.0"
```

> **You're done when:** **Build → Make Project** succeeds and no FTCLib import is red.

## Step 4 — Map the codebase

*5 MIN · SETUP*

Five minutes of orientation now saves twenty later. You only need to know where four kinds of thing live — and notice that the folders themselves are separation of duties made visible.

| Folder | What's in it |
|---|---|
| `Core/` | `HWMap` (all the hardware), `Logger` (all the telemetry), and the OpModes that run the loop |
| `Teleop/Monkeys_Limb/` | Shoulder and extending arm — `ShoulderFSM`, `ArmFSM`, and `LimbFSM` which coordinates them |
| `Teleop/monkeypaw/` | The hand — elbow, wrist, deviator, finger, and `MonkeyPawFSM` which coordinates those |
| `Teleop/Wrappers/` | The only classes in the whole project allowed to talk to motors and servos |

> **You're done when:** You can open `Core/TeleopWithoutDriving.java` without hunting for it. That file is where your work will end up.

<!-- ================= STEP 5 ================= -->

## Step 5 — Learn the arm's vocabulary

*7 MIN · LEARN THE ARM*

*◆ Separation of duties*

This is the most valuable reading you'll do today. Whatever you choose in Step 9 has to be built out of motions the arm **already has** — so the size of your vocabulary is the size of what you're able to imagine.

**How to think about this**

- The arm's classes talk to each other in two kinds of sentence. **Questions** are boolean methods with SHOUTING names that report what is true right now — `AT_INTAKE()`, `GRIPPED()`. **Orders** are methods that ask for something to start happening — `retract()`, `moveToIntakeAngle()`.
- Notice what is **not** there: nothing exposes its raw state enum. That is deliberate. A class that answers questions can change how it works inside without breaking everyone who asks; a class that hands out its state cannot.
- You will not need all sixty methods. You need enough vocabulary to describe a new behaviour without inventing a single new motion.

**What to produce**

- A working list of the questions and orders you might use — enough to describe something you'd actually want the arm to do.

| Questions the arm can answer | Orders the arm can obey |
|---|---|
|  |  |

> **You're done when:** At least six questions and four orders written down, each with the class it came from.

<!-- ================= STEP 6 ================= -->

## Step 6 — See how one mechanism is put together

*5 MIN · LEARN THE ARM*

*◆ Separation of duties*

Open `Teleop/Monkeys_Limb/ArmFSM.java` and `Teleop/Wrappers/ArmMotorsWrapper.java` side by side. You are looking at the shape you'll copy in Step 16.

**How to think about this**

- The **wrapper** owns the hardware objects and does nothing else — no decisions, no `if` statements about what the robot should do. Its whole job is to be the one place that knows a motor exists.
- The **state machine** owns the decisions and never touches hardware directly. Because of that, all of its logic can be tested with a fake wrapper and no robot at all — which is exactly what Step 20 does.
- Watch for the moment `ArmFSM` asks `ShoulderFSM` a question and changes its own behaviour based on the answer. That's two mechanisms coordinating without either knowing how the other works inside.

**Questions worth arguing about**

- The wrapper has one method that really reads the hardware and another that returns what was already read. Why two? What breaks if you only had the first?
- `ArmFSM` imports no hardware classes at all. What does that buy you, concretely, when something goes wrong at a competition?
- If `ArmFSM` read `ShoulderFSM`'s state enum directly instead of asking a question, what would break the next time somebody renamed a state?

| Question | Your answer |
|---|---|
| Name the wrapper's real-read method and its cached one. |  |
| Write one line where `ArmFSM` asks `ShoulderFSM` a question. |  |

> **You're done when:** You can explain, out loud and without the file open, what the wrapper is for and what the state machine is for.

<!-- ================= STEP 7 ================= -->

## Step 7 — See how the loop is kept fast

*4 MIN · LEARN THE ARM*

*◆ Loop time*

Open `Core/MainTeleop.java`, `Core/HWMap.java` and `Core/Logger.java`. Three of the four techniques below are in this code. **One is missing** — finding out which is the point of this step.

| The technique | Where you found it — or “missing” |
|---|---|
| Hardware readings are fetched in one batch per loop instead of one trip per request |  |
| A wrapper has one method that really reads, and a cheap one that returns what was already read |  |
| Telemetry is collected all loop but sent to the Driver Station exactly once |  |
| Each mechanism's own cost is measured separately, so nobody has to guess which one is slow |  |

**Questions worth arguing about**

- Three of these are about doing less work. One is about knowing where the work went. Which is which — and why do you need both?
- If the robot got slower this week, which of the four would tell you where to look?

> **The fourth one is missing, and that's real**
>
> Last season's code measured every subsystem separately. This season's measures only the whole loop — so if the robot got slow, nobody could say which mechanism did it. In Step 19 you add that measurement back, starting with your own code.

> **You're done when:** Three rows name a real file and method. The fourth says “missing”.

<!-- ================= STEP 8 ================= -->

## Step 8 — See how the robot tells you what it's doing

*4 MIN · LEARN THE ARM*

*◆ Data and logging*

Open `Core/Logger.java`, then look at any FSM's `log()` method. This is the system you'll use in Step 17 to find out why your own code isn't working — worth understanding before you need it at speed.

**How to think about this**

- `log()` doesn't send anything; it only buffers. A single `print()` at the very bottom of the loop does the actual send. That's how the robot affords rich diagnostics without paying for them over and over — tenet 3 and tenet 1 cooperating rather than fighting.
- There are three levels. `PRODUCTION` is what a driver needs mid-match. `DEBUG` is everything you'd want while hunting a problem. The level switches on a gamepad button, live, so deep diagnostics can ship without cluttering the driver's screen.
- Look at what the existing FSMs choose to log. Notice they log the **values the decisions were made from**, not only the state they ended up in.

**Questions worth arguing about**

- Your sequence stalls halfway. Watching the arm, you can see it stopped. What would you need on screen to know whether the boolean never went true, went true a loop too early, or went true and got overwritten?
- Why would logging something only you care about at `PRODUCTION` level be a bad idea, even though it works?

| Question | Your answer |
|---|---|
| Which log level will your diagnostics use, and why? |  |
| Name two values — not states — you'd want on screen if your objective misbehaved. |  |

> **You're done when:** You can say which level to log at, and why `print()` is called only once.

<!-- ================= STEP 9 ================= -->

## Step 9 — Choose your objective

*5 MIN · THIS ONE IS YOURS*

Here is the decision the rest of the session hangs on. You are choosing **something the arm should be able to do that it can't do today** — not a mechanism, not a part.

The five directions below are categories, not answers. Each contains many possible objectives; the example is only there to show the shape. Invent your own if you'd rather.

| Direction | The shape of it | One example of many |
|---|---|---|
| **Combine** | One press runs a sequence the driver currently does in several separate steps | One control that both retracts and re-centres, instead of two |
| **Guard** | Refuse or delay a motion until another part of the arm reports it's safe | Don't let the shoulder swing while the arm is extended |
| **Recover** | Get back to a known-good pose from wherever the arm happens to be | A panic control that safely stows the whole limb |
| **Surface** | Make something the driver currently can't see, visible | One readiness indicator instead of five separate numbers |
| **Measure** | Add the per-mechanism timing that Step 7 showed is missing | Time each FSM separately and surface the worst one |

| Question | Your answer |
|---|---|
| In one sentence: what should the arm be able to do when you're finished? |  |
| Which existing questions and orders will it need? |  |

> **You're done when:** You have one sentence, and every teammate says the same one.

<!-- ================= STEP 10 ================= -->

## Step 10 — Check it against the guardrails

*5 MIN · THIS ONE IS NOT*

Your objective is your choice. Whether it **fits this session** is not. Read each line out loud and tick it only if it's actually true. If you can't tick all five, shrink the objective or change direction — two minutes here saves twenty later.

- [ ] **Built from what exists.** Every motion it needs is already a method you wrote down in Step 5. You are not adding hardware, tuning a PID, or measuring a new setpoint.
- [ ] **Visibly done.** You can tell from across the room whether it worked, without reading telemetry. You'll still log — but the demo shouldn't need it.
- [ ] **Worth doing.** It either replaces at least two driver actions with one, or it prevents something that currently goes wrong.
- [ ] **Additive only.** If nobody presses your new control, the robot behaves exactly as it does today.
- [ ] **Has a free control.** `B`, the right bumper and `start` are unbound. Everything else on both gamepads is already taken.

| Question | Your answer |
|---|---|
| Which control will trigger it? |  |
| If you had to shrink this objective by half, what would you cut first? |  |

> **You're done when:** All five boxes are ticked. A box you can't tick means the objective changes — not that you carry on and hope.

<!-- ================= STEP 11 ================= -->

## Step 11 — Phase 1: Plan Intent

*10 MIN · AI-DLC PHASE 1*

*◆ Loop time*

Write down what you're building and why, before anything else. This is the document you and your AI assistant keep returning to. One person types while everyone talks.

**How to think about this**

- An intent is not a design. It says what should be true when you're finished and how you'd know — not how you'll get there. If you catch yourself naming classes, you've skipped ahead.
- With an arm this capable, the **non-goals** row does more work than any other. It is very easy to specify half a match. Write what you're not doing before you get attached to the idea.
- The loop-time budget belongs here, not at the end. A number you commit to now is a constraint you design against; a number you measure at the end is just a number.

> **Prompt:** Our robot arm can already do [the methods from Step 5]. We want it to [your objective]. Ask me what you need to know, then draft a short intent doc with a problem statement, success criteria and non-goals.

| Question | Your answer |
|---|---|
| **Problem** — what does the driver have to do today that's slow, awkward, or easy to get wrong? |  |
| **Success criteria** — what will you demonstrate at the end? |  |
| **Non-goals** — what are you deliberately not doing? |  |
| **Loop-time budget** — how many milliseconds may your addition cost, and how will you know? |  |

> **You're done when:** Every teammate can restate the goal in their own words, and the loop-time row has an actual number in it.

<!-- ================= STEP 12 ================= -->

## Step 12 — Phase 2: Elaborate

*10 MIN · AI-DLC PHASE 2*

Break the intent into a few small slices, each of which you could build and check on its own.

**How to think about this**

- An acceptance criterion is something you could test by hand and get a clear yes or no from. “The arm stows properly” fails that test. “Pressing the control while extended retracts the arm fully before the shoulder starts moving” passes it.
- If a story can't be checked without building three other things first, it isn't a slice — it's the whole objective wearing a disguise. Split it.
- One story should be about how you'll know it's working **from the data**, not from watching. That story is what makes Step 17 quick instead of frantic.

> **Prompt:** Break this intent into 3–4 small stories, each with an acceptance criterion I could check by hand on the bench. Include one about loop time and one about what we'd log.

| Story | Acceptance criterion — how you'd check it |
|---|---|
|  |  |
|  |  |
|  |  |
|  |  |

> **You're done when:** At least one story is small enough to finish alone inside the build block, and one is about how you'll observe it.

<!-- ================= STEP 13 ================= -->

## Step 13 — Phase 3a: Design the sequence

*8 MIN · AI-DLC PHASE 3*

*◆ Separation of duties*

You are not designing a mechanism. You are designing **a sequence of moves the arm already knows how to make**, with a rule for when each one is finished. Do this on paper, before Android Studio.

**How to think about this**

- Name each step for what is true while the arm is in it — `RETRACTING`, not `AFTER_B_PRESSED`. A name that describes the trigger instead of the condition will mislead you an hour from now.
- The hard part is not the steps. It is **how you know a step is finished.** Every arrow needs an existing boolean behind it — which is why Step 5 mattered. An arrow with no boolean is a bug you haven't written yet.
- Decide what happens if the driver interrupts halfway. Every real sequence gets interrupted, and “we didn't think about it” means the arm does whatever it happens to do.
- Decide what **other** code should be able to ask about your work. One or two boolean methods, named like the ones in Step 5, is usually right.

> **Prompt:** Here's the sequence we sketched: [describe]. Turn it into a state diagram, and tell us which transitions we haven't defined an exit condition for — don't design it for us.

### Sketch your steps and arrows here

> **Sketch:** One box per step. One arrow per change. Label every arrow with the boolean that makes it happen.

<!-- ================= STEP 14 ================= -->

## Step 14 — Phase 3b: Write it down properly

*7 MIN · AI-DLC PHASE 3*

Turn the sketch into a table. A row you can't fill is a step you haven't finished designing. The third column matters most — it has to name a real method you could go and look at.

| State | What it orders the arm to do | Existing boolean that ends it | Goes to |
|---|---|---|---|
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

### One decision worth writing down

Pick something your team actually argued about — how many states, what happens on interruption, whether to expose a boolean or let others read your state. Write down what you chose, what else you considered, and what it will cost you later. That's an ADR, and it's how a team remembers **why** six months from now.

| What you decided | What else you considered | What it costs you later |
|---|---|---|
|  |  |  |

> **You're done when:** Every row's third column names a real method in a real class — not “when it's ready”.

<!-- ================= STEP 15 ================= -->

## Step 15 — Phase 4: Verify before you build

*5 MIN · AI-DLC PHASE 4*

Check the design against reality before writing code. Read each line out loud and tick it only if it's actually true. Three of these are the tenets showing up as questions.

> **Prompt:** Here's our design: [paste your state table]. What's missing, ambiguous, or likely to break on real hardware? What happens if the driver interrupts it halfway?

- [ ] Every state has a clear way in **and** a clear way out. No state can trap the arm forever.
- [ ] Every exit condition names a method that exists — you've checked the spelling against the file.
- [ ] You know what happens if the driver presses something else mid-sequence.
- [ ] ◆ **Separation** — your code gives orders only through existing methods. Nothing you're writing touches a motor or servo, and nothing needs a variable that lives outside it.
- [ ] ◆ **Data** — you know which values you'll log, and they include the ones your decisions are made from.
- [ ] ◆ **Loop time** — you have a plan to measure what your addition costs.
- [ ] Nothing changes existing behaviour when your control isn't pressed.
- [ ] The team agrees this is buildable in the time left. If not, you've said out loud what gets cut.

### ◆ Set your dial before you build

Tenet 4. Your design is done — now decide how much of the typing you're handing over. Pick a position from the table at the front of this worksheet, write it here, and say why it's right for this objective and the time you have left.

| Question | Your answer |
|---|---|
| Dial position for your Bolt stage (1 · ask only, 2 · piece by piece, 3 · draft and review) |  |
| Why that position, for this objective? |  |

> **You're done when:** Every box is ticked, your dial position is written down, and anything you couldn't tick has been fixed or cut out loud.

<!-- ================= STEP 16 ================= -->

## Step 16 — Phase 5a: Write your coordinator

*15 MIN · AI-DLC PHASE 5*

*◆ Separation of duties*

Your new class coordinates state machines that already exist. It gives orders and asks questions; it never touches hardware. Build one transition, check it, then write the next — don't write the whole class and then try to run it.

**How to think about this**

- Give it an enum of your states and a field holding the current one. Take the FSMs it needs, plus the `Logger`, in the constructor and store them — that way everything it depends on is visible in one place, and can be swapped for a fake later.
- Write `updateState(...)` as a `switch` where each case decides **only** whether it's time to move on. Then, after the switch, give the order that belongs to whatever state you're now in — in one place, not scattered through the cases. That way your table and your code can't quietly disagree.
- Every variable should live in the smallest scope that works. If you want a field, ask whether a parameter would do. If you want a `static`, ask what makes it different from a tunable constant.
- Add one or two boolean methods so other code can ask about you, named like the ones you found in Step 5.

> **Three rules for this file**
>
> **No hardware.** If you typed `DcMotor`, `Servo` or `hardwareMap` here, it belongs somewhere else. • **Nothing that blocks.** Never call `sleep()` — for a step that takes time, start a timer and check it on later loops. • **Ask, don't reach.** Call the other FSMs' boolean methods. Don't read their state enums, and don't reimplement their logic.

> **You're done when:** It compiles, imports nothing from a hardware package, and you could point at any method and say what its one job is.

<!-- ================= STEP 17 ================= -->

## Step 17 — Phase 5b: Instrument it before you trust it

*5 MIN · AI-DLC PHASE 5*

*◆ Data and logging*

Do this **before** you run it, not after it misbehaves. Five minutes here is the difference between reading the answer off the screen and guessing at it with twelve minutes left.

**How to think about this**

- Log the state you're in. That's the cheap one, and on its own it is not enough.
- Log the **values your transitions depend on**. If a step ends when some boolean goes true, log that boolean **and** whatever it's computed from. When the sequence stalls you want to see the number that failed the comparison — not just that something failed.
- Log at `DEBUG` so it can be switched off from the gamepad. Diagnostics that can be switched off get to stay in the code; diagnostics that clutter the driver's screen get deleted the night before a competition.
- Add your `log()` call inside the OpMode's existing `log()` method. Do **not** add a `telemetry.update()` — there is exactly one in the loop and it isn't yours.

**Questions worth arguing about**

- If your sequence stops on step two and never moves, what would you need on screen to know why within ten seconds?
- Are you comparing a value against a tolerance anywhere? Are both numbers on screen?

| Question | Your answer |
|---|---|
| Which values will you log, and at which level? |  |

> **You're done when:** Your diagnostics are written and switched on, before the first time you run it.

<!-- ================= STEP 18 ================= -->

## Step 18 — Phase 5c: Wire it in and run it

*10 MIN · AI-DLC PHASE 5*

`Core/TeleopWithoutDriving.java` exists to test the arm with the drivetrain switched off. That's where your work goes — not `MainTeleop`, which is the competition OpMode.

**How to think about this**

- Construct your coordinator where the other FSMs are constructed, inside the `try` block before `waitForStart()`, after anything it depends on.
- Call your `updateState(...)` once per loop, passing the control you chose read with `wasJustPressed(...)`. That works only because `readButtons()` runs at the top of the loop — it's already there. Reading `gamepad2.b` directly instead will restart your sequence on every loop the button is held.
- You'll notice `limbFSM.updateState(...)` is commented out in this file. If your objective needs the limb responding to the driver, uncomment it — and write that down, because it changes behaviour and someone will need to know.
- Run it on the bench with the robot safely supported. When it misbehaves, **read your log before you change any code.**

| Question | Your answer |
|---|---|
| What happened the first time you ran it? |  |
| What did the log tell you that watching it didn't? |  |

> **You're done when:** Pressing your control on the bench does what Step 11's success criteria said it would.

<!-- ================= STEP 19 ================= -->

## Step 19 — Phase 5d: Measure what it cost

*5 MIN · AI-DLC PHASE 5*

*◆ Loop time*

In Step 7 you found that nothing measures individual mechanisms. Now you add it back — starting with your own code.

**How to think about this**

- Capture `System.nanoTime()` immediately before your `updateState(...)` call and again immediately after. Subtract, divide by a million, and you have milliseconds as a decimal.
- The existing `loopTimer` reports whole milliseconds. Your addition almost certainly costs less than one, so a millisecond timer would report `0` and teach you nothing. **“0 ms” is not a measurement.**
- Log your number and read it next to the whole-loop number. A cost is only meaningful beside the budget it's spending.

| Question | Your answer |
|---|---|
| Your coordinator's cost per loop |  |
| The whole loop's time |  |
| Did you meet your Step 11 budget? If not, where did it go? |  |

> **You're done when:** You can state your addition's cost as a real measured number, with units.

<!-- ================= STEPS 20-21 ================= -->

## Step 20 — Stretch: test it without the robot

*OPTIONAL · ONLY IF YOU FINISH EARLY*

This is separation of duties paying you back. Because your coordinator only talks to other state machines, you can hand it fakes and test every branch of your logic at your desk — no robot, no Driver Station, no waiting for a deploy.

Look at `ArmFSMTest.java` for the pattern: `mock()` each dependency, build the class, drive one transition, then check both what it ordered and what state it reached.

*Heads up — the existing test suite doesn't currently compile; a few tests call methods whose signatures have changed since they were written. Ask your mentor before running the whole suite.*

| What you're testing | What you expect to be true afterward |
|---|---|
|  |  |

> **You're done when:** One test passes with no robot connected.

## Step 21 — Wrap, demo, retro

*10 MIN*

**What to produce**

- A demo of your objective on the bench — say what it does before you press anything.
- Your measured loop-time number, said out loud.
- One thing the log told you that watching the arm didn't.
- Whether your dial position was right — and what you'd set it to next time.
- The table below, filled in as a team. The parking lot matters most; it's where next session starts.

| What worked | What you'd do differently | Parking lot — for next time |
|---|---|---|
|  |  |  |
