import { useEffect } from "react";
import { clearSession } from "../lib/api";

const LogoutPage = () => {
  useEffect(() => {
    clearSession();
    window.location.href = "/";
  }, []);

  return null;
};

export default LogoutPage;
