import { useEffect, useMemo, useState } from 'react';
import {
  getAccountById,
  getPrediction,
  getRenewalSuggestions,
  getSingleAccountAnalysis,
  login,
  sendRenewalChatMessage
} from './API/api';
import { GetRecords } from './API/Records';

const DASHBOARD_OBJECTS = {
  accounts: 'Account',
  opportunities: 'Opportunity',
  quotes: 'Proposal',
  assets: 'Asset',
  renewals: 'Renewals_c',
  entitlements: 'entitlements_c'
};

const DETAIL_OBJECTS = {
  agreements: 'Agreement',
  quoteLines: ['QuoteLine', 'ProposalLineItem', 'AgreementLineItem']
};

const FIELD_GROUPS = [
  {
    key: 'account',
    title: 'Account Main Detail',
    getRecords: (account) => [account],
    fields: [
      ['Risk Tier', ['risk_tier', 'risk_tier_c', 'RiskTier__c']],
      ['Renewal Readiness Score', ['renewal_readiness_score', 'renewal_readiness_score_c', 'RenewalReadinessScore__c']],
      ['ARR Health', ['arr_health', 'arr_health_c', 'ArrHealth__c']],
      ['Outside Risk To Renewal', ['outside_risk_to_renewal', 'outside_risk_to_renewal_c', 'OutsideRiskToRenewal__c']],
      ['Competitor Activity', ['competitor_activity', 'competitor_activity_c', 'CompetitorActivity__c']],
      ['License Utilization %', ['license_utilization_pct', 'license_utilization_pct_c', 'LicenseUtilizationPct__c']],
      ['Usage Trend', ['usage_trend', 'usage_trend_c', 'UsageTrend__c']],
      ['Production Deployment', ['production_deployment', 'production_deployment_c', 'ProductionDeployment__c']],
      ['Products In Use', ['products_in_use', 'products_in_use_c', 'ProductsInUse__c']],
      ['Products Not Used', ['products_not_used', 'products_not_used_c', 'ProductsNotUsed__c']],
      ['Last Engagement Days Ago', ['last_engagement_days_ago', 'last_engagement_days_ago_c', 'LastEngagementDaysAgo__c']],
      ['CSM Engagement Level', ['csm_engagement_level', 'csm_engagement_level_c', 'CsmEngagementLevel__c']],
      ['Support Tickets Last 90 Days', ['support_tickets_last_90_days', 'support_tickets_last_90_days_c', 'SupportTicketsLast90Days__c']],
      ['Escalations', ['escalations', 'escalations_c', 'Escalations__c']],
      ['NPS Score', ['nps_score', 'nps_score_c', 'NpsScore__c']],
      ['Days To Renewal', ['days_to_renewal', 'days_to_renewal_c', 'DaysToRenewal__c']],
      ['Tenure Years', ['tenure_years', 'tenure_years_c', 'TenureYears__c']],
      ['Previous Renewal Count', ['previous_renewal_count', 'previous_renewal_count_c', 'PreviousRenewalCount__c']],
      ['Subscription Renewal Type', ['subscription_renewal_type', 'subscription_renewal_type_c', 'SubscriptionRenewalType__c']],
      ['ACV USD', ['acv_usd', 'acv_usd_c', 'AcvUsd__c']],
      ['Industry', ['Industry', 'industry']],
      ['Annual Revenue', ['AnnualRevenue', 'annualRevenue']]
    ]
  },
  {
    key: 'agreements',
    title: 'Agreement',
    getRecords: (account) => account.agreements || [],
    fields: [
      ['Subscription Renewal Type', ['subscription_renewal_type', 'subscription_renewal_type_c', 'SubscriptionRenewalType__c']],
      ['Status', ['status', 'Status']],
      ['Status Category', ['status_category', 'status_category_c', 'StatusCategory__c']],
      ['Termination Notice Days', ['termination_notice_days', 'termination_notice_days_c', 'TerminationNoticeDays__c']],
      ['Limitation Of Liability', ['limitation_of_liability', 'limitation_of_liability_c', 'LimitationOfLiability__c']],
      ['Amendments Count', ['amendments_count', 'amendments_count_c', 'AmendmentsCount__c']],
      ['Document Versions Count', ['document_versions_count', 'document_versions_count_c', 'DocumentVersionsCount__c']],
      ['Approvals Count', ['approvals_count', 'approvals_count_c', 'ApprovalsCount__c']],
      ['Agreement End Date', ['agreement_end_date', 'agreement_end_date_c', 'AgreementEndDate__c', 'EndDate']],
      ['Effective Date', ['effective_date', 'effective_date_c', 'EffectiveDate__c', 'EffectiveDate']],
      ['Term Months', ['term_months', 'term_months_c', 'TermMonths__c']],
      ['Type Of Paper', ['type_of_paper', 'type_of_paper_c', 'TypeOfPaper__c']],
      ['Payment Terms', ['payment_terms', 'payment_terms_c', 'PaymentTerms__c']]
    ]
  },
  {
    key: 'assets',
    title: 'Asset',
    getRecords: (account) => account.assets || [],
    fields: [
      ['Asset Status', ['asset_status', 'asset_status_c', 'AssetStatus__c', 'Status']],
      ['Days To Asset Expiry', ['days_to_asset_expiry', 'days_to_asset_expiry_c', 'DaysToAssetExpiry__c']],
      ['Quantity', ['quantity', 'Quantity']],
      ['ARR USD', ['arr_usd', 'arr_usd_c', 'ArrUsd__c']],
      ['ACV USD', ['acv_usd', 'acv_usd_c', 'AcvUsd__c']],
      ['Selling Term Months', ['selling_term_months', 'selling_term_months_c', 'SellingTermMonths__c']],
      ['Asset Expired', ['asset_expired', 'asset_expired_c', 'AssetExpired__c']]
    ]
  },
  {
    key: 'entitlements',
    title: 'Entitlements',
    getRecords: (account) => account.entitlements || [],
    fields: [
      ['Status', ['status', 'Status']],
      ['Cases Used', ['cases_used', 'cases_used_c', 'CasesUsed__c']],
      ['Remaining Cases', ['remaining_cases', 'remaining_cases_c', 'RemainingCases__c']],
      ['Support Tier Numeric', ['support_tier_numeric', 'support_tier_numeric_c', 'SupportTierNumeric__c']],
      ['End Date', ['end_date', 'end_date_c', 'EndDate__c', 'EndDate']]
    ]
  },
  {
    key: 'opportunities',
    title: 'Opportunity',
    getRecords: (account) => account.opportunities || [],
    fields: [
      ['Stage', ['stage', 'Stage', 'StageName']],
      ['Days In Current Stage', ['days_in_current_stage', 'days_in_current_stage_c', 'DaysInCurrentStage__c']],
      ['Close Date', ['close_date', 'close_date_c', 'CloseDate__c', 'CloseDate']],
      ['Forecast Category', ['forecast_category', 'forecast_category_c', 'ForecastCategory__c', 'ForecastCategory']],
      ['Quote Attached', ['quote_attached', 'quote_attached_c', 'QuoteAttached__c']],
      ['Stage History Count', ['stage_history_count', 'stage_history_count_c', 'StageHistoryCount__c']]
    ]
  },
  {
    key: 'quoteLines',
    title: 'Quote Line',
    getRecords: (account) => account.quoteLines || [],
    fields: [
      ['Sales Discount %', ['sales_discount_pct', 'sales_discount_pct_c', 'SalesDiscountPct__c']],
      ['Quantity', ['quantity', 'Quantity']],
      ['Charge Type', ['charge_type', 'charge_type_c', 'ChargeType__c']],
      ['Ext Net Price', ['ext_net_price', 'ext_net_price_c', 'ExtNetPrice__c']],
      ['Approval Status', ['approval_status', 'approval_status_c', 'ApprovalStatus__c']]
    ]
  },
  {
    key: 'quotes',
    title: 'Quotes',
    getRecords: (account) => account.quotes || [],
    fields: [
      ['Approval Stage', ['approval_stage', 'approval_stage_c', 'ApprovalStage__c']],
      ['Discount %', ['discount_pct', 'discount_pct_c', 'DiscountPct__c']],
      ['Quote Revisions', ['quote_revisions', 'quote_revisions_c', 'QuoteRevisions__c']],
      ['Valid Until Date', ['valid_until_date', 'valid_until_date_c', 'ValidUntilDate__c']],
      ['Upsell Accepted', ['upsell_accepted', 'upsell_accepted_c', 'UpsellAccepted__c']],
      ['Primary', ['primary', 'Primary', 'primary_c', 'Primary__c']]
    ]
  },
  {
    key: 'renewals',
    title: 'Renewals',
    getRecords: (account) => account.renewals || [],
    fields: [
      ['Renewed', ['renewed', 'renewed_c', 'Renewed__c']],
      ['Churn Reason', ['churn_reason', 'churn_reason_c', 'ChurnReason__c']],
      ['Engagement Score At Renewal', ['engagement_score_at_renewal', 'engagement_score_at_renewal_c', 'EngagementScoreAtRenewal__c']],
      ['License Utilization At Renewal', ['license_utilization_at_renewal', 'license_utilization_at_renewal_c', 'LicenseUtilizationAtRenewal__c']],
      ['Days Before Expiry Contacted', ['days_before_expiry_contacted', 'days_before_expiry_contacted_c', 'DaysBeforeExpiryContacted__c']],
      ['Executive Engaged', ['executive_engaged', 'executive_engaged_c', 'ExecutiveEngaged__c']],
      ['Discount Given %', ['discount_given_pct', 'discount_given_pct_c', 'DiscountGivenPct__c']],
      ['Upsell Included', ['upsell_included', 'upsell_included_c', 'UpsellIncluded__c']]
    ]
  }
];

