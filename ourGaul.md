# Build a Desktop Productivity RPG — LIFE OS

Act as a **senior product designer, senior UI/UX engineer, and senior desktop application developer**.

I want you to build a polished desktop productivity application that combines personal planning, habit tracking, goal management, AI assistance, and RPG-style gamification.

The application should make improving my real life feel like progressing through an RPG game.

This is not a traditional todo list with a game-themed interface. It should be a complete personal productivity system with a meaningful progression system.

The application is primarily for my personal use, so prioritize a fantastic desktop experience, local data persistence, simplicity, and a polished interface over unnecessary SaaS features.

---

# 1. Product Vision

**Product name:** LIFE OS  
**Tagline:** Make progress your favorite game.

The main idea:

I have goals, projects, habits, and things I want to learn or improve. However, organizing everything, planning my days, staying consistent, and measuring progress can be difficult.

LIFE OS should help me:

- Turn long-term goals into achievable daily missions.
- Organize my week and plan my day.
- Build consistent habits.
- Track my personal development.
- Earn XP and unlock levels by completing real-life activities.
- Understand my progress through statistics and visualizations.
- Use AI to create realistic plans and improve my productivity.
- Receive desktop notifications for important tasks and habits.

**Core product philosophy:**

Productivity comes first. Gamification makes the experience enjoyable, but it should never become more complicated than the actual work.

---

# 2. Technology Stack

Use the following stack:

### Desktop
- Electron
- React
- TypeScript
- Vite

### UI and Styling
- Tailwind CSS
- 8bitcn components as the primary UI component library.
- shadcn/ui where additional components are necessary.
- Lucide icons.
- Framer Motion for subtle animations.
- Recharts for statistics and progress charts.

### Data and Storage
- SQLite for local persistent storage.
- Prisma ORM.
- A clean database layer that separates UI from persistence.

### AI
- Google Gemini API.
- Use structured JSON responses for AI-generated plans and suggestions.
- Keep API credentials out of the renderer process.
- Provide an AI service abstraction so the model provider can be changed later.

### Validation
- Zod for validating forms, database inputs, and AI-generated responses.

### Architecture
Use a modular architecture with clear separation between:

- Electron main process.
- Electron preload.
- React renderer.
- Database and repositories.
- Business logic and services.
- AI integration.
- Notifications.

Use secure Electron defaults:
- `contextIsolation: true`
- `nodeIntegration: false`
- A restricted and typed preload API.
- No direct Node.js access from React components.
- Validate IPC messages.

Do not build a remote backend, authentication system, or multi-user SaaS infrastructure. This is a local-first personal desktop application.

---

# 3. Mandatory Design Direction

The design is extremely important.

I want a combination of two visual directions:

1. Retro vaporwave desktop operating system.
2. RPG character progression and gamified productivity.

The interface should feel like a futuristic personal operating system from a retro arcade universe.

### Visual references

Use these references for inspiration:

- Vaporwave dashboard with neon purple, pink, and cyan.
- Retro arcade interfaces.
- Pixel-art RPG menus.
- RPG character status screens.
- Pixel-style progress bars and badges.
- Dark desktop operating systems.

Do not copy an existing interface. Create a consistent visual identity.

### Color palette

Start with this palette:

- Background: `#100B1D`
- Secondary background: `#19112B`
- Card background: `#211735`
- Elevated surface: `#2B2042`
- Primary purple: `#A855F7`
- Neon pink: `#F472B6`
- Neon cyan: `#22D3EE`
- Success: `#4ADE80`
- Warning: `#FACC15`
- Main text: `#F5F0FF`
- Muted text: `#A99BBF`
- Borders: `#403052`

Use colors intentionally. Do not make everything neon.

### Typography

Use a combination of:

- A readable modern sans-serif font for regular UI.
- A pixel-inspired display font for selected headings, level indicators, and RPG elements.

The pixel font must not reduce readability.

### Design principles

- Dark theme by default.
- Pixel-inspired details, not an entire pixel-art interface.
- Clear visual hierarchy.
- Consistent spacing and typography.
- Beautiful cards and panels.
- Subtle glowing effects.
- Smooth hover and transition animations.
- Responsive layouts within the desktop window.
- Good empty states.
- Excellent loading and error states.
- Keyboard accessibility.
- No unnecessary visual clutter.

