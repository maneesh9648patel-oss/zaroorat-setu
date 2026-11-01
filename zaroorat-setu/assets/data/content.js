/**
 * ZarooratSetu - Site Content & Copy Configuration
 * Centralized content file for easy editing, translations, and updates.
 */

window.ZAROORAT_CONTENT = {
  brand: {
    name: "ZarooratSetu",
    wordmarkHtml: 'zaroorat<span class="brand-pill">setu</span>',
    tagline: "The Right Support for Every Need",
    taglineQuote: "What one person holds in surplus can be another person's necessity.",
    hackfestBadge: "HackFest 3.0 · Track 06",
    trackName: "Open Innovation, Economic Rebuilding & Civic Tech",
    officialProblemStatement: "How might we build an inclusive, low-cost community platform that connects people who need essential resources with verified individuals and organizations that can provide them, using urgency-based matching, offline request access, and reusable resource coordination?"
  },

  hero: {
    badge: "HackFest 3.0 · Track 06",
    headline: "need it? borrow it. got extra? share it.",
    subtext: "A low-cost community network that connects people who need essential resources with verified individuals and organizations, starting with the most urgent needs.",
    actions: {
      askHelp: "Ask for help",
      offerHelp: "Offer help",
      tryPrototype: "Try the prototype"
    },
    quickStats: [
      { label: "Design Principle", value: "Inclusive Civic Tech" },
      { label: "Access Mode", value: "Web + SMS + Missed Call" },
      { label: "Matching Model", value: "Urgency-First (AI + Human)" }
    ]
  },

  problem: {
    sectionTitle: "The Problem",
    sectionSubtitle: "Critical resource gaps happening every day in Tier-2/3 towns and student hubs:",
    highlightedStatement: "Connect these needs through a local, verified, priority-based network that supports donation alongside temporary lending, services and verified public-resource information.",
    cases: [
      {
        id: "education",
        category: "Education",
        title: "Student Fees & Hidden Scholarships",
        text: "A student cannot pay fees, or lacks accurate scholarship information.",
        details: "Critical exam deadlines or semester fees get missed simply because authentic financial aid schemes and textbook sharing never reach the student in time.",
        icon: "🎓",
        theme: "accent-lavender"
      },
      {
        id: "medical",
        category: "Medical",
        title: "Short-Term Medical Equipment",
        text: "A family needs a wheelchair or medical equipment for a few days, but buying is costly.",
        details: "Post-surgery recovery often requires crutches, walker, or wheelchair for 2–3 weeks. Buying costs ₹6,000–₹15,000, while dozens sit idle in nearby storerooms.",
        icon: "🩺",
        theme: "accent-coral"
      },
      {
        id: "surplus",
        category: "Surplus Items",
        title: "Unused Reusable Surplus",
        text: "Extra books, clothes and household items go unused because nobody knows who needs them.",
        details: "Graduated seniors leave behind engineering drafters, calculators, winter coats, and reference books with zero local discovery channels to pass them forward.",
        icon: "📦",
        theme: "accent-lime"
      },
      {
        id: "emergencies",
        category: "Emergencies",
        title: "Urgent Local Responders",
        text: "Blood donor, transport or local volunteer needed, but finding the right contact takes time.",
        details: "WhatsApp group broadcasts get lost in noise, forwarded spam, or stale phone numbers during the golden hours of clinical or transit emergencies.",
        icon: "🚨",
        theme: "accent-violet"
      }
    ]
  },

  solution: {
    sectionTitle: "Our Solution",
    sectionSubtitle: "How ZarooratSetu bridges the gap in 3 simple steps:",
    steps: [
      {
        number: "01",
        title: "Post a need",
        sub: "(App, SMS or missed call)",
        description: "Anyone can post a request via the web app, or dial a toll-free missed call or short SMS on a basic feature phone. Local volunteers assist in registration without digital hurdles.",
        icon: "📲",
        color: "lime"
      },
      {
        number: "02",
        title: "Get verified and matched",
        sub: "(Human reviewer confirms; AI suggests priority; nearby provider found)",
        description: "Our lightweight AI engine calculates urgency based on severity, timeframe, and resource criticality. A trusted community verifier validates the need, and the system connects a nearby verified provider.",
        icon: "🤝",
        color: "coral"
      },
      {
        number: "03",
        title: "Receive and reuse",
        sub: "(QR handover; borrowed items return to the network)",
        description: "Mutual consent protects phone privacy. Physical handovers are logged via secure QR code scans. Borrowed items trigger friendly return reminders, ensuring one item serves dozens of families.",
        icon: "🔄",
        color: "violet"
      }
    ]
  },

  features: {
    sectionTitle: "What Makes It Genuinely Different",
    sectionSubtitle: "Four purposeful design pillars engineered for real grassroots utility:",
    list: [
      {
        id: "ai-priority",
        letter: "A",
        name: "AI Need-Priority Engine",
        summary: "Priority is suggested from urgency, severity of need, available resources and waiting time, not first-come-first-served. A human verifier makes the final decision.",
        badge: "Triage Intelligence",
        icon: "🧠",
        color: "lime"
      },
      {
        id: "offline-access",
        letter: "B",
        name: "Access Without Internet",
        summary: "Feature-phone users can submit requests by missed call, SMS or assisted registration by a volunteer.",
        badge: "True Digital Inclusion",
        icon: "📶",
        color: "lavender"
      },
      {
        id: "borrow-reuse",
        letter: "C",
        name: "Borrow, Return, Reuse",
        summary: "Wheelchairs, calculators, books and tools can be borrowed temporarily, with QR handover and return reminders, so one resource serves many people.",
        badge: "Circular Utility",
        icon: "🔁",
        color: "coral"
      },
      {
        id: "verified-trust",
        letter: "D",
        name: "Verified Need, Verified Help",
        summary: "Verification, duplicate detection and completed-help confirmation reduce fake and repeated requests. Personal details are shared only as needed, after both sides agree.",
        badge: "Mutual Privacy Shield",
        icon: "🛡️",
        color: "violet"
      }
    ]
  },

  comparison: {
    sectionTitle: "Does This Already Exist?",
    sectionSubtitle: "An honest, objective evaluation of the civic tech landscape.",
    disclaimer: {
      boldClaimCheck: "The overall concept cannot be called the world's first, and originality cannot be guaranteed without checking existing products, patents and research.",
      relatedPlatforms: "Related platforms: Curaah (community health and resource coordination) and Medical Share (sharing or renting medical equipment).",
      coreInnovation: "Potential innovation is the combined system: low-internet access + urgency-based matching + verified reuse + transparent outcome tracking. Novelty of this exact combination must be validated separately."
    },
    tableHeaders: [
      "Feature / Dimension",
      "Informal WhatsApp Groups",
      "Curaah",
      "Medical Share",
      "ZarooratSetu (Our Entry)"
    ],
    rows: [
      {
        feature: "Access Without Internet",
        whatsapp: "❌ Requires active data & smartphone",
        curaah: "❌ App / Web only",
        medicalShare: "❌ Web portal only",
        zarooratsetu: "✅ Missed-call, SMS & volunteer-assisted offline intake"
      },
      {
        feature: "Request Prioritization",
        whatsapp: "❌ Chronological / flood spam",
        curaah: "⚠️ Basic triage filters",
        medicalShare: "❌ Commercial rental listing",
        zarooratsetu: "✅ AI urgency score + mandatory human verifier sign-off"
      },
      {
        feature: "Reusable Asset Coordination",
        whatsapp: "❌ Lost in chat logs",
        curaah: "⚠️ Primarily medical referrals",
        medicalShare: "✅ Medical equipment renting",
        zarooratsetu: "✅ Multi-category lending (Medical, Education, Items) + QR return reminders"
      },
      {
        feature: "Verification & Fraud Shield",
        whatsapp: "❌ Zero checks, frequent fraud",
        curaah: "⚠️ NGO partner check",
        medicalShare: "⚠️ Commercial identity",
        zarooratsetu: "✅ Dual-sided verification + fuzzy duplicate detection"
      },
      {
        feature: "Privacy & Contact Masking",
        whatsapp: "❌ Phone numbers public to all members",
        curaah: "⚠️ In-app messaging",
        medicalShare: "⚠️ Business contact",
        zarooratsetu: "✅ Mutual-consent masked contact details"
      },
      {
        feature: "Outcome & Impact Tracking",
        whatsapp: "❌ Unverified outcomes",
        curaah: "⚠️ Internal health tracking",
        medicalShare: "❌ Rental transaction logs",
        zarooratsetu: "✅ Open civic ledger of verified handovers & cost savings"
      }
    ]
  },

  pilot: {
    sectionTitle: "Pilot Plan & Impact",
    sectionSubtitle: "Starting grounded at Rajkiya Engineering College (REC) Banda before broader municipal rollout.",
    recommendation: "Pilot first at REC Banda and nearby areas with students, local NGOs and community volunteers. Show real requests and measure: how many requests were verified, how many were successfully fulfilled, and how much cost was saved. Working prototype and measured impact are more convincing to judges than just saying 'AI-powered'.",
    metricsNote: "To be measured in the pilot. We strictly refuse to invent fake statistics, testimonials or partner numbers.",
    metrics: [
      {
        id: "verified-count",
        label: "Requests Verified by Humans",
        status: "to be measured in the pilot",
        unit: "verified requests",
        target: "Target: 150+ in Month 1",
        description: "Total community requests inspected, verified for genuine urgency, and approved by human coordinators."
      },
      {
        id: "fulfilled-count",
        label: "Successfully Fulfilled",
        status: "to be measured in the pilot",
        unit: "completed handovers",
        target: "Target: 80%+ fulfillment",
        description: "Requests that reached physical handover confirmed via QR code scan and mutual confirmation."
      },
      {
        id: "cost-saved",
        label: "Community Cost Saved",
        status: "to be measured in the pilot",
        unit: "₹ in user savings",
        target: "Target: ₹2.5L+ saved",
        description: "Calculated from retail cost of equipment/books borrowed instead of purchased by struggling families."
      }
    ],
    milestones: [
      {
        stage: "Stage 01 · On-Campus Hub",
        location: "REC Banda Campus & Hostels",
        focus: "Engineering textbooks, Drafters, Casio scientific calculators, emergency transport to Banda district hospital."
      },
      {
        stage: "Stage 02 · Urban-Rural Periphery",
        location: "Banda City & Atarra Block",
        focus: "Wheelchairs, crutches, post-operative equipment lending, winter clothing surplus drives with local youth clubs."
      },
      {
        stage: "Stage 03 · Civic NGO Federation",
        location: "Bundelkhand Civic Network",
        focus: "Integration with local civil society organizations, blood donor pools, and district administration helplines."
      }
    ]
  },

  responsibleDesign: {
    sectionTitle: "Responsible Design & Ethics",
    sectionSubtitle: "Building civic technology that protects human dignity, vulnerable users, and data privacy.",
    pillars: [
      {
        title: "Mutual Consent Privacy",
        text: "Personal phone numbers and exact home locations are NEVER exposed on public feeds. Contact details are shared only as needed, after both sides agree.",
        icon: "🔒"
      },
      {
        title: "Human-in-the-Loop AI",
        text: "The AI urgency engine suggests a priority rank, but an accountable human verifier makes the final call. Algorithms never unilaterally deny support.",
        icon: "👥"
      },
      {
        title: "Anti-Fraud & Duplicate Shield",
        text: "Fuzzy text matching and device/phone heuristics identify duplicate or spam requests across neighborhoods without invasive biometric tracking.",
        icon: "🛡️"
      },
      {
        title: "Low-Literacy & Offline Accessibility",
        text: "Designed with large typography, universal visual cues, audio-assisted prompts, and missed-call intake for citizens without smartphones or English literacy.",
        icon: "♿"
      }
    ]
  },

  roadmap: {
    sectionTitle: "Roadmap & Team",
    sectionSubtitle: "A pragmatic execution path from hackathon concept to measurable civic impact.",
    phases: [
      {
        phase: "Phase 1",
        title: "Interactive Prototype",
        status: "Completed (HackFest 3.0)",
        timeline: "Current Milestone",
        desc: "Complete responsive frontend prototype, offline PWA, urgency heuristics, and stakeholder user test flows."
      },
      {
        phase: "Phase 2",
        title: "Pilot at REC Banda",
        status: "Next Step",
        timeline: "Month 1 - 2",
        desc: "Deploy localized instance at REC Banda campus with student council, hostel marshals, and local volunteers."
      },
      {
        phase: "Phase 3",
        title: "NGO & Community Partnerships",
        status: "Planned",
        timeline: "Month 3 - 4",
        desc: "Partner with verified local NGOs in Banda to onboard medical surplus equipment, blood donor registries, and verifiers."
      },
      {
        phase: "Phase 4",
        title: "Wider Regional Rollout",
        status: "Vision",
        timeline: "Month 5+",
        desc: "Scale open-source protocol across Bundelkhand university clusters and municipal civic citizen portals."
      }
    ],
    team: [
      {
        name: "[Team member name]",
        role: "[Project Lead & Full-Stack Developer]",
        note: "System architecture, offline accessibility workflows, and responsive interface development."
      },
      {
        name: "[Team member name]",
        role: "[Product Designer & UX Researcher]",
        note: "Civic UX, neo-brutalist accessibility design, and field interview protocols."
      },
      {
        name: "[Team member name]",
        role: "[Community Coordinator & Verifier Lead]",
        note: "REC Banda pilot liaison, local NGO outreach, and verification process design."
      }
    ]
  },

  join: {
    sectionTitle: "Join as Helper",
    sectionSubtitle: "Whether you have surplus items, time to verify, or skills to share — become a Setu.",
    disclaimer: "Front-end demonstration only for HackFest 3.0. Form validates locally and displays an interactive simulation receipt. No real server data is collected.",
    contactInfo: {
      email: "[Email: contact@zarooratsetu.org]",
      phone: "[Phone: +91 98765 XXXXX]",
      location: "REC Banda, Uttar Pradesh, India"
    }
  }
};