const toArray = (result) => {
  if (Array.isArray(result?.Data)) return result.Data;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result)) return result;
  return [];
};

const getLookupId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.Id || value.id || value.Value || value.value || null;
};

const getRecordId = (record) => record?.Id || record?.id;

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

const getQuoteId = (record) => (
  record?.QuoteId ||
  record?.ProposalId ||
  record?.Proposal_c__c ||
  getLookupId(record?.Quote) ||
  getLookupId(record?.Proposal) ||
  getLookupId(record?.Proposal_c) ||
  getLookupId(record?.Quote_c) ||
  null
);

const buildAccountMap = (records) => {
  const map = {};

  records.forEach((record) => {
    const accountId = getAccountId(record);
    if (!accountId) return;
    if (!map[accountId]) map[accountId] = [];
    map[accountId].push(record);
  });

  return map;
};

const getFieldValue = (record, candidates) => {
  for (const field of candidates) {
    const value = record?.[field];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return null;
};

const parseNumber = (value) => {
  if (value == null || value === '') return 0;
  if (typeof value === 'object' && 'Value' in value) return parseNumber(value.Value);

  const result = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(result) ? result : 0;
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    if ('Value' in value) return formatValue(value.Value);
    if ('Name' in value) return value.Name;
    if ('Id' in value) return value.Id;
    return JSON.stringify(value);
  }
  return String(value);
};

