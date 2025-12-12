export interface Lead {
  id: string;
  name: string;
  email: string;
  status: "new" | "open" | "in_progress" | "closed";
  source: string;
  createdAt: string;
  summary: string; // The "short" summary displayed in the table
  messages: string[]; // Long messages for AI analysis
}

export const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@techcorp.com",
    status: "new",
    source: "Chat Widget",
    createdAt: "2024-12-01T10:30:00Z",
    summary: "Interested in enterprise plan for team of 50+",
    messages: [
      "Hi there, I'm looking into your enterprise solutions.",
      "We have a team of about 55 people right now, but we're hiring aggressively and expect to be at 80 by Q3.",
      "Our budget is around $50k annually for this kind of tooling. We need something that can handle SSO and has strict audit logs.",
      "We're looking to make a decision by the end of next month so we can onboard in January.",
    ],
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@startup.io",
    status: "in_progress",
    source: "Contact Form",
    createdAt: "2024-11-28T14:20:00Z",
    summary: "Looking for pricing on SMB package",
    messages: [
      "Hello, I saw your pricing page but I have some questions about the SMB tier.",
      "We are a small startup, seeded recently. We need to move fast.",
      "Do you offer any discounts for startups? We have a budget of roughly $500/month.",
      "We need the service to be live within 2 weeks. Is that possible?",
      "Also, we primarily need the analytics features, not the automation ones yet.",
    ],
  },
  {
    id: "3",
    name: "Carol White",
    email: "carol@agency.com",
    status: "open",
    source: "Chat Widget",
    createdAt: "2024-11-25T09:15:00Z",
    summary: "Wants demo for entire team",
    messages: [
      "Hi, can we schedule a demo?",
      "I run a marketing agency with 12 account managers.",
      "We are struggling with keeping track of client comms. We need a unified inbox.",
      "Budget isn't a huge blocker if the value is there, but probably looking at the $1-2k/month range.",
      "Timeline is flexible, but ideally before our busy season starts in March.",
    ],
  },
  {
    id: "4",
    name: "David Lee",
    email: "david@corp.com",
    status: "closed",
    source: "Referral",
    createdAt: "2024-11-20T16:45:00Z",
    summary: "Purchased annual enterprise license",
    messages: [
      "Reference from John at PartnerCorp.",
      "We're ready to move forward with the Enterprise license.",
      "Procurement has approved the $120k budget.",
      "Please send the contract for review. We want to start implementation immediately.",
    ],
  },
  {
    id: "5",
    name: "Eva Martinez",
    email: "eva@business.net",
    status: "new",
    source: "Chat Widget",
    createdAt: "2024-12-02T11:00:00Z",
    summary: "Asking about API integrations",
    messages: [
      "Does your platform support GraphQL?",
      "We need to integrate this with our internal dashboard.",
      "We are just exploring options right now, no set budget or timeline yet.",
      "Just doing a technical feasibility study.",
    ],
  },
];
