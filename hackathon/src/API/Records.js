import { getAccessToken } from "./api";

export async function GetRecords(Objects) {
  try {
    const geturl = "https://preview-rls09.congacloud.com/api/data/v1/objects";
    const access_token = getAccessToken();
    const response = await fetch(`${geturl}/${Objects}`, {
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

  
    return response.json();
  } catch (err) {
    console.log(err.message);
  }
}
