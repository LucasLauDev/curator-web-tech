# LMS Wireframe Content Reference

> 19 pages across 5 roles

---

> **Payment Policy:** The only payment flow in this system is **eBook purchase from the Bookstore**. Course enrollment is entirely free — no subscription, no premium tier, no payment gate for any course content.

---

## Shared Layout Primitives

| Component | Description |
|-----------|-------------|
| `Nav` | Top navigation bar — dark bg, logo placeholder, configurable link count, right-side buttons (Login/Register or avatar/logout) |
| `Sidebar` | Left sidebar — dark bg, configurable item count, active item highlighted |
| `Card` | White surface with border and rounded corners |
| `Btn` | Button — primary (dark fill) or secondary (outlined) |
| `Inp` | Input field — bordered, white bg |
| `Img` | Image placeholder — light bg with diagonal X lines and label |
| `Bar` | Single horizontal progress bar |
| `Bars` | Bar chart — variable height bars |
| `StatCard` | Stat widget — label, large number, sub-label |
| `Lbl` | Section label — uppercase monospace, muted |
| `H` | Heading placeholder block |
| `Lines` | Body text placeholder lines |
| `Tag` | Pill / badge element |

---

## 1. Public

### Homepage
**URL:** `lms.edu.my/homepage`
**Role:** 🌐 Public
**Desc:** Entry point — hero, courses preview, bookstore highlights, footer

**Layout (top to bottom):**

- **Nav** — 5 links (Home, Courses, Bookstore, About, Contact) + Login button + Register button
- **Hero Section** — dark background
  - Left: `HERO SECTION` label, headline block, 2 description lines, 2 CTA buttons (primary Get Started + secondary Browse Courses)
  - Right: hero banner image placeholder
- **Featured Courses** — `FEATURED COURSES` label + 3 course cards in a row
  - Each card: course thumbnail image, title heading, 2 description lines, subject tag (green), primary CTA button
- **Bookstore Highlights** — `BOOKSTORE HIGHLIGHTS` label + 4 book cards in a row
  - Each card: book cover image, title heading, price placeholder, secondary button
- **Footer** — dark bar, 4 link placeholders

---

## 2. Authentication

### Login
**URL:** `lms.edu.my/login`
**Role:** 🔐 Auth
**Desc:** Single login page with role detection and forgot password link

**Layout:**
- Full-page centered
- **Card**
  - Logo placeholder (centered)
  - Page title heading (centered)
  - Subtitle line (centered)
  - `EMAIL ADDRESS` label + input field
  - `PASSWORD` label + Forgot Password link (right-aligned, blue) + input field
  - Remember me checkbox + label
  - Full-width primary Login button
  - Centered helper text link
- Below card: "Don't have an account?" text + Register link (blue)

---

### Register
**URL:** `lms.edu.my/register`
**Role:** 🔐 Auth
**Desc:** Student self-registration with university email validation

**Layout:**
- Full-page centered, light grey background
- **Card**
  - Page title heading
  - Subtitle line
  - 2-col grid:
    - `FULL NAME` input
    - `STUDENT ID` input
    - `UNIVERSITY EMAIL` input (spans full width)
    - `FACULTY` input
    - `YEAR OF STUDY` input
    - `PASSWORD` input
    - `CONFIRM PASSWORD` input
  - Terms & conditions checkbox + label
  - Full-width primary Register button
  - Centered "Already have an account?" link

---

## 3. Student

### Student Dashboard
**URL:** `lms.edu.my/student-dashboard`
**Role:** 🎓 Student
**Desc:** Overview of enrolled courses, progress stats, recent activity

**Layout:**
- **Nav** — no links, 2 right buttons (notifications + logout)
- **Sidebar** (6 items) — Dashboard (active), My Courses, Discussion Forum, Bookstore, My eBooks, Profile
- **Main content:**
  - **Welcome Banner** — dark bg, greeting text + current date (left), avatar circle (right)
  - **Stats Row** — 4 stat cards (courses enrolled, quizzes attempted, completion %, badges)
  - **Enrolled Courses** — `ENROLLED COURSES` label + 3 course cards
    - Each card: subject tag (blue), course title, progress bar (70% / 45% / 90%), last-accessed text, Continue button (full width)
  - **Recent Activity** — `RECENT ACTIVITY` label + card with 3 activity rows
    - Each row: dot indicator, activity text, timestamp

