// src/pages/doctor/DoctorHomeInfo.jsx
export default function DoctorHomeInfo() {
  const block = { maxWidth: 900, marginInline: "auto" };
  const blockBelow = { ...block, margin: "14px auto 0" };

  return (
    <div className="main-shell doctor-home-info">
      {/* Block 1 */}
      <div className="card green-border" style={block}>
        <div className="info-ribbon">
          <h3>Overview of Liver Disorders 🩺</h3>
        </div>
        <p>
          Liver diseases represent a broad group of conditions affecting hepatic structure and
          function. They may arise from metabolic dysfunction, chronic infections, toxic exposures,
          autoimmune mechanisms, or inherited abnormalities. Clinical presentation ranges from
          asymptomatic biochemical abnormalities to advanced decompensation. Many liver conditions
          share a progressive course, moving from inflammation to fibrosis, cirrhosis, and ultimately
          liver failure or malignancy if not identified and managed early.
        </p>
      </div>

      {/* Block 2 */}
      <div className="card green-border" style={blockBelow}>
        <div className="info-ribbon">
          <h3>Fatty Liver Disease (Steatosis) 🧬</h3>
        </div>
        <p>
          Fatty liver disease is characterised by excessive triglyceride accumulation within
          hepatocytes. It may be associated with alcohol intake (Alcoholic Fatty Liver Disease) or
          metabolic risk factors such as obesity, insulin resistance, and type 2 diabetes (Non-Alcoholic
          Fatty Liver Disease). NAFLD is among the most prevalent chronic liver disorders worldwide and
          may progress to steatohepatitis (NASH), fibrosis, and cirrhosis in susceptible individuals.
        </p>
      </div>

      {/* Block 3 */}
      <div className="card green-border" style={blockBelow}>
        <div className="info-ribbon">
          <h3>Hepatitis 🦠</h3>
        </div>
        <p>
          Hepatitis refers to inflammation of the liver and may be acute or chronic. Viral hepatitis
          includes hepatitis A and E (often acute) and hepatitis B, C, and D, which may become chronic
          and contribute to progressive fibrosis. Autoimmune hepatitis is an immune-mediated condition
          in which inflammatory injury targets hepatocytes and may require long-term monitoring and
          immunosuppressive therapy. Chronic hepatitis of any cause can increase the risk of cirrhosis
          and hepatocellular carcinoma.
        </p>
      </div>

      {/* Block 4 */}
      <div className="card green-border" style={blockBelow}>
        <div className="info-ribbon">
          <h3>Cirrhosis 🧱</h3>
        </div>
        <p>
          Cirrhosis is advanced, often irreversible liver scarring due to long-standing injury and
          inflammation. It is characterised by architectural distortion and regenerative nodules that
          impair hepatic function. Cirrhosis can lead to portal hypertension and complications such as
          ascites, variceal bleeding, hepatic encephalopathy, and increased susceptibility to
          hepatocellular carcinoma. Early identification of fibrosis is important to reduce progression
          and prevent decompensation.
        </p>
      </div>

      {/* Block 5 */}
      <div className="card green-border" style={blockBelow}>
        <div className="info-ribbon">
          <h3>Liver Cancer 🎗️</h3>
        </div>
        <p>
          Liver cancer may be primary, most commonly hepatocellular carcinoma, or secondary due to
          metastatic spread from other organs. The majority of primary liver cancers occur in the
          setting of chronic liver disease and cirrhosis. Major risk factors include chronic hepatitis
          B or C infection, alcohol-related cirrhosis, and advanced fibrosis related to NAFLD/NASH.
        </p>
      </div>

      {/* Block 6 */}
      <div className="card green-border" style={blockBelow}>
        <div className="info-ribbon">
          <h3>Genetic Liver Diseases 🧬</h3>
        </div>
        <p>
          Several inherited disorders can cause progressive liver injury by altering metal metabolism
          or protein handling. Hemochromatosis leads to excess iron deposition and oxidative damage.
          Wilson’s disease results in copper accumulation due to impaired biliary excretion. Alpha-1
          antitrypsin deficiency causes abnormal protein accumulation within hepatocytes and may also
          affect the lungs. Early diagnosis and targeted therapy can prevent irreversible liver damage.
        </p>
      </div>

      {/* Block 7 */}
      <div className="card green-border" style={blockBelow}>
        <div className="info-ribbon">
          <h3>Bile Duct Disorders 🧪</h3>
        </div>
        <p>
          Bile duct diseases impair bile formation or flow and can cause cholestatic liver injury.
          Primary biliary cholangitis involves autoimmune destruction of intrahepatic bile ducts, while
          primary sclerosing cholangitis is characterised by progressive inflammation and fibrosis of
          intra- and extrahepatic ducts. Over time, these conditions can lead to cirrhosis, portal
          hypertension, and liver failure.
        </p>
      </div>

      {/* Block 8 */}
      <div className="card green-border" style={blockBelow}>
        <div className="info-ribbon">
          <h3>Liver Failure ⚠️</h3>
        </div>
        <p>
          Liver failure occurs when extensive hepatic injury compromises the liver’s synthetic,
          metabolic, and detoxification functions. It may present acutely (for example due to severe
          drug-induced injury) or as decompensation of chronic liver disease. Clinical features may
          include jaundice, coagulopathy, encephalopathy, and fluid imbalance. Advanced cases often
          require urgent specialist management and may require liver transplantation.
        </p>
      </div>

      {/* Block 9 */}
      <div className="card green-border" style={blockBelow}>
        <div className="info-ribbon">
          <h3>Causes & Risk Factors 🤔</h3>
        </div>
        <p>
          Common contributors to liver disease include chronic alcohol use, viral infections
          (particularly hepatitis B and C), obesity and insulin resistance, dietary factors, toxins and
          hepatotoxic medications, autoimmune conditions, and inherited susceptibility. Risk assessment
          and early stratification are important to identify patients who benefit from closer follow-up
          and timely referral to specialist care.
        </p>
      </div>

      {/* Block 10 */}
      <div className="card green-border" style={blockBelow}>
        <div className="info-ribbon">
          <h3>Typical Progression 📈</h3>
        </div>
        <p>
          Many liver diseases progress from early inflammation to fibrosis and then to cirrhosis.
          As fibrosis advances, the risk of hepatic decompensation and hepatocellular carcinoma rises.
          Non-invasive indices and longitudinal monitoring can support early detection of high-risk
          patients, guide referral decisions, and enable timely interventions to slow or halt disease
          progression.
        </p>
      </div>
    </div>
  );
}
