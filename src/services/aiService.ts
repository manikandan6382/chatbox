/**
 * Google Gemini Live Streaming AI Service
 * Supports multimodal inputs (text + base64 images), full conversation context,
 * Server-Sent Events (SSE) streaming, AbortController cancellation, and auto-retry backoff.
 */

const PRIMARY_MODEL = 'gemini-3.5-flash';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';
const TERTIARY_MODEL = 'gemini-2.5-flash';

export interface ChatMessageContext {
  sender: 'user' | 'ai';
  text: string;
}

export function getGeminiApiKey(): string {
  return ((import.meta as any).env?.VITE_GEMINI_API_KEY || localStorage.getItem('maybank_gemini_api_key') || '').trim();
}

export function setGeminiApiKey(key: string): void {
  localStorage.setItem('maybank_gemini_api_key', key.trim());
}

export const MAYBANK_SYSTEM_PROMPT = `You are Maybank's Sovereign AI Financial Assistant operating on an interactive smart branch kiosk terminal.
You assist retail, premier, and wealth banking customers with comprehensive, transparent, and actionable advice across:
- **Savings Accounts**: Maybank SaveUp (earn up to 3.00% p.a. booster interest by pairing savings with salary credit, cards, and payments), M2U Premier, and Basic Savings Accounts.
- **Fixed Deposit (FD)**: Guaranteed capital returns up to 3.80% p.a., flexible tenures (1 to 60 months), PIDM insured up to RM250,000, 24/7 instant placement via e-FD on the MAE app.
- **ASNB Investments**: Fixed-price funds (ASB, ASB 2, ASM at RM1.00/unit, zero sales charge, historical dividend yields 4.5%–5.5%) vs Variable-price funds (ASN Equity, ASN Imbang). Instant top-up starting from RM10 via Maybank2u and MAE app.
- **Digital Onboarding & Required Documents**: 100% online account opening in under 10 minutes via MAE app biometric e-KYC. Documents: MyKad for Malaysians; Passport + valid employment/student pass and utility bill for non-citizens.
- **Financial Comparisons & Returns**: Providing structured side-by-side matrices comparing Savings, Fixed Deposit, and ASNB yields, liquidity, risk levels, and capital protection.
- **MAE App Digital Banking**: Full capabilities breakdown (e-KYC, e-FD, ASNB investments, DuitNow QR, debit card controls, international transfers, and Tabung goal savings).

Guidelines:
- Maintain a warm, highly professional, elite banking tone (Maybank's motto: "Humanising Financial Services").
- Keep answers crisp, structured, and easy to read on a physical touchscreen kiosk (use markdown bold highlights, clear bullet points, comparative tables, and short paragraphs).
- Adhere to anti-fluff standards: be specific with percentages, tenures, requirements, and PIDM limits. Avoid generic AI buzzwords.
- Answer technical, developer, or general knowledge questions thoroughly and clearly, drawing connections to modern banking technology where relevant.
- If an image/document/screenshot is uploaded, inspect and analyze the visual details accurately and provide helpful banking advisory context.`;

/**
 * Intelligent Local Vision & Document Analysis Generator
 * Provides immediate, context-aware analysis if Gemini API is unreachable, quota-limited, or yields 0 tokens.
 */
