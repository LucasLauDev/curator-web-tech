# LMS System Structure — Page Content Reference

> 27 pages documented across 5 sections

---

> **Payment Policy:** The only payment flow in this system is **eBook purchase from the Bookstore**. Course enrollment is entirely free — no subscription, no premium tier, no payment gate for any course content.

---

## 1. Public 🌐

### Homepage 🏠
*Entry point for all visitors before login*

**Navigation Bar**
- University/platform logo
- Links: Home, Courses, Bookstore, About, Contact
- Login button
- Register button
- Mobile hamburger menu

**Hero Section**
- Headline (platform tagline)
- Short description of platform purpose
- CTA buttons: 'Get Started' / 'Browse Courses'
- Hero illustration or banner image

**Featured Courses Preview**
- 3–6 course cards showing: course title, subject, lecturer name, thumbnail
- View All Courses link

**Bookstore Highlights**
- 3–4 featured eBook cards: cover image, title, author, subsidised price
- Browse Bookstore link

**Platform Features Section**
- Icon + text blocks: e.g. 'Online Quizzes', 'Download eBooks', 'Discussion Forum'
- Brief benefit descriptions

**Footer**
- Platform name & logo
- Navigation links (About, FAQ, Contact)
- Contact email / support info
- Copyright notice

---

## 2. Authentication 🔐

### Register 📝
*New student self-registration*

**Page Header**
- Platform logo
- Page title: 'Create Your Account'
- Link to Login page

**Registration Form**
- Full name field
- University email field (validated for university domain)
- Student ID field
- Password field
- Confirm password field
- Faculty / Department dropdown
- Year of study dropdown
- Terms & conditions checkbox

**Form Validation Messages**
- Invalid email domain error
- Password mismatch error
- Required field warnings

**Post-Registration**
- Success message: 'Verification email sent'
- Instruction to check university email
- Link to resend verification email

---

### Login 🔑
*All roles login from one page*

**Page Header**
- Platform logo
- Page title: 'Welcome Back'
- Link to Register page

**Login Form**
- Email address field
- Password field
- Show/hide password toggle
- 'Remember me' checkbox
- Login button

**Additional Links**
- Forgot Password link
- Back to Homepage link

**Error States**
- Invalid credentials message
- Account not verified message
- Account suspended message

---

### Forgot Password 🔓
*Password reset flow*

**Step 1 – Request Reset**
- Email input field
- Submit button
- Back to Login link

**Step 2 – Email Sent**
- Confirmation message
- Instruction to check inbox
- Resend email option

**Step 3 – Reset Form**
- New password field
- Confirm new password field
- Submit button
- Password strength indicator

---

### Email Verification ✉️
*Confirms university email ownership*

**Verification Status**
- Success: 'Email verified! Redirecting…'
- Error: 'Link expired or invalid'
- Resend verification link button

**Next Steps Message**
- Guide user to login after verification

---

## 3. Student 🎓

### Student Dashboard 📊
*Personalised home after login*

**Header / Top Bar**
- Student name & avatar
- Notification bell icon
- Logout button

**Sidebar Navigation**
- Dashboard
- My Courses
- Discussion Forum
- Bookstore
- My eBooks
- Profile

**Welcome Banner**
- Greeting: 'Welcome back, [Name]'
- Current date

**Enrolled Courses Summary**
- Course cards: title, progress bar, last accessed
- Continue Learning button per course
- View All Courses link

**Progress Overview Widget**
- Overall completion percentage
- Quizzes attempted vs total
- Courses completed badge count

**Recent Activity Feed**
- Last visited course
- Recent forum replies
- Recent purchases

**Quick Links**
- Go to Forum
- Browse Bookstore
- My eBooks

---

### Course List 📋
*Browse and enrol in courses*

**Page Header**
- Page title: 'Courses'
- Search bar (search by course name)
- Filter by: Subject / Faculty / Year

**Course Cards Grid**
- Course thumbnail image
- Course title
- Subject / faculty tag
- Lecturer name
- Number of modules
- Short description
- Enrol / Continue button

**Enrolled Courses Tab**
- List of already enrolled courses with progress bars
- Continue button per course

