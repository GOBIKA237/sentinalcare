/**
 * PLACEHOLDER scorer, standing in for Backend Dev 2's FastAPI/scikit-learn
 * service so the app is demo-able end to end before that repo exists.
 *
 * Swap this out for a real HTTP call once the ML service is up:
 *
 *   const res = await fetch(`${process.env.ML_SERVICE_URL}/score`, {
 *     method: "POST", headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ recentCheckins })
 *   });
 *   return res.json(); // { score, riskBand, factors }
 *
 * The heuristic below is intentionally simple and explainable: it just
 * looks at the trend over the last few check-ins. Good enough to light up
 * the dashboard and alert queue for a demo; not a real clinical model.
 */
function scoreFromCheckins(recentCheckins) {
  if (!recentCheckins || recentCheckins.length === 0) {
    return { score: 0, riskBand: "low", factors: [] };
  }

  const n = recentCheckins.length;
  const avg = (key) => recentCheckins.reduce((s, c) => s + c[key], 0) / n;

  const avgMood = avg("mood");
  const avgSleep = avg("sleep");
  const avgWorkload = avg("workload");

  // Simple, explainable weighting: low mood/sleep and high workload raise risk.
  // Each sub-score is 0-100; final score is a weighted blend.
  const moodRisk = ((5 - avgMood) / 4) * 100;
  const sleepRisk = ((5 - avgSleep) / 4) * 100;
  const workloadRisk = ((avgWorkload - 1) / 4) * 100;

  const score = Math.round(
    moodRisk * 0.4 + sleepRisk * 0.35 + workloadRisk * 0.25
  );

  const factors = [
    { factor: "mood_trend", contribution: Math.round(moodRisk * 0.4) },
    { factor: "sleep_trend", contribution: Math.round(sleepRisk * 0.35) },
    { factor: "workload_trend", contribution: Math.round(workloadRisk * 0.25) },
  ].sort((a, b) => b.contribution - a.contribution);

  const riskBand = score >= 66 ? "high" : score >= 33 ? "moderate" : "low";

  return { score, riskBand, factors };
}

module.exports = { scoreFromCheckins };
