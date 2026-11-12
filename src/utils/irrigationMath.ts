/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SoilProperties {
  type: string;
  hindiName: string;
  fieldCapacity: number; // Volumetric Water Content (m3/m3, e.g. 0.28)
  wiltingPoint: number; // e.g. 0.12
  infiltrationRateMmHr: number;
}

export const SOIL_DATABASE: Record<string, SoilProperties> = {
  'sandy-loam': {
    type: 'Sandy Loam (बलुई दोमट)',
    hindiName: 'बलुई दोमट मिट्टी',
    fieldCapacity: 0.22,
    wiltingPoint: 0.09,
    infiltrationRateMmHr: 25,
  },
  'clay-loam': {
    type: 'Clay Loam (चिकनी दोमट)',
    hindiName: 'चिकनी दोमट मिट्टी',
    fieldCapacity: 0.32,
    wiltingPoint: 0.16,
    infiltrationRateMmHr: 10,
  },
  'silt-loam': {
    type: 'Alluvial Silt Loam (जलोढ़ मिट्टी)',
    hindiName: 'जलोढ़ मिट्टी',
    fieldCapacity: 0.30,
    wiltingPoint: 0.12,
    infiltrationRateMmHr: 15,
  },
  'black-cotton': {
    type: 'Black Cotton Soil (काली मिट्टी)',
    hindiName: 'काली कपास मिट्टी',
    fieldCapacity: 0.38,
    wiltingPoint: 0.20,
    infiltrationRateMmHr: 6,
  },
};

export interface CropInfo {
  id: string;
  name: string;
  hindiName: string;
  category: 'Vegetable' | 'Grain' | 'Cash Crop' | 'Orchard' | 'Legume';
  rootDepthMeters: number;
  stageKc: {
    initial: number;
    vegetative: number;
    flowering: number;
    ripening: number;
  };
  criticalMoistureThreshold: number; // fraction of FC
}

export const CROP_DATABASE: Record<string, CropInfo> = {
  tomato: {
    id: 'tomato',
    name: 'Tomato (टमाटर)',
    hindiName: 'टमाटर (सब्जी)',
    category: 'Vegetable',
    rootDepthMeters: 0.6,
    stageKc: {
      initial: 0.6,
      vegetative: 0.85,
      flowering: 1.15,
      ripening: 0.8,
    },
    criticalMoistureThreshold: 0.65,
  },
  wheat: {
    id: 'wheat',
    name: 'Wheat / Gehun (गेहूं)',
    hindiName: 'गेहूं (अनाज)',
    category: 'Grain',
    rootDepthMeters: 0.9,
    stageKc: {
      initial: 0.4,
      vegetative: 0.8,
      flowering: 1.15,
      ripening: 0.35,
    },
    criticalMoistureThreshold: 0.55,
  },
  maize: {
    id: 'maize',
    name: 'Maize / Makka (मक्का)',
    hindiName: 'मक्का (अनाज)',
    category: 'Grain',
    rootDepthMeters: 1.0,
    stageKc: {
      initial: 0.45,
      vegetative: 0.9,
      flowering: 1.2,
      ripening: 0.4,
    },
    criticalMoistureThreshold: 0.6,
  },
  cotton: {
    id: 'cotton',
    name: 'Cotton / Kapaas (कपास)',
    hindiName: 'कपास (नकदी फसल)',
    category: 'Cash Crop',
    rootDepthMeters: 1.1,
    stageKc: {
      initial: 0.35,
      vegetative: 0.75,
      flowering: 1.2,
      ripening: 0.65,
    },
    criticalMoistureThreshold: 0.55,
  },
  orchard: {
    id: 'orchard',
    name: 'Citrus / Mosambi & Santra (फल बगान)',
    hindiName: 'संतरा व मौसंबी बाग',
    category: 'Orchard',
    rootDepthMeters: 1.2,
    stageKc: {
      initial: 0.7,
      vegetative: 0.8,
      flowering: 0.9,
      ripening: 0.75,
    },
    criticalMoistureThreshold: 0.6,
  },
};

