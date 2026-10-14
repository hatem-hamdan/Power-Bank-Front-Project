import { useEffect, useState } from "react";
import { errorMessage } from "../../api/client";
import { loginAccount, loginWithGoogle, registerAccount } from "../../api/authApi";
import { useStore } from "../../context/StoreContext";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.7 7.1l6.3 5.3C37.4 38.4 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

export function AuthDialog() {
  const { authOpen, setAuthOpen, googleClientId, saveSession } = useStore();
  const [mode, setMode] = useState("signin");
  const [step, setStep] = useState("main");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authOpen || step !== "google" || !googleClientId) {
      return undefined;
    }

    let cancelled = false;

    loadGoogle(googleClientId, async (response) => {
      try {
        const result = await loginWithGoogle(response.credential);
        saveSession(result.data);
      } catch (requestError) {
        if (!cancelled) {
          setError(errorMessage(requestError, "Google sign-in failed. Please try again."));
        }
      }
    }).catch(() => {
      if (!cancelled) {
        setError("Could not load Google sign-in. Check your connection.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authOpen, step, googleClientId, saveSession]);

  if (!authOpen) {
    return null;
  }

  function close() {
    setAuthOpen(false);
    setError("");
    setStep("main");
  }

  async function submit(event) {
    event.preventDefault();

    if (busy) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      if (mode === "register") {
        const fullName = String(form.get("fullName") || "").trim();
        const confirm = String(form.get("confirm") || "");

        if (fullName.length < 2) {
          setError("Enter your full name.");
          return;
        }

        if (password.length < 8) {
          setError("Use at least 8 characters.");
          return;
        }

        if (password !== confirm) {
          setError("Passwords do not match.");
          return;
        }

        const result = await registerAccount({ fullName, email, password });
        saveSession(result.data);
      } else {
        const result = await loginAccount({ email, password });
        saveSession(result.data);
      }
    } catch (requestError) {
      const fallback = mode === "register" ? "Could not create your account." : "Email or password is incorrect.";
      setError(requestError.response?.status === 409 ? "An account with this email already exists. Sign in instead." : errorMessage(requestError, fallback));
    } finally {
      setBusy(false);
    }
  }

  const register = mode === "register";

  return (
    <div className="dialog-backdrop" onClick={close}>
      <div className="dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-button" onClick={close} aria-label="Close">
          ×
        </button>
        {step === "google" ? (
          <>
            <h2>Continue with Google</h2>
            <p className="muted">
              {googleClientId
                ? "Choose your Google account to enter TINYVOLT. We never see your Google password."
                : "Google sign-in is not available yet. Please use email for now."}
            </p>
            <div id="google-button" />
            <p className="form-error">{error}</p>
            <div className="switch-line">
              <button type="button" className="text-button" onClick={() => setStep("main")}>
                Back
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <div className="eyebrow">TINYVOLT</div>
            <h2>{register ? "Create your account" : "Welcome back"}</h2>
            <p className="muted">{register ? "Save your details and check out faster." : "Sign in to your TINYVOLT account."}</p>
            <button
              type="button"
              className="google-button"
              onClick={() => {
                setError("");
                setStep("google");
              }}
            >
              <GoogleMark />
              Continue with Google
            </button>
            <div className="divider">OR</div>
            {register ? (
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" name="fullName" autoComplete="name" placeholder="Alex Morgan" />
              </div>
            ) : null}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="you@email.com" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={register ? "new-password" : "current-password"}
                placeholder={register ? "At least 8 characters" : "Your password"}
              />
            </div>
            {register ? (
              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <input id="confirm" name="confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Repeat password" />
              </div>
            ) : null}
            <p className="form-error">{error}</p>
            <button type="submit" className="primary full" disabled={busy}>
              {register ? "Create account" : "Sign in"}
            </button>
            <button type="button" className="text-button" style={{ display: "block", margin: "8px auto 0" }} onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? "Hide password" : "Show password"}
            </button>
            <div className="switch-line">
              {register ? "Already have an account? " : "New here? "}
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setMode(register ? "signin" : "register");
                  setError("");
                }}
              >
                {register ? "Sign in" : "Create account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function loadGoogle(clientId, onCredential) {
  return new Promise((resolve, reject) => {
    const ready = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: onCredential,
      });
      const slot = document.getElementById("google-button");

      if (slot) {
        slot.innerHTML = "";
        window.google.accounts.id.renderButton(slot, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 280,
        });
      }

      resolve();
    };

    if (window.google?.accounts) {
      ready();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = ready;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
