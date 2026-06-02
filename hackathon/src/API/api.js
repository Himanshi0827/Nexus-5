
import { UserManager, Log, WebStorageStateStore } from "oidc-client-ts";
// const API_URL =
//   "https://preview-rls09.congacloud.com/api/data/v1/objects/AgreementLineItem";
 const userManager = new UserManager({
  authority: "https://login-rlspreview.congacloud.com/api/v1/auth",

  client_id:"05d7c408-393e-42c1-bc4a-3741caa0e131",

  redirect_uri: `${window.location.origin}/callback`,
  response_type: "code",
  scope: "openid",
  userStore: new WebStorageStateStore({ store: window.localStorage }),
});


Log.setLogger(console);

Log.setLevel(Log.DEBUG);

export function login() {
  const currentPath = window.location.pathname + window.location.search;

  userManager.signinRedirect({
    state: {
      returnUrl: currentPath,
    },
  });
}
// Handle callback & store user in session
export async function handleCallback() {
  console.log("Handle callback");
  const user = await userManager.signinRedirectCallback();
  sessionStorage.setItem("user", JSON.stringify(user));
  console.log("user:",user);
  return user;
}
 
export function getAccessToken() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user || !user.access_token) {
    login();
  }
  console.log("bearer",user.accessToken);
  return user.access_token;
}
 
/* ---------------- API CALL ---------------- */
 


export async function getAgreement() {
  const CONTRACT_URL =
      "https://preview-rls09.congacloud.com/api/data/v1/objects/Agreement";
  const accessToken = getAccessToken();
  const response = await fetch(CONTRACT_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
 
  if (!response.ok) {
    throw new Error("Failed to fetch AgreementLineItem");
  }
 
  return response.json();
}

export async function getAccountById(id) {
  try {
    const CONTRACT_URL =
      "https://preview-rls09.congacloud.com/api/data/v1/objects/Account";
 
    const accessToken = getAccessToken();
    const response = await fetch(`${CONTRACT_URL}/${id}`, {
      method: "Get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
   
      },
    });
 
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    const result = await response.json();
    return result.Data;
  } catch (err) {
    console.error(err.message);
  }
}

export async function getPrediction(payload) {

  const response = await fetch(
    "http://localhost:5000/predict",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new Error("Prediction failed");
  }

  return response.json();
}

export async function getAccount() {
  const CONTRACT_URL =
      "https://preview-rls09.congacloud.com/api/data/v1/objects/Account";
  const accessToken = getAccessToken();
  const response = await fetch(CONTRACT_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
 
  if (!response.ok) {
    throw new Error("Failed to fetch Account");
  }
 
  return response.json();
}


 export async function queryGetProposal(Account_id) {
  const token = getAccessToken();

  const response = await fetch(
    "https://preview-rls09.congacloud.com/api/data/v1/query/Proposal",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ObjectName: "Proposal",
        Criteria: `
          Account.Id ='${Account_id}'
        `,
        Select: [
          "*"
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error("Failed to query proposals");
  }

  const result = await response.json();
  return result.Data;
}



 export async function queryGet(Account_id) {
  const token = getAccessToken();

  const response = await fetch(
    "https://preview-rls09.congacloud.com/api/data/v1/query/Proposal",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ObjectName: "Proposal",
        Criteria: `
          Account.Id ='${Account_id}'
        `,
        Select: [
          "*"
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error("Failed to query proposals");
  }

  const result = await response.json();
  return result.Data;
}