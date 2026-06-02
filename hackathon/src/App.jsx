
// import React, { useEffect, useMemo, useState } from 'react';
// import {  getAccountById, getAccessToken, login,getAgreement } from './API/api';
// import { GetRecords } from './API/Records';
// import { generateMockAgreements } from './mockSalesforceData';

// const parseNumber = (value) => {
//   if (value == null) return 0;
//   const cleaned = String(value).replace(/[^0-9.-]/g, '');
//   const result = Number(cleaned);
//   return Number.isFinite(result) ? result : 0;
// };

// const formatMoney = (value) => {
//   if (typeof value === 'number') return `$${value.toLocaleString()}`;
//   if (!value) return 'N/A';
//   return String(value);
// };

// const makeDefaultAgreement = () => ({
//   id: 'placeholder',
//   accountName: 'Loading agreement data...',
//   contractValue: 'N/A',
//   renewalDate: 'TBD',
//   riskScore: 0,
//   probability: '0%',
//   parameters: {
//     discount: '0%',
//     supportTickets: 0,
//     amendments: 0,
//     inactiveDays: 0,
//     clauseRisk: 'Low',
//     quoteRevisions: 0
//   },
//   aiInsights: {
//     summary: 'API connection in progress. Once the record loads, key account values appear here.',
//     recommendations: ['Waiting for agreement record to load.']
//   },
//   timeline: [
//     { month: 'TBD', event: 'Pending', desc: 'Awaiting live agreement data from the API.' }
//   ]
// });

// const normalizeAgreement = (record, index) => {
//   const rawParameters = record.parameters || {};
//   const discountRaw = record.Discount__c || record.Discount || record.discount || rawParameters.discount;
//   const supportTicketsRaw = record.SupportTickets__c || record.SupportTickets || record.supportTickets || rawParameters.supportTickets;
//   const inactiveDaysRaw = record.InactiveDays__c || record.InactiveDays || record.inactiveDays || rawParameters.inactiveDays;
//   const clauseRiskRaw = record.ClauseRisk__c || record.ClauseRisk || record.clauseRisk || rawParameters.clauseRisk;
//   const quoteRevisionsRaw = record.QuoteRevisions__c || record.QuoteRevisions || record.quoteRevisions || rawParameters.quoteRevisions;

//   const discountValue = parseNumber(discountRaw);
//   const inactiveDays = parseNumber(inactiveDaysRaw);
//   const supportTickets = parseNumber(supportTicketsRaw);
//   const quoteRevisions = parseNumber(quoteRevisionsRaw);

//   const clauseRisk = clauseRiskRaw || (inactiveDays > 45 ? 'High' : inactiveDays > 20 ? 'Medium' : 'Low');
//   const baseRisk = 30 + Math.min(discountValue, 40) + Math.min(supportTickets * 4, 40) + (inactiveDays > 30 ? 15 : 0) + (clauseRisk === 'High' ? 15 : clauseRisk === 'Medium' ? 8 : 0);
//   const riskScore = Math.min(100, Math.max(5, Math.round(baseRisk)));
//   const probability = `${Math.max(5, 100 - riskScore)}%`;

//   return {
//     id: record.Id || record.id || record.AgreementId || record.AgreementNumber || `API-${index}`,
//     accountId: record.AccountId || (record.Account && (record.Account.Id || record.Account.Id__c)) || record.AccountId__c || record.accountId || null,
//     accountName: record.Name || record.AccountName || (record.Account && (record.Account.Name || record.Account.AccountName)) || record.CompanyName || `Agreement ${index + 1}`,
//     contractValue: formatMoney(record.ContractValue__c || record.ContractValue || record.Amount || record.contractValue),
//     renewalDate: record.RenewalDate__c || record.RenewalDate || record.renewalDate || record.EndDate || 'TBD',
//     riskScore,
//     probability,
//     parameters: {
//       discount: `${discountValue}%`,
//       supportTickets,
//       amendments: parseNumber(record.Amendments__c || record.amendments || rawParameters.amendments),
//       inactiveDays,
//       clauseRisk,
//       quoteRevisions
//     },
//     aiInsights: {
//       summary:
//         record.AI_Summary__c || record.AnalysisSummary || record.aiSummary ||
//         `Live API agreement loaded for ${record.Name || record.AccountName || record.Account || `record ${index + 1}`}.`,
//       recommendations: [
//         record.Recommendation1__c || `Review the current renewal terms and work with the customer success team.`,
//         record.Recommendation2__c || `Check open support cases and reduce renewal friction.`,
//         record.Recommendation3__c || `Confirm contract value and discount exposure before next customer touchpoint.`
//       ]
//     },
//     timeline: [
//       { month: 'Current', event: 'API record loaded', desc: `Agreement data loaded from the Conga API source.` },
//       { month: 'TBD', event: 'Additional insights', desc: `More historical events can be shown once the API record includes timeline fields.` }
//     ]
//   };
// };