### 8bitcn — IMPORTANT

Use **https://www.8bitcn.com/** as the primary reference for the UI component library.

Before implementing the interface:

1. Inspect the official 8bitcn website.
2. Understand the available components and their installation instructions.
3. Identify components suitable for this application.
4. Install and configure the components correctly.
5. Use the actual components instead of recreating them unnecessarily.
6. Customize their colors, typography, and styles to fit the LIFE OS design system.
7. Check component compatibility with the chosen React, Vite, Tailwind, and Electron setup.

Do not invent component names, APIs, or installation commands.

Use 8bitcn for elements such as:
- Buttons.
- Cards.
- Progress bars.
- Badges.
- Inputs.
- Dialogs.
- Tabs.
- Tooltips.
- Dropdowns.
- Other available components.

If a required component does not exist, use shadcn/ui or implement a reusable component consistent with the design system.

**Important:** The result should look like a coherent, professionally designed application, not a collection of unrelated UI components.

---

# 4. Application Structure

Create the following main navigation:

1. Dashboard
2. Planner
3. Quests
4. Habits
5. Progress
6. AI Companion
7. Settings

Use a persistent sidebar on the left.

The sidebar should include:

- Application logo.
- Navigation items.
- Current character level.
- XP progress.
- Small user status section.
- Settings at the bottom.

The main content should change based on the selected navigation item.

---

# 5. Dashboard — Main Screen

The dashboard is the heart of the application.

When I open LIFE OS, I should immediately understand:

- What should I do today?
- How much progress have I made?
- What habits should I complete?
- What are my upcoming tasks?
- How am I progressing toward my goals?

### Dashboard layout

Create the following sections:

**A. Welcome section**

Display:
- Greeting based on the time of day.
- Current date.
- Short motivational message.
- Current character level.

**B. Character status card**

Display:
- Character avatar or pixel-art placeholder.
- Current level.
- Total XP.
- XP required for the next level.
- XP progress bar.
- Current title or rank.

**C. Daily missions**

Display today's tasks as RPG quests.

Each task should include:
- Title.
- Description.
- Priority.
- Difficulty.
- Estimated duration.
- Associated goal, if applicable.
- XP reward.
- Completion checkbox or action.

Include a button to create a new mission.

**D. Daily progress**

Display:
- Completed tasks.
- Remaining tasks.
- Completed habits.
- Overall daily completion percentage.

Use an attractive visual progress component.

**E. Habit tracker**

Display today's habits with:
- Habit name.
- Icon.
- Completion status.
- Current streak.
- Completion action.

**F. Upcoming activities**

Show:
- Upcoming deadlines.
- Scheduled tasks.
- Important reminders.

**G. Weekly overview**

Display a compact weekly activity visualization showing:
- Tasks completed per day.
- Habits completed per day.
- Weekly XP earned.

Do not overcrowd the dashboard. Use clear sections and a well-balanced layout.

---

# 6. Quest Management

The quest system represents my goals and tasks.

Use RPG terminology without making the application confusing.

### Quest hierarchy

Support:

- Main Quests: Long-term goals.
- Milestones: Important steps toward a goal.
- Daily Missions: Tasks that can be completed today.
- Side Quests: Independent tasks that are not necessarily connected to a major goal.

### Main quest creation

Allow me to create a goal with:

- Title.
- Description.
- Category.
- Target date.
- Priority.
- Optional image or icon.
- Status.

Examples:

- Improve my JavaScript skills.
- Build a professional portfolio.
- Improve my English.
- Launch a side project.
- Learn AI engineering.

### Milestones

Each main quest should support milestones.

For example:

Main Quest: Master JavaScript.

Milestones:
- Understand closures.
- Understand the event loop.
- Practice promises.
- Solve 30 coding challenges.
- Build a practical project.

Each milestone can contain smaller tasks.

### Daily missions

Tasks should support:

- Title.
- Description.
- Due date.
- Priority.
- Difficulty.
- Estimated duration.
- Associated goal or milestone.
- Associated skill.
- XP reward.
- Completion status.

