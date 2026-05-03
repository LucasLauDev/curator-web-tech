import { useState } from "react";

const data = {
  public: {
    label: "Public",
    icon: "🌐",
    color: "#e94560",
    bg: "#1a0a0e",
    pages: [
      {
        id: "homepage",
        name: "Homepage",
        icon: "🏠",
        desc: "Entry point for all visitors before login",
        sections: [
          {
            title: "Navigation Bar",
            items: ["University/platform logo", "Links: Home, Courses, Bookstore, About, Contact", "Login button", "Register button", "Mobile hamburger menu"]
          },
          {
            title: "Hero Section",
            items: ["Headline (platform tagline)", "Short description of platform purpose", "CTA buttons: 'Get Started' / 'Browse Courses'", "Hero illustration or banner image"]
          },
          {
            title: "Featured Courses Preview",
            items: ["3–6 course cards showing: course title, subject, lecturer name, thumbnail", "View All Courses link"]
          },
          {
            title: "Bookstore Highlights",
            items: ["3–4 featured eBook cards: cover image, title, author, subsidised price", "Browse Bookstore link"]
          },
          {
            title: "Platform Features Section",
            items: ["Icon + text blocks: e.g. 'Online Quizzes', 'Download eBooks', 'Discussion Forum'", "Brief benefit descriptions"]
          },
          {
            title: "Footer",
            items: ["Platform name & logo", "Navigation links (About, FAQ, Contact)", "Contact email / support info", "Copyright notice"]
          }
        ]
      }
    ]
  },
  auth: {
    label: "Authentication",
    icon: "🔐",
    color: "#a855f7",
    bg: "#110a1a",
    pages: [
      {
        id: "register",
        name: "Register",
        icon: "📝",
        desc: "New student self-registration",
        sections: [
          { title: "Page Header", items: ["Platform logo", "Page title: 'Create Your Account'", "Link to Login page"] },
          { title: "Registration Form", items: ["Full name field", "University email field (validated for university domain)", "Student ID field", "Password field", "Confirm password field", "Faculty / Department dropdown", "Year of study dropdown", "Terms & conditions checkbox"] },
          { title: "Form Validation Messages", items: ["Invalid email domain error", "Password mismatch error", "Required field warnings"] },
          { title: "Post-Registration", items: ["Success message: 'Verification email sent'", "Instruction to check university email", "Link to resend verification email"] }
        ]
      },
      {
        id: "login",
        name: "Login",
        icon: "🔑",
        desc: "All roles login from one page",
        sections: [
          { title: "Page Header", items: ["Platform logo", "Page title: 'Welcome Back'", "Link to Register page"] },
          { title: "Login Form", items: ["Email address field", "Password field", "Show/hide password toggle", "'Remember me' checkbox", "Login button"] },
          { title: "Additional Links", items: ["Forgot Password link", "Back to Homepage link"] },
          { title: "Error States", items: ["Invalid credentials message", "Account not verified message", "Account suspended message"] }
        ]
      },
      {
        id: "forgot-password",
        name: "Forgot Password",
        icon: "🔓",
        desc: "Password reset flow",
        sections: [
          { title: "Step 1 – Request Reset", items: ["Email input field", "Submit button", "Back to Login link"] },
          { title: "Step 2 – Email Sent", items: ["Confirmation message", "Instruction to check inbox", "Resend email option"] },
          { title: "Step 3 – Reset Form", items: ["New password field", "Confirm new password field", "Submit button", "Password strength indicator"] }
        ]
      },
      {
        id: "email-verify",
        name: "Email Verification",
        icon: "✉️",
        desc: "Confirms university email ownership",
        sections: [
          { title: "Verification Status", items: ["Success: 'Email verified! Redirecting…'", "Error: 'Link expired or invalid'", "Resend verification link button"] },
          { title: "Next Steps Message", items: ["Guide user to login after verification"] }
        ]
      }
    ]
  },
  student: {
    label: "Student",
    icon: "🎓",
    color: "#00b4d8",
    bg: "#020e14",
    pages: [
      {
        id: "s-dashboard",
        name: "Student Dashboard",
        icon: "📊",
        desc: "Personalised home after login",
        sections: [
          { title: "Header / Top Bar", items: ["Student name & avatar", "Notification bell icon", "Logout button"] },
          { title: "Sidebar Navigation", items: ["Dashboard", "My Courses", "Discussion Forum", "Bookstore", "My eBooks", "Profile"] },
          { title: "Welcome Banner", items: ["Greeting: 'Welcome back, [Name]'", "Current date"] },
          { title: "Enrolled Courses Summary", items: ["Course cards: title, progress bar, last accessed", "Continue Learning button per course", "View All Courses link"] },
          { title: "Progress Overview Widget", items: ["Overall completion percentage", "Quizzes attempted vs total", "Courses completed badge count"] },
          { title: "Recent Activity Feed", items: ["Last visited course", "Recent forum replies", "Recent purchases"] },
          { title: "Quick Links", items: ["Go to Forum", "Browse Bookstore", "My eBooks"] }
        ]
      },
      {
        id: "s-course-list",
        name: "Course List",
        icon: "📋",
        desc: "Browse and enrol in courses",
        sections: [
          { title: "Page Header", items: ["Page title: 'Courses'", "Search bar (search by course name)", "Filter by: Subject / Faculty / Year"] },
          { title: "Course Cards Grid", items: ["Course thumbnail image", "Course title", "Subject / faculty tag", "Lecturer name", "Number of modules", "Short description", "Enrol / Continue button"] },
          { title: "Enrolled Courses Tab", items: ["List of already enrolled courses with progress bars", "Continue button per course"] },
          { title: "Pagination / Load More", items: ["Page controls or infinite scroll"] }
        ]
      },
      {
        id: "s-course-detail",
        name: "Course Detail Page",
        icon: "📚",
        desc: "Main learning page per course",
        sections: [
          { title: "Course Header", items: ["Course title & subject tag", "Lecturer name & faculty", "Course description", "Total modules & estimated duration", "Overall progress bar"] },
          { title: "Module Accordion / Sidebar", items: ["List of modules in order", "Module status icon: Completed / In Progress / Locked", "Click to expand module content"] },
          { title: "Lecture Notes Section", items: ["PDF viewer or download button", "File name and upload date", "Multiple files support per module"] },
          { title: "Video Tutorials Section", items: ["Embedded YouTube player or hosted video player", "Video title & duration", "Multiple videos per module"] },
          { title: "Interactive Quiz Section", items: ["Quiz title & number of questions", "Start Quiz button", "Previous attempt score (if any)", "Quiz availability status"] },
          { title: "Progress Tracker", items: ["Module-by-module completion checklist", "Percentage complete indicator"] },
          { title: "Saved Resources Button", items: ["Bookmark/save lecture notes or videos to profile library"] }
        ]
      },
      {
        id: "s-quiz",
        name: "Quiz Page",
        icon: "📝",
        desc: "In-course quiz attempt",
        sections: [
          { title: "Quiz Header", items: ["Quiz title", "Course & module it belongs to", "Total questions count", "Timer (if timed quiz)"] },
          { title: "Question Display", items: ["Question number indicator (e.g. Q3 of 10)", "Question text", "Answer options (multiple choice / true-false)", "Selected answer highlight"] },
          { title: "Navigation Controls", items: ["Previous / Next question buttons", "Question number grid for jumping to any question", "Flag question for review button"] },
          { title: "Submission", items: ["Submit Quiz button (with confirmation prompt)", "Warning if unanswered questions remain"] }
        ]
      },
      {
        id: "s-quiz-result",
        name: "Quiz Results Page",
        icon: "🏆",
        desc: "Post-submission result view",
        sections: [
          { title: "Score Summary", items: ["Score: X / Y (and percentage)", "Pass / Fail status badge", "Time taken"] },
          { title: "Question Review", items: ["Each question with: student's answer, correct answer, explanation (if provided by lecturer)"] },
          { title: "Actions", items: ["Retake Quiz button (if allowed)", "Back to Course button", "Share result (optional)"] }
        ]
      },
      {
        id: "s-forum",
        name: "Discussion Forum",
        icon: "💬",
        desc: "Peer & lecturer Q&A space",
        sections: [
          { title: "Page Header", items: ["Page title: 'Discussion Forum'", "Search bar (search threads)", "Filter by: Course / Category / Date / Most Active"] },
          { title: "Forum Categories", items: ["Category tabs or sidebar: All, By Course, General, Announcements"] },
          { title: "Thread List", items: ["Thread title", "Posted by (name + role badge)", "Course tag", "Date & time", "Reply count", "View count", "Pinned badge (if pinned by lecturer/admin)"] },
          { title: "Create New Thread Button", items: ["Floating or top-placed button", "Opens thread creation form"] },
          { title: "Thread Detail View", items: ["Original post with full content", "Author info + role badge", "Timestamp", "Like / upvote button", "Report button", "Reply form (text editor)", "All replies in chronological order", "Pagination for long threads"] }
        ]
      },
      {
        id: "s-bookstore",
        name: "Bookstore Catalogue",
        icon: "🛍️",
        desc: "Browse and search eBooks",
        sections: [
          { title: "Page Header", items: ["Page title: 'Bookstore'", "Search bar (search by title / author / ISBN)", "Filter by: Category / Subject / Price Range"] },
          { title: "Book Cards Grid", items: ["Book cover image", "Title & author", "Category / subject tag", "Subsidised price", "Add to Cart button", "View Details button"] },
          { title: "Cart Icon", items: ["Floating cart icon with item count badge"] },
          { title: "Book Detail Page", items: ["Large cover image", "Full title, author, publisher, ISBN", "Description / synopsis", "Category, edition, number of pages", "Price (original + subsidised)", "Add to Cart button", "Sample Preview (optional)"] }
        ]
      },
      {
        id: "s-cart",
        name: "Shopping Cart",
        icon: "🛒",
        desc: "Review items before checkout",
        sections: [
          { title: "Cart Items List", items: ["Book cover thumbnail", "Title & author", "Price per item", "Remove item button"] },
          { title: "Order Summary", items: ["Subtotal", "Subsidy discount applied", "Total payable amount"] },
          { title: "Actions", items: ["Continue Shopping button", "Proceed to Checkout button", "Empty cart message (if no items)"] }
        ]
      },
      {
        id: "s-checkout",
        name: "Checkout Page",
        icon: "💳",
        desc: "Simulated payment flow",
        sections: [
          { title: "Order Review", items: ["List of books being purchased", "Subsidised total amount"] },
          { title: "Billing Info Form", items: ["Full name", "Student ID (auto-filled)", "University email (auto-filled)", "Faculty / Department"] },
          { title: "Simulated Payment Section", items: ["Mock card number field", "Mock expiry & CVV fields", "Note: 'This is a simulated payment for academic purposes'", "Pay Now button"] },
          { title: "Order Confirmation Page", items: ["Success message: 'Purchase Successful!'", "Order ID & date", "List of purchased books", "Go to My eBooks button", "Print / Save receipt link"] }
        ]
      },
      {
        id: "s-myebooks",
        name: "My eBooks",
        icon: "📖",
        desc: "Library of purchased books",
        sections: [
          { title: "Page Header", items: ["Page title: 'My eBooks'", "Search purchased books", "Filter by: Category / Recent"] },
          { title: "eBook Cards", items: ["Book cover", "Title & author", "Purchase date", "Read Online button", "Download PDF button"] },
          { title: "Online Reader View", items: ["In-browser PDF / ebook viewer", "Page navigation controls", "Zoom in/out", "Table of contents sidebar", "Bookmark page feature"] }
        ]
      },
      {
        id: "s-profile",
        name: "Student Profile",
        icon: "👤",
        desc: "Account settings & personal info",
        sections: [
          { title: "Profile Header", items: ["Profile photo (upload option)", "Student name", "Student ID", "Faculty & Year of Study"] },
          { title: "Account Settings", items: ["Edit full name", "Change password", "Update profile photo", "Email (read-only)"] },
          { title: "Saved Resources Library", items: ["Bookmarked lecture notes (with link back to course)", "Bookmarked videos", "Remove from saved option"] },
          { title: "Progress Overview", items: ["Courses enrolled & completion status", "Quiz scores history", "Badges / achievements earned"] },
          { title: "Purchase History", items: ["Past orders: date, books, amount paid"] }
        ]
      }
    ]
  },
  lecturer: {
    label: "Lecturer",
    icon: "👨‍🏫",
    color: "#52b788",
    bg: "#020f07",
    pages: [
      {
        id: "l-dashboard",
        name: "Lecturer Dashboard",
        icon: "📊",
        desc: "Lecturer home overview",
        sections: [
          { title: "Header", items: ["Lecturer name & avatar", "Department / faculty", "Notification bell", "Logout"] },
          { title: "Sidebar Navigation", items: ["Dashboard", "My Courses", "Discussion Forum", "eBook Recommendations", "Profile"] },
          { title: "Courses Summary Widget", items: ["Total courses created", "Total enrolled students", "Quick links to each course"] },
          { title: "Student Activity Widget", items: ["Recent quiz submissions in my courses", "Forum activity in my courses"] },
          { title: "eBook Recommendation Status", items: ["Pending / Approved / Rejected recommendation counts"] },
          { title: "Forum Alerts", items: ["Unanswered threads in my course forums", "Reported posts awaiting action"] }
        ]
      },
      {
        id: "l-courses",
        name: "My Courses",
        icon: "🏫",
        desc: "Manage all assigned courses",
        sections: [
          { title: "Page Header", items: ["Page title: 'My Courses'", "Create New Course button"] },
          { title: "Course List", items: ["Course title", "Subject / faculty", "Number of enrolled students", "Number of modules", "Published / Draft status badge", "Edit Course button", "View Student Progress button"] }
        ]
      },
      {
        id: "l-course-editor",
        name: "Course Editor",
        icon: "✏️",
        desc: "Create and edit course content",
        sections: [
          { title: "Course Info Form", items: ["Course title", "Subject / faculty", "Course description (rich text editor)", "Course thumbnail upload", "Publish / Save as Draft toggle"] },
          { title: "Module Manager", items: ["Add new module button", "Module title input", "Reorder modules (drag & drop)", "Delete module option"] },
          { title: "Per-Module Content Blocks", items: ["Upload Lecture Notes (PDF, DOCX)", "Add Video: YouTube URL input OR direct file upload", "Attach supplementary files"] },
          { title: "Quiz Builder (within module)", items: ["Quiz title & instructions", "Add question button: question text, answer options (A–D), correct answer selector, explanation field", "Set time limit (optional)", "Allow retake toggle", "Save Quiz button"] }
        ]
      },
      {
        id: "l-progress",
        name: "Student Progress View",
        icon: "📈",
        desc: "Per-course student analytics",
        sections: [
          { title: "Course Filter", items: ["Select course dropdown"] },
          { title: "Student Table", items: ["Student name & ID", "Modules completed / total", "Quiz scores (per quiz)", "Last active date"] },
          { title: "Export Option", items: ["Export progress as CSV / PDF"] }
        ]
      },
      {
        id: "l-forum",
        name: "Forum Moderation",
        icon: "💬",
        desc: "Manage course forum threads",
        sections: [
          { title: "Course Forum Filter", items: ["Select course to view its forum threads"] },
          { title: "Thread List with Moderation Controls", items: ["Thread title, author, date, reply count", "Pin Thread button", "Lock Thread button (prevent new replies)", "Delete Thread button", "Reply to Thread button"] },
          { title: "Reported Posts Queue", items: ["Posts flagged by students", "View full post", "Delete Post button", "Dismiss Report button"] }
        ]
      },
      {
        id: "l-ebook-rec",
        name: "eBook Recommendations",
        icon: "📖",
        desc: "Recommend books to admin",
        sections: [
          { title: "Recommendation Form", items: ["Book title", "Author(s)", "Publisher & edition", "ISBN", "Subject / course relevance", "Justification / reason for recommendation", "Suggested subsidised price (optional)", "Submit Recommendation button"] },
          { title: "My Recommendations List", items: ["Book title", "Submitted date", "Status badge: Pending / Approved / Rejected", "Admin note on rejection (if any)", "Resubmit option for rejected items"] }
        ]
      },
      {
        id: "l-profile",
        name: "Lecturer Profile",
        icon: "👤",
        desc: "Account and personal settings",
        sections: [
          { title: "Profile Header", items: ["Profile photo upload", "Full name", "Staff / lecturer ID", "Department & faculty"] },
          { title: "Account Settings", items: ["Edit name", "Change password", "Email (read-only)"] },
          { title: "Notification Preferences", items: ["Toggle: Forum replies in my courses", "Toggle: New student enrolments", "Toggle: eBook recommendation status updates"] }
        ]
      }
    ]
  },
  admin: {
    label: "Admin",
    icon: "🛡️",
    color: "#fb8500",
    bg: "#100500",
    pages: [
      {
        id: "a-dashboard",
        name: "Admin Dashboard",
        icon: "📊",
        desc: "Platform-wide control centre",
        sections: [
          { title: "Header", items: ["Admin name & avatar", "Notification bell", "Logout"] },
          { title: "Sidebar Navigation", items: ["Dashboard", "User Management", "Course Oversight", "Discussion Forum", "Bookstore Management", "Reports & Analytics", "Profile"] },
          { title: "Stats Widgets", items: ["Total registered students", "Total active courses", "Total eBooks in catalogue", "Total orders this month"] },
          { title: "Pending Actions Panel", items: ["Students pending email verification", "eBook recommendations awaiting approval", "Forum reports to review"] },
          { title: "Recent Activity Log", items: ["Last 10 user registrations", "Last 5 purchases", "Last forum reports"] }
        ]
      },
      {
        id: "a-user-students",
        name: "Student Management",
        icon: "👥",
        desc: "Manage all student accounts",
        sections: [
          { title: "Page Header", items: ["Page title: 'Student Accounts'", "Search bar (by name / email / student ID)", "Filter by: Status (Active / Pending / Suspended)"] },
          { title: "Student Table", items: ["Full name", "Student ID", "University email", "Faculty & Year", "Registration date", "Account status badge", "Actions: Activate / Suspend / View Profile"] },
          { title: "Bulk Actions", items: ["Select multiple accounts", "Bulk activate / suspend"] }
        ]
      },
      {
        id: "a-user-lecturers",
        name: "Lecturer Management",
        icon: "👨‍🏫",
        desc: "Manage lecturer accounts",
        sections: [
          { title: "Page Header", items: ["Page title: 'Lecturer Accounts'", "Add New Lecturer button"] },
          { title: "Lecturer Table", items: ["Full name", "Staff ID", "Email", "Department", "Courses assigned count", "Account status", "Actions: Edit / Deactivate"] },
          { title: "Add / Edit Lecturer Form", items: ["Full name", "Staff ID", "University email", "Department / faculty", "Set temporary password"] }
        ]
      },
      {
        id: "a-courses",
        name: "Course Oversight",
        icon: "🏫",
        desc: "Monitor and manage all courses",
        sections: [
          { title: "Page Header", items: ["Page title: 'All Courses'", "Search & filter by subject / lecturer / status"] },
          { title: "Course Table", items: ["Course title", "Subject", "Assigned lecturer", "Enrolled students count", "Published status", "Actions: View / Publish / Unpublish / Assign Lecturer"] },
          { title: "Assign Lecturer Modal", items: ["Course name (read-only)", "Lecturer dropdown selector", "Confirm button"] }
        ]
      },
      {
        id: "a-forum",
        name: "Global Forum Moderation",
        icon: "💬",
        desc: "Moderate all forum activity",
        sections: [
          { title: "Page Header", items: ["Search all threads", "Filter by: Course / Date / Reported / All"] },
          { title: "Reported Posts Queue", items: ["Post preview", "Reported by (student name)", "Reason for report", "Original thread link", "Actions: Delete Post / Dismiss Report / Ban User from Forum"] },
          { title: "All Threads View", items: ["Thread title", "Author & role", "Course", "Date", "Actions: Pin / Lock / Delete"] }
        ]
      },
      {
        id: "a-bookstore",
        name: "Bookstore Management",
        icon: "🛒",
        desc: "Manage catalogue and approvals",
        sections: [
          { title: "eBook Approval Queue", items: ["Recommended by (lecturer name)", "Book title, author, ISBN", "Justification note", "Suggested price", "Actions: Approve (with final price input) / Reject (with reason note)"] },
          { title: "Book Catalogue Management", items: ["Full book list with cover, title, author, category, price", "Edit book details button", "Remove from catalogue button", "Add book manually button"] },
          { title: "Add / Edit Book Form", items: ["Book cover image upload", "Title, Author, Publisher, ISBN", "Edition & number of pages", "Category / subject", "Subsidised price", "Upload PDF file (for access after purchase)"] },
          { title: "Inventory & Orders", items: ["Total books in catalogue", "Orders table: order ID, student name, books purchased, amount, date", "Search & filter orders"] }
        ]
      },
      {
        id: "a-reports",
        name: "Reports & Analytics",
        icon: "📈",
        desc: "Platform-wide data insights",
        sections: [
          { title: "User Reports", items: ["New registrations over time (chart)", "Active vs inactive users", "Students per faculty"] },
          { title: "Course Reports", items: ["Most enrolled courses", "Course completion rates", "Average quiz scores per course"] },
          { title: "eBook Sales Reports", items: ["Total revenue (simulated)", "Best-selling books", "Purchase frequency over time"] },
          { title: "Forum Reports", items: ["Most active threads", "Posts per course", "Reports submitted over time"] },
          { title: "Export Options", items: ["Export any report as PDF or CSV"] }
        ]
      },
      {
        id: "a-profile",
        name: "Admin Profile",
        icon: "👤",
        desc: "Admin account settings",
        sections: [
          { title: "Profile Info", items: ["Full name", "Admin role badge", "Email address"] },
          { title: "Account Settings", items: ["Change password", "Update profile photo"] },
          { title: "System Configuration", items: ["Platform name / logo settings", "University email domain whitelist (for registration validation)", "Maintenance mode toggle"] }
        ]
      }
    ]
  }
};

