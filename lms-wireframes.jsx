import { useState } from "react";

// ─── Design Tokens ───────────────────────────────────────
const W = {
  bg: "#f0f2f5", surface: "#fff", border: "#d1d5db",
  navBg: "#2d3748", sidebar: "#374151", sidebarAct: "#4b5563",
  dark: "#1f2937", mid: "#9ca3af", light: "#e5e7eb", line: "#eaecef",
};

// ─── Primitives ──────────────────────────────────────────
const Nav = ({ links = 4, right = 2 }) => (
  <div style={{ height: 36, background: W.navBg, display: "flex", alignItems: "center", padding: "0 12px", gap: 12, flexShrink: 0 }}>
    <div style={{ width: 68, height: 14, background: "#4b5563", borderRadius: 3 }} />
    <div style={{ flex: 1, display: "flex", gap: 12 }}>
      {Array(links).fill(0).map((_, i) => <div key={i} style={{ height: 6, width: 26 + i * 4, background: "#6b7280", borderRadius: 3 }} />)}
    </div>
    {Array(right).fill(0).map((_, i) => (
      <div key={i} style={{ height: 22, width: 58, borderRadius: 4, background: i === right - 1 ? "#4b5563" : "transparent", border: "1px solid #4b5563", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ height: 6, width: 32, background: "#9ca3af", borderRadius: 3 }} />
      </div>
    ))}
  </div>
);

