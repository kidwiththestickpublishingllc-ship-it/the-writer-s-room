"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function VerifyPage() {
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [taxForm, setTaxForm] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !country || !taxForm) {
      setError("Please complete all fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in.");
        return;
      }
      const { error: dbError } = await supabase
        .from("writer_verification")
        .upsert([{
          writer_id: session.user.id,
          full_legal_name: fullName,
          country,
          tax_form_type: taxForm,
          is_adult_content_creator: isAdult,
          verification_status: "pending",
          submitted_at: new Date().toISOString(),
        }]);
      if (dbError) throw dbError;
      await supabase
        .from("profiles")
        .update({ verification_status: "pending" })
        .eq("id", session.user.id);
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: "#111122",
    border: "1px solid rgba(201,168,76,0.15)",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "16px",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#aaa",
    fontSize: "12px",
    marginBottom: "6px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "12px",
  };

  const btnStyle: React.CSSProperties = {
    padding: "10px 24px",
    borderRadius: "8px",
    border: "1px solid rgba(201,168,76,0.3)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    transition: "all 0.2s",
  };

  if (submitted) return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0a14",
      padding: "24px",
    }}>
      <div style={{ maxWidth: "480px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🕯️</div>
        <h1 style={{
          color: "#C9A84C",
          fontFamily: "Georgia, serif",
          fontSize: "28px",
          margin: "0 0 12px",
        }}>
          Verification Submitted
        </h1>
        <p style={{
          color: "#888",
          fontSize: "15px",
          lineHeight: 1.7,
          margin: "0 0 24px",
        }}>
          We will review your information within 2 to 3 business days
          and notify you by email when approved.
          You can continue publishing while we review. 📚
        </p>
        <a href="/dashboard" style={{
          padding: "12px 24px",
          background: "#C9A84C",
          color: "#0a0a14",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 700,
          display: "inline-block",
        }}>
          Back to Dashboard
        </a>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a14",
      color: "#fff",
      padding: "40px 24px",
      fontFamily: "Georgia, serif",
    }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>

        <div style={{ marginBottom: "32px" }}>
          <h1 style={{
            color: "#C9A84C",
            fontSize: "28px",
            fontWeight: 600,
            margin: "0 0 8px",
          }}>
            Writer Verification 🪶
          </h1>
          <p style={{ color: "#666", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
            Required before your first payout.
            You can publish freely while verification is pending.
          </p>
        </div>

        <div style={{
          background: "rgba(201,168,76,0.05)",
          border: "1px solid rgba(201,168,76,0.15)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
        }}>
          <p style={{ color: "#C9A84C", fontSize: "13px", fontWeight: 600, margin: "0 0 12px" }}>
            WHY WE VERIFY
          </p>
          <p style={{ color: "#888", fontSize: "13px", lineHeight: 1.7, margin: "0 0 6px" }}>
            🔒 Protects your earnings and ensures payments reach you safely.
          </p>
          <p style={{ color: "#888", fontSize: "13px", lineHeight: 1.7, margin: "0 0 6px" }}>
            📋 Complies with US tax reporting requirements for creator payments.
          </p>
          <p style={{ color: "#888", fontSize: "13px", lineHeight: 1.7, margin: 0 }}>
            🌍 Your information is stored securely and never shared.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div style={cardStyle}>
            <p style={{ color: "#C9A84C", fontSize: "12px", fontWeight: 600, margin: "0 0 16px", letterSpacing: "0.05em" }}>
              STEP 1 — YOUR INFORMATION
            </p>
            <label style={labelStyle}>Full Legal Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="As it appears on your ID"
              required
              style={inputStyle}
            />
            <label style={labelStyle}>Country of Residence</label>
            <input
              type="text"
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="United States, Japan, Brazil..."
              required
              style={{ ...inputStyle, marginBottom: 0 }}
            />
          </div>

          <div style={cardStyle}>
            <p style={{ color: "#C9A84C", fontSize: "12px", fontWeight: 600, margin: "0 0 8px", letterSpacing: "0.05em" }}>
              STEP 2 — TAX FORM TYPE
            </p>
            <p style={{ color: "#666", fontSize: "13px", margin: "0 0 16px", lineHeight: 1.6 }}>
              US based writers need a W-9.
              Writers outside the US need a W-8BEN.
              We will send you the correct form by email after submission.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {["W-9", "W-8BEN"].map(form => (
                <button
                  key={form}
                  type="button"
                  onClick={() => setTaxForm(form)}
                  style={{
                    ...btnStyle,
                    background: taxForm === form ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.03)",
                    borderColor: taxForm === form ? "#C9A84C" : "rgba(255,255,255,0.1)",
                    color: taxForm === form ? "#C9A84C" : "#666",
                  }}
                >
                  {form === "W-9" ? "W-9 — I am based in the US" : "W-8BEN — I am outside the US"}
                </button>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <p style={{ color: "#C9A84C", fontSize: "12px", fontWeight: 600, margin: "0 0 16px", letterSpacing: "0.05em" }}>
              STEP 3 — CONTENT TYPE
            </p>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isAdult}
                onChange={e => setIsAdult(e.target.checked)}
                style={{ marginTop: "2px", accentColor: "#C9A84C" }}
              />
              <span style={{ color: "#888", fontSize: "13px", lineHeight: 1.6 }}>
                I intend to publish adult content on The Red Room.
                I confirm I am 18 years of age or older and understand
                that additional identity verification may be required.
              </span>
            </label>
          </div>

          {error && (
            <div style={{
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.3)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
            }}>
              <p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !fullName || !country || !taxForm}
            style={{
              width: "100%",
              padding: "16px",
              background: submitting || !fullName || !country || !taxForm
                ? "rgba(201,168,76,0.3)"
                : "#C9A84C",
              color: "#0a0a14",
              borderRadius: "8px",
              border: "none",
              fontSize: "15px",
              fontWeight: 700,
              cursor: submitting || !fullName || !country || !taxForm
                ? "not-allowed"
                : "pointer",
            }}
          >
            {submitting ? "Submitting..." : "Submit Verification 🕯️"}
          </button>

        </form>
      </div>
    </div>
  );
}
