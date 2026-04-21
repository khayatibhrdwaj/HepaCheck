// src/components/InfoTab.jsx
import liverStages from "../assets/Liver13.png"; // <-- place the image here

export default function InfoTab() {
  const block = { maxWidth: 900, marginInline: "auto" };
  const below = { ...block, margin: "14px auto 0" };

  return (
    <div className="main-shell">
      {/* 1) What is NAFLD + Early signs */}
      <div className="card green-border" style={block}>
        <div className="info-ribbon">
          <h3>What is NAFLD? What are the early signs? 🩺</h3>
        </div>
        <p>
          <strong>NAFLD (Nonalcoholic Fatty Liver Disease)</strong>, now often referred to as{" "}
          <strong>MASLD (Metabolic dysfunction-associated steatotic liver disease)</strong>, is a
          chronic liver condition characterized by the accumulation of excessive fat in liver cells
          in people who drink little to no alcohol. While a small amount of liver fat is normal, a
          significant buildup can impair liver function over time.
        </p>
        <p>
          The disease is frequently “silent,” with <strong>no symptoms early on</strong>. When
          symptoms appear, they’re vague—<strong>unexplained fatigue</strong>, malaise, or a{" "}
          <strong>dull ache in the upper-right abdomen</strong> (liver area)—so diagnosis typically
          needs a clinician’s evaluation.
        </p>
      </div>

      {/* 2) Risk factors */}
      <div className="card green-border" style={below}>
        <div className="info-ribbon">
          <h3>What are the risk factors? 🤔</h3>
        </div>
        <ul>
          <li>
            <strong>Obesity</strong>—especially <strong>central (abdominal) obesity</strong> with a
            large waist circumference.
          </li>
          <li>
            <strong>Insulin resistance / Type 2 diabetes</strong> with high blood sugar and increased
            hepatic fat storage.
          </li>
          <li>
            <strong>High blood sugar</strong> (hyperglycemia), even without diabetes.
          </li>
          <li>
            <strong>High triglycerides and cholesterol</strong> (dyslipidemia).
          </li>
          <li>
            Combined <strong>metabolic syndrome</strong>; other risks include genetics,{" "}
            <strong>PCOS</strong>, and <strong>obstructive sleep apnea</strong>.
          </li>
        </ul>
      </div>

      {/* 3) Management targets */}
      <div className="card green-border" style={below}>
        <div className="info-ribbon">
          <h3>What are the key targets for management? 🎯</h3>
        </div>
        <ul>
          <li>
            <strong>Weight:</strong> aim for <strong>5–10%</strong> loss (even 3–5% lowers liver fat).
          </li>
          <li>
            <strong>Waist circumference:</strong> reduce visceral (organ) fat.
          </li>
          <li>
            <strong>Triglycerides:</strong> lower elevated levels (diet, activity, meds as needed).
          </li>
          <li>
            <strong>HbA1c:</strong> tighter glucose control to reduce liver burden.
          </li>
        </ul>
      </div>

      {/* 4) Screening & diagnosis */}
      <div className="card green-border" style={below}>
        <div className="info-ribbon">
          <h3>How is NAFLD screened and diagnosed? 🔬</h3>
        </div>
        <ul>
          <li>
            <strong>Blood tests:</strong> raised AST/ALT may signal liver inflammation.
          </li>
          <li>
            <strong>Non-invasive scores:</strong> <strong>FIB-4</strong> and <strong>NFS</strong> to
            estimate fibrosis risk (age, platelets, AST, ALT).
          </li>
          <li>
            <strong>Imaging:</strong> <strong>Ultrasound</strong> for steatosis;{" "}
            <strong>FibroScan</strong>/MRE for stiffness (fibrosis) without biopsy.
          </li>
          <li>
            <strong>Liver biopsy:</strong> less common now but remains the <em>gold standard</em> for
            definite staging.
          </li>
        </ul>
      </div>

      {/* 5) Lifestyle tips */}
      <div className="card green-border" style={below}>
        <div className="info-ribbon">
          <h3>What are the lifestyle tips for management? 🌱</h3>
        </div>
        <ul>
          <li>
            <strong>Mediterranean-style diet:</strong> fruits/veg, whole grains, legumes, lean
            proteins, nuts/olive oil; limit ultra-processed foods, sugary drinks, excess saturated/trans fats.
          </li>
          <li>
            <strong>Physical activity:</strong> ≥ <strong>150 min/week</strong> moderate aerobic +
            <strong> 2</strong> days/week strength training.
          </li>
          <li>
            <strong>Sleep:</strong> prioritize <strong>7–9 h/night</strong> of quality sleep.
          </li>
        </ul>
      </div>

      {/* 6) Reversibility */}
      <div className="card green-border" style={below}>
        <div className="info-ribbon">
          <h3>How can you reverse NAFLD in its early stages? 💪</h3>
        </div>
        <p>
          Early-stage NAFLD (simple steatosis) is often <strong>reversible</strong> by addressing
          weight, insulin resistance, and diet quality:
        </p>
        <ul>
          <li>
            <strong>Weight loss:</strong> even <strong>5%</strong> reduces liver fat;{" "}
            <strong>7–10%</strong> can decrease inflammation and early fibrosis.
          </li>
          <li>
            <strong>Dietary change:</strong> adopt a sustainable, nutrient-dense pattern (e.g.,
            Mediterranean).
          </li>
          <li>
            <strong>Regular exercise:</strong> improves insulin sensitivity and lowers hepatic fat.
          </li>
        </ul>
      </div>

      {/* 7) Stages — REPLACED with your text + image left, text right */}
      <div className="card green-border" style={below}>
        <div className="info-ribbon">
          <h3>The Stages of NAFLD 📊</h3>
        </div>

        <p style={{ marginTop: 0 }}>
          When NAFLD progresses, it moves through distinct stages of liver damage. Understanding these
          stages is crucial for managing the disease and preventing it from becoming more severe.
        </p>

        <div className="info-split">
          <img
            src={liverStages}
            alt="Healthy liver to cirrhosis progression"
            className="split-img"
            draggable="false"
          />
          <div>
            <ul>
              <li>
                <strong>Stage 1: Simple Fatty Liver (Steatosis)</strong><br />
                The earliest and most common stage—excess fat in liver cells with little or no
                inflammation or scarring. Generally harmless and often reversible with lifestyle
                change (diet, exercise).
              </li>
              <li>
                <strong>Stage 2: NASH (Nonalcoholic Steatohepatitis)</strong><br />
                A more serious form where fat buildup is accompanied by{" "}
                <strong>inflammation and liver cell damage</strong>. This is the turning point where
                permanent scarring can begin.
              </li>
              <li>
                <strong>Stage 3: Fibrosis</strong><br />
                Ongoing inflammation leads to <strong>fibrous scar tissue</strong>. The liver still
                functions, but growing scar tissue interferes with normal work—critical to halt
                further damage here.
              </li>
              <li>
                <strong>Stage 4: Cirrhosis</strong><br />
                Advanced, severe, and largely irreversible scarring. The liver becomes shrunken and
                hardened, impairing function. Complications include liver failure and liver cancer; a
                transplant may be required.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
