# PLAN: Dashboard Calendar Component

## Overview
Create a calendar-like component on the main dashboard to visualize daily expenses, displaying both the total amount and the types/categories of expenses.

## Project Type
WEB (Next.js / React)

## Success Criteria
- [ ] Users can toggle their expense view between Weekly, Daily, and Monthly calendar views.
- [ ] The calendar block for each day displays the total accumulated expenses and distinct expense categories.
- [ ] Clicking on a specific day with multiple expenses opens a modal/popup with detailed transaction information.
- [ ] The component is fully responsive and optimized for mobile screens.
- [ ] Extra Features: Quick date navigation, filtering by category, and visual indicators for high/low spending days.

## 🛑 Open Questions (Socratic Gate)
> [!IMPORTANT]
> Please review and answer these strategic questions before we start implementation:
1. **Design System & Component**: Do we already have a preferred calendar library installed (e.g., `react-day-picker` from shadcn/ui, or `fullcalendar`), or should I build a custom grid from scratch?
2. **Mobile UX Strategy**: For mobile screens, a full 30-day month view is often cramped. Should we default to a Weekly view on mobile, or display a compact month view using only colored indicator dots for expenses?
3. **Data Source**: Do we already have an API endpoint or hook to fetch aggregated daily expense summaries, or do we need to implement a new data transformation logic on the frontend using existing raw transaction data?

## Tech Stack
- Frontend Framework: Next.js (React)
- Styling & UI: Tailwind CSS, shadcn/ui (Dialog/Modal, Select, Popover)
- Date Handling: `date-fns`

## File Structure
- `src/modules/dashboard/components/ExpenseCalendar.tsx` (New)
- `src/modules/dashboard/components/ExpenseDayDetailsModal.tsx` (New)
- `src/modules/dashboard/components/CalendarViewToggle.tsx` (New)
- `src/modules/dashboard/views/DashboardView.tsx` (Modify - to inject the calendar)

## Task Breakdown

### 1. Scaffold the Expense Calendar Component
- **Agent**: `@frontend-specialist`
- **Skill**: `frontend-design`
- **Priority**: P1
- **INPUT**: `DashboardView.tsx` and date libraries.
- **OUTPUT**: A new `ExpenseCalendar.tsx` base component integrated into the dashboard, currently populated with placeholder data.
- **VERIFY**: The component renders gracefully on the dashboard page without breaking existing layouts.

### 2. Implement Calendar Views (Month, Week, Day)
- **Agent**: `@frontend-specialist`
- **Skill**: `frontend-design`
- **Priority**: P1
- **INPUT**: `ExpenseCalendar.tsx`.
- **OUTPUT**: Interactive toggles (`CalendarViewToggle.tsx`) for switching between Monthly, Weekly, and Daily views. Grids are calculated dynamically.
- **VERIFY**: Clicking the toggles changes the calendar grid to the appropriate view mode accurately.

### 3. Integrate Expense Data & Aggregation
- **Agent**: `@backend-specialist` or `@frontend-specialist`
- **Skill**: `api-patterns`
- **Priority**: P1
- **INPUT**: Real expense data source or hooks.
- **OUTPUT**: Logic to aggregate transactions by date, computing the total amount and distinct categories for each day block.
- **VERIFY**: Days with existing expenses accurately display the correct total sum and category icons/labels.

### 4. Create the Daily Details Modal (Popup)
- **Agent**: `@frontend-specialist`
- **Skill**: `frontend-design`
- **Priority**: P2
- **INPUT**: shadcn/ui Dialog component, daily expense data context.
- **OUTPUT**: `ExpenseDayDetailsModal.tsx` that triggers when a user clicks on an active day. It lists individual transactions with precise amounts and categories.
- **VERIFY**: Clicking an active day opens the modal; the modal is scrollable and displays correct items.

### 5. Mobile Responsiveness & Polish
- **Agent**: `@frontend-specialist`
- **Skill**: `frontend-design`
- **Priority**: P2
- **INPUT**: CSS/Tailwind classes.
- **OUTPUT**: Grid layout adjustments for small screens (e.g., hiding text and showing dots on month view on mobile, sticky headers).
- **VERIFY**: Component looks and functions seamlessly on mobile viewports via browser devtools.

## ✅ Phase X: Verification
- [ ] Socratic Gate cleared (User answered questions)
- [ ] No purple/violet hex codes (Agent standard)
- [ ] Lint & Type Check passes (`npm run lint`, `npx tsc --noEmit`)
- [ ] Touch targets are at least 44x44px for mobile accessibility
- [ ] Component passes UX Audit (`ux_audit.py`)
- [ ] Build succeeds without new errors (`npm run build`)