Allow:
- Creating.
- Editing.
- Deleting.
- Completing.
- Rescheduling.
- Filtering.
- Sorting.

Provide a clean quest-management screen with useful filters and clear status indicators.

---

# 7. Habit Tracking

Create a dedicated habit management section.

I should be able to create habits such as:

- Read for 30 minutes.
- Practice English.
- Exercise.
- Study programming.
- Drink enough water.
- Review my daily progress.

Each habit should have:

- Name.
- Description.
- Icon.
- Category.
- Frequency.
- Selected days.
- Optional target duration or quantity.
- Reminder time.
- XP reward.
- Active or archived status.

### Habit tracking

Support:

- Daily habits.
- Weekly habits.
- Custom schedules.
- Daily completion.
- Completion history.
- Streaks.
- Consistency statistics.
- Calendar visualization.

Do not make streaks punishing.

Missing a day should not erase all the user's progress or create guilt. Focus on long-term consistency rather than perfection.

---

# 8. Weekly and Daily Planner

This is one of the most important features.

Create a planning system that helps me organize my time.

### Weekly planner

Display the seven days of the week.

Allow me to:

- Navigate between weeks.
- Add tasks to specific days.
- Move tasks between days.
- View weekly priorities.
- Identify overloaded days.
- See completed and unfinished tasks.

### Daily planner

Display:

- Today's priorities.
- Scheduled tasks.
- Unscheduled tasks.
- Estimated total workload.
- Completed tasks.
- Remaining tasks.

Allow me to organize tasks using a clean timeline or time-blocking interface.

### Rescheduling

When I do not finish a task:

- Do not automatically push everything to tomorrow.
- Show the unfinished tasks.
- Allow me to reschedule, postpone, or remove them.
- Help me avoid overloaded days.

The planner should encourage realistic planning.

---

# 9. RPG Progression System

The gamification system must have a meaningful connection to real activities.

### XP system

Start with these example rewards:

| Activity | XP |
|---|---:|
| Small task | 10 XP |
| Medium task | 20 XP |
| Difficult task | 35 XP |
| Habit completion | 10 XP |
| Milestone completion | 50 XP |
| Main quest completion | 100 XP |

These values should be configurable later.

### Levels

Use progressive XP requirements.

Example:

| Level | Total XP |
|---|---:|
| 1 | 0 |
| 2 | 100 |
| 3 | 250 |
| 4 | 450 |
| 5 | 700 |
| 6 | 1000 |

Create a level progression formula or configurable level thresholds.

### Skill system

Allow me to track personal attributes:

- Knowledge.
- Discipline.
- Focus.
- Health.
- Creativity.
- Social.

Tasks can be associated with one or more skills.

Completing activities contributes to the relevant skill progression.

### Achievements

Add basic achievements such as:

- First Mission Completed.
- First Habit Completed.
- Seven-Day Consistency.
- First Main Quest Completed.
- 100 XP Earned.
- First Weekly Review.

### Important gamification rules

- Never remove XP for missing tasks.
- Do not punish the user for taking breaks.
- Avoid manipulative streak mechanics.
- Avoid making XP more important than real progress.
- Prevent duplicate XP rewards for the same completion.
- Keep a history of XP transactions.

Character customization, inventory, equipment, and complex RPG mechanics can be added later. Do not let them delay the core productivity system.

---

# 10. AI Companion — Gemini

Create an AI assistant integrated into LIFE OS.

The assistant should help me plan and improve my productivity.

Use Gemini through a secure service in the Electron main process or another protected backend layer.

Do not expose API credentials to the renderer.

### AI features

**A. Goal decomposition**

I enter:

"Improve my English."

The AI suggests:

- Milestones.
- Smaller tasks.
- Suggested weekly activities.
- Estimated effort.

I can review and approve the suggestions before they are saved.

**B. Weekly planning**

The AI analyzes:

- My active goals.
- Pending tasks.
- Available time.
- Habits.
- Previous progress.

It proposes a realistic weekly plan.

**C. Daily planning**

The AI helps me decide:

- What should I prioritize today?
- Which tasks are important?
- How much work is realistic?
- What should I postpone?

