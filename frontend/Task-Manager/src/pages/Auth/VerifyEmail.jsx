import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const hasVerifiedRef = useRef(false); // 👈 IMPORTANT

  useEffect(() => {
    const verify = async () => {
      if (hasVerifiedRef.current) return; // 🔒 block second run
      hasVerifiedRef.current = true;

      const token = params.get("token");
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        await axiosInstance.get(
          `${API_PATHS.AUTH.VERIFY_EMAIL}?token=${token}`
        );

        setStatus("success");

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [navigate, params]);

  return (
    <div className="h-screen flex items-center justify-center">
      {status === "verifying" && <p>Verifying email…</p>}
      {status === "success" && (
        <p className="text-green-600">
          Email verified! Redirecting to login…
        </p>
      )}
      {status === "error" && (
        <p className="text-red-500">
          Invalid or expired verification link
        </p>
      )}
    </div>
  );
};

export default VerifyEmail;