**Pagination / Load More**
- Page controls or infinite scroll

---

### Course Detail Page 📚
*Main learning page per course*

**Course Header**
- Course title & subject tag
- Lecturer name & faculty
- Course description
- Total modules & estimated duration
- Overall progress bar

**Module Accordion / Sidebar**
- List of modules in order
- Module status icon: Completed / In Progress / Locked
- Click to expand module content

**Lecture Notes Section**
- PDF viewer or download button
- File name and upload date
- Multiple files support per module

**Video Tutorials Section**
- Embedded YouTube player or hosted video player
- Video title & duration
- Multiple videos per module

**Interactive Quiz Section**
- Quiz title & number of questions
- Start Quiz button
- Previous attempt score (if any)
- Quiz availability status

**Progress Tracker**
- Module-by-module completion checklist
- Percentage complete indicator

**Saved Resources Button**
- Bookmark/save lecture notes or videos to profile library

---

### Quiz Page 📝
*In-course quiz attempt*

**Quiz Header**
- Quiz title
- Course & module it belongs to
- Total questions count
- Timer (if timed quiz)

**Question Display**
- Question number indicator (e.g. Q3 of 10)
- Question text
- Answer options (multiple choice / true-false)
- Selected answer highlight

**Navigation Controls**
- Previous / Next question buttons
- Question number grid for jumping to any question
- Flag question for review button

**Submission**
- Submit Quiz button (with confirmation prompt)
- Warning if unanswered questions remain

---

### Quiz Results Page 🏆
*Post-submission result view*

**Score Summary**
- Score: X / Y (and percentage)
- Pass / Fail status badge
- Time taken

**Question Review**
- Each question with: student's answer, correct answer, explanation (if provided by lecturer)

**Actions**
- Retake Quiz button (if allowed)
- Back to Course button
- Share result (optional)

---

### Discussion Forum 💬
*Peer & lecturer Q&A space*

**Page Header**
- Page title: 'Discussion Forum'
- Search bar (search threads)
- Filter by: Course / Category / Date / Most Active

**Forum Categories**
- Category tabs or sidebar: All, By Course, General, Announcements

**Thread List**
- Thread title
- Posted by (name + role badge)
- Course tag
- Date & time
- Reply count
- View count
- Pinned badge (if pinned by lecturer/admin)

**Create New Thread Button**
- Floating or top-placed button
- Opens thread creation form

**Thread Detail View**
- Original post with full content
- Author info + role badge
- Timestamp
- Like / upvote button
- Report button
- Reply form (text editor)
- All replies in chronological order
- Pagination for long threads

---

### Bookstore Catalogue 🛍️
*Browse and search eBooks*

**Page Header**
- Page title: 'Bookstore'
- Search bar (search by title / author / ISBN)
- Filter by: Category / Subject / Price Range

**Book Cards Grid**
- Book cover image
- Title & author
- Category / subject tag
- Subsidised price
- Add to Cart button
- View Details button

**Cart Icon**
- Floating cart icon with item count badge

**Book Detail Page**
- Large cover image
- Full title, author, publisher, ISBN
- Description / synopsis
- Category, edition, number of pages
- Subsidised price
- Add to Cart button
- Sample Preview (optional)

---

### Shopping Cart 🛒
*Review items before checkout*

**Cart Items List**
- Book cover thumbnail
- Title & author
- Price per item
- Remove item button

**Order Summary**
- Subtotal
- Subsidy discount applied
- Total payable amount

**Actions**
- Continue Shopping button
- Proceed to Checkout button
- Empty cart message (if no items)

---

### Checkout Page 💳
*Simulated payment flow*

**Order Review**
- List of books being purchased
- Subsidised total amount

**Billing Info Form**
- Full name
- Student ID (auto-filled)
- University email (auto-filled)

**Simulated Payment Section**
- Mock card number field
- Mock expiry & CVV fields
- Note: 'This is a simulated payment for academic purposes'
- Pay Now button

**Order Confirmation Page**
- Success message: 'Purchase Successful!'
- Order ID & date
- List of purchased books
- Go to My eBooks button
- Print / Save receipt link