---

### Course List
**URL:** `lms.edu.my/course-list`
**Role:** 🎓 Student
**Desc:** Browse and enrol in courses with search and filters

**Layout:**
- **Nav** + **Sidebar** (6 items, My Courses active)
- **Main content:**
  - **Search/Filter bar** — search input (flex), 2 filter dropdowns (Subject, Faculty/Year)
  - **Tabs** — All Courses (active, dark), Enrolled
  - **Course Grid** — 3-column grid, 6 course cards
    - Each card: course thumbnail, subject tag (blue), course title, lecturer name line, primary Enrol/Continue button (full width)

---

### Course Detail
**URL:** `lms.edu.my/course-detail`
**Role:** 🎓 Student
**Desc:** Module content — notes, videos, quizzes, progress tracker

**Layout:**
- **Nav** + **Sidebar** (6 items, My Courses active)
- **Module Panel** (white, left of content)
  - `MODULES` label
  - 4 module rows — Module 1 active (highlighted bg, progress bar at 70%), Modules 2–4 inactive
- **Content Area:**
  - **Course Header** — subject tag (blue) + faculty tag (green), course title, 2 description lines, overall progress bar (55%)
  - **Lecture Notes card** — `LECTURE NOTES` label, 2 file rows each: PDF icon (red), file name, Download button
  - **Video Tutorials card** — `VIDEO TUTORIALS` label, video player image placeholder
  - **Quiz card** — `QUIZ` label, quiz title + question count (left), Start Quiz primary button (right)

---

### Quiz Page
**URL:** `lms.edu.my/quiz`
**Role:** 🎓 Student
**Desc:** Quiz attempt — question navigation, timer, answer selection

**Layout:**
- **Nav** — no links, 1 right button
- **Left Panel:**
  - `QUESTIONS` label
  - 4×3 grid of 12 question number boxes — Q1–Q2 answered (light), Q3 current (dark/active), Q4–Q12 unattempted (white)
  - `TIMER` label + timer display box (red-tinted)
- **Question Area:**
  - **Question Card**
    - Question label tag (blue) + question counter (right)
    - Question heading + 2 body lines
    - `ANSWER OPTIONS` label
    - 4 option rows (A, B, C, D) — option B selected (dark border + dark bg radio)
  - **Navigation row** — Flag button (left) | Previous button + Next primary button (right)

---

### Discussion Forum
**URL:** `lms.edu.my/forum`
**Role:** 🎓 Student
**Desc:** Thread list, categories, create/reply with report option

**Layout:**
- **Nav** + **Sidebar** (6 items, Discussion Forum active)
- **Main area (flex row):**
  - **Thread List (flex 1):**
    - Search input + filter dropdown + New Thread primary button
    - Category tabs — All (active), My Courses, General, Announcements
    - 5 thread cards
      - Each card: author avatar, thread title + pinned badge (first thread), 2 content lines, course tag (blue), date + reply count meta
  - **Right Sidebar:**
    - **Categories card** — `CATEGORIES` label, 4 category rows with counts
    - **Most Active card** — `MOST ACTIVE` label, 3 thread rows with title + reply count

---

### Bookstore
**URL:** `lms.edu.my/bookstore`
**Role:** 🎓 Student
**Desc:** Book catalogue with filters, categories, and add to cart

**Layout:**
- **Nav** + **Sidebar** (6 items, Bookstore active)
- **Main area (flex row):**
  - **Filter Panel:**
    - Search input
    - **Categories card** — `CATEGORIES` label, 5 checkbox + label rows
    - **Price Range card** — `PRICE RANGE` label, range slider
  - **Book Grid (flex 1):**
    - 3-column grid, 6 book cards
      - Each card: book cover placeholder, title heading, author line, subject tag (blue), price badge (green), Add to Cart primary button

---

### Cart & Checkout
**URL:** `lms.edu.my/cart-checkout`
**Role:** 🎓 Student
**Desc:** eBook cart review, billing info, simulated payment, order summary

