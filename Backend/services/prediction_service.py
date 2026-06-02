import json

from services.gemini_service import get_prediction


FOCUS_FIELDS = {
    "account": [
        "risk_tier", "risk_tier_c", "renewal_readiness_score", "renewal_readiness_score_c",
        "arr_health", "arr_health_c", "outside_risk_to_renewal", "outside_risk_to_renewal_c",
        "competitor_activity", "competitor_activity_c", "license_utilization_pct",
        "license_utilization_pct_c", "usage_trend", "usage_trend_c", "production_deployment",
        "production_deployment_c", "products_in_use", "products_in_use_c", "products_not_used",
        "products_not_used_c", "last_engagement_days_ago", "last_engagement_days_ago_c",
        "csm_engagement_level", "csm_engagement_level_c", "support_tickets_last_90_days",
        "support_tickets_last_90_days_c", "escalations", "escalations_c", "nps_score",
        "nps_score_c", "days_to_renewal", "days_to_renewal_c", "tenure_years",
        "tenure_years_c", "previous_renewal_count", "previous_renewal_count_c",
        "subscription_renewal_type", "subscription_renewal_type_c", "acv_usd", "acv_usd_c",
        "Industry", "AnnualRevenue", "Name", "Id"
    ],
    "agreements": [
        "subscription_renewal_type", "subscription_renewal_type_c", "Status", "status",
        "status_category", "status_category_c", "termination_notice_days",
        "termination_notice_days_c", "limitation_of_liability", "limitation_of_liability_c",
        "amendments_count", "amendments_count_c", "document_versions_count",
        "document_versions_count_c", "approvals_count", "approvals_count_c",
        "agreement_end_date", "agreement_end_date_c", "EffectiveDate", "effective_date",
        "term_months", "term_months_c", "type_of_paper", "type_of_paper_c",
        "payment_terms", "payment_terms_c"
    ],
    "assets": [
        "asset_status", "asset_status_c", "Status", "days_to_asset_expiry",
        "days_to_asset_expiry_c", "quantity", "Quantity", "arr_usd", "arr_usd_c",
        "acv_usd", "acv_usd_c", "selling_term_months", "selling_term_months_c",
        "asset_expired", "asset_expired_c"
    ],
    "entitlements": [
        "status", "Status", "cases_used", "cases_used_c", "remaining_cases",
        "remaining_cases_c", "support_tier_numeric", "support_tier_numeric_c",
        "end_date", "end_date_c", "EndDate"
    ],
    "opportunities": [
        "stage", "Stage", "StageName", "days_in_current_stage", "days_in_current_stage_c",
        "close_date", "close_date_c", "CloseDate", "forecast_category",
        "forecast_category_c", "ForecastCategory", "quote_attached", "quote_attached_c",
        "stage_history_count", "stage_history_count_c"
    ],
    "quotes": [
        "approval_stage", "approval_stage_c", "discount_pct", "discount_pct_c",
        "quote_revisions", "quote_revisions_c", "valid_until_date", "valid_until_date_c",
        "upsell_accepted", "upsell_accepted_c", "primary", "Primary", "primary_c"
    ],
    "quoteLines": [
        "sales_discount_pct", "sales_discount_pct_c", "quantity", "Quantity",
        "charge_type", "charge_type_c", "ext_net_price", "ext_net_price_c",
        "approval_status", "approval_status_c"
    ],
    "renewals": [
        "renewed", "renewed_c", "churn_reason", "churn_reason_c",
        "engagement_score_at_renewal", "engagement_score_at_renewal_c",
        "license_utilization_at_renewal", "license_utilization_at_renewal_c",
        "days_before_expiry_contacted", "days_before_expiry_contacted_c",
        "executive_engaged", "executive_engaged_c", "discount_given_pct",
        "discount_given_pct_c", "upsell_included", "upsell_included_c"
    ]
}


def compact_record(record, fields):
    compact = {}
    for field in fields:
        if field in record and record[field] not in (None, ""):
            compact[field] = record[field]
    return compact


def compact_related_records(records, group_key, limit=8):
    fields = FOCUS_FIELDS.get(group_key, [])
    return [compact_record(record, fields) for record in records[:limit]]