export interface FarmLocation {
  id: string;
  district: string;
  state: string;
  taluk: string;
  hindiName: string;
  plotNumber: string;
  normalRainfallMmYear: number;
  groundwaterZone: 'Safe' | 'Semi-Critical' | 'Critical';
  kisanName: string;
}

export const INDIAN_FARM_LOCATIONS: FarmLocation[] = [
  {
    id: 'nashik-mh',
    district: 'Nashik (नासिक)',
    state: 'Maharashtra',
    taluk: 'Dindori',
    hindiName: 'नासिक, महाराष्ट्र (डिंडोरी ब्लॉक)',
    plotNumber: 'खसरा नं. 142/3 (Plot 4 Acres)',
    normalRainfallMmYear: 780,
    groundwaterZone: 'Semi-Critical',
    kisanName: 'Rameshwar Patil (रामेश्वर पाटिल)',
  },
  {
    id: 'karnal-hr',
    district: 'Karnal (करनाल)',
    state: 'Haryana',
    taluk: 'Gharaunda',
    hindiName: 'करनाल, हरियाणा (घरौंडा ब्लॉक)',
    plotNumber: 'खसरा नं. 88/1 (Plot 5 Acres)',
    normalRainfallMmYear: 620,
    groundwaterZone: 'Critical',
    kisanName: 'Gurpreet Singh (गुरप्रीत सिंह)',
  },
  {
    id: 'warangal-ts',
    district: 'Warangal (वारंगल)',
    state: 'Telangana',
    taluk: 'Wardhannapet',
    hindiName: 'वारंगल, तेलंगाना (वर्धन्नापेट)',
    plotNumber: 'Survey #214 (Plot 3.5 Acres)',
    normalRainfallMmYear: 890,
    groundwaterZone: 'Semi-Critical',
    kisanName: 'K. Venkateshwarlu (वेंकटेश्वरलु)',
  },
  {
    id: 'indore-mp',
    district: 'Indore (इंदौर)',
    state: 'Madhya Pradesh',
    taluk: 'Sanwer',
    hindiName: 'इंदौर, मध्य प्रदेश (सांवेर ब्लॉक)',
    plotNumber: 'खसरा नं. 305 (Plot 6 Acres)',
    normalRainfallMmYear: 840,
    groundwaterZone: 'Safe',
    kisanName: 'Shivraj Chouhan (शिवराज सिंह)',
  },
  {
    id: 'bathinda-pb',
    district: 'Bathinda (बठिंडा)',
    state: 'Punjab',
    taluk: 'Talwandi Sabo',
    hindiName: 'बठिंडा, पंजाब (तलवंडी साबो)',
    plotNumber: 'Kila #12/4 (Plot 5.5 Acres)',
    normalRainfallMmYear: 410,
    groundwaterZone: 'Critical',
    kisanName: 'Harbhajan Singh (हरभजन सिंह)',
  },
];

export type GrowthStage = 'initial' | 'vegetative' | 'flowering' | 'ripening';

/**
 * Calculates Reference Evapotranspiration (ETo) in mm/day
 */
export function calculateETo(
  tempMaxC: number,
  tempMinC: number,
  relativeHumidityPct: number,
  solarRadiationMjM2: number = 22,
  windSpeedMs: number = 2.0
): number {
  const tempMean = (tempMaxC + tempMinC) / 2;
  const tempRange = Math.max(1, tempMaxC - tempMinC);
  
  const radiationEquivalent = 0.408 * solarRadiationMjM2;
  let eto = 0.0023 * (tempMean + 17.8) * Math.sqrt(tempRange) * radiationEquivalent;

  const rhFactor = Math.max(0.7, 1.0 + (50 - relativeHumidityPct) * 0.004);
  const windFactor = Math.max(0.8, 1.0 + (windSpeedMs - 2.0) * 0.05);

  eto = eto * rhFactor * windFactor;
  return Number(Math.max(1.0, Math.min(12.0, eto)).toFixed(2));
}

/**
 * Calculates Crop Water Requirement (ETc) in mm/day
 */
export function calculateETc(etoMmDay: number, cropId: string, stage: GrowthStage): number {
  const crop = CROP_DATABASE[cropId] || CROP_DATABASE['tomato'];
  const kc = crop.stageKc[stage] || 1.0;
  return Number((etoMmDay * kc).toFixed(2));
}

