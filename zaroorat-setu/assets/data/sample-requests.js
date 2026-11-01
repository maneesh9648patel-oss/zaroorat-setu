/**
 * ZarooratSetu - Interactive Prototype Mockup Data
 * All names, phone numbers, and entries are sample simulation data for HackFest 3.0.
 */

window.ZAROORAT_DATA = {
  sampleRequests: [
    {
      id: "REQ-2026-001",
      title: "O-Negative Blood Donor Needed for Emergency Surgery",
      category: "Emergency",
      categoryIcon: "🚨",
      urgency: "Urgent", // Urgent > High > Normal
      urgencyScore: 98,
      location: "District Hospital, Banda (3.2 km)",
      description: "Critical trauma patient in emergency ward requires 2 units of rare O-Negative blood immediately.",
      requesterName: "Amitabh S. (Example Data)",
      requesterContact: "+91 94150 XXXXX (Example Data)",
      timeAgo: "14 mins ago",
      status: "Matched with Provider", // Submitted -> Verified -> Matched -> Handover
      statusStep: 3,
      verifier: "Dr. K. Sharma (Verified Volunteer Verifier #BND-012)",
      matchedProvider: {
        name: "Vikram Chauhan (Example Data)",
        role: "Registered Blood Donor & REC Alumni",
        distance: "1.4 km away (Civil Lines, Banda)",
        rating: "5.0 ★ (4 donations)",
        phoneMasked: "+91 98390 ••••• (Revealed upon mutual confirmation)",
        eta: "20 minutes",
        verifiedBadge: "Verified Identity & Blood Card"
      },
      timeline: [
        { title: "Submitted", time: "14 mins ago", done: true, desc: "Need request lodged via Emergency Fast-Track." },
        { title: "Verified by Human Reviewer", time: "11 mins ago", done: true, desc: "Hospital ward admit slip confirmed by Dr. Sharma." },
        { title: "Matched with Provider", time: "6 mins ago", done: true, desc: "Nearby O-Neg registered donor Vikram C. accepted alert." },
        { title: "Handover & Completion", time: "Estimated in 15 mins", done: false, desc: "Awaiting hospital verification QR scan." }
      ]
    },
    {
      id: "REQ-2026-002",
      title: "Foldable Wheelchair for 3 Weeks (Post-Ankle Fracture)",
      category: "Medical",
      categoryIcon: "🩺",
      urgency: "High",
      urgencyScore: 84,
      location: "REC Banda Faculty Quarters (0.4 km)",
      description: "Student recovered from surgery needs a wheelchair for 20 days to attend classes. Buying new costs ₹8,000.",
      requesterName: "Rahul Kushwaha (Example Data)",
      requesterContact: "+91 87654 XXXXX (Example Data)",
      timeAgo: "2 hours ago",
      status: "Matched with Provider",
      statusStep: 3,
      verifier: "Priya S. (REC Community Coordinator #REC-088)",
      matchedProvider: {
        name: "Gupta Family Surplus Pool (Example Data)",
        role: "Community Equipment Caretaker",
        distance: "0.8 km away (Near Degree College Road)",
        rating: "4.9 ★ (12 reuses)",
        phoneMasked: "+91 94501 ••••• (Revealed upon confirmation)",
        eta: "Today 5:30 PM",
        verifiedBadge: "Verified Equipment & Sanitized"
      },
      timeline: [
        { title: "Submitted", time: "2 hours ago", done: true, desc: "Request posted with doctor discharge summary." },
        { title: "Verified by Human Reviewer", time: "1 hour ago", done: true, desc: "Priya S. confirmed student identity and term." },
        { title: "Matched with Provider", time: "35 mins ago", done: true, desc: "Gupta Caretaker matched for 21-day borrow loop." },
        { title: "Pickup & Completion", time: "Today 5:30 PM", done: false, desc: "QR scan scheduled at REC Banda Gate 1." }
      ]
    },
    {
      id: "REQ-2026-003",
      title: "Casio FX-991CW Calculator & Mini Drafter for Semester Exam",
      category: "Education",
      categoryIcon: "🎓",
      urgency: "High",
      urgencyScore: 78,
      location: "REC Banda Hostel 3 (On-Campus)",
      description: "1st year mechanical engineering student needs scientific calculator and drafter for end-sem graphics exam on Monday.",
      requesterName: "Ananya Mishra (Example Data)",
      requesterContact: "+91 79050 XXXXX (Example Data)",
      timeAgo: "4 hours ago",
      status: "Verified by Reviewer",
      statusStep: 2,
      verifier: "Saurabh P. (Student Verifier #REC-ST-04)",
      matchedProvider: {
        name: "Rohit Saxena (Final Year Mechanical - Example)",
        role: "Student Mentor",
        distance: "Hostel 1, REC Banda",
        rating: "5.0 ★ (6 items lent)",
        phoneMasked: "+91 91200 ••••• (Revealed upon confirmation)",
        eta: "Available this evening",
        verifiedBadge: "REC Student ID Verified"
      },
      timeline: [
        { title: "Submitted", time: "4 hours ago", done: true, desc: "Submitted via campus intranet portal." },
        { title: "Verified by Human Reviewer", time: "3 hours ago", done: true, desc: "Confirmed exam admit card and subject code." },
        { title: "Matched with Provider", time: "In Progress", done: false, desc: "Notifying final-year hostel peers who have spare calculators." },
        { title: "Handover & Completion", time: "Pending Match", done: false, desc: "Hostel common room exchange with QR return token." }
      ]
    },
    {
      id: "REQ-2026-004",
      title: "Warm Winter Blankets (2 Pairs) for Elderly Care Home",
      category: "Items",
      categoryIcon: "📦",
      urgency: "Normal",
      urgencyScore: 62,
      location: "Atarra Road, Banda (4.1 km)",
      description: "Local shelter has welcomed two destitute seniors; clean surplus blankets or jackets needed for upcoming winter chill.",
      requesterName: "Shanti Sewa Trust (Example Data)",
      requesterContact: "+91 97931 XXXXX (Example Data)",
      timeAgo: "6 hours ago",
      status: "Verified by Reviewer",
      statusStep: 2,
      verifier: "Manish Tiwari (Civic NGO Liaison)",
      matchedProvider: null,
      timeline: [
        { title: "Submitted", time: "6 hours ago", done: true, desc: "Submitted via SMS helpline dispatch." },
        { title: "Verified by Human Reviewer", time: "4 hours ago", done: true, desc: "Volunteer visited shelter and logged need." },
        { title: "Matched with Provider", time: "Broadcast Active", done: false, desc: "Alerted registered surplus donors in Banda Central." },
        { title: "Handover & Completion", time: "Pending Match", done: false, desc: "Drop-off planned at Shanti Sewa desk." }
      ]
    },
    {
      id: "REQ-2026-005",
      title: "GATE Mechanical Engineering Previous 10 Years Question Books",
      category: "Education",
      categoryIcon: "🎓",
      urgency: "Normal",
      urgencyScore: 55,
      location: "Near Railway Station, Banda (2.0 km)",
      description: "Self-studying student preparing for GATE 2027; borrowing 2015-2025 solved papers for 2 months.",
      requesterName: "Deepak Yadav (Example Data)",
      requesterContact: "+91 93070 XXXXX (Example Data)",
      timeAgo: "Yesterday",
      status: "Submitted",
      statusStep: 1,
      verifier: "Awaiting Verifier Assignment",
      matchedProvider: null,
      timeline: [
        { title: "Submitted", time: "Yesterday", done: true, desc: "Request logged via web application." },
        { title: "Verified by Human Reviewer", time: "In Queue", done: false, desc: "Assigned to REC Library volunteer verifier." },
        { title: "Matched with Provider", time: "Pending Verification", done: false, desc: "Book repository search will trigger after approval." },
        { title: "Handover & Completion", time: "Pending", done: false, desc: "Library desk return token." }
      ]
    }
  ],

  sampleBorrowableItems: [
    {
      id: "EQUIP-091",
      title: "Foldable Lightweight Wheelchair (Aluminium)",
      category: "Medical",
      categoryIcon: "🩺",
      condition: "Excellent (Sanitized Oct 2026)",
      location: "REC Banda Dispensary Hub",
      owner: "REC Banda Community Pool (Example Data)",
      status: "Available to Borrow",
      borrowDuration: "Up to 21 Days",
      qrToken: "SETU-QR-WCH-091-VALID",
      timesReused: "8 times by 6 families",
      costSaved: "₹18,400 across all loans"
    },
    {
      id: "EQUIP-104",
      title: "Adjustable Axillary Crutches (Pair - Adult)",
      category: "Medical",
      categoryIcon: "🩺",
      condition: "Good (Rubber tips refreshed)",
      location: "Civil Lines Clinic Hub, Banda",
      owner: "Seva Samiti NGO (Example Data)",
      status: "Currently Lent (Returns Nov 4)",
      borrowDuration: "Up to 14 Days",
      qrToken: "SETU-QR-CRU-104-ACTIVE",
      timesReused: "14 times",
      costSaved: "₹11,200"
    },
    {
      id: "EQUIP-219",
      title: "Casio Scientific Calculator FX-991CW",
      category: "Education",
      categoryIcon: "🎓",
      condition: "Like New (Battery 100%)",
      location: "REC Banda Academic Block Room 102",
      owner: "Student Welfare Committee (Example Data)",
      status: "Available to Borrow",
      borrowDuration: "Exam Term (1 to 7 Days)",
      qrToken: "SETU-QR-CALC-219-VALID",
      timesReused: "23 exam sessions",
      costSaved: "₹34,500 total savings"
    },
    {
      id: "EQUIP-332",
      title: "Standard Drafting Machine (Mini-Drafter)",
      category: "Education",
      categoryIcon: "📐",
      condition: "Very Good (Scale aligned)",
      location: "Hostel 2 Common Hub",
      owner: "Senior Batch Surplus (Example Data)",
      status: "Available to Borrow",
      borrowDuration: "Semester or Exam week",
      qrToken: "SETU-QR-DRAFT-332-VALID",
      timesReused: "5 semesters",
      costSaved: "₹6,000"
    }
  ]
};