**Layout:**
- **Nav** — no sidebar
- **Main area (flex row):**
  - **Left Column (flex 1):**
    - `CART` heading
    - 3 cart item cards — each: book thumbnail, title + author + category tag (left), price badge + red delete icon (right)
    - **Billing form card** — `BILLING INFORMATION` label, 2-col grid: Full name, Student ID (auto-filled), Simulated card no., Expiry / CVV inputs
    - Yellow notice banner — dot indicator + "This is a simulated payment for academic purposes" text
  - **Right Column:**
    - **Order Summary card** — `ORDER SUMMARY` label, 3 rows: Subtotal / Subsidy discount / Total payable, Pay Now primary button (full width), Continue Shopping link
    - **Cart mini-list card** — `3 ITEMS IN CART` label, 3 mini rows (book thumbnail + title)

---

### My eBooks
**URL:** `lms.edu.my/my-ebooks`
**Role:** 🎓 Student
**Desc:** Purchased eBook library — online reader and PDF download

**Layout:**
- **Nav** + **Sidebar** (6 items, My eBooks active)
- **Main content:**
  - Search input + filter dropdown (Recent/Category)
  - 5-column grid, 10 eBook cards
    - Each card: book cover placeholder, title heading, author line, 2 buttons side by side — Read (secondary) + Download PDF (primary)

---

## 4. Lecturer

### Lecturer Dashboard
**URL:** `lms.edu.my/lecturer-dashboard`
**Role:** 👨‍🏫 Lecturer
**Desc:** Course summary, student activity, forum alerts, book rec status

**Layout:**
- **Nav** + **Sidebar** (5 items) — Dashboard (active), My Courses, Forum Moderation, eBook Recommendations, Profile
- **Stats Row** — 3 stat cards + Book Recs status card
  - Book Recs card: `BOOK RECS` label, 3 status badges side by side — Pending (grey), Approved (green), Rejected (red)
- **Lower area (flex row):**
  - **My Courses (flex 2):**
    - `MY COURSES` label
    - 3 course rows — each: course thumbnail, title + meta (enrolled students, modules), Edit button + View Progress button
  - **Forum Alerts (flex 1):**
    - `FORUM ALERTS` label
    - Card with 4 alert rows — each: yellow dot + alert text

---

### Course Editor
**URL:** `lms.edu.my/course-editor`
**Role:** 👨‍🏫 Lecturer
**Desc:** Module tree, content upload, video, quiz builder

**Layout:**
- **Nav** + **Sidebar** (5 items, My Courses active)
- **Module Tree Panel** (white):
  - `MODULES` label
  - Add New Module primary button (full width)
  - 4 module rows — Module 1 active and expanded:
    - Sub-items: notes, video, quiz (each with small icon + label)
  - Modules 2–4 collapsed
- **Content Editor (flex 1):**
  - **Module Settings card** — `MODULE TITLE & SETTINGS` label, title input, description textarea, Publish/Draft toggle + label
  - **Lecture Notes card** — `LECTURE NOTES UPLOAD` label, dashed drop zone
  - **Video card** — `VIDEO — YOUTUBE URL OR UPLOAD` label, tab switcher (YouTube URL active / Upload file), URL input field
  - **Quiz Builder card** — `QUIZ BUILDER` label + Add Question button (right), 2 question blocks
    - Each block: question text placeholder, 2-col grid of A/B/C/D radio options

---

### Forum Moderation
**URL:** `lms.edu.my/lecturer-forum`
**Role:** 👨‍🏫 Lecturer
**Desc:** Course forum — pin, lock, delete threads, reported posts queue

**Layout:**
- **Nav** + **Sidebar** (5 items, Forum Moderation active)
- **Main content:**
  - Course dropdown + search input (flex)
  - **Reported Posts Banner** — yellow bg, warning dot + "X reported posts need review" text, Review button
  - 5 thread cards with moderation controls
    - Each card: author avatar, thread title, content line, course tag + date meta, 4 action buttons (Pin / Lock / Delete / Reply)

---

### eBook Recommendations
**URL:** `lms.edu.my/ebook-rec`
**Role:** 👨‍🏫 Lecturer
**Desc:** Submit book recommendations and track approval status