const roleOrder = ["public", "auth", "student", "lecturer", "admin"];

export default function App() {
  const firstRole = roleOrder[0];
  const firstPage = data[firstRole].pages[0].id;
  const [activeRole, setActiveRole] = useState(firstRole);
  const [activePage, setActivePage] = useState(firstPage);

  const role = data[activeRole];
  const page = role.pages.find(p => p.id === activePage) || role.pages[0];

  const handleRoleChange = (r) => {
    setActiveRole(r);
    setActivePage(data[r].pages[0].id);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d0d",
      fontFamily: "'Courier New', monospace",
      display: "flex",
      flexDirection: "column",
      color: "#fff"
    }}>
      {/* Top Header */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "14px 24px" }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#666", marginBottom: 2 }}>LMS DOCUMENTATION</div>
        <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: 1 }}>Individual Page Content Reference</div>
        <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
          {roleOrder.reduce((acc, r) => acc + data[r].pages.length, 0)} pages documented across {roleOrder.length} sections
        </div>
      </div>

      {/* Role Tabs */}
      <div style={{ display: "flex", gap: 2, background: "#0a0a0a", borderBottom: "1px solid #1a1a1a", overflowX: "auto", padding: "8px 12px" }}>
        {roleOrder.map(r => {
          const d = data[r];
          const active = activeRole === r;
          return (
            <button key={r} onClick={() => handleRoleChange(r)} style={{
              background: active ? d.bg : "transparent",
              border: `1.5px solid ${active ? d.color : "#333"}`,
              borderRadius: 8,
              padding: "6px 16px",
              color: active ? d.color : "#666",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              whiteSpace: "nowrap",
              letterSpacing: 1,
              transition: "all 0.15s"
            }}>
              <span>{d.icon}</span>
              <span>{d.label}</span>
              <span style={{ background: active ? d.color + "33" : "#222", borderRadius: 10, padding: "1px 6px", fontSize: 10 }}>
                {d.pages.length}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Page Sidebar */}
        <div style={{
          width: 200, minWidth: 160, background: "#0a0a0a",
          borderRight: "1px solid #1a1a1a",
          overflowY: "auto", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4
        }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#444", padding: "0 8px", marginBottom: 4 }}>PAGES</div>
          {role.pages.map(p => {
            const active = activePage === p.id;
            return (
              <button key={p.id} onClick={() => setActivePage(p.id)} style={{
                background: active ? role.color + "22" : "transparent",
                border: `1px solid ${active ? role.color + "66" : "transparent"}`,
                borderRadius: 8,
                padding: "8px 10px",
                color: active ? role.color : "#777",
                fontSize: 11,
                fontWeight: active ? 700 : 400,
                cursor: "pointer",
                textAlign: "left",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.15s"
              }}>
                <span style={{ fontSize: 14 }}>{p.icon}</span>
                <span style={{ lineHeight: 1.3 }}>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {/* Page Header */}
          <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${role.color}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>{page.icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1 }}>{page.name}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{page.desc}</div>
              </div>
              <div style={{
                marginLeft: "auto", background: role.color + "22",
                border: `1px solid ${role.color}55`, borderRadius: 20,
                padding: "3px 12px", fontSize: 10, color: role.color, fontWeight: 700,
                letterSpacing: 1, whiteSpace: "nowrap"
              }}>
                {role.icon} {role.label}
              </div>
            </div>
            <div style={{ fontSize: 10, color: "#555" }}>
              {page.sections.reduce((acc, s) => acc + s.items.length, 0)} content elements across {page.sections.length} sections
            </div>
          </div>

          {/* Sections Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {page.sections.map((section, i) => (
              <div key={i} style={{
                background: "#111",
                border: `1px solid ${role.color}33`,
                borderRadius: 12,
                overflow: "hidden"
              }}>
                <div style={{
                  background: role.color + "18",
                  borderBottom: `1px solid ${role.color}33`,
                  padding: "10px 14px",
                  display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: role.color, letterSpacing: 0.5 }}>{section.title}</div>
                  <div style={{ fontSize: 9, color: role.color + "88", background: role.color + "22", borderRadius: 10, padding: "2px 7px" }}>
                    {section.items.length} items
                  </div>
                </div>
                <ul style={{ margin: 0, padding: "12px 14px", listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                  {section.items.map((item, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11, color: "#bbb", lineHeight: 1.5 }}>
                      <span style={{ color: role.color, marginTop: 3, fontSize: 7, flexShrink: 0 }}>◆</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom nav */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 16, borderTop: "1px solid #1a1a1a" }}>
            {(() => {
              const pages = role.pages;
              const idx = pages.findIndex(p => p.id === activePage);
              const prev = pages[idx - 1];
              const next = pages[idx + 1];
              return (
                <>
                  {prev ? (
                    <button onClick={() => setActivePage(prev.id)} style={{
                      background: "transparent", border: `1px solid #333`, borderRadius: 8,
                      padding: "7px 14px", color: "#666", fontSize: 11, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6
                    }}>← {prev.icon} {prev.name}</button>
                  ) : <div />}
                  {next ? (
                    <button onClick={() => setActivePage(next.id)} style={{
                      background: "transparent", border: `1px solid ${role.color}55`, borderRadius: 8,
                      padding: "7px 14px", color: role.color, fontSize: 11, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6
                    }}>{next.icon} {next.name} →</button>
                  ) : <div />}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
