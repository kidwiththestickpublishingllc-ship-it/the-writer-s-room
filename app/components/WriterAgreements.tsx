"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// =============================================================
// TTL Writer Agreements
// Drop in: app/writers-room/components/WriterAgreements.tsx
// Usage: import WriterAgreements from "./components/WriterAgreements"
//        <WriterAgreements />  — renders as a nav button that opens modal flow
// =============================================================

// ── Document content ─────────────────────────────────────────

const PLAGIARISM_CLAUSE = `THE TINIEST LIBRARY — PLAGIARISM CLAUSE
Document Version: v1.0
Effective Date: 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ORIGINAL WORK REQUIREMENT

By submitting any story, chapter, poem, memoir, or other written work ("Content") to The Tiniest Library ("TTL"), you represent and warrant that:

(a) The Content is entirely your own original creation;
(b) You are the sole author of the Content, or have obtained all necessary permissions from any co-authors;
(c) The Content has not been previously published elsewhere in substantially the same form without disclosure;
(d) The Content does not infringe upon the intellectual property rights, privacy rights, or any other rights of any third party.

2. PROHIBITION ON PLAGIARISM

You agree that you will not submit Content that:

(a) Reproduces, in whole or in substantial part, the work of another author without proper attribution and permission;
(b) Was generated entirely by artificial intelligence without meaningful human authorship, creative direction, and editorial oversight;
(c) Misrepresents the source, origin, or authorship of any portion of the submitted work;
(d) Incorporates copyrighted material belonging to others beyond what is permitted by fair use doctrine.

3. AI-ASSISTED WRITING POLICY

TTL permits the use of AI tools as writing aids, subject to the following conditions:

(a) The human writer must be the primary creative force behind the work — the ideas, voice, characters, and narrative must originate with you;
(b) AI may be used for editing, brainstorming, grammar correction, and structural suggestions;
(c) You may not submit work that is predominantly AI-generated and present it as your own human authorship;
(d) You must be able to discuss and defend your work as a human author at any time TTL requests.

4. CONSEQUENCES OF VIOLATION

TTL reserves the right to:

(a) Remove any Content found to be plagiarized without notice or compensation;
(b) Permanently terminate the account of any writer found to have submitted plagiarized work;
(c) Pursue legal remedies in cases of willful copyright infringement;
(d) Report violations to relevant literary and publishing communities.

5. REPORTING AND INVESTIGATION

If you believe another writer has plagiarized your work, contact TTL at contact@the-tiniest-library.com. TTL will investigate all credible reports and take appropriate action within a reasonable timeframe.

6. REPRESENTATION

By signing below, you confirm that you have read, understood, and agree to abide by this Plagiarism Clause in its entirety. You understand that your typed name below constitutes a legally binding electronic signature under the Electronic Signatures in Global and National Commerce Act (ESIGN Act) and equivalent laws.`;