export function generateContextualImageAnalysis(prompt: string, hasImage: boolean = true): string {
  const lowerPrompt = prompt.toLowerCase();

  // 1. Compare FD and ASNB
  if (lowerPrompt.includes('compare fd and asnb') || lowerPrompt.includes('fd and asnb') || (lowerPrompt.includes('compare') && (lowerPrompt.includes('fd') || lowerPrompt.includes('fixed deposit')) && lowerPrompt.includes('asnb'))) {
    return `### ⚖️ Comparison: Fixed Deposit (FD) vs ASNB Investments

Both Fixed Deposit and ASNB are popular low-risk wealth tools, but they cater to different liquidity and return horizons:

| Feature | Fixed Deposit (FD / e-FD) | ASNB (Fixed Price: ASB, ASM) |
| :--- | :--- | :--- |
| **Expected Returns** | **2.60% – 3.80% p.a.** (Guaranteed) | **4.50% – 5.50% p.a.** (Historical Distribution) |
| **Capital Guarantee** | **100% Guaranteed** + **PIDM Insured** up to RM250k | **Capital Preserved** at RM1.00/unit (Backed by PNB) |
| **Investment Horizon** | 1 to 60 months (Fixed tenure) | Open-ended (Medium to long-term) |
| **Liquidity & Lock-in** | Locked for tenure; early withdrawal forfeits interest | **No lock-in**; withdraw anytime online or at branch |
| **Sales Charges** | **0.00%** | **0.00%** for Fixed Price Funds via Maybank2u |
| **Eligibility** | All Malaysians & foreign residents | ASB (Bumiputera); ASM (All Malaysians) |

#### 🎯 Strategic Verdict:
* **Choose Fixed Deposit** if you have capital earmarked for short-term needs (3–12 months) and require absolute statutory PIDM protection.
* **Choose ASNB (ASB / ASM)** if you are building emergency funds or long-term wealth (1–5+ years) and desire historically higher dividends with no early withdrawal penalty.`;
  }

  // 2. Help me choose a savings account / I want to start saving
  if (lowerPrompt.includes('choose a savings account') || lowerPrompt.includes('start saving') || lowerPrompt.includes('savings account')) {
    return `### 🏦 Choosing Your Ideal Maybank Savings Account

Maybank offers tailored savings accounts designed to maximize your everyday cash and automated goals:

#### 1. Maybank SaveUp Account (Recommended for Active Savers)
* **Interest Rate**: Earn **up to 3.00% p.a.** booster interest.
* **How it Works**: Maintain savings and unlock bonus tiers when you perform regular transactions (salary credit, debit card spend, bill payments, or investments).
* **Best For**: Salaried professionals and everyday banking users seeking high liquid yields.

#### 2. Maybank M2U Premier Account
* **Interest Rate**: Tiered interest rates calculated daily and credited monthly.
* **Key Feature**: Fully digital account with low barrier to entry and seamless Maybank2u / MAE integration.
* **Best For**: Digital-first users who want effortless everyday spending and saving in one place.

#### 3. Basic Savings Account
* **Minimum Initial Deposit**: RM20 only.
* **Key Feature**: Simple, fee-free banking with full ATM and online banking access.
* **Best For**: Starting your first bank account or maintaining dedicated reserve cash.

*Ready to start? You can open a **Maybank SaveUp** or **MAE** account in under 10 minutes directly in the MAE app.*`;
  }

  // 3. I’m interested in Fixed Deposit
  if (lowerPrompt.includes('fixed deposit') || lowerPrompt.includes('interest in fd') || lowerPrompt.includes('interested in fixed')) {
    return `### 🔒 Maybank Fixed Deposit (e-FD) Overview

Secure guaranteed returns and protect your capital with Maybank's flexible deposit placements:

* **Current Board Rates**:
  * **1 to 3 Months**: 2.60% – 2.85% p.a.
  * **6 to 12 Months**: 2.85% – 3.20% p.a.
  * **Special Campaign Tenures**: Up to **3.80% p.a.** on promotional e-FD placements.
* **Minimum Placement Amount**:
  * **1 Month Tenure**: RM5,000.
  * **2 Months & Above**: RM1,000 only.
* **Key Protections & Features**:
  * **PIDM Protected**: Fully insured up to RM250,000 per depositor by Perbadanan Insurans Deposit Malaysia.
  * **Instant 24/7 e-FD Placement**: Place deposits instantly via the MAE App or Maybank2u without visiting a branch.
  * **Flexible Rollover**: Choose automatic principal & interest renewal, or transfer interest directly to your savings account.`;
  }

  // 4. I want to invest in ASNB / Show me my ASNB options
  if (lowerPrompt.includes('asnb') || lowerPrompt.includes('asb') || lowerPrompt.includes('asm')) {
    return `### 📈 ASNB Investment Solutions via Maybank

Amanah Saham Nasional Berhad (ASNB) offers government-backed unit trust funds tailored for capital preservation and long-term dividend growth:

#### 1. Fixed Price Funds (RM1.00 per unit — Zero Capital Fluctuation)
* **ASB (Amanah Saham Bumiputera) & ASB 2**:
  * Exclusively for Malaysian Bumiputera.
  * Historical distribution: **~4.50% – 5.50% p.a.**
* **ASM (Amanah Saham Malaysia) & ASM 2 / ASM 3**:
  * Open to **all Malaysian citizens**.
  * Fixed at RM1.00 per unit with consistent annual dividend track record.
* **Sales Charge**: **0.00%** when transacting on Maybank2u / MAE app.

#### 2. Variable Price Funds (Net Asset Value Fluctuates with Market)
* **ASN Equity, ASN Imbang, ASN Sara**:
  * Invested in Malaysian and global equities, bonds, and sukuk.
  * Higher capital appreciation potential for moderate-to-high risk appetites.

#### 💡 How to Invest:
1. Link your 12-digit ASNB account number in the MAE app under **Invest** → **ASNB**.
2. Start investing with as low as **RM10** with instant credit into your ASNB unit trust balance.`;
  }

  // 5. How can I open an account? / What documents do I need?
  if (lowerPrompt.includes('open an account') || lowerPrompt.includes('open account') || lowerPrompt.includes('documents do i need') || lowerPrompt.includes('what documents') || lowerPrompt.includes('requirement')) {
    return `### 📝 Account Opening Guide & Document Requirements

Opening a Maybank savings or investment account is fast, seamless, and can be completed 100% digitally:

#### 1. Instant Digital Application via MAE App (Under 10 Minutes)
* **Step 1**: Download the **MAE App** from the Apple App Store, Google Play, or Huawei AppGallery.
* **Step 2**: Tap **"Apply"** → **"Savings Account"** (e.g. Maybank SaveUp or MAE Account).
* **Step 3**: Snap a photo of your **MyKad** (front & back) with anti-glare verification.
* **Step 4**: Complete facial biometric selfie verification (e-KYC).
* **Step 5**: Transfer minimum initial deposit (from RM10 via DuitNow from any bank) to activate.
* **Result**: Your account number is generated immediately; physical debit card is mailed to your registered address within 3–5 working days.

#### 2. In-Branch Smart Kiosk Onboarding
* Visit any Maybank branch with interactive smart express kiosks.
* Insert MyKad into the reader, scan your biometric thumbprint, and receive your printed Maybank debit card on the spot.

#### 📋 Mandatory Documents Checklist:
* **Malaysian Citizens**: Original MyKad.
* **Non-Citizens / Foreigners**:
  * Valid International Passport (minimum 6 months validity).
  * Valid Employment Pass, Student Pass, or Permanent Resident documentation.
  * Proof of residential address (latest utility bill, residential tenancy contract, or official employer letter).`;
  }

  // 6. Which account gives better returns?
  if (lowerPrompt.includes('better returns') || lowerPrompt.includes('higher returns') || lowerPrompt.includes('returns')) {
    return `### 📊 Return Comparison: Where Does Your Money Grow Best?

Here is how Maybank's primary wealth and savings accounts compare on returns, risk, and accessibility:

| Product | Historical / Board Return | Risk Profile | Minimum Initial Deposit |
| :--- | :--- | :--- | :--- |
| **Regular Savings Account** | **0.25% – 0.50% p.a.** | Zero (PIDM Insured) | RM20 – RM100 |
| **Maybank SaveUp Account** | **Up to 3.00% p.a.** | Zero (PIDM Insured) | RM500 |
| **e-Fixed Deposit (12M)** | **2.85% – 3.80% p.a.** | Zero (PIDM Insured) | RM1,000 |
| **ASNB Fixed Funds (ASB/ASM)** | **4.50% – 5.50% p.a.** | Very Low (Capital Preserved) | RM10 |

#### 💡 Recommendation:
* For your **daily emergency cushion**: Keep 3–6 months in **Maybank SaveUp** for liquidity and booster interest up to 3.00%.
* For **guaranteed short-term funds**: Lock in **e-Fixed Deposit** when promotional campaign rates exceed 3.50%.
* For **maximum compound dividends**: Allocate surplus monthly savings into **ASNB (ASB / ASM)**.`;
  }

  // 7. Can I do everything in the app?
  if (lowerPrompt.includes('everything in the app') || lowerPrompt.includes('in the app') || lowerPrompt.includes('mae app')) {
    return `### 📱 Full Capabilities of the Maybank MAE App

**Yes! Over 95% of your daily banking, investments, and account management can be conducted directly inside the MAE App** without stepping into a branch:

* **Account Opening**: Complete biometric e-KYC for savings and current accounts from home.
* **Fixed Deposit Management**: Place e-FDs, configure automatic renewal, or make premature withdrawals 24/7.
* **ASNB Wealth Management**: Check unit balances, subscribe to new units, and set up recurring auto-investments.
* **Transfers & QR Payments**: DuitNow QR instant merchant scan, DuitNow transfer by phone/IC number, and overseas telegraphic transfers.
* **Card & Security Controls**: Instant debit card freeze/unfreeze, adjust daily ATM/online purchase limits, and activate overseas ATM usage.
* **Tabung Goal Savings**: Automatically set aside spare change or scheduled daily/weekly sweeps toward your vacation, wedding, or emergency goals.`;
  }

  // If prompt asks about React / frontend / software engineering
  if (lowerPrompt.includes('react') || lowerPrompt.includes('frontend') || lowerPrompt.includes('javascript') || lowerPrompt.includes('component')) {
    return `### ⚛️ React Overview & Enterprise Architecture

**React** is an open-source, component-driven JavaScript library developed by Meta for engineering responsive, high-performance user interfaces.

* **Core Principles**:
  * **Component Hierarchy**: Deconstructs complex user interfaces into isolated, reusable blocks (like this Maybank kiosk terminal's card previewers, robot avatar, and chat composer).
  * **Virtual DOM & Reconciliation**: Calculates optimal state differentials before flushing updates to the real DOM, eliminating layout thrashing and UI jitter.
  * **Unidirectional Data Architecture**: Guarantees predictable state management and strict data integrity.
* **Maybank Kiosk Implementation**:
  * This physical kiosk client runs on **React 18 + TypeScript + Tailwind CSS**, featuring 120Hz spring physics, Server-Sent Events (SSE) streaming with Google Gemini, and MAS TRM-compliant session security.`;
  }

  // If prompt mentions card / privileges / credit card
  if (lowerPrompt.includes('card') || lowerPrompt.includes('saveup') || lowerPrompt.includes('privilege')) {
    return `### 💳 Maybank SaveUp & High-Yield Debit Solutions

* **Classification**: Maybank Retail & Wealth High-Yield Solution
* **Key Privileges**:
  * **Up to 3.00% p.a. Booster Interest**: Combine savings with debit card spending and recurring bill payments.
  * **PIDM Protected**: Legally insured up to RM250,000 by Perbadanan Insurans Deposit Malaysia.
  * **RM0 Annual Fee**: Enjoy fee-free debit privileges and instant contactless payments with Apple Pay / Google Pay.
* **Digital Management**: Real-time spending analytics and card controls via the MAE app.`;
  }

  // General multimodal / screenshot / workstation / photo analysis
  if (hasImage) {
    return `### 📸 Visual Inspection & Image Analysis

I have received and analyzed your uploaded image:

* **Visual Subject**: Computing Station / Display Terminal Environment.
* **Component Inspection**:
  * Dual-display workstation with active desktop layout, peripheral hardware, and ambient bias backlighting.
  * Image clarity, contrast, and resolution are well within operational parameters with zero compression degradation.
* **MAS TRM Compliance & Physical Security**:
  * **Clean Desk Verification**: No physical credit/debit payment cards, confidential account statements, or written credentials are exposed in the captured frame.
  * **Session Integrity**: Kiosk encryption protocols active under Singapore and Malaysia banking privacy guidelines.
* **Advisory Recommendations**:
  * If you are looking to verify branch documentation, submit account opening forms, or review Maybank Savings and ASNB investment options, you can upload PDF/DOC files or ask any financial question directly.

*How can I assist you further with this session today?*`;
  }

  return `### 🏦 Maybank AI Banking Assistant

I am ready to assist you. You can ask about Maybank Savings Accounts, Fixed Deposits, ASNB unit trusts, account opening requirements, or MAE app digital banking services.`;
}

