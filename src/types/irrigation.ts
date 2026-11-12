/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GrowthStage, FarmLocation } from '../utils/irrigationMath';

export type LanguageMode = 'en' | 'hi';

export interface SoilDepthReading {
  depthCm: 10 | 30 | 60;
  depthInches: 4 | 12 | 24;
  moistureVwc: number; // 0.0 - 0.50
  soilTempC: number;
  tensionKpa: number; // matric suction
  statusLabel: 'dry' | 'optimal' | 'wet';
}

export interface FarmZone {
  id: string;
  name: string;
  hindiName: string;
  cropId: string;
  cropName: string;
  cropHindiName: string;
  cropStage: GrowthStage;
  soilId: string;
  soilName: string;
  soilHindiName: string;
  areaAcres: number;
  areaSqMeters: number;
  irrigationType: 'Drip Line' | 'Micro-Sprinkler' | 'Subsurface Drip';
  irrigationHindiType: string;
  emitterFlowRateLpm: number;
  currentMoistureVwc: number;
  targetMoistureVwc: number;
  depthReadings: SoilDepthReading[];
  valveStatus: 'CLOSED' | 'OPEN' | 'SCHEDULED';
  valveFlowLpm: number;
  pressureBar: number;
  todayLitersDelivered: number;
  lastIrrigated: string;
  hindiLastIrrigated: string;
  healthStatus: 'optimal' | 'attention' | 'critical';
}

export interface BorewellStatus {
  id: string;
  name: string;
  hindiName: string;
  waterTableDepthM: number;
  waterTableDepthFeet: number;
  criticalDepthM: number;
  criticalDepthFeet: number;
  pumpingDischargeLps: number;
  pumpState: 'OFF' | 'RUNNING' | 'FAULT';
  dailyExtractionLiters: number;
  waterSalinityPpm: number;
  rechargeRateM3Day: number;
  alertLevel: 'Safe' | 'Semi-Critical' | 'Critical' | 'Over-Exploited';
  hindiAlertLevel: string;
}

export interface WeatherData {
  locationName: string;
  district: string;
  state: string;
  tempCurrentC: number;
  tempMaxC: number;
  tempMinC: number;
  humidityPct: number;
  condition: string;
  hindiCondition: string;
  windSpeedKmh: number;
  solarRadiationMjM2: number;
  rainForecastMm: number;
  rainProbabilityPct: number;
  uvIndex: number;
  etoTodayMm: number;
  krishiVigyanAdvisory: string;
  hindiKrishiAdvisory: string;
}

export interface IrrigationLog {
  id: string;
  timestamp: string;
  zoneId: string;
  zoneName: string;
  action: 'AI_TRIGGERED' | 'MANUAL' | 'SCHEDULED' | 'STOPPED';
  volumeLiters: number;
  durationMinutes: number;
  waterSavedLiters: number;
  rupeesSavedInr: number;
  status: 'Completed' | 'Active' | 'Aborted';
}

export interface SeasonProgressStats {
  waterSavedLiters: number;
  moneySavedInr: number;
  electricityUnitsKwhSaved: number;
  dieselEquivalentLitersSaved: number;
  borewellDepthPreservedFeet: number;
  cropYieldPotentialPct: number;
  jalMitraStarRating: number; // 1 to 5
}

export interface FarmerBiodata {
  kisanName: string;
  mobileNumber: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  khasraPlotNumber: string;
  primaryCropId: string;
  cropStage: GrowthStage;
  soilId: string;
  totalLandAcres: number;
  borewellDepthFeet: number;
  motorHorsepower: number; // e.g. 5 HP, 7.5 HP
  soilTouchFeel: 'dry_powdery' | 'slightly_moist' | 'healthy_wet';
  createdAt: string;
}