const COPYRIGHT_AGREEMENT = `THE TINIEST LIBRARY — COPYRIGHT AGREEMENT
Document Version: v1.0
Effective Date: 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. YOU OWN YOUR WORK

The Tiniest Library believes fundamentally that writers own what they write. By publishing on TTL, you do not transfer, assign, or surrender your copyright. You remain the sole copyright holder of all Content you submit.

2. LICENSE GRANTED TO TTL

By submitting Content to TTL, you grant The Tiniest Library a limited, non-exclusive, royalty-free license to:

(a) Display, reproduce, and distribute your Content on the TTL platform and associated properties;
(b) Use your name, pen name, and author bio in connection with promoting your Content;
(c) Create promotional excerpts of up to 150 words for marketing purposes with attribution;
(d) Archive your Content for platform continuity and backup purposes.

This license exists solely to operate the TTL platform. It does not grant TTL the right to sell, sublicense, or commercially exploit your work outside the platform without your explicit written consent.

3. YOUR RETAINED RIGHTS

You retain the right to:

(a) Publish your work elsewhere simultaneously or at any time — TTL does not require exclusivity unless you opt into an Exclusive listing;
(b) Remove your work from TTL at any time by contacting us — removal will be processed within 14 business days;
(c) Negotiate separate licensing deals for your work with any third party;
(d) Adapt, expand, translate, or create derivative works from your own Content;
(e) Credit TTL as the original publisher in any subsequent publication of the work.

4. EXCLUSIVE LISTINGS (OPT-IN ONLY)

If you choose to mark a story as "Exclusive" on TTL:

(a) You agree not to publish that specific story on any other platform for the duration of its Exclusive status;
(b) Exclusive status may be removed at any time by contacting TTL with 30 days notice;
(c) In exchange for exclusivity, TTL will promote your story with priority placement and featured author status.

5. INK REVENUE

TTL's Ink economy works as follows:

(a) Readers spend Ink to unlock your stories — TTL distributes a portion of Ink revenue to authors on a monthly basis;
(b) The current revenue share rate is disclosed in your author dashboard and may be updated with 30 days notice;
(c) Tips sent directly by readers via the Ink Jar go entirely to you, with no platform fee;
(d) Revenue distributions require a minimum threshold of accumulated Ink before payout.

6. MORAL RIGHTS

TTL respects your moral rights as an author. We will not:

(a) Alter your work without your consent beyond formatting for platform display;
(b) Remove your attribution or present your work as the work of another person;
(c) Use your work in a context that would damage your reputation.

7. TERM AND TERMINATION

This agreement remains in effect for as long as your Content is hosted on TTL. Upon removal of your Content, the license granted in Section 2 terminates automatically, except for archival copies retained for legal compliance.

8. REPRESENTATION

By signing below, you confirm that you have read, understood, and agree to this Copyright Agreement in its entirety. You affirm that you hold the copyright to all Content you submit to TTL and have the authority to grant the license described herein. Your typed name constitutes a legally binding electronic signature.`;