const Sidebar = ({ n = 6, active = 0, w = 140 }) => (
  <div style={{ width: w, background: W.sidebar, padding: "10px 7px", display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
    {Array(n).fill(0).map((_, i) => (
      <div key={i} style={{ height: 27, borderRadius: 5, background: i === active ? W.sidebarAct : "transparent", display: "flex", alignItems: "center", padding: "0 8px", gap: 7 }}>
        <div style={{ width: 7, height: 7, borderRadius: 2, background: i === active ? "#e5e7eb" : "#6b7280", flexShrink: 0 }} />
        <div style={{ height: 6, width: [46,54,50,42,56,38,52,44][i]||50, background: i === active ? "#e5e7eb" : "#6b7280", borderRadius: 3 }} />
      </div>
    ))}
  </div>
);

const Img = ({ h = 80, label = "image" }) => (
  <div style={{ width: "100%", height: h, background: W.light, border: `1px solid ${W.border}`, borderRadius: 6, position: "relative", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none">
      <line x1="0" y1="0" x2="100%" y2="100%" stroke={W.border} strokeWidth="1.5" />
      <line x1="100%" y1="0" x2="0" y2="100%" stroke={W.border} strokeWidth="1.5" />
    </svg>
    <span style={{ fontSize: 8, color: W.mid, zIndex: 1, background: W.light, padding: "2px 5px", borderRadius: 2 }}>{label}</span>
  </div>
);

const Lines = ({ n = 3, last = 65 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {Array(n).fill(0).map((_, i) => <div key={i} style={{ height: 6, background: W.line, borderRadius: 3, width: i === n - 1 ? `${last}%` : "100%" }} />)}
  </div>
);

const Btn = ({ primary = false, w = 70 }) => (
  <div style={{ height: 24, width: w, borderRadius: 4, background: primary ? W.dark : W.surface, border: `1.5px solid ${primary ? W.dark : W.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <div style={{ height: 6, width: w * 0.55, background: primary ? "#fff" : W.mid, borderRadius: 3 }} />
  </div>
);

const Inp = ({ h = 26 }) => <div style={{ height: h, border: `1.5px solid ${W.border}`, borderRadius: 4, background: W.surface }} />;

const Card = ({ children, p = 10, style = {} }) => (
  <div style={{ background: W.surface, border: `1px solid ${W.border}`, borderRadius: 8, padding: p, ...style }}>{children}</div>
);

const Tag = ({ w = 38, color = W.light }) => <div style={{ height: 14, width: w, background: color, borderRadius: 8 }} />;

const Bar = ({ pct = 60 }) => (
  <div style={{ height: 5, background: W.light, borderRadius: 3, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${pct}%`, background: "#6b7280", borderRadius: 3 }} />
  </div>
);

const Lbl = ({ t }) => <div style={{ fontSize: 8, color: W.mid, letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 5 }}>{t}</div>;

const H = ({ w = "55%", h = 11 }) => <div style={{ height: h, background: W.dark + "25", borderRadius: 3, width: w, marginBottom: 7 }} />;

const Row = ({ cols = 4 }) => (
  <div style={{ display: "flex", gap: 5, padding: "5px 0", borderBottom: `1px solid ${W.line}`, alignItems: "center" }}>
    {Array(cols).fill(0).map((_, i) => <div key={i} style={{ flex: i === 0 ? 2 : 1, height: 6, background: W.line, borderRadius: 3 }} />)}
    <Btn w={42} />
  </div>
);

const Bars = ({ n = 5, h = 56 }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: h }}>
    {[38, 62, 28, 72, 52, 44, 68, 34].slice(0, n).map((v, i) => (
      <div key={i} style={{ flex: 1, height: `${v}%`, background: "#6b7280" + "66", borderRadius: "3px 3px 0 0" }} />
    ))}
  </div>
);

const StatCard = ({ }) => (
  <Card style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
    <div style={{ height: 6, width: 50, background: W.light, borderRadius: 3 }} />
    <div style={{ height: 20, width: 40, background: W.dark + "30", borderRadius: 4 }} />
    <div style={{ height: 5, width: 60, background: W.line, borderRadius: 3 }} />
  </Card>
);

// ─── Wireframes ──────────────────────────────────────────

const wf = {
  homepage: () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={5} right={2} />
      {/* Hero */}
      <div style={{ display: "flex", gap: 16, padding: 20, background: "#1e293b" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <Lbl t="hero section" />
          <div style={{ height: 18, background: "#4b5563", borderRadius: 5, width: "80%" }} />
          <div style={{ height: 12, background: "#374151", borderRadius: 4, width: "95%" }} />
          <div style={{ height: 12, background: "#374151", borderRadius: 4, width: "70%" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Btn primary w={90} />
            <Btn w={90} />
          </div>
        </div>
        <div style={{ width: 180 }}><Img h={110} label="hero banner" /></div>
      </div>
      {/* Featured Courses */}
      <div style={{ padding: "14px 20px" }}>
        <Lbl t="featured courses" />
        <div style={{ display: "flex", gap: 10 }}>
          {[0,1,2].map(i => (
            <Card key={i} style={{ flex: 1 }}>
              <Img h={48} label={`course ${i+1}`} />
              <div style={{ marginTop: 7 }}>
                <H w="80%" h={9} />
                <Lines n={2} last={55} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <Tag w={45} color="#d1fae5" />
                  <Btn primary w={58} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {/* Bookstore */}
      <div style={{ padding: "0 20px 14px" }}>
        <Lbl t="bookstore highlights" />
        <div style={{ display: "flex", gap: 10 }}>
          {[0,1,2,3].map(i => (
            <Card key={i} style={{ flex: 1 }}>
              <Img h={52} label={`book ${i+1}`} />
              <H w="90%" h={8} style={{ marginTop: 6 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <div style={{ height: 10, width: 35, background: W.line, borderRadius: 3 }} />
                <Btn w={54} />
              </div>
            </Card>
          ))}
        </div>
      </div>
      {/* Footer */}
      <div style={{ marginTop: "auto", height: 32, background: W.dark, display: "flex", alignItems: "center", padding: "0 20px", gap: 16 }}>
        {[48, 36, 44, 52].map((w, i) => <div key={i} style={{ height: 5, width: w, background: "#4b5563", borderRadius: 3 }} />)}
      </div>
    </div>
  ),

  login: () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg, alignItems: "center", justifyContent: "center" }}>
      <Card style={{ width: 300, padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 64, height: 14, background: W.dark + "30", borderRadius: 4, margin: "0 auto 8px" }} />
          <H w="70%" h={13} />
          <div style={{ height: 6, width: "55%", background: W.line, borderRadius: 3, margin: "0 auto" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <Lbl t="email address" />
            <Inp />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <Lbl t="password" />
              <div style={{ height: 6, width: 60, background: "#bfdbfe", borderRadius: 3 }} />
            </div>
            <Inp />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 12, height: 12, border: `1.5px solid ${W.border}`, borderRadius: 2 }} />
            <div style={{ height: 6, width: 70, background: W.line, borderRadius: 3 }} />
          </div>
          <Btn primary w="100%" />
          <div style={{ textAlign: "center" }}>
            <div style={{ height: 6, width: 120, background: W.line, borderRadius: 3, margin: "0 auto" }} />
          </div>
        </div>
      </Card>
      <div style={{ marginTop: 12, display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ height: 6, width: 100, background: W.light, borderRadius: 3 }} />
        <div style={{ height: 6, width: 60, background: "#bfdbfe", borderRadius: 3 }} />
      </div>
    </div>
  ),

  register: () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg, alignItems: "center", justifyContent: "center" }}>
      <Card style={{ width: 340, padding: 22 }}>
        <div style={{ marginBottom: 16 }}>
          <H w="65%" h={13} />
          <div style={{ height: 6, width: "75%", background: W.line, borderRadius: 3 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {["Full name", "Student ID", "University email", "Faculty", "Year of study", "Password", "Confirm password", ""].map((f, i) => (
            <div key={i} style={{ gridColumn: i === 2 ? "1 / -1" : "auto" }}>
              {f && <>
                <Lbl t={f} />
                <Inp />
              </>}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "12px 0" }}>
          <div style={{ width: 12, height: 12, border: `1.5px solid ${W.border}`, borderRadius: 2 }} />
          <div style={{ height: 6, width: 140, background: W.line, borderRadius: 3 }} />
        </div>
        <Btn primary w="100%" />
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <div style={{ height: 6, width: 130, background: W.line, borderRadius: 3, margin: "0 auto" }} />
        </div>
      </Card>
    </div>
  ),

  "student-dashboard": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar n={6} active={0} />
        <div style={{ flex: 1, padding: "14px 16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Welcome */}
          <div style={{ background: "#1e293b", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ height: 12, width: 160, background: "#4b5563", borderRadius: 4, marginBottom: 6 }} />
              <div style={{ height: 6, width: 100, background: "#374151", borderRadius: 3 }} />
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#4b5563" }} />
          </div>
          {/* Stats row */}
          <div style={{ display: "flex", gap: 10 }}>
            <StatCard /><StatCard /><StatCard /><StatCard />
          </div>
          {/* Enrolled Courses */}
          <div>
            <Lbl t="enrolled courses" />
            <div style={{ display: "flex", gap: 10 }}>
              {[70, 45, 90].map((p, i) => (
                <Card key={i} style={{ flex: 1 }}>
                  <Tag w={55} color="#dbeafe" />
                  <H w="90%" h={9} />
                  <Bar pct={p} />
                  <div style={{ height: 5, width: 40, background: W.line, borderRadius: 3, marginTop: 4 }} />
                  <div style={{ marginTop: 8 }}><Btn w="100%" /></div>
                </Card>
              ))}
            </div>
          </div>
          {/* Recent Activity */}
          <div>
            <Lbl t="recent activity" />
            <Card>
              {[1,2,3].map(i => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: i < 3 ? `1px solid ${W.line}` : "none", alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: W.light, flexShrink: 0 }} />
                  <div style={{ flex: 1, height: 6, background: W.line, borderRadius: 3 }} />
                  <div style={{ height: 6, width: 40, background: W.line, borderRadius: 3 }} />
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  ),

  "course-list": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar n={6} active={1} />
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Search/filter bar */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1, height: 30, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface, display: "flex", alignItems: "center", padding: "0 10px", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", border: `1.5px solid ${W.mid}` }} />
              <div style={{ height: 6, width: 100, background: W.line, borderRadius: 3 }} />
            </div>
            <div style={{ width: 90, height: 30, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface }} />
            <div style={{ width: 90, height: 30, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface }} />
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 8 }}>
            {["All Courses", "Enrolled"].map((t, i) => (
              <div key={i} style={{ padding: "4px 14px", borderRadius: 16, background: i === 0 ? W.dark : W.surface, border: `1px solid ${W.border}` }}>
                <div style={{ height: 6, width: 50, background: i === 0 ? "#fff" : W.light, borderRadius: 3 }} />
              </div>
            ))}
          </div>
          {/* Course grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[0,1,2,3,4,5].map(i => (
              <Card key={i} p={8}>
                <Img h={55} label={`course ${i+1}`} />
                <div style={{ marginTop: 7, display: "flex", flexDirection: "column", gap: 5 }}>
                  <Tag w={48} color="#dbeafe" />
                  <H w="85%" h={9} />
                  <Lines n={1} last={100} />
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <div style={{ height: 6, width: 55, background: W.line, borderRadius: 3 }} />
                  </div>
                  <Btn primary w="100%" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),

  "course-detail": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar n={6} active={1} />
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Module list */}
          <div style={{ width: 170, background: W.surface, borderRight: `1px solid ${W.border}`, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
            <Lbl t="modules" />
            {["Module 1", "Module 2", "Module 3", "Module 4"].map((m, i) => (
              <div key={i} style={{ padding: "7px 8px", borderRadius: 6, background: i === 0 ? W.bg : "transparent", border: i === 0 ? `1px solid ${W.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === 0 ? "#6b7280" : W.light, flexShrink: 0 }} />
                  <div style={{ height: 6, width: 65, background: i === 0 ? W.dark + "40" : W.line, borderRadius: 3 }} />
                </div>
                {i === 0 && <Bar pct={70} />}
              </div>
            ))}
          </div>
          {/* Content area */}
          <div style={{ flex: 1, padding: "14px 16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Course header */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Tag w={60} color="#dbeafe" />
                <Tag w={70} color="#d1fae5" />
              </div>
              <H w="70%" h={13} />
              <Lines n={2} last={80} />
              <div style={{ marginTop: 8 }}><Bar pct={55} /></div>
            </div>
            {/* Lecture notes */}
            <Card>
              <Lbl t="lecture notes" />
              {[1,2].map(i => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: i === 1 ? "none" : `1px solid ${W.line}` }}>
                  <div style={{ width: 24, height: 28, background: "#fee2e2", borderRadius: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1, height: 6, background: W.line, borderRadius: 3 }} />
                  <Btn w={60} />
                </div>
              ))}
            </Card>
            {/* Video */}
            <Card>
              <Lbl t="video tutorials" />
              <Img h={80} label="video player" />
            </Card>
            {/* Quiz */}
            <Card>
              <Lbl t="quiz" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <H w={120} h={9} />
                  <div style={{ height: 6, width: 80, background: W.line, borderRadius: 3 }} />
                </div>
                <Btn primary w={90} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  ),

  "quiz": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={1} />
      <div style={{ flex: 1, display: "flex", gap: 14, padding: 16, overflow: "hidden" }}>
        {/* Question nav grid */}
        <div style={{ width: 130, display: "flex", flexDirection: "column", gap: 8 }}>
          <Lbl t="questions" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
            {Array(12).fill(0).map((_, i) => (
              <div key={i} style={{ height: 22, borderRadius: 4, background: i === 2 ? W.dark : i < 2 ? W.light : W.surface, border: `1px solid ${W.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ height: 5, width: 10, background: i === 2 ? "#fff" : W.mid, borderRadius: 2 }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <Lbl t="timer" />
            <div style={{ height: 28, background: W.surface, border: `1px solid ${W.border}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ height: 12, width: 50, background: "#fee2e2", borderRadius: 4 }} />
            </div>
          </div>
        </div>
        {/* Question area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <Tag w={80} color="#dbeafe" />
              <div style={{ height: 6, width: 50, background: W.line, borderRadius: 3 }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <H w="90%" h={11} />
              <Lines n={2} last={70} />
            </div>
            <Lbl t="answer options" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["A", "B", "C", "D"].map((opt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6, border: `1.5px solid ${i === 1 ? W.dark : W.border}`, background: i === 1 ? W.bg : W.surface }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${i === 1 ? W.dark : W.border}`, background: i === 1 ? W.dark : W.surface, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ height: 5, width: 8, background: i === 1 ? "#fff" : "transparent", borderRadius: 2 }} />
                  </div>
                  <div style={{ height: 6, width: 100 + i * 20, background: W.line, borderRadius: 3 }} />
                </div>
              ))}
            </div>
          </Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Btn w={80} />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn w={70} />
              <Btn primary w={80} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),

  "forum": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar n={6} active={3} />
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", gap: 12 }}>
          {/* Main threads */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Header */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ flex: 1, height: 30, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface }} />
              <div style={{ width: 80, height: 30, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface }} />
              <Btn primary w={100} />
            </div>
            {/* Category tabs */}
            <div style={{ display: "flex", gap: 6 }}>
              {["All", "My Courses", "General", "Announcements"].map((t, i) => (
                <div key={i} style={{ padding: "4px 12px", borderRadius: 12, background: i === 0 ? W.dark : W.surface, border: `1px solid ${W.border}` }}>
                  <div style={{ height: 6, width: 30 + t.length * 3, background: i === 0 ? "#fff" : W.light, borderRadius: 3 }} />
                </div>
              ))}
            </div>
            {/* Threads */}
            {[0,1,2,3,4].map(i => (
              <Card key={i} p={10}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: W.light, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 5 }}>
                      <H w="55%" h={9} />
                      {i === 0 && <Tag w={28} color="#fef9c3" />}
                    </div>
                    <Lines n={2} last={60} />
                    <div style={{ display: "flex", gap: 8, marginTop: 7 }}>
                      <Tag w={50} color="#dbeafe" />
                      <div style={{ height: 6, width: 60, background: W.line, borderRadius: 3 }} />
                      <div style={{ height: 6, width: 50, background: W.line, borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {/* Sidebar */}
          <div style={{ width: 150, display: "flex", flexDirection: "column", gap: 10 }}>
            <Card>
              <Lbl t="categories" />
              {[1,2,3,4].map(i => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: i < 4 ? `1px solid ${W.line}` : "none" }}>
                  <div style={{ height: 6, width: 60, background: W.line, borderRadius: 3 }} />
                  <div style={{ height: 6, width: 15, background: W.light, borderRadius: 3 }} />
                </div>
              ))}
            </Card>
            <Card>
              <Lbl t="most active" />
              {[1,2,3].map(i => (
                <div key={i} style={{ padding: "4px 0", borderBottom: i < 3 ? `1px solid ${W.line}` : "none" }}>
                  <div style={{ height: 6, width: "90%", background: W.line, borderRadius: 3, marginBottom: 3 }} />
                  <div style={{ height: 5, width: 50, background: W.light, borderRadius: 3 }} />
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  ),

  "bookstore": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar n={6} active={4} />
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", gap: 12 }}>
          {/* Filters */}
          <div style={{ width: 140, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ height: 30, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface }} />
            <Card>
              <Lbl t="categories" />
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 0" }}>
                  <div style={{ width: 11, height: 11, border: `1.5px solid ${W.border}`, borderRadius: 2 }} />
                  <div style={{ height: 6, width: 55 + i * 5, background: W.line, borderRadius: 3 }} />
                </div>
              ))}
            </Card>
            <Card>
              <Lbl t="price range" />
              <div style={{ height: 4, background: W.light, borderRadius: 3, position: "relative", margin: "6px 0" }}>
                <div style={{ position: "absolute", height: "100%", left: "20%", right: "30%", background: W.dark, borderRadius: 3 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ height: 5, width: 25, background: W.line, borderRadius: 3 }} />
                <div style={{ height: 5, width: 25, background: W.line, borderRadius: 3 }} />
              </div>
            </Card>
          </div>
          {/* Book grid */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[0,1,2,3,4,5].map(i => (
                <Card key={i} p={8}>
                  <Img h={70} label={`book cover`} />
                  <div style={{ marginTop: 7, display: "flex", flexDirection: "column", gap: 5 }}>
                    <H w="80%" h={8} />
                    <div style={{ height: 6, width: "60%", background: W.line, borderRadius: 3 }} />
                    <Tag w={45} color="#dbeafe" />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <div style={{ height: 10, width: 38, background: "#d1fae5", borderRadius: 4 }} />
                      <Btn primary w={62} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),

  "cart-checkout": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ flex: 1, padding: 16, display: "flex", gap: 14 }}>
        {/* Cart items */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <H w="30%" h={12} />
          {[1,2,3].map(i => (
            <Card key={i} p={10}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 44, height: 56, background: W.light, border: `1px solid ${W.border}`, borderRadius: 4, flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                  <H w="70%" h={9} />
                  <div style={{ height: 6, width: "50%", background: W.line, borderRadius: 3 }} />
                  <Tag w={45} color="#dbeafe" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <div style={{ height: 10, width: 38, background: "#d1fae5", borderRadius: 4 }} />
                  <div style={{ width: 16, height: 16, borderRadius: 3, border: `1px solid #fecaca`, background: "#fff1f2" }} />
                </div>
              </div>
            </Card>
          ))}
          {/* Billing form */}
          <Card>
            <Lbl t="billing information" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {["Full name", "Student ID", "Simulated card no.", "Expiry / CVV"].map((f, i) => (
                <div key={i}>
                  <Lbl t={f} />
                  <Inp />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, padding: "6px 10px", background: "#fef9c3", borderRadius: 5, display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24", flexShrink: 0 }} />
              <div style={{ height: 6, width: "80%", background: "#fde68a", borderRadius: 3 }} />
            </div>
          </Card>
        </div>
        {/* Order summary */}
        <div style={{ width: 190, display: "flex", flexDirection: "column", gap: 10 }}>
          <Card>
            <Lbl t="order summary" />
            {["Subtotal", "Subsidy discount", "Total payable"].map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 2 ? `1px solid ${W.line}` : "none" }}>
                <div style={{ height: 6, width: 60, background: i === 2 ? W.dark + "30" : W.line, borderRadius: 3 }} />
                <div style={{ height: 6, width: 35, background: i === 2 ? "#6b7280" : W.light, borderRadius: 3 }} />
              </div>
            ))}
            <div style={{ marginTop: 12 }}><Btn primary w="100%" /></div>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <div style={{ height: 6, width: 80, background: W.line, borderRadius: 3, margin: "0 auto" }} />
            </div>
          </Card>
          <Card>
            <Lbl t="3 items in cart" />
            {[1,2,3].map(i => (
              <div key={i} style={{ display: "flex", gap: 7, padding: "4px 0", borderBottom: i < 3 ? `1px solid ${W.line}` : "none", alignItems: "center" }}>
                <div style={{ width: 24, height: 30, background: W.light, borderRadius: 3, flexShrink: 0 }} />
                <div style={{ height: 6, flex: 1, background: W.line, borderRadius: 3 }} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  ),

  "my-ebooks": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar n={6} active={5} />
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, height: 30, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface }} />
            <div style={{ width: 90, height: 30, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {[0,1,2,3,4,5,6,7,8,9].map(i => (
              <Card key={i} p={8}>
                <div style={{ height: 80, background: W.light, border: `1px solid ${W.border}`, borderRadius: 5, marginBottom: 7 }} />
                <H w="85%" h={7} />
                <div style={{ height: 5, width: "65%", background: W.line, borderRadius: 3, marginBottom: 7 }} />
                <div style={{ display: "flex", gap: 4 }}>
                  <Btn w="48%" />
                  <Btn primary w="48%" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),

  "lecturer-dashboard": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar n={5} active={0} />
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <StatCard /><StatCard /><StatCard />
            <Card style={{ flex: 1 }}>
              <Lbl t="book recs" />
              <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                {["pending","approved","rejected"].map((s, i) => (
                  <div key={i} style={{ flex: 1, height: 22, borderRadius: 4, background: [W.light, "#d1fae5", "#fee2e2"][i], display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ height: 8, width: 20, background: ["#9ca3af","#6ee7b7","#fca5a5"][i], borderRadius: 3 }} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 2 }}>
              <Lbl t="my courses" />
              {[0,1,2].map(i => (
                <Card key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, background: W.light, borderRadius: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <H w="65%" h={9} />
                      <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
                        <div style={{ height: 6, width: 50, background: W.line, borderRadius: 3 }} />
                        <div style={{ height: 6, width: 60, background: W.line, borderRadius: 3 }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn w={60} />
                      <Btn w={72} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <Lbl t="forum alerts" />
              <Card>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ display: "flex", gap: 7, padding: "5px 0", borderBottom: i < 4 ? `1px solid ${W.line}` : "none", alignItems: "center" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24", flexShrink: 0 }} />
                    <div style={{ flex: 1, height: 6, background: W.line, borderRadius: 3 }} />
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),

  "course-editor": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar n={5} active={1} />
        {/* Module tree */}
        <div style={{ width: 160, background: W.surface, borderRight: `1px solid ${W.border}`, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          <Lbl t="modules" />
          <Btn primary w="100%" />
          <div style={{ marginTop: 6 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 6px", borderRadius: 5, background: i === 0 ? W.bg : "transparent", border: `1px solid ${i === 0 ? W.border : "transparent"}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: W.light, flexShrink: 0 }} />
                  <div style={{ height: 6, flex: 1, background: W.line, borderRadius: 3 }} />
                  <div style={{ height: 6, width: 6, background: W.light, borderRadius: 2 }} />
                </div>
                {i === 0 && (
                  <div style={{ marginLeft: 12, marginTop: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                    {["notes", "video", "quiz"].map((t, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 6px" }}>
                        <div style={{ width: 5, height: 5, borderRadius: 1, background: W.light, flexShrink: 0 }} />
                        <div style={{ height: 5, width: 45, background: W.line, borderRadius: 3 }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Content editor */}
        <div style={{ flex: 1, padding: "14px 16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <Lbl t="module title & settings" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Inp />
              <div style={{ height: 60, border: `1.5px solid ${W.border}`, borderRadius: 5, background: W.surface }} />
              <div style={{ display: "flex", gap: 8 }}>
                <Btn w={90} />
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 28, height: 14, borderRadius: 7, background: "#6b7280" }} />
                  <div style={{ height: 6, width: 50, background: W.line, borderRadius: 3 }} />
                </div>
              </div>
            </div>
          </Card>
          {/* Upload notes */}
          <Card>
            <Lbl t="lecture notes upload" />
            <div style={{ height: 50, border: `2px dashed ${W.border}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ height: 7, width: 120, background: W.light, borderRadius: 3 }} />
            </div>
          </Card>
          {/* Video */}
          <Card>
            <Lbl t="video — youtube url or upload" />
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {["YouTube URL", "Upload file"].map((t, i) => (
                <div key={i} style={{ padding: "4px 12px", borderRadius: 12, background: i === 0 ? W.dark : W.surface, border: `1px solid ${W.border}` }}>
                  <div style={{ height: 6, width: 50, background: i === 0 ? "#fff" : W.light, borderRadius: 3 }} />
                </div>
              ))}
            </div>
            <Inp />
          </Card>
          {/* Quiz builder */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Lbl t="quiz builder" />
              <Btn w={80} />
            </div>
            {[1,2].map(i => (
              <div key={i} style={{ border: `1px solid ${W.border}`, borderRadius: 6, padding: 8, marginBottom: 6 }}>
                <div style={{ height: 7, width: "80%", background: W.line, borderRadius: 3, marginBottom: 6 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {["A","B","C","D"].map((opt, j) => (
                    <div key={j} style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", border: `1px solid ${W.border}`, flexShrink: 0 }} />
                      <div style={{ height: 5, flex: 1, background: W.line, borderRadius: 3 }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  ),

  "lecturer-forum": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar n={5} active={2} />
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ height: 30, width: 160, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface }} />
            <div style={{ flex: 1, height: 30, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface }} />
          </div>
          {/* Reported posts banner */}
          <div style={{ background: "#fef9c3", border: `1px solid #fde68a`, borderRadius: 7, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
              <div style={{ height: 6, width: 140, background: "#fde68a", borderRadius: 3 }} />
            </div>
            <Btn w={80} />
          </div>
          {/* Thread list with mod controls */}
          {[0,1,2,3,4].map(i => (
            <Card key={i} p={10}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: W.light, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <H w="50%" h={9} />
                  <Lines n={1} last={100} />
                  <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
                    <Tag w={50} color="#dbeafe" />
                    <div style={{ height: 6, width: 50, background: W.line, borderRadius: 3 }} />
                  </div>
                </div>
                {/* Moderation actions */}
                <div style={{ display: "flex", gap: 5 }}>
                  <Btn w={38} />
                  <Btn w={38} />
                  <Btn w={38} />
                  <Btn w={38} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  ),

  "ebook-rec": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar n={5} active={3} />
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", gap: 14 }}>
          {/* Submission form */}
          <div style={{ flex: 1 }}>
            <H w="55%" h={12} />
            <Card style={{ marginTop: 10 }}>
              <Lbl t="book recommendation form" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Book title", "Author(s)", "Publisher & Edition", "ISBN", "Relevant course / subject"].map(f => (
                  <div key={f}><Lbl t={f} /><Inp /></div>
                ))}
                <div>
                  <Lbl t="justification / reason" />
                  <div style={{ height: 50, border: `1.5px solid ${W.border}`, borderRadius: 5, background: W.surface }} />
                </div>
                <div>
                  <Lbl t="suggested price (optional)" />
                  <Inp />
                </div>
                <Btn primary w={140} />
              </div>
            </Card>
          </div>
          {/* Status list */}
          <div style={{ width: 200 }}>
            <H w="70%" h={12} />
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {[["#d1fae5", "#065f46"], ["#fef9c3", "#92400e"], ["#fee2e2", "#991b1b"], ["#fef9c3", "#92400e"]].map(([bg, col], i) => (
                <Card key={i} p={8}>
                  <H w="85%" h={8} />
                  <div style={{ height: 5, width: "60%", background: W.line, borderRadius: 3, marginBottom: 6 }} />
                  <div style={{ height: 14, width: 60, background: bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ height: 5, width: 40, background: col + "88", borderRadius: 3 }} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),

  "admin-dashboard": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar n={7} active={0} />
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <StatCard /><StatCard /><StatCard /><StatCard />
          </div>
          {/* Pending actions */}
          <div style={{ display: "flex", gap: 10 }}>
            {["Pending Verifications", "eBook Approvals", "Forum Reports"].map((label, i) => (
              <Card key={i} style={{ flex: 1 }}>
                <Lbl t={label} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ height: 24, width: 32, background: ["#fee2e2","#fef9c3","#fee2e2"][i], borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ height: 12, width: 18, background: ["#fca5a5","#fde68a","#fca5a5"][i], borderRadius: 3 }} />
                  </div>
                  <Btn w={60} />
                </div>
              </Card>
            ))}
          </div>
          {/* Charts row */}
          <div style={{ display: "flex", gap: 10, flex: 1 }}>
            <Card style={{ flex: 2 }}>
              <Lbl t="user registrations (last 30 days)" />
              <Bars n={7} h={80} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {Array(7).fill(0).map((_, i) => <div key={i} style={{ height: 5, width: 18, background: W.light, borderRadius: 3 }} />)}
              </div>
            </Card>
            <Card style={{ flex: 1 }}>
              <Lbl t="activity log" />
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ display: "flex", gap: 6, padding: "4px 0", borderBottom: i < 5 ? `1px solid ${W.line}` : "none", alignItems: "center" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: W.light, flexShrink: 0 }} />
                  <div style={{ flex: 1, height: 5, background: W.line, borderRadius: 3 }} />
                  <div style={{ height: 5, width: 28, background: W.light, borderRadius: 3 }} />
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  ),

  "admin-users": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar n={7} active={1} />
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Header */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1, height: 30, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface }} />
            <div style={{ width: 100, height: 30, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface }} />
            <div style={{ width: 100, height: 30, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface }} />
            <Btn primary w={100} />
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 6 }}>
            {["Students", "Lecturers"].map((t, i) => (
              <div key={i} style={{ padding: "4px 16px", borderRadius: 12, background: i === 0 ? W.dark : W.surface, border: `1px solid ${W.border}` }}>
                <div style={{ height: 6, width: 40, background: i === 0 ? "#fff" : W.light, borderRadius: 3 }} />
              </div>
            ))}
          </div>
          {/* Table */}
          <Card style={{ flex: 1 }}>
            {/* Table header */}
            <div style={{ display: "flex", gap: 5, padding: "6px 0 8px", borderBottom: `1.5px solid ${W.border}` }}>
              {["2fr","1fr","2fr","1fr","1fr","1fr","1fr"].map((f, i) => (
                <div key={i} style={{ flex: parseFloat(f), height: 7, background: W.dark + "25", borderRadius: 3 }} />
              ))}
            </div>
            {[0,1,2,3,4,5,6,7].map(i => (
              <div key={i} style={{ display: "flex", gap: 5, padding: "6px 0", borderBottom: `1px solid ${W.line}`, alignItems: "center" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: W.light, flexShrink: 0 }} />
                {["2fr","1fr","2fr","1fr","1fr"].map((f, j) => (
                  <div key={j} style={{ flex: parseFloat(f), height: 6, background: W.line, borderRadius: 3 }} />
                ))}
                <div style={{ height: 14, width: 50, background: i % 3 === 0 ? "#fef9c3" : "#d1fae5", borderRadius: 8 }} />
                <div style={{ display: "flex", gap: 5 }}>
                  <Btn w={50} />
                  <Btn w={50} />
                </div>
              </div>
            ))}
          </Card>
          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ height: 6, width: 80, background: W.light, borderRadius: 3 }} />
            <div style={{ display: "flex", gap: 5 }}>
              {[1,2,3,"...",8].map((p, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: 5, background: p === 1 ? W.dark : W.surface, border: `1px solid ${W.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ height: 6, width: 12, background: p === 1 ? "#fff" : W.light, borderRadius: 3 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),

  "admin-bookstore": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar n={7} active={4} />
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", gap: 12, overflow: "hidden" }}>
          {/* Approval queue */}
          <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Lbl t="approval queue" />
              <div style={{ height: 14, width: 16, background: "#fca5a5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ height: 5, width: 8, background: "#991b1b", borderRadius: 2 }} />
              </div>
            </div>
            {[0,1,2,3].map(i => (
              <Card key={i} p={8}>
                <H w="85%" h={8} />
                <div style={{ height: 5, width: "60%", background: W.line, borderRadius: 3, marginBottom: 5 }} />
                <div style={{ height: 5, width: "80%", background: W.line, borderRadius: 3, marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 6 }}>
                  <div style={{ height: 6, width: 50, background: W.line, borderRadius: 3 }} />
                  <Inp h={18} />
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <Btn primary w="50%" />
                  <div style={{ flex: 1, height: 24, borderRadius: 4, background: "#fee2e2", border: `1px solid #fca5a5`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ height: 6, width: 30, background: "#fca5a5", borderRadius: 3 }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {/* Catalogue management */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, height: 30, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface }} />
              <div style={{ width: 90, height: 30, border: `1.5px solid ${W.border}`, borderRadius: 6, background: W.surface }} />
              <Btn primary w={100} />
            </div>
            <Card style={{ flex: 1 }}>
              <Lbl t="book catalogue" />
              {/* Table header */}
              <div style={{ display: "flex", gap: 5, padding: "4px 0 8px", borderBottom: `1.5px solid ${W.border}` }}>
                {[55, 36, 60, 35, 35, 40].map((w, i) => (
                  <div key={i} style={{ width: w, height: 7, background: W.dark + "25", borderRadius: 3, flexShrink: 0 }} />
                ))}
              </div>
              {[0,1,2,3,4,5,6].map(i => (
                <div key={i} style={{ display: "flex", gap: 5, padding: "6px 0", borderBottom: `1px solid ${W.line}`, alignItems: "center" }}>
                  <div style={{ width: 28, height: 34, background: W.light, borderRadius: 3, flexShrink: 0 }} />
                  {[36, 60, 35, 35].map((w, j) => (
                    <div key={j} style={{ width: w, height: 6, background: W.line, borderRadius: 3, flexShrink: 0 }} />
                  ))}
                  <div style={{ height: 12, width: 38, background: "#d1fae5", borderRadius: 8 }} />
                  <div style={{ display: "flex", gap: 4 }}>
                    <Btn w={36} />
                    <Btn w={36} />
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  ),

  "admin-reports": () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.bg }}>
      <Nav links={0} right={2} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar n={7} active={5} />
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Date filter */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 5 }}>
              {["7 days","30 days","3 months","Custom"].map((t, i) => (
                <div key={i} style={{ padding: "4px 10px", borderRadius: 12, background: i === 1 ? W.dark : W.surface, border: `1px solid ${W.border}` }}>
                  <div style={{ height: 6, width: 35, background: i === 1 ? "#fff" : W.light, borderRadius: 3 }} />
                </div>
              ))}
            </div>
            <div style={{ marginLeft: "auto" }}><Btn w={90} /></div>
          </div>
          {/* Charts 2x2 grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1 }}>
            <Card>
              <Lbl t="user registrations" />
              <Bars n={7} h={80} />
            </Card>
            <Card>
              <Lbl t="course completion rates" />
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
                {[["Intro to CS", 82], ["Data Structures", 65], ["Web Dev", 91], ["Algorithms", 48], ["DB Systems", 73]].map(([name, pct], i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 80, height: 6, background: W.line, borderRadius: 3, flexShrink: 0 }} />
                    <div style={{ flex: 1, height: 10, background: W.light, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#6b7280", borderRadius: 4 }} />
                    </div>
                    <div style={{ height: 6, width: 22, background: W.light, borderRadius: 3, flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <Lbl t="ebook sales (simulated)" />
              <Bars n={6} h={80} />
            </Card>
            <Card>
              <Lbl t="forum activity" />
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 0", borderBottom: i < 4 ? `1px solid ${W.line}` : "none" }}>
                    <div style={{ height: 6, flex: 2, background: W.line, borderRadius: 3 }} />
                    <div style={{ height: 6, flex: 1, background: W.light, borderRadius: 3 }} />
                    <div style={{ height: 6, flex: 1, background: W.light, borderRadius: 3 }} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  ),
};

// ─── Page Index ──────────────────────────────────────────
const pages = [
  { role: "🌐 Public", pages: [{ id: "homepage", label: "Homepage", desc: "Entry point — hero, courses preview, bookstore highlights, footer" }] },
  { role: "🔐 Auth", pages: [
    { id: "login", label: "Login", desc: "Single login page with role detection and forgot password link" },
    { id: "register", label: "Register", desc: "Student self-registration with university email validation" },
  ]},
  { role: "🎓 Student", pages: [
    { id: "student-dashboard", label: "Dashboard", desc: "Overview of enrolled courses, progress stats, recent activity" },
    { id: "course-list", label: "Course List", desc: "Browse and enrol in courses with search and filters" },
    { id: "course-detail", label: "Course Detail", desc: "Module content — notes, videos, quizzes, progress tracker" },
    { id: "quiz", label: "Quiz Page", desc: "Quiz attempt — question navigation, timer, answer selection" },
    { id: "forum", label: "Discussion Forum", desc: "Thread list, categories, create/reply with report option" },
    { id: "bookstore", label: "Bookstore", desc: "Book catalogue with filters, categories, and add to cart" },
    { id: "cart-checkout", label: "Cart & Checkout", desc: "Cart review, billing form, simulated payment, order summary" },
    { id: "my-ebooks", label: "My eBooks", desc: "Purchased eBook library — online reader and PDF download" },
  ]},
  { role: "👨‍🏫 Lecturer", pages: [
    { id: "lecturer-dashboard", label: "Dashboard", desc: "Course summary, student activity, forum alerts, book rec status" },
    { id: "course-editor", label: "Course Editor", desc: "Module tree, content upload, video, quiz builder" },
    { id: "lecturer-forum", label: "Forum Moderation", desc: "Course forum — pin, lock, delete threads, reported posts queue" },
    { id: "ebook-rec", label: "eBook Recommendations", desc: "Submit book recommendations and track approval status" },
  ]},
  { role: "🛡️ Admin", pages: [
    { id: "admin-dashboard", label: "Dashboard", desc: "Platform stats, pending actions, user chart, activity log" },
    { id: "admin-users", label: "User Management", desc: "Student/Lecturer accounts — search, filter, activate, suspend" },
    { id: "admin-bookstore", label: "Bookstore Management", desc: "Approval queue with pricing, catalogue CRUD" },
    { id: "admin-reports", label: "Reports & Analytics", desc: "Registration, completion, sales, forum charts with date filters" },
  ]},
];

const allPages = pages.flatMap(g => g.pages.map(p => ({ ...p, role: g.role })));

// ─── App ─────────────────────────────────────────────────
export default function App() {
  const [current, setCurrent] = useState("homepage");
  const page = allPages.find(p => p.id === current);
  const currentIdx = allPages.findIndex(p => p.id === current);
  const WireframeComponent = wf[current];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#111827", fontFamily: "system-ui, sans-serif", overflow: "hidden" }}>
      {/* App header */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#475569", marginBottom: 2 }}>LMS WIREFRAME MOCKUPS</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{allPages.length} Pages Documented</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {currentIdx > 0 && (
            <button onClick={() => setCurrent(allPages[currentIdx - 1].id)} style={{ height: 28, padding: "0 10px", borderRadius: 5, background: "transparent", border: "1px solid #334155", color: "#94a3b8", fontSize: 11, cursor: "pointer" }}>← Prev</button>
          )}
          {currentIdx < allPages.length - 1 && (
            <button onClick={() => setCurrent(allPages[currentIdx + 1].id)} style={{ height: 28, padding: "0 10px", borderRadius: 5, background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", fontSize: 11, cursor: "pointer" }}>Next →</button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Page navigator */}
        <div style={{ width: 200, background: "#0f172a", borderRight: "1px solid #1e293b", overflowY: "auto", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
          {pages.map((group) => (
            <div key={group.role}>
              <div style={{ fontSize: 9, color: "#475569", letterSpacing: 2, padding: "8px 8px 4px", fontWeight: 700 }}>{group.role}</div>
              {group.pages.map(p => (
                <button key={p.id} onClick={() => setCurrent(p.id)} style={{ width: "100%", textAlign: "left", background: current === p.id ? "#1e293b" : "transparent", border: `1px solid ${current === p.id ? "#334155" : "transparent"}`, borderRadius: 6, padding: "6px 10px", color: current === p.id ? "#e2e8f0" : "#64748b", fontSize: 11, cursor: "pointer", display: "block" }}>
                  {p.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Main view */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Page info bar */}
          <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "8px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
            <div style={{ flex: 1, height: 22, background: "#0f172a", borderRadius: 5, display: "flex", alignItems: "center", padding: "0 10px" }}>
              <div style={{ fontSize: 10, color: "#475569" }}>lms.edu.my/{page?.id}</div>
            </div>
            <div style={{ fontSize: 10, color: "#64748b" }}>{page?.role}</div>
          </div>

          {/* Wireframe */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {WireframeComponent ? (
              <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
                <WireframeComponent />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#475569", fontSize: 13 }}>Select a page to preview</div>
            )}
          </div>

          {/* Page description */}
          <div style={{ background: "#0f172a", borderTop: "1px solid #1e293b", padding: "8px 16px", flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginRight: 8 }}>{page?.label}</span>
            <span style={{ fontSize: 11, color: "#475569" }}>{page?.desc}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
