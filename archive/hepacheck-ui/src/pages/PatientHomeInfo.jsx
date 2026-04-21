export default function PatientHomeInfo() {
  const block = { maxWidth: 900, marginInline: "auto" };
  const blockBelow = { ...block, margin: "14px auto 0" };

  return (
    <div className="main-shell patient-home-info">
      {/* Block 1 */}
      <div className="card green-border" style={block}>
        <div className="info-ribbon">
          <h3>What is NAFLD? 🩺</h3>
        </div>
        <p>
          <strong>Nonalcoholic Fatty Liver Disease (NAFLD)</strong> is a condition where
          <strong> excess fat builds up in the liver</strong> in individuals who drink little to no alcohol.
          It's the most common liver disease in Western countries, affecting millions of people.
          Think of your liver as a filter; when you have NAFLD, this filter gets clogged with fat,
          which prevents it from working efficiently. While a small amount of fat in the liver is
          normal and doesn't cause harm, too much can lead to serious health problems.
        </p>
      </div>

      {/* Block 2 */}
      <div className="card green-border" style={blockBelow}>
        <div className="info-ribbon">
          <h3>How NAFLD Progresses 📈</h3>
        </div>
        <p>
          If left unmanaged, the excess fat in the liver can trigger inflammation and cell damage,
          a condition known as <strong>NASH (Nonalcoholic Steatohepatitis)</strong>. This is a more
          aggressive form of the disease that can lead to <strong>fibrosis</strong>, or scarring of
          the liver tissue. As the scarring worsens and spreads, it can develop into
          <strong> cirrhosis</strong>, a severe and irreversible condition where the liver becomes
          hard and scarred, losing its ability to function. In its most advanced stages, cirrhosis
          can lead to liver failure and the need for a liver transplant.
        </p>
      </div>

      {/* Block 3 */}
      <div className="card green-border" style={blockBelow}>
        <div className="info-ribbon">
          <h3>What Causes It? 🤔</h3>
        </div>
        <p>
          The exact cause of NAFLD isn't fully understood, but it's strongly linked to a group of
          conditions known as <strong>metabolic syndrome</strong>. These include <strong>obesity</strong>,
          especially with a large waist circumference, <strong>insulin resistance</strong> (common in
          people with type 2 diabetes), <strong>high blood sugar</strong>, and
          <strong> high levels of fats</strong> (triglycerides) in the blood. These factors contribute
          to the liver's inability to process fats effectively, leading to their accumulation.
        </p>
      </div>
    </div>
  );
}