// const normalizeResults = (result) => {
//   const items = Array.isArray(result.Data)
//     ? result.Data
//     : Array.isArray(result.data)
//     ? result.data
//     : Array.isArray(result)
//     ? result
//     : [];

//   return items.map(normalizeAgreement);
// };

// export default function App() {
//   const [agreements, setAgreements] = useState([]);
//   const [isAuthenticated, setIsAuthenticated] = useState(Boolean(sessionStorage.getItem('user') || getAccessToken()));
//   const [selectedAccId, setSelectedAccId] = useState(null);
//   const [currentPage, setCurrentPage] = useState('dashboard');
//   const [accountsMap, setAccountsMap] = useState({});
//   const [accountDetails, setAccountDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const onLogin = () => setIsAuthenticated(true);
//     window.addEventListener('user-logged-in', onLogin);
//     return () => window.removeEventListener('user-logged-in', onLogin);
//   }, []);

//   useEffect(() => {
//     const loadAgreements = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const result = await getAgreement();
//         const normalized = normalizeResults(result);

//         if (!normalized.length) {
//           throw new Error('API returned no agreement records. Using fallback mock data.');
//         }

//         // attempt to fetch accounts and map by Id
//         try {
//           const accResult = await GetRecords('Account');
//           const accItems = Array.isArray(accResult)
//             ? accResult
//             : Array.isArray(accResult.Data)
//             ? accResult.Data
//             : Array.isArray(accResult.data)
//             ? accResult.data
//             : [];

//           const map = {};
//           accItems.forEach((a) => {
//             const id = a.Id || a.id || a.AccountId || a.AccountId__c;
//             if (id) map[id] = a;
//           });
//           setAccountsMap(map);

//           // merge account names into normalized agreements when possible
//           const merged = normalized.map((ag) => {
//             if (ag.accountId && map[ag.accountId]) {
//               return { ...ag, accountName: map[ag.accountId].Name || map[ag.accountId].name || ag.accountName };
//             }
//             return ag;
//           });

//           setAgreements(merged);
//           setSelectedAccId(merged[0].id);
//         } catch (accErr) {
//           // if accounts fetch fails, fallback to agreements only
//           console.warn('Account fetch failed, continuing with agreements only', accErr);
//           setAgreements(normalized);
//           setSelectedAccId(normalized[0].id);
//         }
//       } catch (err) {
//         console.error('Agreement API error:', err);
//         setError(err?.message || 'Unable to fetch agreement data from API.');
//         const fallback = generateMockAgreements();
//         setAgreements(fallback);
//         setSelectedAccId(fallback[0].id);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadAgreements();
//   }, []);

//   const allAgreements = agreements.length ? agreements : [makeDefaultAgreement()];
//   const currentAgreement = allAgreements.find((a) => a.id === selectedAccId) || allAgreements[0] || makeDefaultAgreement();

//   // when an agreement is selected for details, try to fetch full account details
//   useEffect(() => {
//     const loadAccountDetails = async () => {
//       if (!selectedAccId || currentPage !== 'details') return;
//       const ag = allAgreements.find((x) => x.id === selectedAccId);
//       if (!ag || !ag.accountId) {
//         setAccountDetails(null);
//         return;
//       }

//       try {
//         const acc = await getAccountById(ag.accountId);
//         setAccountDetails(acc || null);
//       } catch (err) {
//         console.warn('Failed to load account details for', ag.accountId, err);
//         setAccountDetails(null);
//       }
//     };

//     loadAccountDetails();
//   }, [selectedAccId, currentPage, allAgreements]);

//   const stats = useMemo(() => {
//     const high = allAgreements.filter((a) => a.riskScore > 60).length;
//     const med = allAgreements.filter((a) => a.riskScore > 30 && a.riskScore <= 60).length;
//     const low = allAgreements.filter((a) => a.riskScore <= 30).length;
//     return { high, med, low, total: allAgreements.length };
//   }, [allAgreements]);

