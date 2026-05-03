/**
 * Idempotent demo courses + enrollments (requires seed-demo-users.js first).
 * Uses DATABASE_URL from .env (Supabase direct connection).
 * Sample notes attach as JSON with `url` pointing at /assets/sample-files/* (repo static files).
 *
 * Courses are owned by instructor@uts.edu.my.
 * Every `student` in public.users is enrolled in all published courses.
 * Roster demo data: each student gets distinct joined date, module completion count, and
 * progress per course (deterministic mix of index + hash so re-seeds stay reproducible).
 * Requires migration `course_module_completion` (see supabase/migrations/*course_module_completion.sql).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });

const { createPoolFromEnv } = require('../server/db');
const {
  createCourse,
  replaceCourseContent,
  assertInstructorOwnsCourse,
  selectModulesForLearning
} = require('../server/coursesRepo');

const pool = createPoolFromEnv();
if (!pool) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const DEMO_STUDENT_ID = 'UTS20230001';
const DEMO_STUDENT_EMAIL = 'ali@student.uts.edu.my';

/** Reproducible 32-bit mix (FNV-1a style) — varies per email+course without Math.random(). */
function stableHash32 (str) {
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

async function refreshAllEnrollmentProgress () {
  await pool.query(`
    UPDATE public.course_enrollments ce
    SET progress_percent = LEAST(
      100::numeric,
      GREATEST(
        0::numeric,
        ROUND(
          CASE
            WHEN COALESCE(mc.total, 0) = 0 THEN 0::numeric
            ELSE 100::numeric * COALESCE(comp.done, 0) / mc.total
          END
        )
      )
    )::smallint
    FROM public.course_enrollments ce2
    LEFT JOIN (
      SELECT course_id, COUNT(*)::numeric AS total
      FROM public.course_modules
      GROUP BY course_id
    ) mc ON mc.course_id = ce2.course_id
    LEFT JOIN (
      SELECT x.user_id, m.course_id, COUNT(*)::numeric AS done
      FROM public.course_module_completion x
      INNER JOIN public.course_modules m ON m.id = x.module_id
      GROUP BY x.user_id, m.course_id
    ) comp ON comp.user_id = ce2.user_id AND comp.course_id = ce2.course_id
    WHERE ce.user_id = ce2.user_id AND ce.course_id = ce2.course_id
  `);
}

/** @param {string} diskName Filename on disk inside assets/sample-files */
function pdfSample (diskName, sizeLabel, displayTitleOpt) {
  return {
    name: displayTitleOpt || diskName,
    download_name: diskName,
    url: '/assets/sample-files/' + encodeURIComponent(diskName),
    size_label: sizeLabel || 'PDF · bundled sample'
  };
}

/** Four choices; first is correct (matches prior seed style). */
function mcq (prompt, correct, w1, w2, w3) {
  return {
    prompt,
    choices: [correct, w1, w2, w3],
    correct_index: 0
  };
}

/** Exactly five questions per module (quizzes seed requirement). */
function quiz5 (a, b, c, d, e) {
  return [a, b, c, d, e];
}

/** Matches files under assets/sample-files/ in repo */
const PDF = {
  webTech: pdfSample(
    'Web Technologies.pdf',
    '~1–2 MB · course reader',
    'Web Technologies reader (notes)'
  ),
  pastPaper: pdfSample(
    'Web Technology Old Question 2069.pdf',
    '~mid-size · demo past paper',
    'Web Tech — Old questions (demo)'
  ),
  architecture: pdfSample(
    'COMPUTER ORGANIZATION AND ARCHITECTURE.pdf',
    '~large excerpt · supplementary',
    'Computer Organization & Architecture (bundled excerpt)'
  ),
  creativity: pdfSample(
    'understand-creativity.pdf',
    '~mid-size · design thinking notes',
    'Understand creativity (reading)'
  )
};

const WEB_TECH = {
  title: 'Web Technology',
  faculty: 'Computing',
  category: 'technology',
  description:
    'This web technology course introduces the fundamental concepts and tools used to build modern websites and web applications. It covers key topics such as HTML, CSS, JavaScript, and basic web development frameworks. Students will gain practical skills in designing, developing, and deploying interactive and responsive web solutions.',
  thumbnail_url: 'https://picsum.photos/seed/webtech-course/800/450',
  modules: [
    {
      title: 'Introduction to Web Technologies',
      description:
        'Overview of the web, its architecture, and how websites and web applications operate.',
      lecture_notes_summary:
        'WWW, HTTP, browsers vs servers, URLs. Bundled reader and demo papers under /assets/sample-files.',
      sample_files: [PDF.webTech, PDF.pastPaper],
      video_url: 'https://www.youtube.com/watch?v=DHv8OFF04cE',
      quiz: quiz5(
        mcq('What does the term "WWW" stand for?', 'World Wide Web', 'World Web Wide', 'Web World Wide', 'Wide World Web'),
        mcq('Which protocol is primarily used for transferring web pages?', 'HTTP', 'FTP', 'SMTP', 'TCP'),
        mcq('What is a web browser?', 'A tool to access and display web pages', 'A programming language', 'A server application', 'A database system'),
        mcq('Which of the following is an example of a web server?', 'Apache', 'Chrome', 'Firefox', 'HTML'),
        mcq('What does a URL represent?', 'An address of a resource on the internet', 'A coding language', 'A web browser', 'A server configuration')
      )
    },
    {
      title: 'HTML Fundamentals',
      description: 'Covers the structure of web pages using HTML, including elements, forms, and semantic tags.',
      lecture_notes_summary: 'Structure, hyperlinks, headings, breaks, image attributes. See bundled Web Technologies PDF.',
      sample_files: [PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=kDp2vKG1SBs',
      quiz: quiz5(
        mcq('What does HTML stand for?', 'Hyper Text Markup Language', 'Hyper Trainer Marking Language', 'Hyper Text Marketing Language', 'High Text Markup Language'),
        mcq('Which tag is used to create a hyperlink?', '<a>', '<link>', '<href>', '<url>'),
        mcq('Which HTML tag is used for the largest heading?', '<h1>', '<h6>', '<heading>', '<head>'),
        mcq('Which tag is used to create a line break?', '<br>', '<lb>', '<break>', '<ln>'),
        mcq('Which attribute is used to specify an image source?', 'src', 'href', 'link', 'img')
      )
    },
    {
      title: 'CSS and Layout Design',
      description: 'Introduces styling, the box model, and layout techniques such as Flexbox and Grid.',
      lecture_notes_summary: 'Selectors, color, box model (padding), Flexbox vs Grid overview.',
      sample_files: [PDF.creativity, PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=705XCEruZFs',
      quiz: quiz5(
        mcq('What does CSS stand for?', 'Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style System', 'Colorful Style Sheets'),
        mcq('Which property is used to change text color?', 'color', 'font-color', 'text-color', 'fgcolor'),
        mcq('Which CSS property controls the space inside an element?', 'padding', 'margin', 'border', 'spacing'),
        mcq('Which layout system is one-dimensional?', 'Flexbox', 'Grid', 'Table', 'Float'),
        mcq('Which symbol is used for class selectors in CSS?', '.', '#', '*', '&')
      )
    },
    {
      title: 'Responsive Web Design',
      description: 'Focuses on building websites that adapt to different devices using media queries and flexible layouts.',
      lecture_notes_summary: 'Media queries, viewport, relative units (%), mobile-first mindset.',
      sample_files: [PDF.pastPaper],
      video_url: 'https://www.youtube.com/watch?v=srvUrASNj0s',
      quiz: quiz5(
        mcq('What is the purpose of responsive design?', 'Adapt layout to different devices', 'Improve server speed', 'Increase file size', 'Reduce HTML usage'),
        mcq('Which CSS feature is used for responsiveness?', 'Media queries', 'Variables', 'Animations', 'Borders'),
        mcq('What does "viewport" refer to?', 'Visible area of a web page on a device', 'Server memory', 'CSS property', 'HTML tag'),
        mcq('Which unit is relative for responsive design?', '%', 'px', 'cm', 'pt'),
        mcq('Which meta tag helps with mobile responsiveness?', 'viewport', 'charset', 'description', 'keywords')
      )
    },
    {
      title: 'JavaScript Essentials',
      description:
        'Covers basic programming concepts including variables, functions, events, and control structures.',
      lecture_notes_summary: 'var, comments, console.log, function syntax, Boolean type.',
      sample_files: [PDF.webTech, PDF.pastPaper],
      video_url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
      quiz: quiz5(
        mcq('Which keyword is used to declare a variable in JavaScript?', 'var', 'int', 'string', 'dim'),
        mcq('Which symbol is used for single-line comments?', '//', '<!-- -->', '##', '**'),
        mcq('Which method displays output in the browser console?', 'console.log()', 'print()', 'display()', 'write()'),
        mcq('What is the correct way to write a function?', 'function myFunc()', 'function = myFunc()', 'def myFunc()', 'func myFunc()'),
        mcq('Which data type is used for true/false values?', 'Boolean', 'String', 'Number', 'Float')
      )
    }
  ]
};

const UI_DESIGN = {
  title: 'User Interface Design',
  faculty: 'Computing',
  category: 'design',
  description:
    'Layouts, typography, spacing, accessibility, feedback patterns — Gestalt grounding plus downloadable PDF readings from /assets/sample-files.',
  thumbnail_url: 'https://picsum.photos/seed/ui-course/800/450',
  modules: [
    {
      title: 'Module 1: Visual hierarchy',
      description: 'Proximity, similarity, emphasis, and rhythm on-screen.',
      lecture_notes_summary:
        'Creativity reading + typography context from the Web Technologies bundled reader (PDF appendix).',
      sample_files: [PDF.creativity, PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=R9auouuOaYI',
      quiz: quiz5(
        mcq('Which Gestalt principle groups items that move together?', 'Common fate', 'Closure', 'Continuity', 'Figure-ground'),
        mcq('Large tap targets primarily help:', 'Motor accuracy & accessibility', 'GPU ray tracing', 'DNS caching', 'SQL indexing'),
        mcq('White space can:', 'Separate groups and reduce cognitive load', 'Guarantee WCAG AAA contrast', 'Replace all labels', 'Turn off animations'),
        mcq('Typographic scale usually:', 'Uses deliberate size steps for headings/body', 'Uses random font sizes', 'Requires monospace only', 'Forbids line height'),
        mcq('Visual weight guides attention via:', 'Size, contrast, and color', 'Only animation duration', 'Server latency', 'Database shards')
      )
    },
    {
      title: 'Module 2: Feedback, skeletons & confirmations',
      description: 'How to communicate state without surprising users.',
      lecture_notes_summary: 'Use Old Question PDF prompts for drafting microcopy critiques.',
      sample_files: [PDF.pastPaper],
      video_url: 'https://www.youtube.com/watch?v=KEG7b851Rjs',
      quiz: quiz5(
        mcq('For destructive deletes, ideally:', 'Confirm intent with clear consequences', 'Hide rollback entirely', 'Use only iconography with no text', 'Disable auditing'),
        mcq('Skeleton screens help users perceive:', 'That content is loading', 'That the app crashed', 'TLS certificate errors', 'SQL deadlocks'),
        mcq('Inline validation should generally:', 'Be timely and tied to the field', 'Wait until annual tax filing', 'Only run on paper forms', 'Replace all labels with icons'),
        mcq('Disabled buttons without explanation often:', 'Increase confusion and abandonment', 'Always improve conversion', 'Fix keyboard navigation', 'Satisfy WCAG by default'),
        mcq('Success states should:', 'Confirm what happened and next steps if any', 'Navigate away with no message', 'Clear the form silently only', 'Log the user out')
      )
    },
    {
      title: 'Module 3: Color, contrast & branding',
      description: 'Palette discipline, accessible contrast, and emotional tone.',
      lecture_notes_summary: 'WCAG contrast ratios; semantic color (not color alone); brand vs. usability.',
      sample_files: [PDF.creativity],
      video_url: 'https://www.youtube.com/watch?v=Qa1xM46pJ7Y',
      quiz: quiz5(
        mcq('WCAG contrast guidance matters most for:', 'Readability for low-vision users', 'Print-only workflows', 'CPU branch prediction', 'SMTP ports'),
        mcq('Relying on red vs green alone to convey state is:', 'A poor practice for accessibility', 'Always sufficient', 'Required by law everywhere', 'Neutral'),
        mcq('Neutral grays in UI often:', 'Let accent colors carry meaning', 'Must be pure #000000 only', 'Cannot pair with typography', 'Replace spacing systems'),
        mcq('Dark mode considerations include:', 'Elevation without heavy shadows', 'Ignoring focus rings', 'Disabling all images', 'Removing headings'),
        mcq('Brand color applied to body text at small sizes may:', 'Fail contrast; adjust shades or weight', 'Automatically meet AAA', 'Only affect print CSS', 'Fix all layout bugs')
      )
    },
    {
      title: 'Module 4: Navigation & information architecture',
      description: 'Menus, search, wayfinding, and content grouping.',
      lecture_notes_summary: 'Primary vs secondary nav; breadcrumbs; URL ↔ mental model.',
      sample_files: [PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=6cU3rP6kdAA',
      quiz: quiz5(
        mcq('Information scent helps users:', 'Predict what a link leads to', 'Ignore headings', 'Compile wasm', 'Encrypt disks'),
        mcq('Too many top-level nav items usually:', 'Overwhelms scanning and choice', 'Improves IA automatically', 'Fixes mobile keyboards', 'Replaces sitemaps'),
        mcq('Breadcrumbs shine when:', 'The hierarchy is deep or users land mid-funnel', 'There is only one page', 'You never use routing', 'Forms omit labels'),
        mcq('Consistent placement of primary actions:', 'Reduces hunt time', 'Should randomize per session', 'Requires rainbow gradients', 'Forbids keyboard use'),
        mcq('Search should handle:', 'No results and typos gracefully', 'Only exact GUID matches', 'Silent failures', 'Infinite spinners only')
      )
    },
    {
      title: 'Module 5: Design systems & handoff',
      description: 'Components, tokens, documentation, and collaboration with engineering.',
      lecture_notes_summary: 'Figma variables/tokens; props; accessibility notes in specs.',
      sample_files: [PDF.architecture],
      video_url: 'https://www.youtube.com/watch?v=EyHkJ5EuZJg',
      quiz: quiz5(
        mcq('A design token often encodes:', 'A named decision (color, space, type)', 'Raw machine code', 'Every user’s password', 'SQL migrations'),
        mcq('Component variants document:', 'Intentional states (size, emphasis)', 'Random pixel nudging only', 'Server rack layouts', 'DNS records'),
        mcq('Handoff should clarify:', 'Interaction, empty, error, and loading states', 'Only hex codes', 'Nothing about motion', 'Marketing slogans only'),
        mcq('Storybook-like catalogs help:', 'Engineers preview isolated UI states', 'Replace user research', 'Host databases', 'Sign TLS certs'),
        mcq('Design–dev drift is best reduced by:', 'Shared language and automated checks', 'Longer email chains only', 'Skipping reviews', 'Deleting documentation')
      )
    }
  ]
};

const DIGITAL_PRODUCT = {
  title: 'Digital Product Foundations',
  faculty: 'Business',
  category: 'business',
  description:
    'Stakeholders, KPIs, delivery hygiene. Bundled architecture + creativity PDFs simulate cross-disciplinary reading packs.',
  thumbnail_url: 'https://picsum.photos/seed/digital-product/800/452',
  modules: [
    {
      title: 'Module 1: Outcomes over busywork',
      description: 'KPI framing; facilitation drills from Understand Creativity excerpt.',
      lecture_notes_summary: 'OKRs, outcome mapping PDF pair.',
      sample_files: [PDF.creativity, PDF.architecture],
      video_url: 'https://www.youtube.com/watch?v=5MgBikgcWnY',
      quiz: quiz5(
        mcq('Healthy KPI characteristics include:', 'Measurable timeframe & owner', 'No baseline ever', 'Only vanity counts', 'Hidden from teams'),
        mcq('Outputs vs outcomes: shipping features is often…', 'An output; value to users is the outcome', 'Always identical', 'Irrelevant', 'Only legal compliance'),
        mcq('Leading indicators tend to:', 'Change before lagging results', 'Always arrive years later', 'Replace user feedback', 'Obviate analytics'),
        mcq('A roadmap should connect work to:', 'Problems and outcomes', 'Random sprint filler', 'Only headcount plans', 'Unrelated projects'),
        mcq('Stakeholder misalignment often shows up as:', 'Conflicting success definitions', 'Perfectly uniform metrics', 'Zero meetings', 'Identical priorities always')
      )
    },
    {
      title: 'Module 2: Tech trade-offs for PM literacy',
      description: 'Skim CO&A excerpt sections to intuit latency vs throughput when scoping backends.',
      lecture_notes_summary: 'Dependency chatty-ness vs batched workloads.',
      sample_files: [PDF.architecture],
      video_url: 'https://www.youtube.com/watch?v=6nD52yV0wN4',
      quiz: quiz5(
        mcq('Chatty microservice chatter often hurts:', 'End-to-end latency', 'JPEG compression only', 'HEIC thumbnails', 'Markdown parsing'),
        mcq('Phased rollout with flags helps:', 'Blast radius control', 'DNS encryption', 'SQL drop tables blindly', 'Removing monitoring'),
        mcq('Technical debt interest refers to:', 'Slower change and higher risk over time', 'Bank loan rates for startups', 'CDN bills only', 'Open source licenses'),
        mcq('Batch processing vs streaming suits:', 'Different latency and consistency needs', 'Identical use cases always', 'Only desktop apps', 'Only CSS'),
        mcq('Non-functional requirements include:', 'Performance, security, reliability', 'Only pixel colors', 'Only naming workshops', 'Font licensing for logos only')
      )
    },
    {
      title: 'Module 3: Discovery & problem validation',
      description: 'Interviews, journeys, and assumption testing before build.',
      lecture_notes_summary: 'Problem/solution fit; hypothesis statements; bias mitigation.',
      sample_files: [PDF.creativity, PDF.pastPaper],
      video_url: 'https://www.youtube.com/watch?v=aWQrJGbN8Po',
      quiz: quiz5(
        mcq('Open-ended interviews help:', 'Uncover goals and constraints', 'Confirm only what you already believe', 'Replace prototypes forever', 'Skip consent'),
        mcq('Assumption mapping prioritizes:', 'Risky unknowns to test first', 'Every idea equally', 'Only legal disclaimers', 'Stock tickers'),
        mcq('Jobs-to-be-done thinking focuses on:', 'Progress the user is trying to make', 'Demographics alone', 'Your feature list only', 'Internal headcount'),
        mcq('A prototype at low fidelity can:', 'Test desirability before build cost rises', 'Replace production security review', 'Ship PHI without safeguards', 'Guarantee product-market fit'),
        mcq('Confirmation bias in research is mitigated by:', 'Neutral prompts and diverse samples', 'Only talking to power users', 'Avoiding notes', 'Skipping synthesis')
      )
    },
    {
      title: 'Module 4: Delivery, agile hygiene & prioritization',
      description: 'Backlogs, estimation literacy, and sustainable pace.',
      lecture_notes_summary: 'RICE/ICE contrasts; WIP limits; definition of done.',
      sample_files: [PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=502MLrZJZpc',
      quiz: quiz5(
        mcq('A well-groomed backlog item usually has:', 'Clear value and acceptance notes', 'Only a title', 'No owner', 'Infinite scope'),
        mcq('Work in progress limits aim to:', 'Improve flow and reduce context switching', 'Stop collaboration', 'Remove QA', 'Hide metrics'),
        mcq('Tech debt paydown is best framed as:', 'Product risk reduction with expected payoff', 'Purely aesthetic preference', 'Avoiding all refactors', 'Only holiday work'),
        mcq('Sprint goals should be:', 'Coherent and achievable', 'A random grab bag', 'Entirely unrelated cards', 'Secret from stakeholders'),
        mcq('Definition of Done often includes:', 'Tested, documented, and deployable increments', 'Only code merged', 'No review', 'Undefined')
      )
    },
    {
      title: 'Module 5: Analytics, experimentation & ethics',
      description: 'Event design, A/B tests, and responsible data use.',
      lecture_notes_summary: 'North Star vs guardrails; GDPR-minded instrumentation.',
      sample_files: [PDF.architecture],
      video_url: 'https://www.youtube.com/watch?v=zOvId43XGfg',
      quiz: quiz5(
        mcq('A/B tests need:', 'Clear primary metric and sample planning', 'No hypothesis', 'Instant 100% rollouts always', 'Only post-hoc stories'),
        mcq('Cohort analyses help compare:', 'Groups over time on behavior/retention', 'CPU register widths', 'Compiler flags only', 'Paint drying'),
        mcq('Vanity metrics often:', 'Look good but mislead decisions', 'Always align with revenue', 'Replace qualitative insight', 'Fix strategy'),
        mcq('Guardrail metrics in experiments:', 'Monitor harm while optimizing a primary KPI', 'Are optional noise', 'Always rise together', 'Replace consent'),
        mcq('Ethical product analytics avoids:', 'Collecting more data than needed without purpose', 'Documenting retention policies', 'User control where required', 'Minimization principles')
      )
    }
  ]
};

const DATA_ENGINEERING = {
  title: 'Data Engineering Essentials',
  faculty: 'Computing',
  category: 'technology',
  description:
    'Relational modeling, SQL, pipelines, and data quality — aligned with modern analytics stacks.',
  thumbnail_url: 'https://picsum.photos/seed/data-eng-uts/800/450',
  modules: [
    {
      title: 'Module 1: Relational data modeling',
      description: 'Entities, keys, normalization intuition, and integrity.',
      lecture_notes_summary: '1NF–3NF sketches; surrogate vs natural keys; FK constraints.',
      sample_files: [PDF.architecture, PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=ztHopE5Wnpc',
      quiz: quiz5(
        mcq('A primary key uniquely identifies:', 'A row in a table', 'A PDF file only', 'A CSS class', 'A GPU core'),
        mcq('Foreign keys express:', 'Relationships between tables', 'Only text formatting', 'HTTP caching', 'DNS TTL'),
        mcq('Third normal form generally reduces:', 'Update anomalies from redundancy', 'All joins', 'Index usefulness', 'Query readability'),
        mcq('Surrogate keys are often:', 'System-generated stable identifiers', 'Always user emails', 'Only composite strings', 'Optional in SQL'),
        mcq('Referential integrity helps:', 'Keep related rows consistent', 'Speed up painting only', 'Replace backups', 'Hide schemas')
      )
    },
    {
      title: 'Module 2: SQL querying & joins',
      description: 'SELECT, filtering, aggregations, inner/left joins.',
      lecture_notes_summary: 'GROUP BY pitfalls; HAVING vs WHERE; NULL handling.',
      sample_files: [PDF.pastPaper],
      video_url: 'https://www.youtube.com/watch?v=9yeOJ0nMNnE',
      quiz: quiz5(
        mcq('INNER JOIN returns rows where:', 'Keys match in both relations', 'Only left table rows', 'No predicates apply', 'NULL equals NULL always'),
        mcq('LEFT JOIN preserves:', 'All rows from the left side', 'Only right-side rows', 'Neither side', 'Random samples'),
        mcq('GROUP BY typically pairs with:', 'Aggregates like COUNT/SUM', 'DDL CREATE TABLE only', 'HTTP verbs', 'CSS flex shorthand'),
        mcq('HAVING filters:', 'Groups after aggregation', 'Rows before GROUP BY only', 'Indexes only', 'Network packets'),
        mcq('COUNT(*) counts:', 'All rows in the group', 'Only non-null values in the first column', 'Distinct primary keys without GROUP BY', 'TCP handshake packets')
      )
    },
    {
      title: 'Module 3: ETL & ELT patterns',
      description: 'Ingestion, transformation layers, and orchestration overview.',
      lecture_notes_summary: 'Batch windows; idempotency; DLQ concepts.',
      sample_files: [PDF.architecture],
      video_url: 'https://www.youtube.com/watch?v=I1wvfdxqXEk',
      quiz: quiz5(
        mcq('Idempotent pipelines can safely:', 'Re-run after failures without duplicating effects', 'Never retry', 'Delete sources', 'Skip validation'),
        mcq('ELT emphasizes:', 'Load raw then transform in the warehouse', 'Transform only on laptops', 'No pipelines', 'Manual CSV paste'),
        mcq('A dead-letter queue often holds:', 'Failed records for inspection/replay', 'Successful rows only', 'UI assets', 'SSL certificates'),
        mcq('Late-arriving data in warehouses:', 'Needs policy (ignore, restate, version)', 'Never happens', 'Invalidates SQL', 'Disables indexes'),
        mcq('Schema drift in sources requires:', 'Contracts, alerts, or versioning', 'Ignoring changes', 'Hard-coded CSV paths only', 'Disabling monitoring')
      )
    },
    {
      title: 'Module 4: Data quality & testing',
      description: 'Profiling, constraints, and observability for datasets.',
      lecture_notes_summary: 'Great expectations–style checks; freshness SLAs.',
      sample_files: [PDF.creativity],
      video_url: 'https://www.youtube.com/watch?v=OMz6rFsHJcg',
      quiz: quiz5(
        mcq('Data quality dimensions include:', 'Accuracy, completeness, timeliness', 'Only row count', 'Font size', 'Hex color balance'),
        mcq('A uniqueness test fails when:', 'Duplicate keys appear unexpectedly', 'All values are null', 'Join counts rise', 'Indexes exist'),
        mcq('Profiling before modeling helps spot:', 'Skew, outliers, bad formats', 'Perfect data always', 'Legal jurisdiction only', 'HTTP verbs'),
        mcq('Freshness SLAs align with:', 'How stale data can be for decisions', 'UI animation speed', 'RAM vendor', 'DNS propagation only'),
        mcq('Row-level checks complement:', 'Aggregate dashboards for drift', 'Deleting logs', 'Ignoring sources', 'Manual secrecy')
      )
    },
    {
      title: 'Module 5: Warehousing & performance basics',
      description: 'Columnar vs row stores, partitioning, cost-aware design.',
      lecture_notes_summary: 'Clustering keys; materialized views; scan minimization.',
      sample_files: [PDF.architecture, PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=3GZiXpt7gBk',
      quiz: quiz5(
        mcq('Columnar storage often accelerates:', 'Analytic scans on few columns', 'Single-row OLTP lookups always', 'Video transcoding', 'DNS'),
        mcq('Partition pruning reduces:', 'Data scanned for filtered queries', 'All security', 'Need for SQL', 'Index existence'),
        mcq('Wide denormalized tables trade:', 'Storage and duplication for read speed', 'Nothing', 'All normalization benefits with zero cost', 'TCP for UDP'),
        mcq('Materialized views speed queries by:', 'Precomputing heavy aggregations', 'Removing indexes', 'Stopping refresh jobs', 'Disabling RBAC'),
        mcq('Cost-aware querying means:', 'Understanding credits/bytes scanned', 'Ignoring warehouse bills', 'Running SELECT * forever', 'No concurrency limits')
      )
    }
  ]
};

const MOBILE_DEV = {
  title: 'Mobile Application Development',
  faculty: 'Computing',
  category: 'technology',
  description:
    'Platform constraints, navigation, performance, and release basics for iOS/Android experiences.',
  thumbnail_url: 'https://picsum.photos/seed/mobile-dev-uts/800/450',
  modules: [
    {
      title: 'Module 1: Mobile UX foundations',
      description: 'Touch targets, gestures, interruptions, and context of use.',
      lecture_notes_summary: 'Thumb reach; one-handed use; offline expectations.',
      sample_files: [PDF.creativity],
      video_url: 'https://www.youtube.com/watch?v=0fWt7QCXwEo',
      quiz: quiz5(
        mcq('Minimum tappable areas should generally:', 'Be large enough for motor variance', 'Match 1px squares', 'Ignore WCAG', 'Use only hover'),
        mcq('Mobile sessions are often:', 'Interrupted and short', 'Always eight hours', 'Identical to desktop', 'Free of latency'),
        mcq('Platform conventions matter because:', 'Users bring learned expectations', 'They never change', 'They forbid customization', 'They replace research'),
        mcq('Orientation changes imply:', 'Responsive layouts and state preservation', 'Ignoring layout', 'Reloading OS', 'Disabling accessibility'),
        mcq('Haptic feedback should:', 'Reinforce outcomes without noise', 'Fire randomly', 'Replace visual focus', 'Only exist on servers')
      )
    },
    {
      title: 'Module 2: Navigation patterns',
      description: 'Stacks, tabs, modals, and deep linking.',
      lecture_notes_summary: 'Back stack behavior; URL/universal links intro.',
      sample_files: [PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=6te8D4B1YTk',
      quiz: quiz5(
        mcq('Tab bars suit:', 'Peer sections of equal importance', 'Long hierarchical wizards only', 'One-off destructive flows only', 'Print layouts'),
        mcq('Modal sheets often communicate:', 'Focused tasks or confirmations', 'Permanent app structure', 'Background sync only', 'Database ER diagrams'),
        mcq('Deep links enable:', 'Opening specific in-app destinations from outside', 'Replacing push permissions', 'Skipping routing', 'TLS termination'),
        mcq('Back navigation should:', 'Respect platform back expectations', 'Always exit the app', 'Never animate', 'Clear secure storage always'),
        mcq('Nested navigation needs:', 'Clear titles and state recovery', 'Infinite stacks only', 'No breadcrumbs', 'Hard-coded colors only')
      )
    },
    {
      title: 'Module 3: State & data on device',
      description: 'Local storage tiers, sync, and conflict strategies.',
      lecture_notes_summary: 'Keychain/Keystore; cache vs source of truth.',
      sample_files: [PDF.architecture],
      video_url: 'https://www.youtube.com/watch?v=7Dxr5TUNcuI',
      quiz: quiz5(
        mcq('On-device secrets should use:', 'Platform secure storage APIs', 'Plain SharedPreferences only', 'Logcat prints', 'QR codes in screenshots'),
        mcq('Offline-first patterns require:', 'Clear conflict resolution', 'Ignoring timestamps', 'Disabling retries', 'No caching'),
        mcq('Image caches help:', 'Reduce network and CPU decode churn', 'Increase APK size only', 'Replace SSL pinning', 'Remove lists'),
        mcq('Source of truth for UI should be:', 'Predictable and observable state', 'Random globals', 'Clipboard only', 'Toast messages'),
        mcq('Background fetch constraints exist because:', 'OS preserves battery and fairness', 'Apps own the CPU forever', 'Networks are infinite', 'SQLite forbids threads')
      )
    },
    {
      title: 'Module 4: Performance & profiling',
      description: 'Frame budgets, memory, and startup time.',
      lecture_notes_summary: 'Jank; overdraw; lazy lists; image sizing.',
      sample_files: [PDF.pastPaper],
      video_url: 'https://www.youtube.com/watch?v=U_hNeihvwFU',
      quiz: quiz5(
        mcq('Skipping expensive work on the UI thread reduces:', 'Jank and ANRs risk', 'Battery always to zero', 'Need for layouts', 'HTTPS'),
        mcq('Oversized bitmaps waste:', 'Memory and decode time', 'Only disk quota', 'DNS lookups', 'Git bandwidth'),
        mcq('List virtualization helps:', 'Only render visible rows', 'Render 100k children eagerly', 'Disable scrolling', 'Remove accessibility'),
        mcq('Cold start optimization targets:', 'Time to first meaningful frame', 'Compile server kernels', 'Printer DPI', 'SMTP latency'),
        mcq('Leak detection tools spot:', 'Retained objects prolonging memory use', 'Syntax errors', 'SQL typos', 'DNS misconfig only')
      )
    },
    {
      title: 'Module 5: Releases, testing & store policies',
      description: 'Beta tracks, device labs, review guidelines.',
      lecture_notes_summary: 'Feature flags; staged rollouts; privacy nutrition labels.',
      sample_files: [PDF.creativity, PDF.architecture],
      video_url: 'https://www.youtube.com/watch?v=YOSfKxSi8G8',
      quiz: quiz5(
        mcq('Staged rollouts help:', 'Limit blast radius of defects', 'Skip monitoring', 'Avoid versioning', 'Remove crash reporting'),
        mcq('TestFlight/Play internal tracks suit:', 'Dogfooding before production', 'Only marketing screenshots', 'Deleting backups', 'Public ranking only'),
        mcq('Store review commonly checks:', 'Privacy disclosures and guideline violations', 'Algorithmic proofs', 'Office lease terms', 'Printer drivers'),
        mcq('Automated UI tests complement:', 'Manual exploratory testing', 'Deleting QA', 'Only unit tests of math', 'Ignoring accessibility'),
        mcq('Version codes/names must:', 'Increase monotonically as platforms require', 'Stay fixed forever', 'Match server UUIDs', 'Include emoji only')
      )
    }
  ]
};

const CYBERSECURITY = {
  title: 'Introduction to Cybersecurity',
  faculty: 'Computing',
  category: 'technology',
  description:
    'CIA triad, threat basics, authentication, secure engineering habits for developers.',
  thumbnail_url: 'https://picsum.photos/seed/cyber-uts/800/450',
  modules: [
    {
      title: 'Module 1: Security goals & the CIA triad',
      description: 'Confidentiality, integrity, availability with real examples.',
      lecture_notes_summary: 'Ransomware vs integrity; DDoS vs availability.',
      sample_files: [PDF.architecture],
      video_url: 'https://www.youtube.com/watch?v=inWWhr5tnYU',
      quiz: quiz5(
        mcq('Confidentiality is about:', 'Preventing unauthorized disclosure', 'Guaranteed uptime only', 'Hash collisions only', 'UI spacing'),
        mcq('Integrity means:', 'Data and systems remain accurate and trusted', 'Encryption speed', 'Only network bandwidth', 'CSS grid'),
        mcq('Availability focuses on:', 'Legitimate access when needed', 'Absolute secrecy', 'Disabling logging', 'Removing backups'),
        mcq('A DDoS primarily threatens:', 'Availability', 'Confidentiality only', ' Compiler correctness', 'Font licensing'),
        mcq('Least privilege limits:', 'Damage from compromised accounts', 'All collaboration', 'Need for auditing', 'TLS adoption')
      )
    },
    {
      title: 'Module 2: Threat modeling basics',
      description: 'STRIDE-lite, assets, trust boundaries.',
      lecture_notes_summary: 'Data flow diagrams; attacker personas; mitigations.',
      sample_files: [PDF.pastPaper],
      video_url: 'https://www.youtube.com/watch?v=LK1EkJ_gW0I',
      quiz: quiz5(
        mcq('A trust boundary separates:', 'Components with different privilege levels', 'Identical processes', 'Only colors', 'HTTP from FTP always'),
        mcq('Spoofing identity is mitigated by:', 'Strong authentication', 'Disabling MFA', 'Logging only', 'Longer CSS'),
        mcq('Tampering threats target:', 'Integrity of data or code', 'Only DNS aesthetics', 'Printer toner', 'Thread pool names'),
        mcq('Repudiation concerns:', 'Denying actions without evidence', 'HTTPS ciphers', 'GPU VRAM', 'Line height'),
        mcq('Elevation of privilege means:', 'Gaining capabilities beyond intended role', 'Using TLS 1.3', 'Reading public docs', 'Caching images')
      )
    },
    {
      title: 'Module 3: Authentication & passwords',
      description: 'Hashing, MFA, session cookies, OAuth at high level.',
      lecture_notes_summary: 'Never store plaintext passwords; rotation policies.',
      sample_files: [PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=ccDHVeWDptc',
      quiz: quiz5(
        mcq('Passwords should be stored as:', 'Slow salted hashes', 'Plaintext for recovery', 'Base64 only', 'JWT header claims'),
        mcq('MFA adds factors beyond:', 'Something you know', 'Network cables', 'DNS TTL', 'Docker layers'),
        mcq('Session fixation is best mitigated by:', 'Regenerating session IDs after login', 'Longer CSS files', 'Disabling HTTPS', 'Client-side only sessions'),
        mcq('OAuth is commonly used for:', 'Delegating authorization to identity providers', 'Symmetric disk encryption only', 'CSS resets', 'Garbage collection'),
        mcq('Credential stuffing leverages:', 'Leaked passwords reused across sites', 'Quantum primality tests', 'SVG curves', 'Printer spoolers')
      )
    },
    {
      title: 'Module 4: Web app vulnerabilities overview',
      description: 'Injection, XSS, CSRF at conceptual level.',
      lecture_notes_summary: 'Prepared statements; CSP; SameSite cookies.',
      sample_files: [PDF.webTech, PDF.pastPaper],
      video_url: 'https://www.youtube.com/watch?v=4YOpILi9Oxs',
      quiz: quiz5(
        mcq('SQL injection arises when:', 'User input becomes query structure unsafely', 'You use HTTPS', 'You minify JS', 'You use grid layout'),
        mcq('XSS allows attackers to:', 'Run script in another user’s browser context', 'Speed up DNS', 'Normalize databases automatically', 'Increase RAM bandwidth'),
        mcq('Parameterized queries help prevent:', 'Injection by separating code and data', 'All logic bugs', 'CSS layout issues', 'Email delivery'),
        mcq('CSRF tricks a browser into:', 'Performing unwanted authenticated actions', 'Blocking cookies', 'Installing GPU drivers', 'Parsing PDFs locally'),
        mcq('Content Security Policy can reduce:', 'Inline script execution risks', 'Need for HTML', 'TLS usage', 'Database indexes')
      )
    },
    {
      title: 'Module 5: Secure SDLC & incident readiness',
      description: 'Reviews, dependency hygiene, logging, response basics.',
      lecture_notes_summary: 'SBOM concepts; patch SLAs; runbooks.',
      sample_files: [PDF.architecture],
      video_url: 'https://www.youtube.com/watch?v=m5lQNx0XfVQ',
      quiz: quiz5(
        mcq('Shift-left security encourages:', 'Finding issues earlier in development', 'Only post-release audits', 'Disabling tests', 'Ignoring dependencies'),
        mcq('Vulnerable dependencies should be:', 'Tracked and updated with governance', 'Pinned forever without scans', 'Copied from unknown blogs', 'Stored in cookies'),
        mcq('Security logs should be:', 'Protected, time-synced, and actionable', 'Public for transparency always', 'Disabled in prod', 'Only in Word docs'),
        mcq('An incident runbook describes:', 'Steps and roles during a breach', 'Marketing calendar', 'Typography scale', 'GPU overclocking'),
        mcq('Post-incident reviews aim to:', 'Learn and improve controls', 'Assign blame only', 'Delete evidence', 'Stop monitoring')
      )
    }
  ]
};

const CLOUD_DEVOPS = {
  title: 'Cloud Computing & DevOps',
  faculty: 'Computing',
  category: 'technology',
  description:
    'IaaS/PaaS/SaaS, containers, CI/CD, observability, and infrastructure as code.',
  thumbnail_url: 'https://picsum.photos/seed/cloud-devops-uts/800/450',
  modules: [
    {
      title: 'Module 1: Cloud service models',
      description: 'Shared responsibility, elasticity, and pricing models.',
      lecture_notes_summary: 'CapEx vs OpEx; regions/AZs; quotas.',
      sample_files: [PDF.architecture],
      video_url: 'https://www.youtube.com/watch?v=4E81BLtfU_I',
      quiz: quiz5(
        mcq('IaaS generally exposes:', 'Virtualized compute/network you manage above the OS boundary', 'Only SaaS email', 'Raw silicon only', 'DNS exclusively'),
        mcq('PaaS reduces:', 'Operational toil for runtimes/databases', 'All security responsibility', 'Need for code', 'Billing review'),
        mcq('SaaS delivers:', 'Fully managed applications', 'Only hypervisors', 'Rack screws', 'TCP specs'),
        mcq('Elasticity means:', 'Scaling resources with demand', 'Fixed capacity forever', 'Disabling autoscaling', 'Static IPs only'),
        mcq('Regions vs availability zones relate to:', 'Fault isolation and latency', 'CSS breakpoints', 'JWT algorithms', 'Printer queues')
      )
    },
    {
      title: 'Module 2: Containers & images',
      description: 'Docker basics, image layers, registries.',
      lecture_notes_summary: 'Entrypoint vs cmd; non-root users.',
      sample_files: [PDF.architecture, PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=g31MBNikb0M',
      quiz: quiz5(
        mcq('Containers share:', 'The host kernel in isolated user spaces', 'Nothing with the host', 'Physical GPUs only', 'SMTP ports exclusively'),
        mcq('Image layers help with:', 'Caching and reuse', 'Infinite mutable VM disks only', 'Removing package managers', 'DNSSEC'),
        mcq('A Dockerfile defines:', 'Build steps for an image', 'Kubernetes controllers only', 'SSL handshakes', 'SQL indexes'),
        mcq('Registries store:', 'Versioned images with metadata', 'Only source zip files', 'TLS private keys publicly', 'Word templates'),
        mcq('Running as non-root inside containers:', 'Limits blast radius', 'Is forbidden always', 'Disables networking', 'Requires VMs')
      )
    },
    {
      title: 'Module 3: CI/CD pipelines',
      description: 'Build, test, scan, deploy automation.',
      lecture_notes_summary: 'Branch protections; artifact promotion; secrets in CI.',
      sample_files: [PDF.pastPaper],
      video_url: 'https://www.youtube.com/watch?v=XWkPz9Y8LHs',
      quiz: quiz5(
        mcq('Continuous Integration emphasizes:', 'Frequent automated integration of changes', 'Yearly merges', 'Manual FTP deploys only', 'Deleting tests'),
        mcq('Continuous Delivery means:', 'Software is always releasable with automation', 'Deploying every second blindly', 'No staging', 'Only local builds'),
        mcq('Pipeline secrets should be:', 'Injected via secret managers', 'Hard-coded in YAML', 'Posted in Slack', 'Emailed as attachments'),
        mcq('Artifact immutability helps:', 'Reproducible promotions across environments', 'Random builds', 'Skipping versioning', 'Ignoring SBOM'),
        mcq('Flaky tests in CI should be:', 'Tracked and fixed or quarantined deliberately', 'Ignored silently', 'Deleted to green the build', 'Only run manually yearly')
      )
    },
    {
      title: 'Module 4: Observability — logs, metrics, traces',
      description: 'SLIs/SLOs, structured logging, distributed tracing intro.',
      lecture_notes_summary: 'RED/USE methods; sampling; cardinality pitfalls.',
      sample_files: [PDF.architecture],
      video_url: 'https://www.youtube.com/watch?v=Ijq0UTYXXis',
      quiz: quiz5(
        mcq('Structured logs improve:', 'Searchability and automated parsing', 'Only human eyeballed scrollback', 'DNS caching', 'Font rendering'),
        mcq('Metrics excel at:', 'Time-series aggregates and alerting', 'Replacing all logs', 'Storing PII safely without care', 'Debugging without context'),
        mcq('Traces help diagnose:', 'Latency across distributed calls', 'compile times only', 'Printer jams', 'SQL NULL semantics only'),
        mcq('High-cardinality labels can:', 'Explode metric storage/cost', 'Always be free', 'Replace dashboards', 'Fix bugs automatically'),
        mcq('An SLO is:', 'A target level of reliability for a service', 'A marketing slogan', 'A CSS variable', 'A legal subpoena')
      )
    },
    {
      title: 'Module 5: Infrastructure as Code',
      description: 'Declarative stacks, drift, policy as code.',
      lecture_notes_summary: 'Terraform/CloudFormation concepts; modules; state.',
      sample_files: [PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=zWw2KUIb0mo',
      quiz: quiz5(
        mcq('IaC primarily provides:', 'Repeatable, versioned infrastructure', 'Manual console clicking only', 'Dynamic DNS for pets', 'GPU overclock scripts'),
        mcq('State files track:', 'Mapping of config to real resources', 'Only git commits', 'User passwords', 'JPEG quality'),
        mcq('Drift occurs when:', 'Live resources diverge from declared config', 'Terraform formats HCL', 'Logs rotate', 'Containers restart healthily'),
        mcq('Modules in IaC encourage:', 'Reuse and consistent patterns', 'Copy-paste only', 'One-off snowflakes always', 'Deleting environments randomly'),
        mcq('Policy as code can enforce:', 'Tags, encryption, and network rules pre-deploy', 'Typography scales', 'HR schedules', 'Printer drivers')
      )
    }
  ]
};

const BUSINESS_ANALYTICS = {
  title: 'Business Analytics & Data Literacy',
  faculty: 'Business',
  category: 'business',
  description:
    'Descriptive analytics, visualization hygiene, inference intuition, and decision dashboards.',
  thumbnail_url: 'https://picsum.photos/seed/biz-analytics-uts/800/450',
  modules: [
    {
      title: 'Module 1: Descriptive analytics',
      description: 'Aggregations, distributions, cohort tables.',
      lecture_notes_summary: 'Mean vs median; percentiles; seasonality awareness.',
      sample_files: [PDF.pastPaper, PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=4mDfEmFy_hs',
      quiz: quiz5(
        mcq('The median resists:', 'Outliers better than a naive mean in skewed data', 'All uncertainty', 'Missing data always', 'Graph cycles'),
        mcq('A cohort groups users by:', 'Shared start time or trait', 'Random TCP ports', 'CSS z-index', 'Printer DPI'),
        mcq('Seasonality means:', 'Repeating patterns tied to calendar cycles', 'Data without timestamps', 'Only annual reports', 'DNS caching'),
        mcq('Variance communicates:', 'Spread around a central tendency', 'Only mode', 'Only min', 'HTTP status codes'),
        mcq('Aggregates can hide:', 'Important subgroups (Simpson’s phenomenon)', 'Nothing ever', 'All bias', 'Legal compliance')
      )
    },
    {
      title: 'Module 2: Visualization principles',
      description: 'Choosing chart types, scales, and avoiding deceit.',
      lecture_notes_summary: 'Bar vs line; dual axis risks; labeling.',
      sample_files: [PDF.creativity],
      video_url: 'https://www.youtube.com/watch?v=7xGrLoMLaM4',
      quiz: quiz5(
        mcq('Bar charts suit:', 'Comparing discrete categories', 'Continuous time series always', 'Three dimensions inherently', 'DNS lookups'),
        mcq('Truncated y-axes on bar charts can:', 'Exaggerate differences misleadingly', 'Always improve honesty', 'Fix sampling bias', 'Replace tables'),
        mcq('Lines emphasize:', 'Trends over time', 'Exact part-to-whole without caution', 'Hierarchical clusters only', 'PCI compliance'),
        mcq('Chartjunk refers to:', 'Decorative clutter that obscures data', 'Necessary gridlines', 'Alt text', 'Error bars'),
        mcq('Accessible charts need:', 'Text alternatives and sufficient contrast', 'Only color to encode categories', 'Animation always', 'Raw SQL in captions')
      )
    },
    {
      title: 'Module 3: Hypothesis testing intuition',
      description: 'Null/alternative, p-values without cargo-culting, effect sizes.',
      lecture_notes_summary: 'Power; multiple comparisons caution.',
      sample_files: [PDF.architecture],
      video_url: 'https://www.youtube.com/watch?v=0zZYBALbZgg',
      quiz: quiz5(
        mcq('A null hypothesis typically states:', 'No effect or no difference', 'The new variant always wins', 'Correlation implies causation', 'p > 0.99 always'),
        mcq('Statistical significance ≠', 'Practical importance', 'Logical notation', 'Database index', 'DNS record'),
        mcq('Effect size communicates:', 'Magnitude of a difference', 'Only sample size', 'Only NHST ritual', 'GPU FLOPs'),
        mcq('p-hacking can arise from:', 'Many optional analytical paths without preregistration', 'Preregistered plans', 'Blinded studies', 'Documented protocols'),
        mcq('Confidence intervals show:', 'A range plausible for a parameter estimate', 'Certainty at 100%', 'Causal arrows', 'TLS cipher order')
      )
    },
    {
      title: 'Module 4: Regression intuition for managers',
      description: 'Correlation, controls, overfitting at high level.',
      lecture_notes_summary: 'R² caveats; leakage; extrapolation.',
      sample_files: [PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=ZkjP5CSRjx0',
      quiz: quiz5(
        mcq('Multicollinearity can:', 'Destabilize coefficient interpretation', 'Guarantee better forecasts always', 'Remove need for labels', 'Fix data collection'),
        mcq('Overfitting means:', 'Model fits noise in training, generalizes poorly', 'Using too little data only', 'Always linear models', 'Disabling validation'),
        mcq('Extrapolating far outside training range is:', 'Risky as relationships may change', 'Always safe', 'Required', 'Only a SQL issue'),
        mcq('Control variables help:', 'Isolate relationships by accounting for confounders', 'Increase p-hacking only', 'Remove graphs', 'Replace experiments'),
        mcq('Leakage contaminates data when:', 'Future information sneaks into training features', 'You split train/test correctly', 'You normalize after split carefully', 'You log transforms labels alone')
      )
    },
    {
      title: 'Module 5: Dashboards & decision hygiene',
      description: 'KPI trees, filters, governance.',
      lecture_notes_summary: 'Self-service vs curated; certification; freshness badges.',
      sample_files: [PDF.pastPaper],
      video_url: 'https://www.youtube.com/watch?v=jbkSRLYSojo',
      quiz: quiz5(
        mcq('A dashboard should answer:', 'Specific decisions or questions', 'Every database row', 'Legal briefs', 'GPU temperatures only'),
        mcq('Too many KPIs on one screen:', 'Dilutes focus and actionability', 'Always improves clarity', 'Replaces strategy', 'Fixes data quality'),
        mcq('Certified metrics reduce:', 'Conflicting definitions across teams', 'Need for documentation', 'Governance value', 'Trust'),
        mcq('Filter cascades should be:', 'Predictable and labeled', 'Hidden state only', 'Random per session', 'Only server-side SQL text'),
        mcq('Showing data freshness helps users:', 'Judge timeliness of decisions', 'Ignore staleness', 'Skip SLAs', 'Avoid documentation')
      )
    }
  ]
};

const PROFESSIONAL_COMM = {
  title: 'Professional Communication',
  faculty: 'General Studies',
  category: 'general',
  description:
    'Audience analysis, clarity in writing, presentations, feedback, and workplace messaging.',
  thumbnail_url: 'https://picsum.photos/seed/comm-uts/800/450',
  modules: [
    {
      title: 'Module 1: Audience & purpose',
      description: 'Stakeholder mapping, context, and desired outcomes.',
      lecture_notes_summary: 'BLUF style; so-what early; jargon calibration.',
      sample_files: [PDF.creativity],
      video_url: 'https://www.youtube.com/watch?v=HERwRQS0848',
      quiz: quiz5(
        mcq('Knowing your audience guides:', 'Depth, tone, and channel', 'Only font choice', 'Nothing in tech contexts', 'Random structure'),
        mcq('Purpose answers:', 'What change should this message create?', 'Which font files exist', 'DNS TTL values', 'SQL joins only'),
        mcq('Jargon with executives should be:', 'Minimized or briefly defined', 'Maximized to sound smart', 'Only acronyms', 'In footnotes only'),
        mcq('BLUF recommends:', 'Lead with the bottom line', 'Hide conclusions until page 12', 'Only citations', 'Passive voice always'),
        mcq('Persuasion requires:', 'Credible evidence and clear asks', 'Only confidence', 'No data', 'All caps emphasis')
      )
    },
    {
      title: 'Module 2: Writing with clarity',
      description: 'Structure, plain language, redundancy trimming.',
      lecture_notes_summary: 'Topic sentences; active voice preference; skimmable headings.',
      sample_files: [PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=OIR1QufJ7H8',
      quiz: quiz5(
        mcq('Headings help readers:', 'Scan and navigate arguments', 'Hide structure', 'Replace conclusions', 'Increase word count only'),
        mcq('Active voice usually improves:', 'Agent clarity and directness', 'Word count inflation', 'Ambiguity', 'Legal risk always'),
        mcq('Redundant pairs like "end result" should be:', 'Edited to one clear word', 'Doubled for emphasis', 'Translated to Latin', 'Moved to footnotes only'),
        mcq('Paragraphs should express:', 'One main idea with supporting sentences', 'Ten unrelated facts', 'Only quotes', 'HTML tags'),
        mcq('Plain language favors:', 'Familiar words and short sentences', 'Obscure vocabulary always', 'Passive stack-ups', 'Wall-of-text blocks')
      )
    },
    {
      title: 'Module 3: Presentations that land',
      description: 'Story arc, visuals, rehearsal, timing.',
      lecture_notes_summary: 'Assertion–evidence slides; speaker notes ≠ on-slide walls.',
      sample_files: [PDF.creativity, PDF.pastPaper],
      video_url: 'https://www.youtube.com/watch?v=9tqruAThOr0',
      quiz: quiz5(
        mcq('One idea per slide tends to:', 'Improve retention and pacing', 'Waste time always', 'Require tiny fonts', 'Forbid images'),
        mcq('Speaker notes belong:', 'In the presenter view, not wall-of-text slides', 'Only on LinkedIn', 'In DNS TXT', 'Inside images only'),
        mcq('Rehearsal reveals:', 'Timing issues and awkward transitions', 'Nothing useful', 'Only typos in code', 'Printer errors'),
        mcq('Contrast on slides supports:', 'Legibility for the whole room', 'Only dark mode phones', 'DNS security', 'SQL planners'),
        mcq('A strong opening should:', 'Frame stakes and roadmap', 'Apologize for length always', 'List every acronym', 'Read slides verbatim')
      )
    },
    {
      title: 'Module 4: Feedback & difficult conversations',
      description: 'SBI model, psychological safety basics, listening.',
      lecture_notes_summary: 'Separate person from behavior; shared goals.',
      sample_files: [PDF.creativity],
      video_url: 'https://www.youtube.com/watch?v=ftJfxTwj6R4',
      quiz: quiz5(
        mcq('Actionable feedback is:', 'Specific, timely, and behavior-focused', 'Vague yearly', 'Only positive fluff', 'Public shaming'),
        mcq('SBI structures feedback as:', 'Situation–Behavior–Impact', 'Salary–Bonus–Incentive', 'SQL–Batch–Index', 'SMTP–IMAP–POP'),
        mcq('Listening to understand differs from:', 'Listening to counter immediately', 'Taking notes', 'Asking clarifiers', 'Paraphrasing'),
        mcq('Psychological safety enables:', 'Raising risks early without fear', 'Avoiding all standards', 'Zero accountability', 'Ignoring deadlines'),
        mcq('Difficult talks benefit from:', 'Private setting and shared facts', 'Email-only surprises', 'Cc-ing entire company', 'Ambiguous subjects only')
      )
    },
    {
      title: 'Module 5: Email & async workplace norms',
      description: 'Subject lines, to/cc, threads, SLAs.',
      lecture_notes_summary: 'Summarize forwards; expected response windows; inclusive tone.',
      sample_files: [PDF.pastPaper],
      video_url: 'https://www.youtube.com/watch?v=yoXFJwfQ7pE',
      quiz: quiz5(
        mcq('Subject lines should:', 'Summarize the ask or outcome', 'Be empty', 'Use vague "Hi" only', 'Hide urgency always'),
        mcq('CC implies:', 'FYI responsibility vs direct action', 'Primary accountability always', 'Secret recipients', 'Encryption'),
        mcq('Thread hijacking is poor practice because:', 'It buries context and breaks tracking', 'It improves SEO', 'It fixes bugs', 'It shortens meetings'),
        mcq('Bulleted action items help:', 'Clarify who does what by when', 'Obscure ownership', 'Replace politeness', 'Increase ambiguity'),
        mcq('Inclusive tone avoids:', 'Assumptions about background or availability', 'Clear deadlines', 'Polite openings', 'Thanks and appreciation')
      )
    }
  ]
};

const ENTREPRENEURSHIP = {
  title: 'Entrepreneurship & Innovation',
  faculty: 'Business',
  category: 'business',
  description:
    'Ideation, business models, MVPs, funding landscape, and traction metrics for early ventures.',
  thumbnail_url: 'https://picsum.photos/seed/entrepreneur-uts/800/450',
  modules: [
    {
      title: 'Module 1: Ideation & problem validation',
      description: 'Customer problems worth solving vs cool tech alone.',
      lecture_notes_summary: 'Jobs, pains, and gains; early evidence.',
      sample_files: [PDF.creativity, PDF.webTech],
      video_url: 'https://www.youtube.com/watch?v=cbwfXWnZEOY',
      quiz: quiz5(
        mcq('A venture idea needs:', 'A clearly underserved problem for a reachable market', 'Only a domain name', 'A logo', 'Perfect code first'),
        mcq('Customer interviews should avoid:', 'Leading questions that confirm bias', 'Note-taking', 'Follow-ups', 'Segmentation'),
        mcq('Beachhead markets are:', 'Initial focused segments to win first', 'Oceans only', 'Global launches day one', 'Only enterprise'),
        mcq('Competitive alternatives include:', 'Manual processes and spreadsheets, not just startups', 'Only Fortune 500', 'Nothing if you are first', 'Government only'),
        mcq('Problem statements should be:', 'Observable and painful enough to pay or switch', 'Vague inspirational quotes', 'Technology-only', 'Only feature lists')
      )
    },
    {
      title: 'Module 2: Business models & monetization',
      description: 'Value prop, revenue mechanics, unit economics intro.',
      lecture_notes_summary: 'CAC/LTV intuition; pricing experiments.',
      sample_files: [PDF.architecture],
      video_url: 'https://www.youtube.com/watch?v=8iOp6qNtyHY',
      quiz: quiz5(
        mcq('A value proposition explains:', 'Benefit and why you vs alternatives', 'Only team bios', 'Office lease terms', 'VPC subnet masks'),
        mcq('Subscription models trade:', 'Predictable revenue vs churn management', 'Nothing', 'All upfront cash always', 'Legal immunity'),
        mcq('Marketplace businesses must balance:', 'Supply and demand-side incentives', 'Only engineering hiring', 'DNS failover', 'Printer maintenance'),
        mcq('Freemium requires:', 'A path from free value to paid expansion', 'Zero costs', 'No support', 'Unlimited abuse'),
        mcq('Gross margin matters because:', 'It funds growth and R&D after COGS', 'It replaces strategy', 'It is irrelevant', 'It equals revenue always')
      )
    },
    {
      title: 'Module 3: MVPs & experiments',
      description: 'Build–measure–learn loops, smoke tests, concierge MVPs.',
      lecture_notes_summary: 'Hypothesis cards; kill/ pivot criteria.',
      sample_files: [PDF.creativity],
      video_url: 'https://www.youtube.com/watch?v=isIzsBWeW5E',
      quiz: quiz5(
        mcq('An MVP tests:', 'Riskiest assumptions with minimum effort', 'Every feature for v10', 'Only branding', 'Patent filings only'),
        mcq('A concierge MVP:', 'Manually delivers the service before automation', 'Is illegal', 'Requires ASICs', 'Skips customer contact'),
        mcq('Smoke tests can measure:', 'Willingness to click or pre-order', 'Production scalability exactly', 'Database normalization', 'GPU temps'),
        mcq('Vanity milestones include:', 'Logo awards without retention', 'Paying customers with repeat use', 'Documented pain reduction', 'NPS with follow-up'),
        mcq('Pivot means:', 'A substantive change in strategy based on learning', 'Giving up arbitrarily', 'Renaming only', 'Copying competitors blindly')
      )
    },
    {
      title: 'Module 4: Funding & cap table basics',
      description: 'Bootstrapping, angels, VC fit, dilution intuition.',
      lecture_notes_summary: 'SAFE/convertible note concepts; due diligence expectations.',
      sample_files: [PDF.pastPaper],
      video_url: 'https://www.youtube.com/watch?v=bWFUd0YMYBo',
      quiz: quiz5(
        mcq('Bootstrapping means:', 'Funding growth from revenues/customers', 'Only government grants', 'Ignoring accounting', 'Avoiding all advisors'),
        mcq('Angels often bring:', 'Capital plus network and advice', 'Guaranteed Series D', 'DNS hosting', 'Unlimited liabilities'),
        mcq('VCs typically seek:', 'High-growth scalable outcomes', 'Lifestyle cash cows only', 'Non-equity gifts', 'Guaranteed dividends'),
        mcq('Dilution happens when:', 'New shares divide ownership percentages', 'You hire employees', 'You incorporate', 'You open a bank account'),
        mcq('Due diligence reviews:', 'Legal, financial, and product claims', 'Only slide fonts', 'Printer contracts', 'Social media likes only')
      )
    },
    {
      title: 'Module 5: Traction, storytelling & persistence',
      description: 'North Star for startups, narrative, ethical growth.',
      lecture_notes_summary: 'Investor updates; resilience; compliance awareness.',
      sample_files: [PDF.webTech, PDF.creativity],
      video_url: 'https://www.youtube.com/watch?v=4dL2S7bSXX4',
      quiz: quiz5(
        mcq('Traction evidences:', 'Real demand and retention signals', 'Only pitch deck animations', 'Vanity installs only', 'Office square footage'),
        mcq('A fundraising narrative connects:', 'Problem, insight, progress, and team edge', 'Random buzzwords', 'Only technical debt', 'Personal hobbies only'),
        mcq('Ethical growth avoids:', 'Dark patterns and deceptive metrics', 'Transparent pricing', 'Honest churn reporting', 'Clear policies'),
        mcq('Investor updates should:', 'Summarize wins, asks, and risks honestly', 'Hide all bad news', 'Only GIFs', 'Arrive randomly yearly'),
        mcq('Resilience in startups includes:', 'Learning from failed experiments quickly', 'Ignoring all feedback', 'Avoiding pivots', 'Burning bridges')
      )
    }
  ]
};

const SEED_COURSES = [
  WEB_TECH,
  UI_DESIGN,
  DIGITAL_PRODUCT,
  DATA_ENGINEERING,
  MOBILE_DEV,
  CYBERSECURITY,
  CLOUD_DEVOPS,
  BUSINESS_ANALYTICS,
  PROFESSIONAL_COMM,
  ENTREPRENEURSHIP
];

async function ensureCourseWithContent (published, payload, idx, total) {
  const label = `[${idx}/${total}]`;
  const modCount = Array.isArray(payload.modules) ? payload.modules.length : 0;
  const { rows: inst } = await pool.query(
    `SELECT id FROM public.users WHERE lower(email) = lower('instructor@uts.edu.my') LIMIT 1`
  );
  const instructorId = inst[0]?.id;
  if (!instructorId) throw new Error('instructor@uts.edu.my missing — run npm run seed-users first');

  const { rows: ex } = await pool.query(
    `SELECT id FROM public.courses WHERE instructor_id = $1::uuid AND title = $2::text LIMIT 1`,
    [instructorId, payload.title]
  );
  let courseId = ex[0]?.id;
  const isNew = !courseId;
  if (!courseId) {
    courseId = await createCourse(pool, instructorId, {
      title: payload.title,
      description: payload.description,
      faculty: payload.faculty,
      category: payload.category,
      thumbnail_url: payload.thumbnail_url,
      status: published ? 'published' : 'draft'
    });
  }
  const owns = await assertInstructorOwnsCourse(pool, instructorId, courseId);
  if (!owns) throw new Error('Course ownership mismatch');

  console.log(
    `${label} course "${payload.title}" — ${isNew ? 'created' : 'existing'} id=${courseId}; replacing content (${modCount} modules)…`
  );
  await replaceCourseContent(pool, instructorId, courseId, {
    title: payload.title,
    description: payload.description,
    faculty: payload.faculty,
    category: payload.category,
    thumbnail_url: payload.thumbnail_url,
    status: published ? 'published' : 'draft',
    modules: payload.modules
  });

  let quizCount = 0;
  for (const m of payload.modules || []) {
    if (Array.isArray(m.quiz)) quizCount += m.quiz.length;
  }
  console.log(`    OK — modules=${modCount}, quiz questions≈${quizCount} (skipped empty/invalid items per repo rules)`);

  return courseId;
}

async function ensureSeed () {
  const totalCourses = SEED_COURSES.length;
  console.log('--- Seed: courses, modules, quiz_questions ---');
  console.log(`Publishing ${totalCourses} demo course(s) for instructor@uts.edu.my\n`);

  const courseIds = [];
  let idx = 0;
  for (const c of SEED_COURSES) {
    idx += 1;
    courseIds.push(await ensureCourseWithContent(true, c, idx, totalCourses));
  }
  const id1 = courseIds[0];

  const { rows: demoStudRows } = await pool.query(
    `
    SELECT id, email, student_id
    FROM public.users
    WHERE role = 'student'::text
      AND (
        upper(trim(COALESCE(student_id, ''))) = $1::text
        OR lower(email) = lower($2::text)
      )
    LIMIT 1`,
    [DEMO_STUDENT_ID, DEMO_STUDENT_EMAIL]
  );
  const ali = demoStudRows[0];
  if (!ali) {
    throw new Error(
      `Demo student ${DEMO_STUDENT_ID} (${DEMO_STUDENT_EMAIL}) missing — run npm run seed-users first`
    );
  }

  const { rows: publishedCourses } = await pool.query(
    `SELECT id, title FROM public.courses WHERE status = $1::text ORDER BY title ASC`,
    ['published']
  );
  const publishedCourseIds = publishedCourses.map((r) => String(r.id));
  const { rows: allStudents } = await pool.query(
    `SELECT id, email, student_id FROM public.users WHERE role = $1::text ORDER BY email ASC`,
    ['student']
  );

  console.log('\n--- Seed: public.course_enrollments ---');
  console.log(
    `  Students: ${allStudents.length} | Published courses (all instructors): ${publishedCourses.length}`
  );
  publishedCourses.forEach((row, i) => {
    console.log(`    [${i + 1}] ${row.id} — ${row.title}`);
  });

  const enrRes = await pool.query(
    `
    INSERT INTO public.course_enrollments (user_id, course_id)
    SELECT s.id, c.id
    FROM public.users s
    CROSS JOIN public.courses c
    WHERE s.role = $1::text AND c.status = $2::text
    ON CONFLICT (user_id, course_id) DO NOTHING`,
    ['student', 'published']
  );
  console.log(
    `  Insert attempt finished — new enrollment row(s) this run: ${enrRes.rowCount ?? 0} (0 if already seeded)`
  );

  console.log('\n--- Seed: roster variety (joined date, modules done, progress — unique per student row) ---');

  for (const course of publishedCourses) {
    const cid = course.id;
    const mods = await selectModulesForLearning(pool, cid);
    const modIds = mods.map((m) => m.id);
    const M = modIds.length;

    await pool.query(
      `
      DELETE FROM public.course_module_completion x
      USING public.course_modules m
      WHERE x.module_id = m.id
        AND m.course_id = $1::uuid
        AND x.user_id IN (SELECT id FROM public.users WHERE role = $2::text)`,
      [cid, 'student']
    );

    let si = 0;
    for (const s of allStudents) {
      const h = stableHash32(`${s.email}\0${cid}`);
      const daysBack = 8 + si * 4 + (h % 4);
      const hourJitter = (h >>> 5) % 23;
      const enrolledAt = new Date(Date.now() - ((daysBack * 24 + hourJitter) * 3600 * 1000));

      await pool.query(
        `
        UPDATE public.course_enrollments
        SET enrolled_at = $1::timestamptz
        WHERE user_id = $2::uuid AND course_id = $3::uuid`,
        [enrolledAt.toISOString(), s.id, cid]
      );

      const numComplete =
        M === 0 ? 0 : Math.min(M, (si * 19 + (h % 997) + Math.floor(h / 13) % 3) % (M + 1));

      for (let j = 0; j < numComplete; j++) {
        await pool.query(
          `
          INSERT INTO public.course_module_completion (user_id, module_id)
          VALUES ($1::uuid, $2::uuid)
          ON CONFLICT (user_id, module_id) DO NOTHING`,
          [s.id, modIds[j]]
        );
      }

      if (si < 2) {
        const pct = M ? Math.round((numComplete / M) * 100) : 0;
        console.log(
          `  "${String(course.title).slice(0, 42)}…" | ${s.email} | joined ~${daysBack}d ago | modules ${numComplete}/${M} (~${pct}%)`
        );
      }
      si++;
    }
    console.log(`  … ${allStudents.length} student(s) updated for course ${course.id}`);
  }

  console.log('\n--- Recalculating enrollment progress (all rows) ---');
  await refreshAllEnrollmentProgress();
  console.log('  OK — progress_percent refreshed for every enrollment');

  const mods1 = await selectModulesForLearning(pool, id1);
  const aliCompletionRows = mods1.length
    ? await pool.query(
        `SELECT COUNT(*)::int AS n FROM public.course_module_completion x
         INNER JOIN public.course_modules m ON m.id = x.module_id AND m.course_id = $1::uuid
         WHERE x.user_id = $2::uuid`,
        [id1, ali.id]
      )
    : { rows: [{ n: 0 }] };

  const summary = {
    seeded_course_ids: courseIds,
    seeded_course_count: courseIds.length,
    published_course_count: publishedCourseIds.length,
    students_seeded: allStudents.map((s) => ({
      id: s.id,
      email: s.email,
      student_id: s.student_id
    })),
    instructor_email: 'instructor@uts.edu.my',
    demo_student: {
      student_id: ali.student_id,
      email: ali.email,
      user_id: ali.id,
      web_tech_modules_completed: Number(aliCompletionRows.rows[0]?.n || 0),
      web_tech_module_total: mods1.length
    }
  };
  console.log('\n--- Summary (JSON) ---');
  console.log(JSON.stringify(summary, null, 2));
}

ensureSeed()
  .then(() => {
    console.log('\nOK — course seed finished.');
    return pool.end();
  })
  .catch((err) => {
    console.error(err.message || err);
    pool.end().finally(() => process.exit(1));
  });
