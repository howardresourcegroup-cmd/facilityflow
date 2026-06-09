// Roomward blog — SEO content targeting validated keywords, funneling to the product.
// Add new posts by appending to POSTS. Each `content` field is Markdown.

export interface Post {
  slug: string;
  title: string;
  description: string;   // meta description + list excerpt
  date: string;          // ISO
  readMins: number;
  keyword: string;       // primary target (for our own tracking)
  content: string;       // Markdown
}

export const POSTS: Post[] = [
  {
    slug: "what-is-a-cmms-hotel-guide",
    title: "What Is a CMMS? A Hotel Operator's Guide",
    description: "A plain-English guide to CMMS (computerized maintenance management system) software for hotels — what it does, why it matters, and how to tell if your property needs one.",
    date: "2026-06-09",
    readMins: 6,
    keyword: "cmms software",
    content: `A **CMMS** — a *computerized maintenance management system* — is software that helps a property track maintenance work: what's broken, who's fixing it, what's been done, and what's coming up. If your team still runs on paper tickets, a group text, or a whiteboard behind the front desk, a CMMS is the upgrade that makes the whole operation visible.

For hotels specifically, a CMMS does something a spreadsheet never can: it ties every issue to a *place* — a room, a floor, a piece of equipment — and keeps a history so nothing falls through the cracks between shifts.

## What a CMMS actually does

At its core, a good CMMS handles four things:

- **Work orders** — log an issue, assign it to a tech, track it from open to done, with photos and notes.
- **Assets** — keep a record of your HVAC units, water heaters, elevators, and appliances, including service history.
- **Preventive maintenance** — schedule recurring upkeep so small problems get caught before they become guest complaints.
- **Reporting** — see how long repairs take, which rooms generate the most issues, and where your time goes.

## Why hotels need one more than most

A hotel is a building full of moving parts that *guests live inside of*. A broken AC in an office is an annoyance; a broken AC in Room 214 at 11pm is a refund and a bad review. The cost of a missed maintenance task is unusually high in hospitality, and the people who spot problems (housekeepers, front desk) are rarely the people who fix them.

That hand-off — from whoever noticed to whoever fixes — is where most hotels lose time. A CMMS closes that gap: housekeeping flags a leak, it instantly becomes a work order, maintenance sees it, and the front desk can see the room is down before they sell it.

## Signs your property has outgrown spreadsheets

- Issues get reported twice, or not at all.
- Nobody can answer "what's the status of Room 214?" without three phone calls.
- Preventive maintenance happens when something breaks, not before.
- You have no idea which rooms or systems cost you the most.

If two or more of those sound familiar, you've outgrown manual tracking.

## How Roomward fits

[Roomward](/) is a CMMS built for hospitality. It connects the people who *see* problems with the people who *solve* them — housekeeping, front desk, and maintenance all work from the same live view of the property. Rooms appear on a real floor plan, work orders carry photos and history, and a live housekeeping board shows the front desk exactly which rooms are ready.

You can [start a free 14-day trial](/signup) — no credit card — and have your first building set up in a few minutes.`,
  },
  {
    slug: "preventive-maintenance-for-hotels",
    title: "Preventive Maintenance for Hotels: How to Build a Plan",
    description: "A step-by-step guide to building a preventive maintenance plan for a hotel or lodge — what to schedule, how often, and how to keep it from slipping.",
    date: "2026-06-09",
    readMins: 7,
    keyword: "preventive maintenance plan",
    content: `Reactive maintenance — fixing things only after they break — is the most expensive way to run a property. A guest finds the problem, you comp the room, and the repair costs more because it failed at the worst possible time. **Preventive maintenance** flips that: you service equipment on a schedule so it fails far less often, and almost never in front of a guest.

Here's how to build a plan that actually sticks.

## Step 1: Inventory your assets

You can't maintain what you haven't listed. Walk the property and record the things that fail and matter: HVAC units, water heaters, elevators, kitchen equipment, pool systems, laundry machines, and life-safety equipment. For each, note the location, model, and age.

## Step 2: Set intervals

Every asset has a sensible service cadence — some monthly, some quarterly, some seasonal. A few hospitality staples:

- **HVAC filters** — monthly to quarterly depending on occupancy.
- **Smoke/CO detectors** — test quarterly, batteries twice a year.
- **Water heaters** — flush annually.
- **Kitchen hoods & grease traps** — on a code-driven schedule.

Start with manufacturer recommendations, then adjust based on what actually fails.

## Step 3: Assign and schedule

A plan nobody owns is a plan that slips. Each recurring task needs an owner and a due date that shows up *before* it's overdue — not a note in someone's head. This is exactly where software beats a binder: recurring work orders generate themselves and land on the right person's list.

## Step 4: Close the loop with the people who see problems

Your housekeepers walk every room, every day. They are your best early-warning system. When it's easy for them to flag a worn outlet or a slow drain — and that flag becomes a tracked work order automatically — you catch dozens of small issues before they escalate.

## Step 5: Measure and adjust

Track how often each asset needs reactive repair. If a unit keeps breaking despite being "on schedule," service it more often or replace it. Your plan should get smarter every quarter.

## Making it stick with Roomward

[Roomward](/) turns this plan into something your team lives in, not a document they forget. Recurring maintenance becomes scheduled work orders, every asset carries its full service history, and housekeeping can flag issues from any room in a tap — so they become work orders instantly.

[Start a free 14-day trial](/signup) and build your property's plan in an afternoon.`,
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