//   const getRiskStatus = (score) => {
//     if (score > 60) return { label: 'High Risk', color: '#DC2626', bg: '#FEE2E2' };
//     if (score > 30) return { label: 'Medium Risk', color: '#D97706', bg: '#FEF3C7' };
//     return { label: 'Healthy', color: '#059669', bg: '#D1FAE5' };
//   };

//   return (
//     <div style={styles.appContainer}>
//       <nav style={styles.navbar}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//           <div style={styles.logoIcon}>⚡</div>
//           <div>
//             <h1 style={styles.navTitle}>Conga + Salesforce Renewal Intelligence Hub</h1>
//             <p style={styles.navSubtitle}>Enterprise Risk Scoring Architecture & AI Explainability Layer</p>
//           </div>
//         </div>
//         <div style={styles.navButtonGroup}>
//           <button
//             style={{
//               ...styles.navBtn,
//               backgroundColor: currentPage === 'dashboard' ? '#2563EB' : 'transparent',
//               color: currentPage === 'dashboard' ? '#FFF' : '#374151'
//             }}
//             onClick={() => setCurrentPage('dashboard')}
//           >
//             📊 Executive Dashboard
//           </button>
//           <button
//             style={{
//               ...styles.navBtn,
//               backgroundColor: currentPage === 'details' ? '#2563EB' : 'transparent',
//               color: currentPage === 'details' ? '#FFF' : '#374151'
//             }}
//             onClick={() => setCurrentPage('details')}
//           >
//             🔍 Deep-Dive Inspection {(accountDetails && (accountDetails.Name || accountDetails.name)) || currentAgreement.accountName.split(' ')[0]}
//           </button>

//           {!isAuthenticated ? (
//             <button style={{ ...styles.navBtn, backgroundColor: '#10B981', color: '#fff' }} onClick={() => login()}>
//               🔐 Sign in
//             </button>
//           ) : (
//             <button
//               style={{ ...styles.navBtn, backgroundColor: 'transparent', color: '#374151' }}
//               onClick={() => {
//                 sessionStorage.removeItem('user');
//                 setIsAuthenticated(false);
//               }}
//             >
//               ⎋ Sign out
//             </button>
//           )}
//         </div>
//       </nav>

//       {loading && (
//         <div style={{ marginBottom: '24px', color: '#1F2937' }}>
//           Loading live agreement data from the API...{error ? ` Error: ${error}` : ''}
//         </div>
//       )}

//       {!loading && error && (
//         <div style={{ marginBottom: '24px', color: '#B91C1C' }}>
//           API fallback active. Showing generated mock data while live data is unavailable.
//         </div>
//       )}

//       {currentPage === 'dashboard' && (
//         <div>
//           <div style={styles.statsRow}>
//             <div style={{ ...styles.statBox, borderLeft: '6px solid #DC2626' }}>
//               <span style={styles.statLabel}>High Risk Accounts</span>
//               <span style={{ ...styles.statVal, color: '#DC2626' }}>{stats.high}</span>
//             </div>
//             <div style={{ ...styles.statBox, borderLeft: '6px solid #D97706' }}>
//               <span style={styles.statLabel}>Medium Risk Attention</span>
//               <span style={{ ...styles.statVal, color: '#D97706' }}>{stats.med}</span>
//             </div>
//             <div style={{ ...styles.statBox, borderLeft: '6px solid #059669' }}>
//               <span style={styles.statLabel}>Healthy / Stable Pipelines</span>
//               <span style={{ ...styles.statVal, color: '#059669' }}>{stats.low}</span>
//             </div>
//             <div style={{ ...styles.statBox, borderLeft: '6px solid #6B7280' }}>
//               <span style={styles.statLabel}>Total Analyzed Agreements</span>
//               <span style={styles.statVal}>{stats.total}</span>
//             </div>
//           </div>