**D. Adaptive planning**

If I miss several tasks, the AI should:

- Analyze the situation.
- Identify overloaded days.
- Suggest rescheduling.
- Prioritize important activities.
- Avoid moving everything to tomorrow.

**E. Weekly reflection**

At the end of the week, generate a report showing:

- Tasks completed.
- Tasks postponed.
- Habit consistency.
- XP earned.
- Goal progress.
- Strongest performance areas.
- Areas that need improvement.
- Suggestions for next week.

### AI interaction rules

The AI should not automatically change my data.

Use this workflow:

1. Gather relevant local data.
2. Send the necessary context to Gemini.
3. Receive structured suggestions.
4. Validate the response with Zod.
5. Display the proposed changes.
6. Let me approve or reject them.
7. Save only approved changes.

Provide clear loading, error, and retry states.

Add a settings section for the Gemini API key and model configuration.

---

# 11. Desktop Notifications

Notifications are important because this is a desktop productivity application.

Implement native desktop notifications through Electron.

Support:

- Task reminders.
- Habit reminders.
- Upcoming deadlines.
- Daily planning reminders.
- End-of-day reflection reminders.
- Weekly review reminders.

Allow me to:

- Enable or disable notifications.
- Configure reminder times.
- Configure quiet hours.
- Snooze reminders.
- Choose notification categories.

Avoid excessive notifications.

Use scheduled background tasks or a reliable local scheduling mechanism.

Notifications should work while the application is running in the background. If the application is completely closed, clearly handle the limitations of the scheduling approach.

---

# 12. Progress and Analytics

Create a Progress section that makes personal improvement visible.

Display:

- Total XP.
- Current level.
- Total completed missions.
- Total completed habits.
- Current and best streaks.
- Goal completion rate.
- Weekly productivity.
- Monthly activity.

Include visualizations:

- XP earned over time.
- Tasks completed per day.
- Habit consistency.
- Skill progression.
- Weekly versus monthly performance.

Use Recharts with the application design system.

Provide useful date filters.

The charts must use actual persisted data, not hardcoded sample values.

---

# 13. Settings

Create a settings screen containing:

### General
- Application preferences.
- Theme.
- Start screen.
- Date format.
- Time format.
- Timezone.

### Gamification
- XP reward configuration.
- Skill management.
- Level progression settings.

### AI
- Gemini API key.
- Model selection.
- AI feature preferences.

### Notifications
- Enable/disable.
- Reminder preferences.
- Quiet hours.

### Data
- Export data.
- Import data.
- Database backup.
- Restore backup.
- Reset application data with confirmation.

Because this is a personal local-first application, data ownership and backup are important.

---

# 14. Database Design

Use SQLite and Prisma.

Design a normalized schema with appropriate relationships.

Suggested entities:

- UserSettings
- Goal
- Milestone
- Task
- Habit
- HabitLog
- WeeklyPlan
- DailyPlan
- Skill
- XPTransaction
- Achievement
- UserAchievement
- Reminder
- DailyReflection
- AIPlan

Important requirements:

1. Every record should have stable IDs.
2. Store timestamps consistently in UTC.
3. Preserve the user's timezone.
4. Separate habit definitions from habit completion logs.
5. Track XP through transactions.
6. Prevent duplicate XP transactions for the same activity.
7. Support archived goals and habits.
8. Avoid deleting historical progress when an entity is archived.
9. Validate data before persistence.
10. Add database migrations.

Keep the schema practical. Do not introduce unnecessary complexity.

---

# 15. Application UX Requirements

The application must feel like a real desktop application.

Implement:

- Proper desktop window dimensions.
- Custom title bar if appropriate.
- Window controls.
- Persistent sidebar.
- Keyboard shortcuts.
- Context menus where useful.
- Confirmation dialogs for destructive actions.
- Toast notifications.
- Empty states.
- Skeleton loading states.
- Error boundaries.
- Search and filtering.
- Smooth transitions.

Add useful keyboard shortcuts, for example:

- `Ctrl + K`: Quick command/search.
- `Ctrl + N`: Create a task.
- `Ctrl + Shift + N`: Create a goal.
- `Ctrl + ,`: Open settings.