/**
 * Calculates Effective Rainfall (mm)
 */
export function calculateEffectiveRainfall(rainfallForecastMm: number): number {
  if (rainfallForecastMm <= 3) return 0;
  if (rainfallForecastMm <= 25) {
    return Number((rainfallForecastMm * 0.8).toFixed(1));
  }
  return Number((20 + (rainfallForecastMm - 25) * 0.6).toFixed(1));
}

/**
 * Calculates Soil Moisture Deficit (SMD) in mm of water
 */
export function calculateSoilMoistureDeficit(
  currentMoistureVwc: number,
  soilId: string,
  rootDepthM: number
): {
  deficitMm: number;
  readilyAvailableWaterMm: number;
  isStressed: boolean;
  saturationPercentage: number;
} {
  const soil = SOIL_DATABASE[soilId] || SOIL_DATABASE['clay-loam'];
  const fc = soil.fieldCapacity;
  const wp = soil.wiltingPoint;

  const tawMm = (fc - wp) * rootDepthM * 1000;
  const rawMm = tawMm * 0.5;

  const currentAvailableMm = Math.max(0, (currentMoistureVwc - wp) * rootDepthM * 1000);
  const deficitMm = Math.max(0, tawMm - currentAvailableMm);
  const isStressed = currentAvailableMm < rawMm;
  
  const saturationPercentage = Math.min(100, Math.max(0, ((currentMoistureVwc - wp) / (fc - wp)) * 100));

  return {
    deficitMm: Number(deficitMm.toFixed(1)),
    readilyAvailableWaterMm: Number(rawMm.toFixed(1)),
    isStressed,
    saturationPercentage: Number(saturationPercentage.toFixed(1)),
  };
}

export interface IrrigationRecommendation {
  shouldIrrigate: boolean;
  recommendedVolumeLiters: number;
  recommendedDurationMinutes: number;
  netIrrigationMm: number;
  etcMm: number;
  effectiveRainMm: number;
  urgency: 'none' | 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  hindiReason: string;
  suggestedStartTime: string;
  hindiSuggestedStartTime: string;
  waterSavedLitersVsFlood: number;
}

/**
 * Computes AI-driven micro-irrigation recommendation with bilingual rural explainability
 */