---

### My eBooks 📖
*Library of purchased books*

**Page Header**
- Page title: 'My eBooks'
- Search purchased books
- Filter by: Category / Recent

**eBook Cards**
- Book cover
- Title & author
- Purchase date
- Read Online button
- Download PDF button

**Online Reader View**
- In-browser PDF / ebook viewer
- Page navigation controls
- Zoom in/out
- Table of contents sidebar
- Bookmark page feature

---

### Student Profile 👤
*Account settings & personal info*

**Profile Header**
- Profile photo (upload option)
- Student name
- Student ID
- Faculty & Year of Study

**Account Settings**
- Edit full name
- Change password
- Update profile photo
- Email (read-only)

**Saved Resources Library**
- Bookmarked lecture notes (with link back to course)
- Bookmarked videos
- Remove from saved option

**Progress Overview**
- Courses enrolled & completion status
- Quiz scores history
- Badges / achievements earned

**eBook Purchase History**
- Past eBook orders: date, books purchased, amount paid

---

## 4. Lecturer 👨‍🏫

### Lecturer Dashboard 📊
*Lecturer home overview*

**Header**
- Lecturer name & avatar
- Department / faculty
- Notification bell
- Logout

**Sidebar Navigation**
- Dashboard
- My Courses
- Discussion Forum
- eBook Recommendations
- Profile

**Courses Summary Widget**
- Total courses created
- Total enrolled students
- Quick links to each course

**Student Activity Widget**
- Recent quiz submissions in my courses
- Forum activity in my courses

**eBook Recommendation Status**
- Pending / Approved / Rejected recommendation counts

**Forum Alerts**
- Unanswered threads in my course forums
- Reported posts awaiting action

---

### My Courses 🏫
*Manage all assigned courses*

**Page Header**
- Page title: 'My Courses'
- Create New Course button

**Course List**
- Course title
- Subject / faculty
- Number of enrolled students
- Number of modules
- Published / Draft status badge
- Edit Course button
- View Student Progress button

---

### Course Editor ✏️
*Create and edit course content*

**Course Info Form**
- Course title
- Subject / faculty
- Course description (rich text editor)
- Course thumbnail upload
- Publish / Save as Draft toggle

**Module Manager**
- Add new module button
- Module title input
- Reorder modules (drag & drop)
- Delete module option

**Per-Module Content Blocks**
- Upload Lecture Notes (PDF, DOCX)
- Add Video: YouTube URL input OR direct file upload
- Attach supplementary files

**Quiz Builder (within module)**
- Quiz title & instructions
- Add question button: question text, answer options (A–D), correct answer selector, explanation field
- Set time limit (optional)
- Allow retake toggle
- Save Quiz button

---

### Student Progress View 📈
*Per-course student analytics*

**Course Filter**
- Select course dropdown

**Student Table**
- Student name & ID
- Modules completed / total
- Quiz scores (per quiz)
- Last active date

**Export Option**
- Export progress as CSV / PDF

---

### Forum Moderation 💬
*Manage course forum threads*

**Course Forum Filter**
- Select course to view its forum threads

**Thread List with Moderation Controls**
- Thread title, author, date, reply count
- Pin Thread button
- Lock Thread button (prevent new replies)
- Delete Thread button
- Reply to Thread button

**Reported Posts Queue**
- Posts flagged by students
- View full post
- Delete Post button
- Dismiss Report button

---

### eBook Recommendations 📖
*Recommend books to admin*

**Recommendation Form**
- Book title
- Author(s)
- Publisher & edition
- ISBN
- Subject / course relevance
- Justification / reason for recommendation
- Suggested subsidised price (optional)
- Submit Recommendation button

**My Recommendations List**
- Book title
- Submitted date
- Status badge: Pending / Approved / Rejected
- Admin note on rejection (if any)
- Resubmit option for rejected items

---

### Lecturer Profile 👤
*Account and personal settings*

**Profile Header**
- Profile photo upload
- Full name
- Staff / lecturer ID
- Department & faculty

**Account Settings**
- Edit name
- Change password
- Email (read-only)