//           <div style={styles.card}>
//             <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#111827' }}>Live Conga CLM Contract Audit Stream</h3>
//             <div style={{ overflowX: 'auto' }}>
//               <table style={styles.table}>
//                 <thead>
//                   <tr style={styles.thRow}>
//                     <th style={styles.th}>Account Reference</th>
//                     <th style={styles.th}>Contract Value</th>
//                     <th style={styles.th}>Discount %</th>
//                     <th style={styles.th}>Inactivity (Days)</th>
//                     <th style={styles.th}>Clause Complexity</th>
//                     <th style={styles.th}>Engine Risk Score</th>
//                     <th style={{ ...styles.th, textAlign: 'right' }}>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {allAgreements.map((item) => {
//                     const status = getRiskStatus(item.riskScore);
//                     return (
//                       <tr key={item.id} style={styles.tr}>
//                         <td style={{ ...styles.td, fontWeight: '600', color: '#111827' }}>{(accountsMap[item.accountId] && (accountsMap[item.accountId].Name || accountsMap[item.accountId].name)) || item.accountName}</td>
//                         <td style={styles.td}>{item.contractValue}</td>
//                         <td style={styles.td}>{item.parameters.discount}</td>
//                         <td style={styles.td}>{item.parameters.inactiveDays} Days</td>
//                         <td style={styles.td}>
//                           <span
//                             style={{
//                               fontSize: '12px',
//                               padding: '2px 6px',
//                               borderRadius: '4px',
//                               backgroundColor: item.parameters.clauseRisk === 'High' ? '#FEE2E2' : '#F3F4F6',
//                               color: item.parameters.clauseRisk === 'High' ? '#991B1B' : '#374151'
//                             }}
//                           >
//                             {item.parameters.clauseRisk}
//                           </span>
//                         </td>
//                         <td style={styles.td}>
//                           <span style={{ ...styles.badge, backgroundColor: status.bg, color: status.color }}>
//                             {item.riskScore} ({status.label})
//                           </span>
//                         </td>
//                         <td style={{ ...styles.td, textAlign: 'right' }}>
//                           <button
//                             style={styles.actionLink}
//                             onClick={() => {
//                               setSelectedAccId(item.id);
//                               setCurrentPage('details');
//                             }}
//                           >
//                             Analyze →
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {currentPage === 'details' && (
//         <div style={styles.gridSplit}>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//             <div style={styles.card}>
//               <span style={{ fontSize: '12px', color: '#4B5563', fontWeight: 'bold' }}>SALESFORCE REVENUE CONTEXT</span>
//               <h2 style={{ margin: '4px 0 16px 0', fontSize: '22px' }}>{(accountDetails && (accountDetails.Name || accountDetails.name)) || currentAgreement.accountName}</h2>
//               <div style={styles.paramsGrid}>
//                 <div style={styles.paramItem}><strong>Contract ID:</strong> {currentAgreement.id}</div>
//                 <div style={styles.paramItem}><strong>ARR Value:</strong> {currentAgreement.contractValue}</div>
//                 <div style={styles.paramItem}><strong>Target Expiry:</strong> {currentAgreement.renewalDate}</div>
//                 <div style={styles.paramItem}><strong>CPQ Discount:</strong> {currentAgreement.parameters.discount}</div>
//                 <div style={styles.paramItem}><strong>Quote Revisions:</strong> {currentAgreement.parameters.quoteRevisions} Iterations</div>
//                 <div style={styles.paramItem}><strong>Open Cases:</strong> {currentAgreement.parameters.supportTickets} Tickets</div>
//               </div>

//               {accountDetails && (
//                 <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
//                   <div style={{ fontWeight: '700', marginBottom: '6px' }}>Account Details</div>
//                   <div style={{ fontSize: '14px', color: '#374151' }}><strong>Name:</strong> {accountDetails.Name || accountDetails.name}</div>
//                   {accountDetails.Industry && <div style={{ fontSize: '14px', color: '#374151' }}><strong>Industry:</strong> {accountDetails.Industry}</div>}
//                   {accountDetails.Phone && <div style={{ fontSize: '14px', color: '#374151' }}><strong>Phone:</strong> {accountDetails.Phone}</div>}
//                   {accountDetails.BillingCity && <div style={{ fontSize: '14px', color: '#374151' }}><strong>City:</strong> {accountDetails.BillingCity}</div>}
//                 </div>
//               )}

//               <div style={{ ...styles.engineOutputBox, borderColor: getRiskStatus(currentAgreement.riskScore).color }}>
//                 <div>
//                   <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#4B5563' }}>INTELLIGENCE CALCULATION</div>
//                   <div style={{ fontSize: '32px', fontWeight: '800', margin: '4px 0', color: getRiskStatus(currentAgreement.riskScore).color }}>
//                     {currentAgreement.riskScore} / 100
//                   </div>
//                 </div>
//                 <div style={{ textAlign: 'right' }}>
//                   <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#4B5563' }}>RENEWAL PROBABILITY</div>
//                   <div style={{ fontSize: '32px', fontWeight: '800', margin: '4px 0', color: '#2563EB' }}>
//                     {currentAgreement.probability}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div style={styles.card}>
//               <h3 style={{ marginTop: 0, color: '#111827' }}>Historical AI Risk Timeline</h3>
//               <div style={styles.timelineContainer}>
//                 {currentAgreement.timeline.map((item, index) => (
//                   <div key={index} style={styles.timelineNode}>
//                     <div style={styles.timelineDot}></div>
//                     <div style={styles.timelineContent}>
//                       <span style={styles.timelineMonth}>{item.month}</span>
//                       <strong style={styles.timelineEvent}>{item.event}</strong>
//                       <p style={styles.timelineDesc}>{item.desc}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//             <div style={{ ...styles.card, backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}>
//               <h3 style={{ marginTop: 0, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 <span>✨</span> Azure AI Foundry Explanation Layer
//               </h3>
//               <p style={{ lineHeight: '1.6', color: '#1E3A8A', margin: 0 }}>{currentAgreement.aiInsights.summary}</p>
//             </div>

//             <div style={styles.card}>
//               <h3 style={{ marginTop: 0, color: '#111827' }}>Prescriptive Action Matrix</h3>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                 {currentAgreement.aiInsights.recommendations.map((rec, idx) => (
//                   <div key={idx} style={styles.recItem}>
//                     <div style={styles.recNumber}>{idx + 1}</div>
//                     <div style={{ color: '#374151', fontSize: '14px', lineHeight: '1.4' }}>{rec}</div>
//                   </div>
//                 ))}
//               </div>

//               <button
//                 style={styles.emailGenBtn}
//                 onClick={() => alert(`Generated Draft Email for ${currentAgreement.accountName}:\n\n\"Dear Customer, We noticed issues regarding outstanding engineering cases...\"`)}
//               >
//                 ✉️ Auto-Draft Recovery Communications
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// const styles = {
//   appContainer: { fontFamily: 'Segoe UI, system-ui, sans-serif', backgroundColor: '#F3F4F6', minHeight: '100vh', padding: '24px', boxSizing: 'border-box' },
//   navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px', border: '1px solid #E5E7EB', flexWrap: 'wrap', gap: '16px' },
//   logoIcon: { fontSize: '24px', background: '#DBEAFE', padding: '8px', borderRadius: '8px' },
//   navTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' },
//   navSubtitle: { margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' },
//   navButtonGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
//   navBtn: { border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' },
//   statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' },
//   statBox: { backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', border: '1px solid #E5E7EB' },
//   statLabel: { fontSize: '12px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' },
//   statVal: { fontSize: '28px', fontWeight: '800', marginTop: '6px', color: '#111827' },
//   card: { backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' },
//   table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
//   thRow: { borderBottom: '2px solid #E5E7EB' },
//   th: { padding: '12px 16px', color: '#4B5563', fontSize: '13px', fontWeight: '600' },
//   tr: { borderBottom: '1px solid #E5E7EB' },
//   td: { padding: '14px 16px', fontSize: '14px', color: '#4B5563' },
//   badge: { fontSize: '12px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px' },
//   actionLink: { background: 'none', border: 'none', color: '#2563EB', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
//   gridSplit: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' },
//   paramsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '16px 0' },
//   paramItem: { fontSize: '14px', color: '#4B5563', backgroundColor: '#F9FAFB', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E5E7EB' },
//   engineOutputBox: { display: 'flex', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '8px', marginTop: '16px', borderLeft: '4px solid' },
//   timelineContainer: { display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' },
//   timelineNode: { display: 'flex', gap: '16px', position: 'relative' },
//   timelineDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563EB', marginTop: '6px', zIndex: 2 },
//   timelineContent: { display: 'flex', flexDirection: 'column' },
//   timelineMonth: { fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' },
//   timelineEvent: { fontSize: '14px', color: '#111827', margin: '2px 0' },
//   timelineDesc: { fontSize: '13px', color: '#6B7280', margin: 0 },
//   recItem: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
//   recNumber: { backgroundColor: '#F3F4F6', color: '#1F2937', fontWeight: '700', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 },
//   emailGenBtn: { marginTop: '20px', width: '100%', border: 'none', backgroundColor: '#10B981', color: '#FFF', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }
// };

import { useEffect, useMemo, useState } from 'react';
import { getPrediction } from './API/api';
import { GetRecords } from './API/Records';

const getLookupId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.Id || value.id || value.Value || value.value || null;
};

const getAccountId = (record) => (
  record?.AccountId ||
  record?.accountId ||
  record?.AccountId__c ||
  record?.Account_Id__c ||
  record?.Account_cId ||
  record?.Account_c_Id ||
  record?.Account_c__c ||
  getLookupId(record?.Account) ||
  getLookupId(record?.Account_c) ||
  getLookupId(record?.Account__r) ||
  getLookupId(record?.Account_c__r) ||
  null
);

const getRecordId = (record) => record?.Id || record?.id;

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccId, setSelectedAccId] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Bulk Initializer Sequence 
  useEffect(() => {
    const loadPipelineData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Execute all 6 Conga platform collections in parallel
        const [
          accountResult,
          opportunityResult,
          proposalResult,
          assetResult,
          renewalResult,
          entitlementResult
        ] = await Promise.all([
          GetRecords("Account"),
          GetRecords("Opportunity"),
          GetRecords("Proposal"),
          GetRecords("Asset"),
          GetRecords("Renewals_c"),
          GetRecords("entitlements_c")
        ]);

        const accountData = accountResult?.Data || accountResult || [];
        console.log('Loaded Account records:', accountData);
        const opportunityData = opportunityResult?.Data || opportunityResult || [];
        console.log('Loaded Opportunity records:', opportunityData);
        const proposalData = proposalResult?.Data || proposalResult || [];
        console.log('Loaded Proposal records:', proposalData);
        const assetData = assetResult?.Data || assetResult || [];
        console.log('Loaded Asset records:', assetData);
        const renewalData = renewalResult?.Data || renewalResult || [];
        console.log('Loaded Renewal records:', renewalData);
        const entitlementData = entitlementResult?.Data || entitlementResult || [];
        console.log('Loaded Entitlement records:', entitlementData);

        // Build localized key maps for fast grouping
        const buildMap = (records) => {
          const map = {};
          records.forEach(record => {
            const accountId = getAccountId(record);
            if (!accountId) return;
            if (!map[accountId]) map[accountId] = [];
            map[accountId].push(record);
          });
          return map;
        };

        const opportunityMap = buildMap(opportunityData);
        const proposalMap = buildMap(proposalData);
        const assetMap = buildMap(assetData);
        const renewalMap = buildMap(renewalData);
        const entitlementMap = buildMap(entitlementData);

        // Merge baseline models
        const mergedPayload = accountData.map(account => ({
          ...account,
          Id: getRecordId(account),
          opportunities: opportunityMap[getRecordId(account)] || [],
          proposals: proposalMap[getRecordId(account)] || [],
          assets: assetMap[getRecordId(account)] || [],
          renewals: renewalMap[getRecordId(account)] || [],
          entitlements: entitlementMap[getRecordId(account)] || [],
          // Safeguard properties if ML payload isn't returned yet
          riskScore: 0, 
          probability: '0%'
        }));

        // 2. Dispatch combined JSON Payload to AI Engine for multi-variant predictions
        try {
          const bulkAIResponse = await getPrediction({ accounts: mergedPayload });
          
          // Map calculated predictions back into state array context
          if (bulkAIResponse && bulkAIResponse.predictions) {
            const predictableMap = {};
            bulkAIResponse.predictions.forEach(p => {
              predictableMap[p.accountId] = p;
            });

            const finalEnrichedData = mergedPayload.map(acc => {
              const aiData = predictableMap[acc.Id];
              return aiData ? { ...acc, riskScore: aiData.riskScore, probability: aiData.probability } : acc;
            });
            setAccounts(finalEnrichedData);
          } else {
            setAccounts(mergedPayload);
          }
        } catch (aiErr) {
          console.error("Bulk AI Prediction system execution failed:", aiErr);
          setAccounts(mergedPayload); // Fallback to standard merged records without weights
        }

      } catch (err) {
        console.error('Pipeline initialization failure:', err);
        setError(err?.message || 'Unable to load structural pipeline definitions.');
      } finally {
        setLoading(false);
      }
    };

    loadPipelineData();
  }, []);

  // Compute live analytical KPI stats from unified account array
  const stats = useMemo(() => {
    const high = accounts.filter((a) => (a.riskScore || 0) > 60).length;
    const med = accounts.filter((a) => (a.riskScore || 0) > 30 && (a.riskScore || 0) <= 60).length;
    const low = accounts.filter((a) => (a.riskScore || 0) <= 30).length;
    return { high, med, low, total: accounts.length };
  }, [accounts]);

  const selectedAccount = useMemo(() => {
    return accounts.find(a => a.Id === selectedAccId) || null;
  }, [accounts, selectedAccId]);

  const getRiskStatus = (score) => {
    if (score > 60) return { label: 'High Risk', color: '#DC2626', bg: '#FEE2E2' };
    if (score > 30) return { label: 'Medium Risk', color: '#D97706', bg: '#FEF3C7' };
    return { label: 'Healthy', color: '#059669', bg: '#D1FAE5' };
  };

  return (
    <div style={styles.appContainer}>
      <nav style={styles.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={styles.logoIcon}>⚡</div>
          <div>
            <h1 style={styles.navTitle}>Conga + Salesforce Renewal Intelligence Hub</h1>
            <p style={styles.navSubtitle}>Enterprise Risk Scoring Architecture & AI Explainability Layer</p>
          </div>
        </div>
        <div style={styles.navButtonGroup}>
          <button
            style={{
              ...styles.navBtn,
              backgroundColor: currentPage === 'dashboard' ? '#2563EB' : 'transparent',
              color: currentPage === 'dashboard' ? '#FFF' : '#374151'
            }}
            onClick={() => setCurrentPage('dashboard')}
          >
            📊 Executive Dashboard
          </button>
          <button
            style={{
              ...styles.navBtn,
              backgroundColor: currentPage === 'details' ? '#2563EB' : 'transparent',
              color: currentPage === 'details' ? '#FFF' : '#374151'
            }}
            disabled={!selectedAccId}
            onClick={() => setCurrentPage('details')}
          >
            🔍 Deep-Dive Inspection {selectedAccount ? `(${selectedAccount.Name})` : ''}
          </button>
        </div>
      </nav>

      {loading && (
        <div style={{ marginBottom: '24px', color: '#1F2937' }}>
          Loading live account information from parallel Conga system calls...
        </div>
      )}

      {!loading && error && (
        <div style={{ marginBottom: '24px', color: '#B91C1C' }}>
          Error pipeline: {error}
        </div>
      )}

      {currentPage === 'dashboard' && !loading && (
        <div>
          <div style={styles.statsRow}>
            <div style={{ ...styles.statBox, borderLeft: '6px solid #DC2626' }}>
              <span style={styles.statLabel}>High Risk Accounts</span>
              <span style={{ ...styles.statVal, color: '#DC2626' }}>{stats.high}</span>
            </div>
            <div style={{ ...styles.statBox, borderLeft: '6px solid #D97706' }}>
              <span style={styles.statLabel}>Medium Risk Attention</span>
              <span style={{ ...styles.statVal, color: '#D97706' }}>{stats.med}</span>
            </div>
            <div style={{ ...styles.statBox, borderLeft: '6px solid #059669' }}>
              <span style={styles.statLabel}>Healthy Stable Pipelines</span>
              <span style={{ ...styles.statVal, color: '#059669' }}>{stats.low}</span>
            </div>
            <div style={{ ...styles.statBox, borderLeft: '6px solid #6B7280' }}>
              <span style={styles.statLabel}>Total Account Matrices</span>
              <span style={styles.statVal}>{stats.total}</span>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#111827' }}>Live Integrated Account Stream</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Account Name</th>
                    <th style={styles.th}>Industry</th>
                    <th style={styles.th}>Annual Revenue</th>
                    <th style={styles.th}>Days To Renewal</th>
                    <th style={styles.th}>Renewal Score</th>
                    <th style={styles.th}>Calculated Risk</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((item) => {
                    const status = getRiskStatus(item.riskScore || 0);
                    return (
                      <tr key={item.Id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: '600', color: '#111827' }}>{item.Name || 'N/A'}</td>
                        <td style={styles.td}>{item.Industry || 'N/A'}</td>
                        <td style={styles.td}>{item.AnnualRevenue?.Value || item.AnnualRevenue || 'N/A'}</td>
                        <td style={styles.td}>{item.days_to_renewal_c || '0'} Days</td>
                        <td style={styles.td}>{item.renewal_readiness_score_c || 'N/A'}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, backgroundColor: status.bg, color: status.color }}>
                            {item.riskScore || 0}% ({status.label})
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button
                            style={styles.actionLink}
                            onClick={() => {
                              setSelectedAccId(item.Id);
                              setCurrentPage('details');
                            }}
                          >
                            Analyze →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'details' && selectedAccount && (
        <div style={styles.gridSplit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={styles.card}>
              <span style={{ fontSize: '12px', color: '#4B5563', fontWeight: 'bold' }}>CONGA CONTEXT PLATFORM</span>
              <h2 style={{ margin: '4px 0 16px 0', fontSize: '22px' }}>{selectedAccount.Name}</h2>
              <div style={styles.paramsGrid}>
                <div style={styles.paramItem}><strong>Industry:</strong> {selectedAccount.Industry || 'N/A'}</div>
                <div style={styles.paramItem}><strong>Opportunities:</strong> {selectedAccount.opportunities.length} Items</div>
                <div style={styles.paramItem}><strong>Proposals/Quotes:</strong> {selectedAccount.proposals.length} Records</div>
                <div style={styles.paramItem}><strong>Assets Managed:</strong> {selectedAccount.assets.length} Active</div>
                <div style={styles.paramItem}><strong>Open Entitlements:</strong> {selectedAccount.entitlements.length} Active</div>
              </div>

              <div style={{ ...styles.engineOutputBox, borderColor: getRiskStatus(selectedAccount.riskScore || 0).color }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#4B5563' }}>INTELLIGENCE RISK SCORE</div>
                  <div style={{ fontSize: '32px', fontWeight: '800', margin: '4px 0', color: getRiskStatus(selectedAccount.riskScore || 0).color }}>
                    {selectedAccount.riskScore || 0} / 100
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#4B5563' }}>RENEWAL PROBABILITY</div>
                  <div style={{ fontSize: '32px', fontWeight: '800', margin: '4px 0', color: '#2563EB' }}>
                    {selectedAccount.probability || '0%'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Keep the styles object from your original implementation below...
const styles = {
  appContainer: { fontFamily: 'Segoe UI, system-ui, sans-serif', backgroundColor: '#F3F4F6', minHeight: '100vh', padding: '24px', boxSizing: 'border-box' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px', border: '1px solid #E5E7EB', flexWrap: 'wrap', gap: '16px' },
  logoIcon: { fontSize: '24px', background: '#DBEAFE', padding: '8px', borderRadius: '8px' },
  navTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' },
  navSubtitle: { margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' },
  navButtonGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  navBtn: { border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' },
  statBox: { backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', border: '1px solid #E5E7EB' },
  statLabel: { fontSize: '12px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' },
  statVal: { fontSize: '28px', fontWeight: '800', marginTop: '6px', color: '#111827' },
  card: { backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { borderBottom: '2px solid #E5E7EB' },
  th: { padding: '12px 16px', color: '#4B5563', fontSize: '13px', fontWeight: '600' },
  tr: { borderBottom: '1px solid #E5E7EB' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#4B5563' },
  badge: { fontSize: '12px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px' },
  actionLink: { background: 'none', border: 'none', color: '#2563EB', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  gridSplit: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' },
  paramsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '16px 0' },
  paramItem: { fontSize: '14px', color: '#4B5563', backgroundColor: '#F9FAFB', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E5E7EB' },
  engineOutputBox: { display: 'flex', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '8px', marginTop: '16px', borderLeft: '4px solid' },
  timelineContainer: { display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' },
  timelineNode: { display: 'flex', gap: '16px', position: 'relative' },
  timelineDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563EB', marginTop: '6px', zIndex: 2 },
  timelineContent: { display: 'flex', flexDirection: 'column' },
  timelineMonth: { fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' },
  timelineEvent: { fontSize: '14px', color: '#111827', margin: '2px 0' },
  timelineDesc: { fontSize: '13px', color: '#6B7280', margin: 0 },
  recItem: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  recNumber: { backgroundColor: '#F3F4F6', color: '#1F2937', fontWeight: '700', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 },
  emailGenBtn: { marginTop: '20px', width: '100%', border: 'none', backgroundColor: '#10B981', color: '#FFF', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }
};