export function computeIrrigationPlan(params: {
  cropId: string;
  stage: GrowthStage;
  soilId: string;
  currentMoistureVwc: number;
  areaSquareMeters: number;
  tempMaxC: number;
  tempMinC: number;
  humidityPct: number;
  rainForecastMm: number;
  rainProbabilityPct: number;
  emitterFlowRateLitersPerMin: number;
  dripEfficiencyPct?: number;
}): IrrigationRecommendation {
  const {
    cropId,
    stage,
    soilId,
    currentMoistureVwc,
    areaSquareMeters,
    tempMaxC,
    tempMinC,
    humidityPct,
    rainForecastMm,
    rainProbabilityPct,
    emitterFlowRateLitersPerMin,
    dripEfficiencyPct = 92,
  } = params;

  const crop = CROP_DATABASE[cropId] || CROP_DATABASE['tomato'];
  const soil = SOIL_DATABASE[soilId] || SOIL_DATABASE['clay-loam'];
  
  const eto = calculateETo(tempMaxC, tempMinC, humidityPct);
  const etc = calculateETc(eto, cropId, stage);
  
  const expectedRain = rainProbabilityPct >= 50 
    ? calculateEffectiveRainfall(rainForecastMm * (rainProbabilityPct / 100))
    : 0;

  const moistureAnalysis = calculateSoilMoistureDeficit(currentMoistureVwc, soilId, crop.rootDepthMeters);

  const wettedAreaFraction = crop.category === 'Orchard' ? 0.40 : 0.65;
  const effectiveWettedAreaM2 = areaSquareMeters * wettedAreaFraction;

  const deficitReplenishmentMm = moistureAnalysis.isStressed 
    ? Math.min(6.0, moistureAnalysis.deficitMm * 0.25)
    : 0;

  let netMm = Math.max(0, etc + deficitReplenishmentMm - expectedRain);
  netMm = Math.min(10.0, netMm);

  // If rain predicted
  if (rainProbabilityPct >= 70 && rainForecastMm >= 15 && currentMoistureVwc > soil.wiltingPoint * 1.3) {
    return {
      shouldIrrigate: false,
      recommendedVolumeLiters: 0,
      recommendedDurationMinutes: 0,
      netIrrigationMm: 0,
      etcMm: etc,
      effectiveRainMm: expectedRain,
      urgency: 'none',
      reason: `Heavy rain forecast (${rainForecastMm}mm, ${rainProbabilityPct}% chance). Drip postponed to save water and electricity.`,
      hindiReason: `भारी बारिश का अनुमान (${rainForecastMm} मिमी, ${rainProbabilityPct}% संभावना)। बिजली और पानी बचाने के लिए ड्रिप सिंचाई रोक दी गई है।`,
      suggestedStartTime: 'After rain passes (बारिश के बाद)',
      hindiSuggestedStartTime: 'बारिश गुजरने के बाद',
      waterSavedLitersVsFlood: Math.round(areaSquareMeters * etc * 1.5),
    };
  }

  // If moisture sufficient
  if (currentMoistureVwc >= soil.fieldCapacity * 0.9 && netMm < 3) {
    return {
      shouldIrrigate: false,
      recommendedVolumeLiters: 0,
      recommendedDurationMinutes: 0,
      netIrrigationMm: 0,
      etcMm: etc,
      effectiveRainMm: expectedRain,
      urgency: 'none',
      reason: 'Root moisture is at optimal capacity. No irrigation needed today.',
      hindiReason: 'जड़ों में पर्याप्त नमी मौजूद है। आज सिंचाई की कोई आवश्यकता नहीं है।',
      suggestedStartTime: 'Check tomorrow 06:00 AM (कल सुबह जांचें)',
      hindiSuggestedStartTime: 'कल सुबह 06:00 बजे जांचें',
      waterSavedLitersVsFlood: 0,
    };
  }

  const efficiency = dripEfficiencyPct / 100;
  const grossMm = netMm / efficiency;

  const totalLiters = Math.round(grossMm * effectiveWettedAreaM2);
  const flowRate = Math.max(0.1, emitterFlowRateLitersPerMin);
  const durationMinutes = Math.round(totalLiters / flowRate);

  const floodVolumeLiters = Math.round((netMm / 0.5) * areaSquareMeters * 1.25);
  const waterSaved = Math.max(0, floodVolumeLiters - totalLiters);

  let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (moistureAnalysis.isStressed || currentMoistureVwc <= soil.wiltingPoint * 1.15) {
    urgency = 'critical';
  } else if (currentMoistureVwc < soil.fieldCapacity * 0.6) {
    urgency = 'high';
  } else if (netMm > 5) {
    urgency = 'medium';
  }

  let reason = `${crop.name} in ${stage} stage requires ${totalLiters.toLocaleString()} Litres (${durationMinutes} mins). Saves ${waterSaved.toLocaleString()}L vs open flood irrigation.`;
  let hindiReason = `${crop.hindiName} को इस समय ${totalLiters.toLocaleString()} लीटर पानी (${durationMinutes} मिनट ड्रिप) चाहिए। खुली नाली सिंचाई की तुलना में ${waterSaved.toLocaleString()} लीटर पानी की सीधी बचत होगी।`;

  const suggestedStartTime = tempMaxC > 32 ? '05:30 AM (कम वाष्पीकरण समय)' : '06:30 AM';
  const hindiSuggestedStartTime = tempMaxC > 32 ? 'सुबह 05:30 बजे (वाष्प हानि से बचाव)' : 'सुबह 06:30 बजे';

  return {
    shouldIrrigate: totalLiters > 0,
    recommendedVolumeLiters: totalLiters,
    recommendedDurationMinutes: durationMinutes,
    netIrrigationMm: Number(netMm.toFixed(1)),
    etcMm: etc,
    effectiveRainMm: expectedRain,
    urgency,
    reason,
    hindiReason,
    suggestedStartTime,
    hindiSuggestedStartTime,
    waterSavedLitersVsFlood: waterSaved,
  };
}

