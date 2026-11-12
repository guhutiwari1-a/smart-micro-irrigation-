import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateETo,
  calculateETc,
  calculateSoilMoistureDeficit,
  computeIrrigationPlan,
  predictGroundwaterStatus,
  calculateEnergyAndCostSavingsInr,
  calculateEffectiveRainfall,
  generateFarmerBiodataSummary,
} from './irrigationMath';

test('calculateETo returns positive values within expected agronomical ranges', () => {
  const eto = calculateETo(34, 22, 45, 24, 2.5);
  assert.ok(eto > 2.0 && eto < 10.0, `ETo ${eto} should be between 2 and 10 mm/day`);
});

test('calculateETc correctly multiplies ETo by crop growth stage coefficient Kc', () => {
  const eto = 5.0;
  const etcTomatoFlowering = calculateETc(eto, 'tomato', 'flowering');
  assert.equal(etcTomatoFlowering, 5.75);

  const etcWheatInitial = calculateETc(eto, 'wheat', 'initial');
  assert.equal(etcWheatInitial, 2.0);
});

test('calculateEffectiveRainfall handles light vs moderate precipitation', () => {
  assert.equal(calculateEffectiveRainfall(2), 0);
  assert.equal(calculateEffectiveRainfall(10), 8.0);
});

test('calculateSoilMoistureDeficit detects stress when moisture drops below RAW threshold', () => {
  const analysisStressed = calculateSoilMoistureDeficit(0.18, 'clay-loam', 0.6);
  assert.equal(analysisStressed.isStressed, true);
  assert.ok(analysisStressed.deficitMm > 50);

  const analysisHealthy = calculateSoilMoistureDeficit(0.31, 'clay-loam', 0.6);
  assert.equal(analysisHealthy.isStressed, false);
  assert.ok(analysisHealthy.saturationPercentage > 90);
});

test('computeIrrigationPlan postpones irrigation when heavy rain is forecast and gives Hindi explanation', () => {
  const plan = computeIrrigationPlan({
    cropId: 'tomato',
    stage: 'vegetative',
    soilId: 'clay-loam',
    currentMoistureVwc: 0.25,
    areaSquareMeters: 1000,
    tempMaxC: 30,
    tempMinC: 20,
    humidityPct: 60,
    rainForecastMm: 25,
    rainProbabilityPct: 80,
    emitterFlowRateLitersPerMin: 10,
  });

  assert.equal(plan.shouldIrrigate, false);
  assert.ok(plan.reason.includes('Heavy rain'));
  assert.ok(plan.hindiReason.includes('भारी बारिश'));
});

test('predictGroundwaterStatus provides measurements in both meters and feet', () => {
  const status = predictGroundwaterStatus({
    currentDepthM: 28.5,
    criticalThresholdDepthM: 35.0,
    aquiferSpecificYield: 0.10,
    catchmentAreaHectares: 10,
    dailyRainfallMm: 0,
    dailyExtractionLiters: 150000,
    activeBorewells: 3,
    dripAdoptionPct: 80,
  });

  assert.ok(status.currentWaterTableDepthFeet > 90);
  assert.ok(status.forecast90DaysDepthFeet > status.currentWaterTableDepthFeet);
  assert.ok(status.hindiAlertLevel.length > 0);
});

test('calculateEnergyAndCostSavingsInr calculates positive INR (₹) savings', () => {
  const savings = calculateEnergyAndCostSavingsInr(50000, 28.5);
  assert.ok(savings.kwhSaved > 0);
  assert.ok(savings.moneySavedInr > 0, `Expected positive ₹ savings, got ${savings.moneySavedInr}`);
  assert.ok(savings.electricitySavedInr > 0);
});

test('generateFarmerBiodataSummary produces realistic daily and seasonal metrics based on inputs', () => {
  const summary = generateFarmerBiodataSummary({
    cropId: 'tomato',
    cropStage: 'flowering',
    soilId: 'clay-loam',
    totalLandAcres: 2.5,
    borewellDepthFeet: 95,
    motorHorsepower: 5,
    soilTouchFeel: 'dry_powdery',
    tempMaxC: 34,
    tempMinC: 22,
    humidityPct: 38,
    rainForecastMm: 0,
    rainProbabilityPct: 10,
  });

  assert.ok(summary.dailyWaterRequirementLiters > 0);
  assert.ok(summary.dailyDripMinutes > 0);
  assert.ok(summary.seasonMoneySavedInr > 0);
  assert.equal(summary.borewellSafetyStatus, 'Moderate');
  assert.ok(summary.hindiSoilStatusExplanation.includes('मिट्टी'));
});