// ── Styles ───────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;500;600;700&display=swap');

  .wa-trigger {
    font-family: 'Syne', sans-serif;
    font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
    color: rgba(232,228,218,0.6);
    border: 1px solid rgba(232,228,218,0.15);
    background: transparent;
    padding: 6px 16px; border-radius: 6px;
    cursor: pointer; transition: all 0.2s;
    display: inline-flex; align-items: center; gap: 7px;
  }
  .wa-trigger:hover {
    color: #E2C97E;
    border-color: rgba(201,168,76,0.4);
    background: rgba(201,168,76,0.08);
  }
  .wa-trigger-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #4ade80; flex-shrink: 0;
  }
  .wa-trigger-dot.unsigned { background: #fbbf24; }
  .wa-trigger-dot.partial { background: #60a5fa; }

  /* Overlay */
  .wa-overlay {
    position: fixed; inset: 0; z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .wa-backdrop {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.92);
    backdrop-filter: blur(12px);
    cursor: pointer;
  }

  /* Modal */
  .wa-modal {
    position: relative; z-index: 10;
    width: 100%; max-width: 780px;
    background: #0f0f0f;
    border: 1px solid rgba(201,168,76,0.3);
    border-radius: 4px;
    display: flex; flex-direction: column;
    max-height: 92vh;
    overflow: hidden;
    box-shadow: 0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,168,76,0.15);
  }

  /* Top gold accent line */
  .wa-modal-top {
    height: 3px;
    background: linear-gradient(90deg, transparent, #C9A84C, #E2C97E, #C9A84C, transparent);
    flex-shrink: 0;
  }

  /* Progress bar */
  .wa-progress {
    display: flex; align-items: center; gap: 0;
    padding: 0; flex-shrink: 0;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(201,168,76,0.03);
  }
  .wa-progress-step {
    flex: 1; padding: 14px 20px;
    display: flex; align-items: center; gap: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(232,228,218,0.25);
    border-right: 1px solid rgba(255,255,255,0.06);
    transition: all 0.3s;
  }
  .wa-progress-step:last-child { border-right: none; }
  .wa-progress-step.active { color: #C9A84C; background: rgba(201,168,76,0.06); }
  .wa-progress-step.done { color: rgba(74,222,128,0.8); }
  .wa-step-num {
    width: 20px; height: 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; flex-shrink: 0;
    border: 1px solid currentColor;
    transition: all 0.3s;
  }
  .wa-progress-step.active .wa-step-num {
    background: #C9A84C; color: #000; border-color: #C9A84C;
  }
  .wa-progress-step.done .wa-step-num {
    background: rgba(74,222,128,0.15); border-color: rgba(74,222,128,0.5);
  }

  /* Header */
  .wa-header {
    padding: 28px 36px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
  }
  .wa-header-eyebrow {
    font-family: 'Syne', sans-serif;
    font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase;
    color: rgba(201,168,76,0.6); display: block; margin-bottom: 8px;
  }
  .wa-header-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px; font-weight: 300; color: #f0ece2;
    line-height: 1.1; margin-bottom: 8px;
  }
  .wa-header-meta {
    font-family: 'Syne', sans-serif;
    font-size: 10px; color: rgba(232,228,218,0.3);
    letter-spacing: 0.1em; display: flex; gap: 20px; flex-wrap: wrap;
  }

  /* Doc scroll area */
  .wa-doc {
    flex: 1; overflow-y: auto; padding: 28px 36px;
    min-height: 0;
  }
  .wa-doc::-webkit-scrollbar { width: 4px; }
  .wa-doc::-webkit-scrollbar-track { background: transparent; }
  .wa-doc::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 2px; }

  .wa-doc-text {
    font-family: 'Syne', sans-serif;
    font-size: 12px; line-height: 2; color: rgba(232,228,218,0.55);
    white-space: pre-wrap; letter-spacing: 0.03em;
  }
  .wa-doc-text strong { color: rgba(232,228,218,0.85); font-weight: 600; }

  .wa-scroll-hint {
    font-family: 'Syne', sans-serif;
    font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase;
    color: rgba(201,168,76,0.5);
    text-align: center; padding: 12px 0 4px;
    animation: wa-pulse 2s ease-in-out infinite;
  }
  @keyframes wa-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }

  /* Signature section */
  .wa-sig {
    padding: 24px 36px 28px;
    border-top: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
    background: rgba(201,168,76,0.02);
  }
  .wa-sig-title {
    font-family: 'Syne', sans-serif;
    font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase;
    color: rgba(201,168,76,0.6); margin-bottom: 16px;
  }
  .wa-sig-row {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 14px; margin-bottom: 16px;
  }
  .wa-field { display: flex; flex-direction: column; gap: 6px; }
  .wa-field-label {
    font-family: 'Syne', sans-serif;
    font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(232,228,218,0.3);
  }
  .wa-input {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 4px; padding: 10px 14px;
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px; font-weight: 300; font-style: italic;
    color: #f0ece2; outline: none;
    transition: border-color 0.2s, background 0.2s;
    width: 100%;
  }
  .wa-input::placeholder { color: rgba(232,228,218,0.2); font-style: italic; }
  .wa-input:focus { border-color: rgba(201,168,76,0.5); background: rgba(201,168,76,0.04); }
  .wa-input-date {
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-style: normal;
    color: rgba(232,228,218,0.5);
    cursor: default;
  }
  .wa-email-row { margin-bottom: 16px; }

  /* Consent line */
  .wa-consent {
    font-family: 'Syne', sans-serif;
    font-size: 10px; line-height: 1.7; color: rgba(232,228,218,0.4);
    padding: 12px 16px; border-left: 2px solid rgba(201,168,76,0.4);
    background: rgba(201,168,76,0.04); border-radius: 0 4px 4px 0;
    margin-bottom: 20px;
  }
  .wa-consent strong { color: rgba(201,168,76,0.9); }

  /* Actions */
  .wa-actions { display: flex; align-items: center; gap: 12px; }
  .wa-btn-sign {
    font-family: 'Syne', sans-serif;
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    font-weight: 700; color: #000;
    background: linear-gradient(135deg, #C9A84C, #8a6510);
    border: none; padding: 14px 32px; border-radius: 4px;
    cursor: pointer; transition: opacity 0.2s;
    display: flex; align-items: center; gap: 8px;
    flex: 1; justify-content: center;
  }
  .wa-btn-sign:hover:not(:disabled) { opacity: 0.88; }
  .wa-btn-sign:disabled { opacity: 0.35; cursor: not-allowed; }
  .wa-btn-cancel {
    font-family: 'Syne', sans-serif;
    font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
    color: rgba(232,228,218,0.4); background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    padding: 14px 20px; border-radius: 4px;
    cursor: pointer; transition: all 0.2s;
  }
  .wa-btn-cancel:hover { color: rgba(232,228,218,0.7); border-color: rgba(255,255,255,0.2); }

  /* Success screen */
  .wa-success {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 60px 40px; text-align: center;
  }
  .wa-success-icon {
    width: 64px; height: 64px; border-radius: 50%;
    background: rgba(74,222,128,0.1);
    border: 1px solid rgba(74,222,128,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; margin-bottom: 24px;
  }
  .wa-success-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px; font-weight: 300; color: #f0ece2;
    margin-bottom: 12px;
  }
  .wa-success-sub {
    font-family: 'Syne', sans-serif;
    font-size: 12px; color: rgba(232,228,218,0.45);
    line-height: 1.7; max-width: 420px; margin-bottom: 32px;
  }
  .wa-success-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .wa-btn-next {
    font-family: 'Syne', sans-serif;
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    font-weight: 700; color: #000;
    background: linear-gradient(135deg, #C9A84C, #8a6510);
    border: none; padding: 13px 28px; border-radius: 4px;
    cursor: pointer; transition: opacity 0.2s;
  }
  .wa-btn-next:hover { opacity: 0.88; }
  .wa-btn-download {
    font-family: 'Syne', sans-serif;
    font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
    color: rgba(232,228,218,0.6); background: transparent;
    border: 1px solid rgba(255,255,255,0.15);
    padding: 13px 24px; border-radius: 4px;
    cursor: pointer; transition: all 0.2s;
  }
  .wa-btn-download:hover { color: #E2C97E; border-color: rgba(201,168,76,0.4); }

  /* All done */
  .wa-all-done {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 60px 40px; text-align: center;
  }
  .wa-stamp {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(74,222,128,0.7);
    border: 2px solid rgba(74,222,128,0.3);
    padding: 8px 20px; border-radius: 2px;
    display: inline-block; margin-bottom: 24px;
    transform: rotate(-2deg);
  }
  .wa-all-done-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36px; font-weight: 300; color: #f0ece2;
    margin-bottom: 14px;
  }
  .wa-all-done-sub {
    font-family: 'Syne', sans-serif;
    font-size: 12px; color: rgba(232,228,218,0.45);
    line-height: 1.8; max-width: 440px; margin-bottom: 32px;
  }

  /* Error */
  .wa-error {
    font-family: 'Syne', sans-serif;
    font-size: 11px; color: rgba(248,113,113,0.9);
    padding: 10px 14px; border-radius: 4px;
    background: rgba(248,113,113,0.08);
    border: 1px solid rgba(248,113,113,0.2);
    margin-top: 12px;
  }

  @media (max-width: 600px) {
    .wa-sig-row { grid-template-columns: 1fr; }
    .wa-modal { max-height: 96vh; }
    .wa-header { padding: 20px 24px 16px; }
    .wa-doc { padding: 20px 24px; }
    .wa-sig { padding: 20px 24px 24px; }
    .wa-progress-step { padding: 12px; }
    .wa-step-label { display: none; }
  }
`;

// ── PDF generator (client-side via jsPDF CDN) ────────────────

async function generatePDF(
  docType: "plagiarism" | "copyright",
  writerName: string,
  writerEmail: string,
  signedAt: string
): Promise<void> {
  // Dynamically load jsPDF from CDN
  if (!(window as any).jspdf) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load jsPDF"));
      document.head.appendChild(script);
    });
  }

  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

  const pageW = 215.9;
  const pageH = 279.4;
  const margin = 25;
  const contentW = pageW - margin * 2;

  // Gold accent line at top
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(1);
  doc.line(margin, 15, pageW - margin, 15);

  // TTL header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(201, 168, 76);
  doc.text("THE TINIEST LIBRARY", margin, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(150, 140, 120);
  const docTitle = docType === "plagiarism"
    ? "PLAGIARISM CLAUSE — SIGNED AGREEMENT"
    : "COPYRIGHT AGREEMENT — SIGNED COPY";
  doc.text(docTitle, margin, 28);
  doc.text(`Document Version: v1.0  |  ${signedAt}`, pageW - margin, 28, { align: "right" });

  // Thin line
  doc.setDrawColor(60, 55, 45);
  doc.setLineWidth(0.3);
  doc.line(margin, 32, pageW - margin, 32);

  // Document title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(240, 236, 226);
  const title = docType === "plagiarism"
    ? "Plagiarism Clause"
    : "Copyright Agreement";
  doc.text(title, margin, 44);

  // Body text
  const fullText = docType === "plagiarism" ? PLAGIARISM_CLAUSE : COPYRIGHT_AGREEMENT;
  const lines = fullText.split("\n");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(180, 170, 155);

  let y = 55;
  const lineH = 5;

  for (const line of lines) {
    if (y > pageH - 60) {
      doc.addPage();
      y = 25;
      // Page header
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 90, 70);
      doc.text("THE TINIEST LIBRARY — " + docTitle, margin, 15);
      doc.setDrawColor(60, 55, 45);
      doc.setLineWidth(0.2);
      doc.line(margin, 18, pageW - margin, 18);
      y = 26;
    }

    if (line.startsWith("━")) {
      doc.setDrawColor(60, 55, 45);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += lineH * 0.8;
      continue;
    }

    // Section headers (numbered like "1. SOMETHING")
    const isHeader = /^\d+\.\s+[A-Z\s&()]+$/.test(line.trim());
    if (isHeader) {
      y += lineH * 0.5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(201, 168, 76);
      doc.text(line, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(180, 170, 155);
      y += lineH * 1.3;
      continue;
    }

    if (line.trim() === "") {
      y += lineH * 0.6;
      continue;
    }

    const wrapped = doc.splitTextToSize(line, contentW);
    for (const wl of wrapped) {
      if (y > pageH - 60) {
        doc.addPage();
        y = 26;
      }
      doc.text(wl, margin, y);
      y += lineH;
    }
  }

  // Signature block
  if (y > pageH - 70) {
    doc.addPage();
    y = 30;
  }

  y += 10;
  doc.setDrawColor(60, 55, 45);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(201, 168, 76);
  doc.text("ELECTRONIC SIGNATURE", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 140, 120);
  doc.text("This document has been electronically signed. Typed signatures are legally binding under the ESIGN Act.", margin, y, { maxWidth: contentW });
  y += 12;

  // Signature box
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentW / 2 - 5, 22, 2, 2, "S");

  doc.setFont("helvetica", "italic");
  doc.setFontSize(14);
  doc.setTextColor(240, 236, 226);
  doc.text(writerName, margin + 6, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120, 110, 90);
  doc.text("SIGNED BY (TYPED NAME)", margin + 6, y + 17);

  // Date box
  const dateX = margin + contentW / 2 + 5;
  doc.setDrawColor(60, 55, 45);
  doc.setLineWidth(0.3);
  doc.roundedRect(dateX, y, contentW / 2 - 5, 22, 2, 2, "S");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(180, 170, 155);
  doc.text(signedAt, dateX + 6, y + 9);
  doc.setFontSize(7);
  doc.setTextColor(120, 110, 90);
  doc.text("DATE SIGNED", dateX + 6, y + 17);

  y += 30;
  if (writerEmail) {
    doc.setFontSize(8);
    doc.setTextColor(120, 110, 90);
    doc.text(`Email: ${writerEmail}`, margin, y);
    y += 6;
  }
  doc.text(`Platform: The Tiniest Library — The Writer's Room`, margin, y);
  y += 6;
  doc.text(`Document type: ${docType === "plagiarism" ? "Plagiarism Clause v1.0" : "Copyright Agreement v1.0"}`, margin, y);

  // Bottom gold line
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(margin, pageH - 18, pageW - margin, pageH - 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 90, 70);
  doc.text("© The Tiniest Library — Confidential — Retain for your records", pageW / 2, pageH - 12, { align: "center" });

  const filename = docType === "plagiarism"
    ? `TTL_Plagiarism_Clause_${writerName.replace(/\s+/g, "_")}.pdf`
    : `TTL_Copyright_Agreement_${writerName.replace(/\s+/g, "_")}.pdf`;

  doc.save(filename);
}

// ── Main component ────────────────────────────────────────────

type Step = "plagiarism" | "plagiarism-done" | "copyright" | "copyright-done" | "all-done";

export default function WriterAgreements() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("plagiarism");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [plagiarismSigned, setPlagiarismSigned] = useState(false);
  const [copyrightSigned, setCopyrightSigned] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  // Check localStorage for already-signed state
  useEffect(() => {
    const p = localStorage.getItem("ttl_plagiarism_signed");
    const c = localStorage.getItem("ttl_copyright_signed");
    if (p) setPlagiarismSigned(true);
    if (c) setCopyrightSigned(true);
    if (p && !c) setStep("copyright");
  }, []);

  // Track scroll to bottom of doc
  const handleDocScroll = () => {
    const el = docRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) {
      setScrolledToBottom(true);
    }
  };

  const canSign = name.trim().length >= 3 && scrolledToBottom;

  const handleSign = async (docType: "plagiarism" | "copyright") => {
    if (!canSign) return;
    setSigning(true);
    setError("");

    const signedAt = today;

    try {
      // Save to Supabase
      const { error: dbError } = await supabase
        .from("agreements")
        .insert({
          writer_name: name.trim(),
          writer_email: email.trim() || null,
          document_type: docType,
          document_version: "v1.0",
          signed_at: new Date().toISOString(),
        });

      if (dbError) throw new Error(dbError.message);

      // Generate + download PDF
      await generatePDF(docType, name.trim(), email.trim(), signedAt);

      // Mark in localStorage
      localStorage.setItem(`ttl_${docType}_signed`, "true");

      if (docType === "plagiarism") {
        setPlagiarismSigned(true);
        setStep("plagiarism-done");
      } else {
        setCopyrightSigned(true);
        setStep("copyright-done");
      }

      setScrolledToBottom(false);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSigning(false);
    }
  };

  const goToDoc = (target: Step) => {
    setStep(target);
    setScrolledToBottom(false);
    setTimeout(() => {
      if (docRef.current) docRef.current.scrollTop = 0;
    }, 50);
  };

  const triggerStatus =
    plagiarismSigned && copyrightSigned ? "signed" :
    plagiarismSigned || copyrightSigned ? "partial" : "unsigned";

  const triggerLabel =
    triggerStatus === "signed" ? "Agreements Signed" :
    triggerStatus === "partial" ? "1 of 2 Signed" : "Sign Agreements";

  return (
    <>
      <style>{STYLES}</style>

      {/* Nav trigger button */}
      <button
        className="wa-trigger"
        onClick={() => {
          if (plagiarismSigned && copyrightSigned) {
            setStep("all-done");
          } else if (plagiarismSigned) {
            setStep("copyright");
          } else {
            setStep("plagiarism");
          }
          setOpen(true);
        }}
      >
        <span className={`wa-trigger-dot ${triggerStatus}`} />
        {triggerLabel}
      </button>

      {/* Modal */}
      {open && (
        <div className="wa-overlay">
          <div className="wa-backdrop" onClick={() => setOpen(false)} />
          <div className="wa-modal">
            <div className="wa-modal-top" />

            {/* Progress */}
            <div className="wa-progress">
              <div className={`wa-progress-step ${step === "plagiarism" ? "active" : plagiarismSigned ? "done" : ""}`}>
                <div className="wa-step-num">{plagiarismSigned ? "✓" : "1"}</div>
                <span className="wa-step-label">Plagiarism Clause</span>
              </div>
              <div className={`wa-progress-step ${step === "copyright" ? "active" : copyrightSigned ? "done" : ""}`}>
                <div className="wa-step-num">{copyrightSigned ? "✓" : "2"}</div>
                <span className="wa-step-label">Copyright Agreement</span>
              </div>
              <div className={`wa-progress-step ${step === "all-done" ? "done" : ""}`}>
                <div className="wa-step-num">{plagiarismSigned && copyrightSigned ? "✓" : "3"}</div>
                <span className="wa-step-label">Complete</span>
              </div>
            </div>

            {/* ── PLAGIARISM DOC ── */}
            {step === "plagiarism" && (
              <>
                <div className="wa-header">
                  <span className="wa-header-eyebrow">The Tiniest Library — Writer Agreement 1 of 2</span>
                  <div className="wa-header-title">Plagiarism Clause</div>
                  <div className="wa-header-meta">
                    <span>Version 1.0</span>
                    <span>Effective 2026</span>
                    <span>Scroll to bottom to unlock signature</span>
                  </div>
                </div>
                <div className="wa-doc" ref={docRef} onScroll={handleDocScroll}>
                  {!scrolledToBottom && (
                    <div className="wa-scroll-hint">↓ Scroll to read the full document</div>
                  )}
                  <div className="wa-doc-text">{PLAGIARISM_CLAUSE}</div>
                  {!scrolledToBottom && (
                    <div className="wa-scroll-hint" style={{ paddingBottom: 16 }}>↑ Continue scrolling to unlock signature</div>
                  )}
                </div>
                <div className="wa-sig">
                  <div className="wa-sig-title">Electronic Signature</div>
                  <div className="wa-sig-row">
                    <div className="wa-field">
                      <label className="wa-field-label">Full Legal Name *</label>
                      <input
                        className="wa-input"
                        type="text"
                        placeholder="Type your full name…"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                    </div>
                    <div className="wa-field">
                      <label className="wa-field-label">Date</label>
                      <input
                        className="wa-input wa-input-date"
                        type="text"
                        value={today}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="wa-email-row">
                    <div className="wa-field">
                      <label className="wa-field-label">Email (for your copy)</label>
                      <input
                        className="wa-input"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontStyle: "normal" }}
                      />
                    </div>
                  </div>
                  <div className="wa-consent">
                    By typing your name above, you confirm that you have read this Plagiarism Clause in full and agree to be legally bound by its terms. <strong>Your typed name constitutes a valid electronic signature</strong> under the ESIGN Act and equivalent legislation.
                  </div>
                  {error && <div className="wa-error">{error}</div>}
                  <div className="wa-actions">
                    <button className="wa-btn-cancel" onClick={() => setOpen(false)}>Cancel</button>
                    <button
                      className="wa-btn-sign"
                      disabled={!canSign || signing}
                      onClick={() => handleSign("plagiarism")}
                    >
                      {signing ? "Signing…" : !scrolledToBottom ? "↓ Read document to sign" : !name.trim() ? "Enter your name to sign" : "I Agree & Sign — Download PDF ↓"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── PLAGIARISM DONE ── */}
            {step === "plagiarism-done" && (
              <div className="wa-success">
                <div className="wa-success-icon">✓</div>
                <div className="wa-success-title">Plagiarism Clause Signed</div>
                <p className="wa-success-sub">
                  Your signed PDF has been downloaded and your agreement has been recorded. One document down — the Copyright Agreement is next.
                </p>
                <div className="wa-success-actions">
                  <button className="wa-btn-download" onClick={() => generatePDF("plagiarism", name, email, today)}>
                    Download Again ↓
                  </button>
                  <button className="wa-btn-next" onClick={() => goToDoc("copyright")}>
                    Continue to Copyright Agreement →
                  </button>
                </div>
              </div>
            )}

            {/* ── COPYRIGHT DOC ── */}
            {step === "copyright" && (
              <>
                <div className="wa-header">
                  <span className="wa-header-eyebrow">The Tiniest Library — Writer Agreement 2 of 2</span>
                  <div className="wa-header-title">Copyright Agreement</div>
                  <div className="wa-header-meta">
                    <span>Version 1.0</span>
                    <span>Effective 2026</span>
                    <span>Scroll to bottom to unlock signature</span>
                  </div>
                </div>
                <div className="wa-doc" ref={docRef} onScroll={handleDocScroll}>
                  {!scrolledToBottom && (
                    <div className="wa-scroll-hint">↓ Scroll to read the full document</div>
                  )}
                  <div className="wa-doc-text">{COPYRIGHT_AGREEMENT}</div>
                  {!scrolledToBottom && (
                    <div className="wa-scroll-hint" style={{ paddingBottom: 16 }}>↑ Continue scrolling to unlock signature</div>
                  )}
                </div>
                <div className="wa-sig">
                  <div className="wa-sig-title">Electronic Signature</div>
                  <div className="wa-sig-row">
                    <div className="wa-field">
                      <label className="wa-field-label">Full Legal Name *</label>
                      <input
                        className="wa-input"
                        type="text"
                        placeholder="Type your full name…"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                    </div>
                    <div className="wa-field">
                      <label className="wa-field-label">Date</label>
                      <input
                        className="wa-input wa-input-date"
                        type="text"
                        value={today}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="wa-email-row">
                    <div className="wa-field">
                      <label className="wa-field-label">Email (for your copy)</label>
                      <input
                        className="wa-input"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontStyle: "normal" }}
                      />
                    </div>
                  </div>
                  <div className="wa-consent">
                    By typing your name above, you confirm that you have read this Copyright Agreement in full and agree to its terms. You affirm that you hold copyright to all work you submit to TTL. <strong>Your typed name is a legally binding electronic signature.</strong>
                  </div>
                  {error && <div className="wa-error">{error}</div>}
                  <div className="wa-actions">
                    <button className="wa-btn-cancel" onClick={() => setOpen(false)}>Cancel</button>
                    <button
                      className="wa-btn-sign"
                      disabled={!canSign || signing}
                      onClick={() => handleSign("copyright")}
                    >
                      {signing ? "Signing…" : !scrolledToBottom ? "↓ Read document to sign" : !name.trim() ? "Enter your name to sign" : "I Agree & Sign — Download PDF ↓"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── COPYRIGHT DONE ── */}
            {step === "copyright-done" && (
              <div className="wa-success">
                <div className="wa-success-icon">✓</div>
                <div className="wa-success-title">Copyright Agreement Signed</div>
                <p className="wa-success-sub">
                  Both agreements are signed and on record. Your PDFs have been downloaded. You're now fully onboarded as a TTL writer.
                </p>
                <div className="wa-success-actions">
                  <button className="wa-btn-download" onClick={() => generatePDF("copyright", name, email, today)}>
                    Download Again ↓
                  </button>
                  <button className="wa-btn-next" onClick={() => setStep("all-done")}>
                    Complete Onboarding →
                  </button>
                </div>
              </div>
            )}

            {/* ── ALL DONE ── */}
            {step === "all-done" && (
              <div className="wa-all-done">
                <div className="wa-stamp">Agreements On File</div>
                <div className="wa-all-done-title">You're officially a TTL writer.</div>
                <p className="wa-all-done-sub">
                  Both your Plagiarism Clause and Copyright Agreement are signed, downloaded, and saved to our records. Your work is protected — and so is ours. Welcome to the library.
                </p>
                <div className="wa-success-actions">
                  <button
                    className="wa-btn-download"
                    onClick={() => generatePDF("plagiarism", name || "Writer", email, today)}
                  >
                    Re-download Plagiarism Clause
                  </button>
                  <button
                    className="wa-btn-download"
                    onClick={() => generatePDF("copyright", name || "Writer", email, today)}
                  >
                    Re-download Copyright Agreement
                  </button>
                  <button className="wa-btn-next" onClick={() => setOpen(false)}>
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