export type GroundwaterAlertLevel = 'Safe' | 'Semi-Critical' | 'Critical' | 'Over-Exploited';

export interface GroundwaterForecast {
  currentWaterTableDepthM: number;
  currentWaterTableDepthFeet: number;
  criticalThresholdDepthM: number;
  criticalThresholdDepthFeet: number;
  rechargeRateM3Day: number;
  extractionRateM3Day: number;
  netDepletionM3Day: number;
  estimatedDepletionVelocityMmDay: number;
  alertLevel: GroundwaterAlertLevel;
  hindiAlertLevel: string;
  daysUntilCritical: number | null;
  forecast30DaysDepthFeet: number;
  forecast60DaysDepthFeet: number;
  forecast90DaysDepthFeet: number;
  sustainabilityIndexPct: number;
  mitigationAdvice: string[];
  hindiMitigationAdvice: string[];
}

/**
 * Predicts groundwater trends in Feet and Meters with Indian agrarian contexts
 */
export function predictGroundwaterStatus(params: {
  currentDepthM: number;
  criticalThresholdDepthM: number;
  aquiferSpecificYield?: number;
  catchmentAreaHectares: number;
  dailyRainfallMm: number;
  dailyExtractionLiters: number;
  activeBorewells: number;
  dripAdoptionPct: number;
}): GroundwaterForecast {
  const {
    currentDepthM,
    criticalThresholdDepthM,
    aquiferSpecificYield = 0.10,
    catchmentAreaHectares,
    dailyRainfallMm,
    dailyExtractionLiters,
    activeBorewells,
    dripAdoptionPct,
  } = params;

  const areaM2 = catchmentAreaHectares * 10000;
  const infiltrationCoeff = 0.14;
  const naturalRechargeM3 = (dailyRainfallMm / 1000) * areaM2 * infiltrationCoeff;

  const irrigationReturnFlowM3 = ((dailyExtractionLiters / 1000) * (1 - dripAdoptionPct / 100) * 0.2);
  const totalRechargeM3 = naturalRechargeM3 + irrigationReturnFlowM3;

  const extractionM3 = dailyExtractionLiters / 1000;
  const netDepletionM3 = extractionM3 - totalRechargeM3;

  const deltaDepthMetersPerDay = netDepletionM3 / (areaM2 * aquiferSpecificYield);
  const deltaDepthMmPerDay = deltaDepthMetersPerDay * 1000;

  const forecast30M = Math.max(2, currentDepthM + deltaDepthMetersPerDay * 30);
  const forecast60M = Math.max(2, currentDepthM + deltaDepthMetersPerDay * 60);
  const forecast90M = Math.max(2, currentDepthM + deltaDepthMetersPerDay * 90);

  const extractionRatio = totalRechargeM3 > 0 ? extractionM3 / totalRechargeM3 : 2.5;
  const bufferMeters = criticalThresholdDepthM - currentDepthM;

  let alertLevel: GroundwaterAlertLevel = 'Safe';
  let hindiAlertLevel = 'सुरक्षित (Safe)';
  if (currentDepthM >= criticalThresholdDepthM || extractionRatio > 1.2) {
    alertLevel = 'Over-Exploited';
    hindiAlertLevel = 'अति-दोहित (Over-Exploited)';
  } else if (bufferMeters < 3 || extractionRatio > 0.95) {
    alertLevel = 'Critical';
    hindiAlertLevel = 'गंभीर (Critical)';
  } else if (bufferMeters < 8 || extractionRatio > 0.70) {
    alertLevel = 'Semi-Critical';
    hindiAlertLevel = 'सावधानी (Semi-Critical)';
  } else {
    alertLevel = 'Safe';
    hindiAlertLevel = 'सुरक्षित (Safe)';
  }

  let daysUntilCritical: number | null = null;
  if (deltaDepthMetersPerDay > 0 && bufferMeters > 0) {
    daysUntilCritical = Math.round(bufferMeters / deltaDepthMetersPerDay);
  }

  const sustainabilityIndex = Math.min(100, Math.max(5, Math.round(100 - (extractionRatio - 0.5) * 60)));

  const advice: string[] = [
    'Use pulse micro-drip at night or early morning to stop evaporative waste.',
    'Build farm percolation recharge trenches (खेत तलाई) to harvest monsoon water.',
    'Avoid unmetered continuous pumping; limit borewell runs to 4-5 hours per day.',
  ];

  const hindiAdvice: string[] = [
    'वाष्प हानि रोकने के लिए केवल सुबह 5-8 बजे या शाम को ही ड्रिप चालू करें।',
    'खेत तलाई और सोक-पिट बनाकर मानसूनी बारिश के पानी को बोरवेल रिचार्ज में डालें।',
    'बोरवेल मोटर को लगातार 8 घंटे चलाने की जगह 2-2 घंटे के अंतराल पर चलाएं।',
  ];

  // 1 meter ~ 3.28084 feet
  const currentDepthFeet = Number((currentDepthM * 3.28084).toFixed(1));
  const criticalThresholdDepthFeet = Number((criticalThresholdDepthM * 3.28084).toFixed(1));

  return {
    currentWaterTableDepthM: Number(currentDepthM.toFixed(2)),
    currentWaterTableDepthFeet: currentDepthFeet,
    criticalThresholdDepthM: Number(criticalThresholdDepthM.toFixed(2)),
    criticalThresholdDepthFeet: criticalThresholdDepthFeet,
    rechargeRateM3Day: Number(totalRechargeM3.toFixed(1)),
    extractionRateM3Day: Number(extractionM3.toFixed(1)),
    netDepletionM3Day: Number(netDepletionM3.toFixed(1)),
    estimatedDepletionVelocityMmDay: Number(deltaDepthMmPerDay.toFixed(2)),
    alertLevel,
    hindiAlertLevel,
    daysUntilCritical,
    forecast30DaysDepthFeet: Number((forecast30M * 3.28084).toFixed(1)),
    forecast60DaysDepthFeet: Number((forecast60M * 3.28084).toFixed(1)),
    forecast90DaysDepthFeet: Number((forecast90M * 3.28084).toFixed(1)),
    sustainabilityIndexPct: sustainabilityIndex,
    mitigationAdvice: advice,
    hindiMitigationAdvice: hindiAdvice,
  };
}

