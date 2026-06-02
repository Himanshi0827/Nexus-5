const accountNames = [
  "ABC Healthcare", "Acme Corp", "Globex Industries", "Initech Solutions", "Umbrella Corp",
  "Hooli Inc", "Vehement Capital", "Massive Dynamic", "Soylent Corp", "Cyberdyne Systems",
  "Stark Industries", "Wayne Enterprises", "Tyrell Corp", "Oscorp", "Virtucon",
  "Blue Sun Corp", "Axiom Robotics", "Frobozz Co", "Gekko & Co", "Bluth Company"
];

// Generates a mock Salesforce/Conga integrated payload
export const generateMockAgreements = () => {
  const data = [];

  for (let i = 1; i <= 50; i++) {
    const accountName = accountNames[i % accountNames.length] + ` (${100 + i})`;
    const contractValue = Math.floor(Math.random() * 400000) + 50000; // $50k to $450k

    // Distribute risks: ~20 high, ~20 medium, ~10 healthy
    let discount = Math.floor(Math.random() * 20);
    let supportTickets = Math.floor(Math.random() * 5);
    let amendments = Math.floor(Math.random() * 4);
    let inactiveDays = Math.floor(Math.random() * 30);
    let clauseRisk = "Low";
    let quoteRevisions = Math.floor(Math.random() * 4);

    if (i <= 20) { // High Risk profiles
      discount = Math.floor(Math.random() * 25) + 26; // 26% - 50%
      supportTickets = Math.floor(Math.random() * 10) + 11; // 11 - 20
      amendments = Math.floor(Math.random() * 5) + 6; // 6 - 10
      inactiveDays = Math.floor(Math.random() * 60) + 61; // 61 - 120 days
      clauseRisk = "High";
      quoteRevisions = Math.floor(Math.random() * 5) + 6;
    } else if (i > 20 && i <= 40) { // Medium Risk profiles
      discount = Math.floor(Math.random() * 15) + 15; // 15% - 30%
      supportTickets = Math.floor(Math.random() * 6) + 5; // 5 - 10
      amendments = Math.floor(Math.random() * 3) + 3; // 3 - 5
      inactiveDays = Math.floor(Math.random() * 30) + 30; // 30 - 60 days
      clauseRisk = "Medium";
      quoteRevisions = Math.floor(Math.random() * 3) + 3;
    }

    // Heuristic Renewal Intelligence Engine Logic
    let score = 10; // base risk minimum
    if (discount > 25) score += 15;
    if (supportTickets > 10) score += 20;
    if (amendments > 5) score += 10;
    if (inactiveDays > 60) score += 25;
    if (clauseRisk === "High") score += 20;
    if (quoteRevisions > 5) score += 10;

    // Cap score at 100
    const riskScore = Math.min(score, 100);
    const probability = Math.max(100 - riskScore, 5); // Inverse of risk

    data.push({
      id: `AGR-${2026}${i}`,
      accountName,
      contractValue: `$${contractValue.toLocaleString()}`,
      renewalDate: `2026-0${Math.floor(Math.random() * 4) + 6}-15`, // June to Sept 2026
      riskScore,
      probability: `${probability}%`,
      parameters: { discount: `${discount}%`, supportTickets, amendments, inactiveDays, clauseRisk, quoteRevisions },
      aiInsights: {
        summary: `Azure AI Analysis: Flagged via Conga CLM pipeline due to ${clauseRisk.toLowerCase()} risk clauses alongside ${inactiveDays} days of CRM inactivity. Combined with a heavy ${discount}% CPQ discount, this indicates critical margin slippage and churn vulnerability.`,
        recommendations: [
          `Initiate an executive review call referencing the ${clauseRisk} liability terms.`,
          `Trigger an automated Conga CPQ quote modification reducing discount to sustainable levels.`,
          `Assign a dedicated Customer Success engineer to close out the ${supportTickets} pending cases.`
        ]
      },
      timeline: [
        { month: "March", event: "Amendment Spike", desc: `${amendments} scope changes logged in Conga CLM.` },
        { month: "April", event: "Engagement Drop", desc: `Customer interactions dropped. Inactivity hit ${inactiveDays} days.` },
        { month: "May", event: "Support Escalation", desc: `${supportTickets} high-severity customer service cases opened.` },
        { month: "June (Current)", event: "Renewal Risk Level Elevated", desc: `Intelligence Engine computed a risk score of ${riskScore}.` }
      ]
    });
  }

  return data;
};
