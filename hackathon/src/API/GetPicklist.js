import { getAccessToken } from "./api";

const base_url =
  "https://preview-rls09.congacloud.com/api/metadata/v1/objects/AgreementLineItem/fields";

export async function GetPicklist(fieldname) {
  try {
    const access_token = await getAccessToken();
    const response = await fetch(`${base_url}/${fieldname}/dependency-fields`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    console.log("Success");
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err.message);
  }
}


const base_url1 =
  "https://preview-rls09.congacloud.com/api/metadata/v1/objects/APTS_Account_Contract_c/fields";

export async function GetPicklists(fieldname) {
  try {
    const access_token = await getAccessToken();
    const response = await fetch(`${base_url1}/${fieldname}/dependency-fields`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    console.log("Success");
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err.message);
  }
}