/**
 * Calculates Indian Rupee (₹) savings on electricity and water pumping
 */
export function calculateEnergyAndCostSavingsInr(
  litersSaved: number,
  wellDepthM: number,
  electricityRatePerKwhInr: number = 6.5, // Indian commercial/agri rural rate
  waterTankerEquivalentPer1000LInr: number = 75.0 // Water saved replacement value in ₹
): {
  kwhSaved: number;
  carbonKgSaved: number;
  moneySavedInr: number;
  electricitySavedInr: number;
} {
  const totalDynamicHeadM = wellDepthM + 3.0 + 22.0;
  const pumpEfficiency = 0.60;
  const kwhPer1000L = (9.81 * totalDynamicHeadM) / (3600 * pumpEfficiency);
  const kwhSaved = (litersSaved / 1000) * kwhPer1000L;
  
  const carbonKgSaved = kwhSaved * 0.72;
  const electricitySavedInr = kwhSaved * electricityRatePerKwhInr;
  const waterValueSavedInr = (litersSaved / 1000) * waterTankerEquivalentPer1000LInr;
  const moneySavedInr = electricitySavedInr + waterValueSavedInr;

  return {
    kwhSaved: Number(kwhSaved.toFixed(1)),
    carbonKgSaved: Number(carbonKgSaved.toFixed(1)),
    moneySavedInr: Math.round(moneySavedInr),
    electricitySavedInr: Math.round(electricitySavedInr),
  };
}

export interface BiodataCalculationResult {
  dailyWaterRequirementLiters: number;
  dailyDripMinutes: number;
  seasonWaterSavedLakhLiters: number;
  seasonMoneySavedInr: number;
  borewellHeadroomFeet: number;
  borewellSafetyStatus: 'Safe' | 'Moderate' | 'Critical';
  soilStatusExplanation: string;
  hindiSoilStatusExplanation: string;
  recommendedTime: string;
  hindiRecommendedTime: string;
  jalMitraStars: number;
}

/**
 * Generates dynamic customized farm biodata & water calculation based on farmer inputs
 */