**Layout:**
- **Nav** + **Sidebar** (5 items, eBook Recommendations active)
- **Main area (flex row):**
  - **Submission Form (flex 1):**
    - Page title heading
    - **Recommendation Form card** — `BOOK RECOMMENDATION FORM` label
      - Fields: Book title, Author(s), Publisher & Edition, ISBN, Relevant course / subject (each with label + input)
      - Justification / reason — label + textarea
      - Suggested price (optional) — label + input
      - Submit Recommendation primary button
  - **Status List:**
    - `MY RECOMMENDATIONS` heading
    - 4 recommendation cards — each: title heading, submitted date line, status badge (green Approved / yellow Pending / red Rejected)

---

## 5. Admin

### Admin Dashboard
**URL:** `lms.edu.my/admin-dashboard`
**Role:** 🛡️ Admin
**Desc:** Platform stats, pending actions, user chart, activity log

**Layout:**
- **Nav** + **Sidebar** (7 items) — Dashboard (active), User Management, Course Oversight, Discussion Forum, Bookstore Management, Reports & Analytics, Profile
- **Stats Row** — 4 stat cards (Total students, Active courses, eBooks in catalogue, Orders this month)
- **Pending Actions Row** — 3 cards
  - Pending Verifications (red badge)
  - eBook Approvals (yellow badge)
  - Forum Reports (red badge)
  - Each: count badge + action button
- **Charts Row (flex):**
  - **User Registrations chart (flex 2)** — `USER REGISTRATIONS (LAST 30 DAYS)` label, 7-bar chart, day labels below
  - **Activity Log (flex 1)** — `ACTIVITY LOG` label, 5 log rows (dot + text + timestamp)

---

### User Management
**URL:** `lms.edu.my/admin-users`
**Role:** 🛡️ Admin
**Desc:** Student/Lecturer accounts — search, filter, activate, suspend

**Layout:**
- **Nav** + **Sidebar** (7 items, User Management active)
- **Main content:**
  - **Header row** — search input (flex), Status filter dropdown, Faculty filter dropdown, Add Lecturer primary button
  - **Tabs** — Students (active, dark), Lecturers
  - **Accounts Table card:**
    - Header row: Name / Student ID / Email / Faculty / Year / Status / Actions
    - 8 data rows — each: avatar circle, name, ID, email, faculty, year, status badge (yellow Pending or green Active), Activate button + Suspend button
  - **Pagination** — "Showing X of Y" text (left), page buttons 1 2 3 … 8 (right, page 1 active/dark)

---

### Bookstore Management
**URL:** `lms.edu.my/admin-bookstore`
**Role:** 🛡️ Admin
**Desc:** Approval queue with pricing, catalogue CRUD

**Layout:**
- **Nav** + **Sidebar** (7 items, Bookstore Management active)
- **Main area (flex row):**
  - **Approval Queue:**
    - `APPROVAL QUEUE` label + red count badge
    - 4 recommendation cards — each:
      - Book title, author line, justification line
      - Price input field (inline)
      - Approve primary button + Reject button (red)
  - **Catalogue Management (flex 1):**
    - Search input + filter dropdown + Add Book primary button
    - **Book Catalogue card** — `BOOK CATALOGUE` label
      - Table header: Cover / Title / Author / Category / Price / Status / Actions
      - 7 book rows — each: thumbnail, title, author, category, price, green status badge, Edit button + Remove button

---

### Reports & Analytics
**URL:** `lms.edu.my/admin-reports`
**Role:** 🛡️ Admin
**Desc:** Registration, completion, sales, forum charts with date filters

**Layout:**
- **Nav** + **Sidebar** (7 items, Reports & Analytics active)
- **Main content:**
  - **Date Filter row** — 4 tabs (7 days / 30 days active / 3 months / Custom) + Export button (right)
  - **2×2 Chart Grid:**
    - **User Registrations** — `USER REGISTRATIONS` label, 7-bar chart
    - **Course Completion Rates** — `COURSE COMPLETION RATES` label, horizontal bar rows for 5 courses (Intro to CS 82%, Data Structures 65%, Web Dev 91%, Algorithms 48%, DB Systems 73%)
    - **eBook Sales (Simulated)** — `EBOOK SALES (SIMULATED)` label, 6-bar chart
    - **Forum Activity** — `FORUM ACTIVITY` label, 5-row table (thread name / post count / report count)
