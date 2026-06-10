// Tutorial content for the Help & Guides center.
// Each guide is a feature area with step-by-step instructions.

export interface TutorialStep {
  title: string;
  body: string;
}

export interface Tutorial {
  id: string;
  icon: string;        // lucide icon name (mapped in the component)
  title: string;
  summary: string;
  minutes: number;
  steps: TutorialStep[];
}

export const TUTORIALS: Tutorial[] = [
  {
    id: "getting-started",
    icon: "Rocket",
    title: "Getting Started",
    summary: "The 5-minute tour — from empty workspace to tracking your first issue.",
    minutes: 5,
    steps: [
      { title: "Add your first building", body: "Go to Buildings → Add Building. Enter the name, type (hotel, office, school…), and address. This is the facility you'll monitor." },
      { title: "Add floors", body: "Open the building and click Add Floor for each level. Each floor gets its own visual floor plan." },
      { title: "Map the rooms", body: "On a floor, click Edit Layout. Drag across the grid to draw each room, name it, and pick a type. You're looking straight down at the floor, like a blueprint." },
      { title: "Log a work order", body: "When something needs attention, click New Work Order, describe the issue, set a priority, and assign a technician. It's now tracked end-to-end." },
      { title: "Watch the dashboard", body: "The dashboard shows live status — active issues, room health, who's online. Every card is clickable and jumps to the detail." },
    ],
  },
  {
    id: "floorplan",
    icon: "LayoutGrid",
    title: "Buildings & Floor Plans",
    summary: "Build a top-down map of any facility and see every room's status at a glance.",
    minutes: 4,
    steps: [
      { title: "The building overview", body: "Open any building to see the control-panel stack on the left — every floor with its health percentage and room-status cells. Click a floor to jump to it." },
      { title: "Draw rooms with the builder", body: "Click Edit Layout, then click-and-drag across empty grid cells to draw a room's footprint. Name it and choose a type. Rooms save instantly." },
      { title: "Read room colors", body: "Green = operational, cyan = cleaning required, amber = needs maintenance, red = offline or emergency. The legend is always visible." },
      { title: "Update a room's status", body: "Click any room to open its panel. Change the status, add notes, or create a work order tied to that exact room." },
      { title: "Remove a room", body: "In Edit Layout mode, click a room and use the red trash badge to delete it." },
    ],
  },
  {
    id: "work-orders",
    icon: "ClipboardList",
    title: "Work Orders",
    summary: "Create, assign, track, and close maintenance jobs.",
    minutes: 4,
    steps: [
      { title: "Create a work order", body: "Click New Work Order. Give it a clear title, description, priority (low → critical), and category. Optionally tie it to a room and assign a technician." },
      { title: "Filter the list", body: "On the Work Orders page, filter by status or priority. The dashboard's stat cards also deep-link here pre-filtered (e.g. Critical Alerts → critical only)." },
      { title: "Move it through stages", body: "Open a work order and click any stage on the progress bar — Open → Assigned → In Progress → Waiting Parts → Completed." },
      { title: "Add updates & photos", body: "Post comments to log progress, and attach photos with the paperclip — useful for documenting damage or completed repairs." },
      { title: "Assign or reassign", body: "In the sidebar, pick a technician from the dropdown. They'll see it in their assignments." },
    ],
  },
  {
    id: "roles",
    icon: "KeyRound",
    title: "Roles & Permissions",
    summary: "Control exactly what each team member can see and do.",
    minutes: 3,
    steps: [
      { title: "Open the role editor", body: "Go to Settings → Roles & Permissions. You'll see the six built-in roles: Administrator, Manager, Maintenance Tech, Housekeeping, Front Desk, Viewer." },
      { title: "Toggle permissions", body: "Click a role to see its permission matrix grouped by area. Flip any switch — it saves immediately. Try turning off 'Create work orders' for Viewer." },
      { title: "Create a custom role", body: "Click New Role, name it, pick a color, then toggle the exact permissions it should have. Perfect for unusual job functions." },
      { title: "How enforcement works", body: "Permissions actually hide and disable actions across the app. A Viewer won't even see the 'Add Building' button. The database enforces it too." },
    ],
  },
  {
    id: "team",
    icon: "Users",
    title: "Your Team",
    summary: "Invite staff and keep everyone coordinated.",
    minutes: 2,
    steps: [
      { title: "Invite a teammate", body: "Go to Settings → Team → Invite. Enter their name, email, and role. Copy the temporary credentials and share them — they can change their password after first login." },
      { title: "Change a role", body: "In Settings → Team, click the role icon next to any member to change their role instantly. Permissions update across the whole app immediately." },
      { title: "Remove access", body: "Click the trash icon next to a member to remove them from your organization. Their account is deactivated but not deleted." },
      { title: "Track technicians", body: "The Technicians page shows availability, active task counts, and lets you assign work orders directly from each card." },
    ],
  },
  {
    id: "integrations",
    icon: "Zap",
    title: "Integrations",
    summary: "Connect RoomMaster, Eptura, and your other systems.",
    minutes: 3,
    steps: [
      { title: "Sync RoomMaster", body: "On the dashboard, the RoomMaster panel pulls housekeeping statuses. Click Sync Now — dirty rooms become 'cleaning required' and auto-generate work orders." },
      { title: "Sync Eptura Asset", body: "The Eptura panel pulls your CMMS work orders and asset records so everything lives in one place." },
      { title: "Push changes back", body: "When you change a guest room's status here, it pushes back to RoomMaster automatically — two-way sync." },
      { title: "Reset a connection", body: "Click Reset on any integration panel to disconnect and clear its sync state." },
    ],
  },
  {
    id: "chat",
    icon: "MessageSquare",
    title: "Team Chat",
    summary: "Coordinate in real time, encrypted.",
    minutes: 2,
    steps: [
      { title: "Pick a channel", body: "Team Chat has channels like general, maintenance, housekeeping, and urgent. Click one to open the conversation." },
      { title: "Send a message", body: "Type and hit send — messages appear instantly for everyone in your organization. It's encrypted in transit and at rest." },
      { title: "Stay private", body: "Only members of your organization can read your channels. Other companies on the platform never see your messages." },
    ],
  },
  {
    id: "reports",
    icon: "BarChart3",
    title: "Reports & Assets",
    summary: "Understand trends and track your equipment.",
    minutes: 2,
    steps: [
      { title: "Read the reports", body: "The Reports page computes live KPIs from your work orders — resolution time, completion rate, open count, and a 6-month volume chart." },
      { title: "Track assets", body: "The Assets page is your equipment registry. Add assets with model, serial, and next-service date. Overdue service is flagged in red." },
      { title: "Spot problems early", body: "Use the category breakdown to see where issues cluster — if HVAC dominates, that's where to invest." },
    ],
  },
];

// Getting-started checklist items (tracked in localStorage)
export const CHECKLIST = [
  { id: "building", label: "Add your first building", href: "/buildings" },
  { id: "floor", label: "Add a floor & map rooms", href: "/buildings" },
  { id: "work_order", label: "Create a work order", href: "/work-orders/new" },
  { id: "team", label: "Invite a teammate", href: "/settings" },
  { id: "roles", label: "Review roles & permissions", href: "/settings" },
];