Make sure shortcuts do not conflict with standard text editing behavior.

---

# 16. MVP Priorities

Do not try to build everything at once.

Build in phases.

### Phase 1 — Foundation

- Electron + React + TypeScript + Vite setup.
- Configure Tailwind.
- Inspect and install 8bitcn components.
- Establish design tokens.
- Create the desktop shell.
- Create navigation.
- Configure SQLite and Prisma.
- Implement local persistence.

### Phase 2 — Core Productivity

- Dashboard.
- Goal management.
- Milestones.
- Task management.
- Habit tracking.
- Daily planner.
- Weekly planner.

### Phase 3 — Gamification

- XP transactions.
- Level progression.
- Skills.
- Achievements.
- Progress dashboard.

### Phase 4 — AI

- Gemini integration.
- Goal decomposition.
- Weekly planning.
- Daily planning.
- Adaptive rescheduling.
- Weekly reflections.

### Phase 5 — Desktop Experience

- Native notifications.
- Settings.
- Data export/import.
- Backup and restore.
- Keyboard shortcuts.
- Packaging and installation.

Focus on delivering a functional and polished MVP before adding advanced RPG features.

---

# 17. Code Quality and Engineering Standards

Act as a senior engineer.

Follow these rules:

- Use TypeScript strictly.
- Avoid `any`.
- Use reusable components.
- Keep components small and focused.
- Separate business logic from UI.
- Use a clean folder structure.
- Avoid giant components.
- Avoid duplicated code.
- Use typed IPC communication.
- Validate external and AI-generated data.
- Handle errors properly.
- Use environment variables or secure local configuration for secrets.
- Do not hardcode fake statistics.
- Do not use mock data as the final implementation.
- Do not leave nonfunctional buttons.
- Do not implement decorative controls that do nothing.
- Do not create unnecessary abstractions.

Write maintainable code that another developer can understand.

---

# 18. Development Workflow — VERY IMPORTANT

Do not generate the entire application in one giant response.

Work incrementally.

**Step 1: Analyze and plan**

- Inspect the existing project.
- If no project exists, initialize it.
- Inspect the 8bitcn documentation and available components.
- Propose the architecture.
- Propose the folder structure.
- Define the design system.
- Define the initial database schema.
- Identify technical risks.

**Step 2: Build the foundation**

Implement the desktop shell, navigation, design system, and database.

**Step 3: Build complete features**

Implement one feature at a time.

For each feature:

1. Explain the implementation plan briefly.
2. Build the UI.
3. Implement the business logic.
4. Connect it to persistent storage.
5. Add validation.
6. Test the main user flows.
7. Verify the UI visually.
8. Fix problems before moving forward.

**Step 4: Integration**

Make sure all features work together.

For example:

- Completing a task updates XP.
- XP updates the character level.
- Completing a habit updates habit history.
- Completing tasks updates the dashboard.
- Weekly planning uses real goals and tasks.
- AI suggestions use actual local data.
- Notifications use actual task and habit schedules.

**Step 5: Final quality review**

Check:

- Desktop functionality.
- Data persistence after restarting.
- Database integrity.
- UI consistency.
- Responsive behavior within the window.
- Keyboard accessibility.
- Notification behavior.
- Error handling.
- Application packaging.

Do not claim a feature is complete until it actually works.

---

# 19. Final Product Quality

I want the result to feel like a polished indie desktop application.

Think of:

- A retro futuristic operating system.
- A personal RPG status screen.
- A productivity dashboard.
- A clean planning application.

The interface should be visually impressive but practical enough to use every day.

Avoid:
- Generic SaaS dashboards.
- Excessive gradients.
- Too many glowing effects.
- Overcrowded cards.
- Unreadable pixel fonts.
- Random decorative elements.
- Unnecessary animations.
- Fake gamification.
- Unfinished features.

**The most important objective:**

Build an application I would genuinely enjoy opening every morning to plan my day, complete my missions, track my habits, and see my real-life progress.

Start with Step 1: analyze the project, inspect 8bitcn, and present the architecture, folder structure, database design, and implementation plan before writing the main application code.
i want to use design patterns .
color shades each of its role .