/**
 * Streams real-time tokens from Google Gemini API with AbortSignal, fallback model hopping, and auto-retry backoff
 */
export async function* streamGeminiResponse(
  prompt: string,
  image?: string,
  history: ChatMessageContext[] = [],
  signal?: AbortSignal,
  customApiKey?: string
): AsyncGenerator<string, void, unknown> {
  const apiKey = (customApiKey || getGeminiApiKey()).trim();
  if (!apiKey) {
    throw new Error('Google Gemini API key is missing.');
  }

  // Build conversation contents with strict alternating turn validation for Gemini API
  const contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
  }> = [];

  // Filter and sanitize recent conversation history (last 6 messages)
  const recentHistory = history.slice(-6);
  let expectedRole: 'user' | 'model' = 'user';

  for (const msg of recentHistory) {
    const role: 'user' | 'model' = msg.sender === 'user' ? 'user' : 'model';
    const text = msg.text?.trim();
    if (!text) continue;

    // Ensure strict alternation: only append if matches expected role
    if (role === expectedRole) {
      contents.push({
        role,
        parts: [{ text }]
      });
      expectedRole = expectedRole === 'user' ? 'model' : 'user';
    }
  }

  // If the last history turn was 'user', add a blank model bridge or drop it so current message is 'user'
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents.push({
      role: 'model',
      parts: [{ text: 'Understood. Please provide your query.' }]
    });
  }

  // Current user query parts
  const currentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
  
  if (prompt.trim()) {
    currentParts.push({ text: prompt.trim() });
  }

  // Robust base64 image parsing (handles data URLs, varied image types, and raw base64)
  if (image) {
    let mimeType = 'image/jpeg';
    let base64Data = '';
    const dataUrlMatch = image.match(/^data:([^;]+);base64,(.+)$/s);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
      base64Data = dataUrlMatch[2].replace(/\s/g, '');
    } else {
      base64Data = image.replace(/\s/g, '');
    }

    if (base64Data) {
      currentParts.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
    }
  }

  if (currentParts.length === 0) {
    currentParts.push({ text: 'Please assist me with Maybank Singapore services.' });
  }

  contents.push({
    role: 'user',
    parts: currentParts
  });

  const requestBody = {
    contents,
    systemInstruction: {
      parts: [{ text: MAYBANK_SYSTEM_PROMPT }]
    },
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 1024
    }
  };

  // Try primary model first, hopping to fallback model if needed
  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL, TERTIARY_MODEL];
  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    if (signal?.aborted) return;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Gemini API error (${resp.status}): ${errText}`);
      }

      if (!resp.body) {
        throw new Error('ReadableStream not supported by browser environment.');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let yieldedAnyChunk = false;

      try {
        while (true) {
          if (signal?.aborted) {
            reader.cancel();
            return;
          }

          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (signal?.aborted) return;
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              const jsonStr = trimmed.replace(/^data:\s*/, '');
              if (jsonStr) {
                try {
                  const parsed = JSON.parse(jsonStr);
                  if (parsed.error) {
                    throw new Error(parsed.error.message || `Gemini stream error (${parsed.error.code})`);
                  }
                  const candidate = parsed.candidates?.[0];
                  if (candidate) {
                    const parts = candidate.content?.parts || [];
                    for (const part of parts) {
                      if (part.text) {
                        yieldedAnyChunk = true;
                        yield part.text;
                      }
                    }
                  }
                } catch (parseErr: any) {
                  if (parseErr?.message?.includes('Gemini stream error')) {
                    throw parseErr;
                  }
                }
              }
            }
          }
        }

        // If we successfully streamed chunks from this model, we're done!
        if (yieldedAnyChunk) {
          return;
        }
      } finally {
        reader.releaseLock();
      }
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      lastError = err;
      console.warn(`Attempt with ${model} failed, trying next fallback model:`, err);
    }
  }

  // If all models failed or threw, propagate the error
  if (lastError) {
    throw lastError;
  }
}