const formatMoney = (value) => {
  const amount = parseNumber(value);
  if (!amount) return 'N/A';
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });
};

const getRiskStatus = (score) => {
  if (score > 60) return { label: 'High Risk', color: '#DC2626', bg: '#FEE2E2' };
  if (score > 30) return { label: 'Medium Risk', color: '#B45309', bg: '#FEF3C7' };
  return { label: 'Healthy', color: '#047857', bg: '#D1FAE5' };
};

const normalizePrediction = (prediction) => ({
  riskScore: parseNumber(prediction?.riskScore ?? prediction?.risk_score),
  probability: prediction?.probability || `${parseNumber(prediction?.renewalPercentage ?? prediction?.renewal_percentage)}%`,
  summary: prediction?.summary || '',
  riskLevel: prediction?.riskLevel || prediction?.risk_level || '',
  keyReasons: prediction?.keyReasons || prediction?.key_reasons || [],
  recommendedActions: prediction?.recommendedActions || prediction?.recommended_actions || []
});

async function getFirstAvailableRecords(objectNames) {
  const names = Array.isArray(objectNames) ? objectNames : [objectNames];
  const results = await Promise.all(names.map((name) => GetRecords(name)));
  return results.flatMap(toArray);
}

export default function App() {
  const hasStoredUser = Boolean(sessionStorage.getItem('user'));
  const [accounts, setAccounts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(hasStoredUser);
  const [selectedAccId, setSelectedAccId] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(hasStoredUser);
  const [detailLoading, setDetailLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [singleAnalysis, setSingleAnalysis] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const onLogin = () => {
      setIsAuthenticated(true);
      setLoading(true);
    };
    window.addEventListener('user-logged-in', onLogin);
    return () => window.removeEventListener('user-logged-in', onLogin);
  }, []);

  useEffect(() => {
    const loadPipelineData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          accountResult,
          opportunityResult,
          quoteResult,
          assetResult,
          renewalResult,
          entitlementResult
        ] = await Promise.all([
          GetRecords(DASHBOARD_OBJECTS.accounts),
          GetRecords(DASHBOARD_OBJECTS.opportunities),
          GetRecords(DASHBOARD_OBJECTS.quotes),
          GetRecords(DASHBOARD_OBJECTS.assets),
          GetRecords(DASHBOARD_OBJECTS.renewals),
          GetRecords(DASHBOARD_OBJECTS.entitlements)
        ]);

        const accountData = toArray(accountResult);
        const opportunityMap = buildAccountMap(toArray(opportunityResult));
        const quoteMap = buildAccountMap(toArray(quoteResult));
        const assetMap = buildAccountMap(toArray(assetResult));
        const renewalMap = buildAccountMap(toArray(renewalResult));
        const entitlementMap = buildAccountMap(toArray(entitlementResult));

        const mergedAccounts = accountData.map((account) => {
          const accountId = getRecordId(account);
          return {
            ...account,
            Id: accountId,
            opportunities: opportunityMap[accountId] || [],
            quotes: quoteMap[accountId] || [],
            proposals: quoteMap[accountId] || [],
            assets: assetMap[accountId] || [],
            renewals: renewalMap[accountId] || [],
            entitlements: entitlementMap[accountId] || [],
            agreements: [],
            quoteLines: [],
            riskScore: 0,
            probability: 'Pending'
          };
        });

        setAccounts(mergedAccounts);
        setSelectedAccId((currentId) => currentId || mergedAccounts[0]?.Id || null);

        try {
          const bulkAIResponse = await getPrediction({ accounts: mergedAccounts });
          const predictionMap = {};

          toArray(bulkAIResponse?.predictions).forEach((prediction) => {
            const accountId = prediction.accountId || prediction.account_id || prediction.Id || prediction.id;
            if (accountId) predictionMap[accountId] = normalizePrediction(prediction);
          });

          setAccounts(
            mergedAccounts.map((account) => ({
              ...account,
              ...(predictionMap[account.Id] || {})
            }))
          );
        } catch (predictionErr) {
          console.error('Bulk prediction failed:', predictionErr);
          setError(predictionErr?.message || 'Accounts loaded, but bulk prediction failed.');
        }
      } catch (err) {
        console.error('Pipeline initialization failure:', err);
        setError(err?.message || 'Unable to load account renewal data.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) loadPipelineData();
  }, [isAuthenticated]);

  const stats = useMemo(() => {
    const high = accounts.filter((account) => account.riskScore > 60).length;
    const med = accounts.filter((account) => account.riskScore > 30 && account.riskScore <= 60).length;
    const low = accounts.filter((account) => account.riskScore <= 30).length;
    return { high, med, low, total: accounts.length };
  }, [accounts]);

  const loadAccountAnalysis = async (account) => {
    const accountId = getRecordId(account);
    setSelectedAccId(accountId);
    setCurrentPage('details');
    setSelectedAccount(account);
    setSingleAnalysis(null);
    setSuggestions([]);
    setChatMessages([]);
    setDetailLoading(true);
    setAiLoading(true);
    setDetailError(null);

    try {
      const [fullAccount, agreementRecords, quoteLineRecords] = await Promise.all([
        getAccountById(accountId),
        getFirstAvailableRecords(DETAIL_OBJECTS.agreements),
        getFirstAvailableRecords(DETAIL_OBJECTS.quoteLines)
      ]);

      const quoteIds = new Set((account.quotes || account.proposals || []).map(getRecordId).filter(Boolean));
      const agreements = agreementRecords.filter((record) => getAccountId(record) === accountId);
      const quoteLines = quoteLineRecords.filter((record) => {
        const recordAccountId = getAccountId(record);
        if (recordAccountId === accountId) return true;
        const quoteId = getQuoteId(record);
        return quoteId && quoteIds.has(quoteId);
      });

      const detailedAccount = {
        ...account,
        ...(fullAccount || {}),
        Id: accountId,
        agreements,
        quoteLines
      };

      setSelectedAccount(detailedAccount);
      setAccounts((current) => current.map((item) => (item.Id === accountId ? { ...item, ...detailedAccount } : item)));

      const [analysisResult, suggestionResult] = await Promise.all([
        getSingleAccountAnalysis({ account: detailedAccount }),
        getRenewalSuggestions({ account: detailedAccount })
      ]);

      const analysis = analysisResult?.analysis || analysisResult;
      setSingleAnalysis(analysis);
      setSuggestions(suggestionResult?.suggestions || suggestionResult?.recommendedActions || analysis?.recommendedActions || []);
    } catch (err) {
      console.error('Account analysis failed:', err);
      setDetailError(err?.message || 'Unable to load detailed account analysis.');
    } finally {
      setDetailLoading(false);
      setAiLoading(false);
    }
  };

  const sendChat = async () => {
    const message = chatInput.trim();
    if (!message || !selectedAccount) return;

    const nextMessages = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(nextMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const result = await sendRenewalChatMessage({
        account: selectedAccount,
        messages: nextMessages,
        message
      });

      setChatMessages([
        ...nextMessages,
        { role: 'assistant', content: result?.reply || result?.answer || 'I could not generate a response.' }
      ]);
    } catch (err) {
      console.error('Renewal chat failed:', err);
      setChatMessages([
        ...nextMessages,
        { role: 'assistant', content: 'Chat analysis failed. Please try again after the backend is running.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const activeAccount = selectedAccount || accounts.find((account) => account.Id === selectedAccId);
  const activeAnalysis = singleAnalysis || activeAccount || {};
  const activeRisk = parseNumber(activeAnalysis.riskScore ?? activeAccount?.riskScore);
  const activeStatus = getRiskStatus(activeRisk);

  return (
    <div style={styles.appContainer}>
      <nav style={styles.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={styles.logoIcon}>CI</div>
          <div>
            <h1 style={styles.navTitle}>Conga Renewal Intelligence Hub</h1>
            <p style={styles.navSubtitle}>Account renewal risk with Conga object context</p>
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
            Dashboard
          </button>
          <button
            style={{
              ...styles.navBtn,
              backgroundColor: currentPage === 'details' ? '#2563EB' : 'transparent',
              color: currentPage === 'details' ? '#FFF' : '#374151',
              opacity: activeAccount ? 1 : 0.55
            }}
            disabled={!activeAccount}
            onClick={() => setCurrentPage('details')}
          >
            Analyze Detail
          </button>
          {!isAuthenticated ? (
            <button style={{ ...styles.navBtn, backgroundColor: '#059669', color: '#FFF' }} onClick={() => login()}>
              Sign in
            </button>
          ) : (
            <button
              style={{ ...styles.navBtn, backgroundColor: 'transparent', color: '#374151' }}
              onClick={() => {
                sessionStorage.removeItem('user');
                setIsAuthenticated(false);
                setAccounts([]);
                setSelectedAccount(null);
                setSelectedAccId(null);
              }}
            >
              Sign out
            </button>
          )}
        </div>
      </nav>

      {loading && <div style={styles.statusText}>Loading live account information from Conga...</div>}

      {!loading && !isAuthenticated && (
        <div style={styles.card}>
          <h2 style={{ marginTop: 0 }}>Sign in to load account renewal data</h2>
          <p style={{ color: '#4B5563', marginBottom: '16px' }}>
            After sign-in the dashboard will load accounts and related Conga records.
          </p>
          <button style={{ ...styles.navBtn, backgroundColor: '#059669', color: '#FFF' }} onClick={() => login()}>
            Sign in
          </button>
        </div>
      )}

      {!loading && error && <div style={{ ...styles.statusText, color: '#B91C1C' }}>{error}</div>}

      {currentPage === 'dashboard' && !loading && isAuthenticated && (
        <div>
          <div style={styles.statsRow}>
            <div style={{ ...styles.statBox, borderLeft: '6px solid #DC2626' }}>
              <span style={styles.statLabel}>High Risk Accounts</span>
              <span style={{ ...styles.statVal, color: '#DC2626' }}>{stats.high}</span>
            </div>
            <div style={{ ...styles.statBox, borderLeft: '6px solid #B45309' }}>
              <span style={styles.statLabel}>Medium Risk Attention</span>
              <span style={{ ...styles.statVal, color: '#B45309' }}>{stats.med}</span>
            </div>
            <div style={{ ...styles.statBox, borderLeft: '6px solid #047857' }}>
              <span style={styles.statLabel}>Healthy Accounts</span>
              <span style={{ ...styles.statVal, color: '#047857' }}>{stats.low}</span>
            </div>
            <div style={{ ...styles.statBox, borderLeft: '6px solid #4B5563' }}>
              <span style={styles.statLabel}>Total Accounts Analyzed</span>
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
                        <td style={{ ...styles.td, fontWeight: '600', color: '#111827' }}>{item.Name || item.name || 'N/A'}</td>
                        <td style={styles.td}>{item.Industry || item.industry || 'N/A'}</td>
                        <td style={styles.td}>{formatMoney(item.AnnualRevenue || item.annualRevenue)}</td>
                        <td style={styles.td}>{formatValue(getFieldValue(item, ['days_to_renewal_c', 'days_to_renewal', 'DaysToRenewal__c']))} Days</td>
                        <td style={styles.td}>{formatValue(getFieldValue(item, ['renewal_readiness_score_c', 'renewal_readiness_score', 'RenewalReadinessScore__c']))}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, backgroundColor: status.bg, color: status.color }}>
                            {item.riskScore || 0}% {status.label}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button style={styles.actionLink} onClick={() => loadAccountAnalysis(item)}>
                            Analyze
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

      {currentPage === 'details' && activeAccount && (
        <div style={styles.detailLayout}>
          <div style={styles.detailMain}>
            <div style={styles.card}>
              <div style={styles.detailHeader}>
                <div>
                  <span style={styles.overline}>Selected Account</span>
                  <h2 style={{ margin: '4px 0 0 0', fontSize: '22px' }}>{activeAccount.Name || activeAccount.name}</h2>
                </div>
                <button style={styles.actionButton} onClick={() => loadAccountAnalysis(activeAccount)} disabled={detailLoading || aiLoading}>
                  Refresh Analysis
                </button>
              </div>

              {detailError && <div style={{ ...styles.statusText, color: '#B91C1C' }}>{detailError}</div>}
              {detailLoading && <div style={styles.statusText}>Fetching full account and related detail records...</div>}

              <div style={{ ...styles.engineOutputBox, borderColor: activeStatus.color }}>
                <div>
                  <div style={styles.boxLabel}>Single Account Risk</div>
                  <div style={{ ...styles.boxValue, color: activeStatus.color }}>{activeRisk || 0} / 100</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={styles.boxLabel}>Renewal Probability</div>
                  <div style={{ ...styles.boxValue, color: '#2563EB' }}>
                    {activeAnalysis.probability || activeAccount.probability || 'Pending'}
                  </div>
                </div>
              </div>

              <p style={styles.summaryText}>
                {aiLoading ? 'Generating account summary with Gemini...' : activeAnalysis.summary || 'Run analysis to generate the account renewal summary.'}
              </p>
            </div>

            {FIELD_GROUPS.map((group) => {
              const records = group.getRecords(activeAccount);
              return (
                <details key={group.key} open={group.key === 'account'} style={styles.dropdownCard}>
                  <summary style={styles.dropdownSummary}>
                    <span>{group.title}</span>
                    <span style={styles.countPill}>{records.length}</span>
                  </summary>
                  {records.length ? (
                    records.map((record, index) => (
                      <div key={getRecordId(record) || `${group.key}-${index}`} style={styles.recordBlock}>
                        {records.length > 1 && <div style={styles.recordTitle}>Record {index + 1}</div>}
                        <div style={styles.fieldGrid}>
                          {group.fields.map(([label, candidates]) => (
                            <div key={label} style={styles.fieldItem}>
                              <span style={styles.fieldLabel}>{label}</span>
                              <span style={styles.fieldValue}>{formatValue(getFieldValue(record, candidates))}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={styles.emptyText}>No related {group.title.toLowerCase()} records found for this account.</div>
                  )}
                </details>
              );
            })}
          </div>

          <aside style={styles.sidePanel}>
            <div style={styles.card}>
              <span style={styles.overline}>Renewal Suggestions</span>
              {(suggestions.length ? suggestions : ['Run analysis to generate renewal actions.']).map((suggestion, index) => (
                <div key={`${suggestion}-${index}`} style={styles.recItem}>
                  <div style={styles.recNumber}>{index + 1}</div>
                  <div style={{ color: '#374151', fontSize: '14px', lineHeight: 1.4 }}>{formatValue(suggestion)}</div>
                </div>
              ))}
            </div>

            <div style={styles.card}>
              <span style={styles.overline}>Renewal Chat</span>
              <div style={styles.chatBox}>
                {chatMessages.length ? (
                  chatMessages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      style={{
                        ...styles.chatBubble,
                        alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor: message.role === 'user' ? '#DBEAFE' : '#F3F4F6'
                      }}
                    >
                      {message.content}
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyText}>Ask what is blocking renewal, which stakeholder to contact, or what action should happen next.</div>
                )}
                {chatLoading && <div style={styles.emptyText}>Gemini is thinking...</div>}
              </div>
              <div style={styles.chatInputRow}>
                <input
                  style={styles.chatInput}
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') sendChat();
                  }}
                  placeholder="Ask about this renewal..."
                />
                <button style={styles.actionButton} onClick={sendChat} disabled={chatLoading || !chatInput.trim()}>
                  Send
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

const styles = {
  appContainer: { fontFamily: 'Segoe UI, system-ui, sans-serif', backgroundColor: '#F3F4F6', minHeight: '100vh', padding: '24px', boxSizing: 'border-box' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: '16px 24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px', border: '1px solid #E5E7EB', flexWrap: 'wrap', gap: '16px' },
  logoIcon: { fontSize: '13px', fontWeight: '800', color: '#1D4ED8', background: '#DBEAFE', padding: '8px', borderRadius: '6px' },
  navTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' },
  navSubtitle: { margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' },
  navButtonGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  navBtn: { border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' },
  statusText: { marginBottom: '16px', color: '#1F2937', fontSize: '14px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' },
  statBox: { backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', border: '1px solid #E5E7EB' },
  statLabel: { fontSize: '12px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' },
  statVal: { fontSize: '28px', fontWeight: '800', marginTop: '6px', color: '#111827' },
  card: { backgroundColor: '#FFF', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { borderBottom: '2px solid #E5E7EB' },
  th: { padding: '12px 16px', color: '#4B5563', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #E5E7EB' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#4B5563', verticalAlign: 'middle' },
  badge: { fontSize: '12px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px', whiteSpace: 'nowrap' },
  actionLink: { background: 'none', border: 'none', color: '#2563EB', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  actionButton: { border: 'none', backgroundColor: '#2563EB', color: '#FFF', padding: '8px 12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' },
  detailLayout: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '24px', alignItems: 'start' },
  detailMain: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sidePanel: { display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' },
  overline: { fontSize: '12px', color: '#4B5563', fontWeight: '700', textTransform: 'uppercase' },
  engineOutputBox: { display: 'flex', justifyContent: 'space-between', gap: '16px', backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '8px', marginTop: '16px', borderLeft: '4px solid' },
  boxLabel: { fontSize: '13px', fontWeight: '700', color: '#4B5563', textTransform: 'uppercase' },
  boxValue: { fontSize: '32px', fontWeight: '800', margin: '4px 0' },
  summaryText: { color: '#374151', lineHeight: 1.6, margin: '16px 0 0 0' },
  dropdownCard: { backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  dropdownSummary: { cursor: 'pointer', padding: '14px 18px', fontWeight: '700', color: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  countPill: { fontSize: '12px', color: '#374151', backgroundColor: '#F3F4F6', borderRadius: '999px', padding: '2px 8px' },
  recordBlock: { padding: '0 18px 18px 18px', borderTop: '1px solid #F3F4F6' },
  recordTitle: { fontSize: '12px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', margin: '12px 0 8px 0' },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' },
  fieldItem: { backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '10px 12px', minWidth: 0 },
  fieldLabel: { display: 'block', fontSize: '11px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' },
  fieldValue: { display: 'block', fontSize: '14px', color: '#111827', overflowWrap: 'anywhere' },
  emptyText: { color: '#6B7280', fontSize: '14px', lineHeight: 1.5, padding: '12px 18px 18px 18px' },
  recItem: { display: 'flex', gap: '12px', alignItems: 'flex-start', marginTop: '12px' },
  recNumber: { backgroundColor: '#F3F4F6', color: '#1F2937', fontWeight: '700', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 },
  chatBox: { minHeight: '260px', maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', margin: '16px 0', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px', backgroundColor: '#FFF' },
  chatBubble: { maxWidth: '85%', padding: '10px 12px', borderRadius: '8px', color: '#111827', fontSize: '14px', lineHeight: 1.45 },
  chatInputRow: { display: 'flex', gap: '8px' },
  chatInput: { flex: 1, border: '1px solid #D1D5DB', borderRadius: '6px', padding: '9px 10px', fontSize: '14px', minWidth: 0 }
};
