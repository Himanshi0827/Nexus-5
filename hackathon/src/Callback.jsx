import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleCallback } from "./API/api";


function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const user = await handleCallback();
        console.log("User after callback:", user);

        // Get original route
        const returnUrl = user?.state?.returnUrl || "/";

        navigate(returnUrl);
      } catch (err) {
        console.error("Login failed", err);
        navigate("/");
      }
    };

    processCallback();
  }, [navigate]);

  return <p>Signing you in...</p>;
}
export default Callback;