**Notification Preferences**
- Toggle: Forum replies in my courses
- Toggle: New student enrolments
- Toggle: eBook recommendation status updates

---

## 5. Admin 🛡️

### Admin Dashboard 📊
*Platform-wide control centre*

**Header**
- Admin name & avatar
- Notification bell
- Logout

**Sidebar Navigation**
- Dashboard
- User Management
- Course Oversight
- Discussion Forum
- Bookstore Management
- Reports & Analytics
- Profile

**Stats Widgets**
- Total registered students
- Total active courses
- Total eBooks in catalogue
- Total orders this month

**Pending Actions Panel**
- Students pending email verification
- eBook recommendations awaiting approval
- Forum reports to review

**Recent Activity Log**
- Last 10 user registrations
- Last 5 purchases
- Last forum reports

---

### Student Management 👥
*Manage all student accounts*

**Page Header**
- Page title: 'Student Accounts'
- Search bar (by name / email / student ID)
- Filter by: Status (Active / Pending / Suspended)

**Student Table**
- Full name
- Student ID
- University email
- Faculty & Year
- Registration date
- Account status badge
- Actions: Activate / Suspend / View Profile

**Bulk Actions**
- Select multiple accounts
- Bulk activate / suspend

---

### Lecturer Management 👨‍🏫
*Manage lecturer accounts*

**Page Header**
- Page title: 'Lecturer Accounts'
- Add New Lecturer button

**Lecturer Table**
- Full name
- Staff ID
- Email
- Department
- Courses assigned count
- Account status
- Actions: Edit / Deactivate

**Add / Edit Lecturer Form**
- Full name
- Staff ID
- University email
- Department / faculty
- Set temporary password

---

### Course Oversight 🏫
*Monitor and manage all courses*

**Page Header**
- Page title: 'All Courses'
- Search & filter by subject / lecturer / status

**Course Table**
- Course title
- Subject
- Assigned lecturer
- Enrolled students count
- Published status
- Actions: View / Publish / Unpublish / Assign Lecturer

**Assign Lecturer Modal**
- Course name (read-only)
- Lecturer dropdown selector
- Confirm button

---

### Global Forum Moderation 💬
*Moderate all forum activity*

**Page Header**
- Search all threads
- Filter by: Course / Date / Reported / All

**Reported Posts Queue**
- Post preview
- Reported by (student name)
- Reason for report
- Original thread link
- Actions: Delete Post / Dismiss Report / Ban User from Forum

**All Threads View**
- Thread title
- Author & role
- Course
- Date
- Actions: Pin / Lock / Delete

---

### Bookstore Management 🛒
*Manage catalogue and approvals*

**eBook Approval Queue**
- Recommended by (lecturer name)
- Book title, author, ISBN
- Justification note
- Suggested price
- Actions: Approve (with final price input) / Reject (with reason note)

**Book Catalogue Management**
- Full book list with cover, title, author, category, price
- Edit book details button
- Remove from catalogue button
- Add book manually button

**Add / Edit Book Form**
- Book cover image upload
- Title, Author, Publisher, ISBN
- Edition & number of pages
- Category / subject
- Subsidised price
- Upload PDF file (for access after purchase)

**Inventory & Orders**
- Total books in catalogue
- Orders table: order ID, student name, books purchased, amount, date
- Search & filter orders

---

### Reports & Analytics 📈
*Platform-wide data insights*

**User Reports**
- New registrations over time (chart)
- Active vs inactive users
- Students per faculty

**Course Reports**
- Most enrolled courses
- Course completion rates
- Average quiz scores per course

**eBook Sales Reports**
- Total revenue (simulated)
- Best-selling books
- Purchase frequency over time

**Forum Reports**
- Most active threads
- Posts per course
- Reports submitted over time

**Export Options**
- Export any report as PDF or CSV

---

### Admin Profile 👤
*Admin account settings*

**Profile Info**
- Full name
- Admin role badge
- Email address

**Account Settings**
- Change password
- Update profile photo

**System Configuration**
- Platform name / logo settings
- University email domain whitelist (for registration validation)
- Maintenance mode toggle