export function generateFarmerBiodataSummary(params: {
  cropId: string;
  cropStage: GrowthStage;
  soilId: string;
  totalLandAcres: number;
  borewellDepthFeet: number;
  motorHorsepower: number;
  soilTouchFeel: 'dry_powdery' | 'slightly_moist' | 'healthy_wet';
  tempMaxC: number;
  tempMinC: number;
  humidityPct: number;
  rainForecastMm: number;
  rainProbabilityPct: number;
}): BiodataCalculationResult {
  const {
    cropId,
    cropStage,
    soilId,
    totalLandAcres,
    borewellDepthFeet,
    motorHorsepower,
    soilTouchFeel,
    tempMaxC,
    tempMinC,
    humidityPct,
    rainForecastMm,
    rainProbabilityPct,
  } = params;

  // Derive soil moisture from farmer touch-feel input
  const measuredVwc = soilTouchFeel === 'dry_powdery' ? 0.15 : soilTouchFeel === 'slightly_moist' ? 0.25 : 0.35;
  const areaSqM = totalLandAcres * 4046.86; // 1 acre ~ 4047 m2

  // Flow rate: a 5HP motor pumps ~350-450 L/min, scaled for drip zone manifold
  const emitterFlowLpm = Math.min(100, Math.max(20, motorHorsepower * 8.5));

  const plan = computeIrrigationPlan({
    cropId,
    stage: cropStage,
    soilId,
    currentMoistureVwc: measuredVwc,
    areaSquareMeters: areaSqM,
    tempMaxC,
    tempMinC,
    humidityPct,
    rainForecastMm,
    rainProbabilityPct,
    emitterFlowRateLitersPerMin: emitterFlowLpm,
  });

  const borewellDepthM = borewellDepthFeet / 3.28084;
  const criticalLimitFeet = 135.0; // standard critical drawdown floor in India
  const headroomFeet = Math.max(0, Number((criticalLimitFeet - borewellDepthFeet).toFixed(1)));
  
  let borewellSafetyStatus: 'Safe' | 'Moderate' | 'Critical' = 'Safe';
  if (borewellDepthFeet > 130) {
    borewellSafetyStatus = 'Critical';
  } else if (borewellDepthFeet > 90) {
    borewellSafetyStatus = 'Moderate';
  }

  // Seasonal projections for the farmer's acreage (typically 90-120 days crop cycle)
  const seasonLiters = plan.waterSavedLitersVsFlood * 35;
  const seasonLakhLiters = Number((seasonLiters / 100000).toFixed(2));
  const savings = calculateEnergyAndCostSavingsInr(seasonLiters, borewellDepthM);

  const soilStatusExplanation = soilTouchFeel === 'dry_powdery'
    ? 'Soil is powdery and dry. High matric tension detected. Immediate drip pulse required.'
    : soilTouchFeel === 'slightly_moist'
    ? 'Soil has fair moisture. Gentle maintenance drip recommended.'
    : 'Soil is saturated. Delay irrigation to prevent root hypoxia.';

  const hindiSoilStatusExplanation = soilTouchFeel === 'dry_powdery'
    ? 'मिट्टी भुरभुरी व सूखी है। पौधों की जड़ों को तत्काल नमी चाहिए, ड्रिप तुरंत चालू करें।'
    : soilTouchFeel === 'slightly_moist'
    ? 'मिट्टी में मध्यम नमी बनी हुई है। केवल सामान्य अंतराल पर ही ड्रिप दें।'
    : 'मिट्टी में भरपूर नमी है। फंगस रोग से बचने के लिए आज पानी न दें।';

  return {
    dailyWaterRequirementLiters: plan.recommendedVolumeLiters,
    dailyDripMinutes: plan.recommendedDurationMinutes,
    seasonWaterSavedLakhLiters: seasonLakhLiters,
    seasonMoneySavedInr: savings.moneySavedInr,
    borewellHeadroomFeet: headroomFeet,
    borewellSafetyStatus,
    soilStatusExplanation,
    hindiSoilStatusExplanation,
    recommendedTime: plan.suggestedStartTime,
    hindiRecommendedTime: plan.hindiSuggestedStartTime,
    jalMitraStars: 5,
  };
}