def compact_account(account):
    return {
        "accountId": account.get("Id") or account.get("id"),
        "account": compact_record(account, FOCUS_FIELDS["account"]),
        "relatedCounts": {
            "agreements": len(account.get("agreements", [])),
            "opportunities": len(account.get("opportunities", [])),
            "quotes": len(account.get("quotes", account.get("proposals", []))),
            "quoteLines": len(account.get("quoteLines", [])),
            "assets": len(account.get("assets", [])),
            "renewals": len(account.get("renewals", [])),
            "entitlements": len(account.get("entitlements", []))
        },
        "agreements": compact_related_records(account.get("agreements", []), "agreements"),
        "opportunities": compact_related_records(account.get("opportunities", []), "opportunities"),
        "quotes": compact_related_records(account.get("quotes", account.get("proposals", [])), "quotes"),
        "quoteLines": compact_related_records(account.get("quoteLines", []), "quoteLines"),
        "assets": compact_related_records(account.get("assets", []), "assets"),
        "renewals": compact_related_records(account.get("renewals", []), "renewals"),
        "entitlements": compact_related_records(account.get("entitlements", []), "entitlements")
    }


def build_bulk_prompt(accounts):
    compact_accounts = [compact_account(account) for account in accounts]

    return f"""
You are a Renewal Intelligence Engine for Conga account data.

Analyze every account below and return ONLY valid JSON. Do not wrap the JSON in markdown.
Return exactly one prediction for every account id in the same input order.

Accounts:
{json.dumps(compact_accounts, indent=2, default=str)}

Return format:
{{
  "predictions": [
    {{
      "accountId": "same account id from input",
      "riskScore": 35,
      "probability": "65%",
      "renewalPercentage": 65,
      "healthStatus": "Healthy",
      "riskLevel": "Low",
      "summary": "One concise account-level summary.",
      "keyReasons": ["Reason 1", "Reason 2"],
      "recommendedActions": ["Action 1", "Action 2"]
    }}
  ]
}}
"""


def build_account_analysis_prompt(account_data):
    account = account_data.get("account", account_data) if isinstance(account_data, dict) else account_data

    return f"""
You are a senior renewal risk analyst.

Analyze this single Conga account and its related Agreement, Asset, Entitlement, Opportunity, Quote, Quote Line, and Renewal context.
Return ONLY valid JSON. Do not wrap the JSON in markdown.

Account Context:
{json.dumps(compact_account(account), indent=2, default=str)}

Return format:
{{
  "analysis": {{
    "accountId": "same account id from input",
    "riskScore": 35,
    "probability": "65%",
    "renewalPercentage": 65,
    "riskLevel": "Low",
    "healthStatus": "Healthy",
    "summary": "A concise explanation of the renewal probability and main blockers.",
    "keyReasons": [
      "Specific reason based on account or related object data",
      "Specific reason based on account or related object data",
      "Specific reason based on account or related object data"
    ],
    "watchItems": [
      "Metric or object field to monitor",
      "Metric or object field to monitor"
    ],
    "recommendedActions": [
      "Immediate next action",
      "Immediate next action"
    ]
  }}
}}
"""


def build_suggestions_prompt(account_data):
    account = account_data.get("account", account_data) if isinstance(account_data, dict) else account_data

    return f"""
You are a customer success leader creating a renewal save plan.

Use the Conga account and related records below to recommend practical actions that improve renewal probability.
Prioritize actions that are specific, measurable, and tied to fields in the data.
Return ONLY valid JSON. Do not wrap the JSON in markdown.

Account Context:
{json.dumps(compact_account(account), indent=2, default=str)}

Return format:
{{
  "suggestions": [
    "Action 1 with owner/timing",
    "Action 2 with owner/timing",
    "Action 3 with owner/timing",
    "Action 4 with owner/timing"
  ],
  "emailTalkingPoints": [
    "Customer-facing talking point",
    "Customer-facing talking point"
  ],
  "internalNextSteps": [
    "Internal owner and action",
    "Internal owner and action"
  ]
}}
"""


def build_chat_prompt(payload):
    account = payload.get("account", {})
    messages = payload.get("messages", [])
    message = payload.get("message", "")

    return f"""
You are a renewal intelligence chat assistant. Answer the user's question using only the account context and prior chat below.
Be concise, practical, and specific. Return ONLY valid JSON. Do not wrap the JSON in markdown.

Account Context:
{json.dumps(compact_account(account), indent=2, default=str)}

Prior Chat:
{json.dumps(messages[-8:], indent=2, default=str)}

Latest User Question:
{message}

Return format:
{{
  "reply": "Helpful answer for the user",
  "supportingSignals": [
    "Data signal 1",
    "Data signal 2"
  ],
  "nextBestAction": "One recommended next action"
}}
"""


def generate_renewal_prediction(account_data):
    accounts = account_data.get("accounts") if isinstance(account_data, dict) else None
    prompt = build_bulk_prompt(accounts) if isinstance(accounts, list) else build_account_analysis_prompt(account_data)
    return get_prediction(prompt)


def generate_account_analysis(account_data):
    return get_prediction(build_account_analysis_prompt(account_data))


def generate_suggestions(account_data):
    return get_prediction(build_suggestions_prompt(account_data))


def generate_chat_response(payload):
    return get_prediction(build_chat_prompt(payload))
