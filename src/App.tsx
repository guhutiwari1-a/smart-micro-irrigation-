/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { KpiOverview } from './components/KpiOverview';
import { FieldSensorsView } from './components/FieldSensorsView';
import { AiRecommenderView } from './components/AiRecommenderView';
import { GroundwaterView } from './components/GroundwaterView';
import { ValveControlView } from './components/ValveControlView';
import { FarmerProgressView } from './components/FarmerProgressView';
import { AiAgronomistModal } from './components/AiAgronomistModal';
import { FarmerInputBioDataModal } from './components/FarmerInputBioDataModal';
import { FarmerDirectInputCard } from './components/FarmerDirectInputCard';
import { PmksyInfoModal } from './components/PmksyInfoModal';
import { INITIAL_ZONES, INITIAL_BOREWELL, INITIAL_WEATHER, INITIAL_LOGS } from './data/mockFarmData';
import { ALL_INDIAN_STATES, IndianDistrictData } from './data/indianLocations';
import {
  FarmZone,
  BorewellStatus,
  WeatherData,
  IrrigationLog,
  LanguageMode,
  FarmerBiodata,
} from './types/irrigation';
import {
  calculateEnergyAndCostSavingsInr,
  computeIrrigationPlan,
  FarmLocation,
  CROP_DATABASE,
  SOIL_DATABASE,
} from './utils/irrigationMath';

export default function App() {
  const [zones, setZones] = useState<FarmZone[]>(INITIAL_ZONES);
  const [borewell, setBorewell] = useState<BorewellStatus>(INITIAL_BOREWELL);
  const [weather, setWeather] = useState<WeatherData>(INITIAL_WEATHER);
  const [logs, setLogs] = useState<IrrigationLog[]>(INITIAL_LOGS);
  
  // Pan-India Location State across North, South, East, West, Central
  const defaultState = ALL_INDIAN_STATES.find((s) => s.state === 'Maharashtra') || ALL_INDIAN_STATES[0];
  const defaultDistrict = defaultState.districts.find((d) => d.district === 'Nashik') || defaultState.districts[0];

  const [currentState, setCurrentState] = useState<string>(defaultState.state);
  const [currentDistrict, setCurrentDistrict] = useState<IndianDistrictData>(defaultDistrict);

  // Farmer Bio-Data Profile
  const [farmerBiodata, setFarmerBiodata] = useState<FarmerBiodata>({
    kisanName: 'Rameshwar Patil (रामेश्वर पाटिल)',
    mobileNumber: '98220XXXXX',
    state: defaultState.state,
    district: defaultDistrict.district,
    tehsil: 'Niphad (निफाड़)',
    village: 'Pimpalgaon Baswant',
    khasraPlotNumber: 'Gat No. 142/2B',
    primaryCropId: 'tomato',
    cropStage: 'flowering',
    soilId: 'clay-loam',
    totalLandAcres: 3.5,
    borewellDepthFeet: defaultDistrict.climate.groundwaterDepthFeet,
    motorHorsepower: 5.0,
    soilTouchFeel: 'slightly_moist',
    createdAt: new Date().toLocaleDateString('en-IN'),
  });

  const [language, setLanguage] = useState<LanguageMode>('hi'); // Default Hindi for Indian rural context
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAgronomistOpen, setIsAgronomistOpen] = useState<boolean>(false);
  const [isBiodataModalOpen, setIsBiodataModalOpen] = useState<boolean>(false);
  const [isPmksyModalOpen, setIsPmksyModalOpen] = useState<boolean>(false);

  // Compute seasonal savings in Litres and INR (₹)
  const totalWaterSavedLiters = logs.reduce((sum, l) => sum + l.waterSavedLiters, 152000);
  const savings = calculateEnergyAndCostSavingsInr(totalWaterSavedLiters, borewell.waterTableDepthM);

  // Compute today's AI water recommendation across zones
  const recommendedTodayLiters = zones.reduce((sum, z) => {
    const plan = computeIrrigationPlan({
      cropId: z.cropId,
      stage: z.cropStage,
      soilId: z.soilId,
      currentMoistureVwc: z.currentMoistureVwc,
      areaSquareMeters: z.areaSqMeters,
      tempMaxC: weather.tempMaxC,
      tempMinC: weather.tempMinC,
      humidityPct: weather.humidityPct,
      rainForecastMm: weather.rainForecastMm,
      rainProbabilityPct: weather.rainProbabilityPct,
      emitterFlowRateLitersPerMin: z.emitterFlowRateLpm,
    });
    return sum + (plan.shouldIrrigate ? plan.recommendedVolumeLiters : 0);
  }, 0);

  // Natural slow telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setZones((prevZones) =>
        prevZones.map((zone) => {
          if (zone.valveStatus === 'OPEN') {
            const newMoisture = Math.min(0.40, zone.currentMoistureVwc + 0.004);
            const addedVolume = Math.round((zone.valveFlowLpm * 3.5) / 60);
            return {
              ...zone,
              currentMoistureVwc: Number(newMoisture.toFixed(3)),
              todayLitersDelivered: zone.todayLitersDelivered + addedVolume,
              depthReadings: zone.depthReadings.map((d) => ({
                ...d,
                moistureVwc: Number(Math.min(0.40, d.moistureVwc + 0.003).toFixed(3)),
                tensionKpa: Math.max(15, d.tensionKpa - 2),
              })),
              healthStatus: newMoisture >= zone.targetMoistureVwc * 0.9 ? 'optimal' : 'attention',
            };
          } else {
            const slightDrop = weather.tempCurrentC > 32 ? 0.0004 : 0.0002;
            const newMoisture = Math.max(0.12, zone.currentMoistureVwc - slightDrop);
            const isCritical = newMoisture < zone.targetMoistureVwc * 0.65;
            const isAttention = newMoisture < zone.targetMoistureVwc * 0.85;

            return {
              ...zone,
              currentMoistureVwc: Number(newMoisture.toFixed(3)),
              healthStatus: isCritical ? 'critical' : isAttention ? 'attention' : 'optimal',
            };
          }
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [weather.tempCurrentC]);

  // Handle location change dynamically from dropdown across India
  const handleSelectDistrict = (district: IndianDistrictData, stateName: string) => {
    setCurrentDistrict(district);
    setCurrentState(stateName);

    // Dynamically update weather & climate based on the selected Indian location
    setWeather({
      district: district.district,
      state: stateName,
      locationName: `${district.tehsils[0]?.split('(')[0].trim() || district.district}, ${district.district}`,
      tempCurrentC: district.climate.tempCurrentC,
      tempMaxC: district.climate.tempMaxC,
      tempMinC: district.climate.tempMinC,
      humidityPct: district.climate.humidityPct,
      condition: district.climate.condition,
      hindiCondition: district.climate.hindiCondition,
      windSpeedKmh: 12,
      solarRadiationMjM2: 21.5,
      rainForecastMm: district.climate.rainForecastMm,
      rainProbabilityPct: district.climate.rainProbabilityPct,
      uvIndex: 7,
      etoTodayMm: district.climate.etoTodayMm,
      krishiVigyanAdvisory: district.climate.krishiAdvisory,
      hindiKrishiAdvisory: district.climate.hindiKrishiAdvisory,
    });

    // Update borewell groundwater depth from district regional telemetry
    setBorewell((prev) => ({
      ...prev,
      waterTableDepthM: district.climate.groundwaterDepthM,
      waterTableDepthFeet: district.climate.groundwaterDepthFeet,
      seasonalSafeLimitM: district.climate.groundwaterDepthM + 9.5,
      alertLevel:
        district.climate.groundwaterZone === 'Critical'
          ? 'Critical'
          : district.climate.groundwaterZone === 'Semi-Critical'
          ? 'Semi-Critical'
          : 'Safe',
    }));

    // Update farmer location coordinates in biodata
    setFarmerBiodata((prev) => ({
      ...prev,
      state: stateName,
      district: district.district,
      tehsil: district.tehsils[0]?.split('(')[0].trim() || district.district,
      borewellDepthFeet: district.climate.groundwaterDepthFeet,
    }));
  };

  // Direct update from on-page FarmerDirectInputCard
  const handleDirectBiodataUpdate = (updated: FarmerBiodata, districtData?: IndianDistrictData) => {
    setFarmerBiodata(updated);

    if (districtData) {
      setCurrentDistrict(districtData);
      setCurrentState(updated.state);
      setWeather((prev) => ({
        ...prev,
        district: districtData.district,
        state: updated.state,
        locationName: `${updated.village || districtData.tehsils[0]?.split('(')[0].trim() || districtData.district}, ${districtData.district}`,
        tempCurrentC: districtData.climate.tempCurrentC,
        tempMaxC: districtData.climate.tempMaxC,
        tempMinC: districtData.climate.tempMinC,
        humidityPct: districtData.climate.humidityPct,
        condition: districtData.climate.condition,
        hindiCondition: districtData.climate.hindiCondition,
        rainForecastMm: districtData.climate.rainForecastMm,
        rainProbabilityPct: districtData.climate.rainProbabilityPct,
        etoTodayMm: districtData.climate.etoTodayMm,
        krishiVigyanAdvisory: districtData.climate.krishiAdvisory,
        hindiKrishiAdvisory: districtData.climate.hindiKrishiAdvisory,
      }));

      const depthM = Number((updated.borewellDepthFeet * 0.3048).toFixed(1));
      setBorewell((prev) => ({
        ...prev,
        waterTableDepthFeet: updated.borewellDepthFeet,
        waterTableDepthM: depthM,
        seasonalSafeLimitM: depthM + 9.5,
        alertLevel:
          districtData.climate.groundwaterZone === 'Critical'
            ? 'Critical'
            : districtData.climate.groundwaterZone === 'Semi-Critical'
            ? 'Semi-Critical'
            : 'Safe',
      }));
    }

    // Calibrate primary plot (Zone 1) to the farmer's input
    const crop = CROP_DATABASE[updated.primaryCropId] || CROP_DATABASE['tomato'];
    const soil = SOIL_DATABASE[updated.soilId] || SOIL_DATABASE['clay-loam'];
    const areaSqM = Math.round(updated.totalLandAcres * 4046.86);

    let touchMoisture = 0.22;
    if (updated.soilTouchFeel === 'dry_powdery') touchMoisture = soil.wiltingPoint + 0.02;
    else if (updated.soilTouchFeel === 'slightly_moist') touchMoisture = (soil.fieldCapacity + soil.wiltingPoint) / 2;
    else if (updated.soilTouchFeel === 'healthy_wet') touchMoisture = soil.fieldCapacity * 0.95;

    setZones((prev) => [
      {
        ...prev[0],
        name: `Plot 1 - ${crop.name} (${updated.totalLandAcres} Acres)`,
        hindiName: `खेत 1 - ${crop.hindiName} (${updated.totalLandAcres} एकड़)`,
        cropId: crop.id,
        cropName: crop.name,
        cropHindiName: crop.hindiName,
        cropStage: updated.cropStage,
        soilId: updated.soilId,
        soilType: soil.type,
        soilHindiType: soil.hindiName,
        areaAcres: updated.totalLandAcres,
        areaSqMeters: areaSqM,
        currentMoistureVwc: Number(touchMoisture.toFixed(3)),
        targetMoistureVwc: Number((soil.fieldCapacity * 0.9).toFixed(3)),
        wiltingPointVwc: soil.wiltingPoint,
        depthReadings: [
          { depthCm: 10, depthInches: 4, moistureVwc: Math.max(0.08, touchMoisture - 0.04), soilTempC: 25, tensionKpa: 70, statusLabel: 'optimal' },
          { depthCm: 30, depthInches: 12, moistureVwc: touchMoisture, soilTempC: 24, tensionKpa: 55, statusLabel: 'optimal' },
          { depthCm: 60, depthInches: 24, moistureVwc: Math.min(0.40, touchMoisture + 0.03), soilTempC: 22, tensionKpa: 42, statusLabel: 'optimal' },
        ],
      },
      ...prev.slice(1),
    ]);
  };

  // Handle Save / Apply from Farmer Bio-Data Input Modal
  const handleSaveBiodata = (updated: FarmerBiodata, districtData: IndianDistrictData) => {
    handleDirectBiodataUpdate(updated, districtData);
    setIsBiodataModalOpen(false);
  };

  // Toggle single valve
  const handleToggleValve = (zoneId: string, durationMin: number = 30) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === zoneId) {
          const willOpen = z.valveStatus !== 'OPEN';
          const newStatus = willOpen ? 'OPEN' : 'CLOSED';
          const flow = willOpen ? z.emitterFlowRateLpm : 0;
          const pressure = willOpen ? 2.1 : 0;

          if (willOpen) {
            const delivered = Math.round(z.emitterFlowRateLpm * durationMin);
            const saved = Math.round(delivered * 0.85);
            const rupeesSaved = Math.round((saved / 1000) * 85);
            setLogs((l) => [
              {
                id: `log-${Date.now()}`,
                timestamp: language === 'hi' ? 'अभी-अभी (चालू)' : 'Just now (Active)',
                zoneId: z.id,
                zoneName: language === 'hi' ? z.hindiName : z.name,
                action: 'MANUAL',
                volumeLiters: delivered,
                durationMinutes: durationMin,
                waterSavedLiters: saved,
                rupeesSavedInr: rupeesSaved,
                status: 'Active',
              },
              ...l,
            ]);
          }

          return {
            ...z,
            valveStatus: newStatus,
            valveFlowLpm: flow,
            pressureBar: pressure,
            lastIrrigated: willOpen ? 'Irrigating now...' : 'Just finished',
            hindiLastIrrigated: willOpen ? 'सिंचाई जारी है...' : 'अभी बंद हुआ',
          };
        }
        return z;
      })
    );
  };

  // Emergency stop all valves
  const handleEmergencyStopAll = () => {
    setZones((prev) =>
      prev.map((z) => ({
        ...z,
        valveStatus: 'CLOSED',
        valveFlowLpm: 0,
        pressureBar: 0,
      }))
    );
  };

  // Update zone moisture directly from slider in Field view
  const handleUpdateZoneMoisture = (zoneId: string, newVwc: number) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === zoneId) {
          const isCritical = newVwc < z.targetMoistureVwc * 0.65;
          const isAttention = newVwc < z.targetMoistureVwc * 0.85;
          return {
            ...z,
            currentMoistureVwc: Number(newVwc.toFixed(3)),
            healthStatus: isCritical ? 'critical' : isAttention ? 'attention' : 'optimal',
            depthReadings: [
              { depthCm: 10, depthInches: 4, moistureVwc: Math.max(0.08, newVwc - 0.03), soilTempC: 26, tensionKpa: Math.round((0.35 - newVwc) * 250), statusLabel: newVwc < 0.20 ? 'dry' : 'optimal' },
              { depthCm: 30, depthInches: 12, moistureVwc: newVwc, soilTempC: 24, tensionKpa: Math.round((0.35 - newVwc) * 220), statusLabel: newVwc < 0.20 ? 'dry' : 'optimal' },
              { depthCm: 60, depthInches: 24, moistureVwc: Math.min(0.40, newVwc + 0.05), soilTempC: 22, tensionKpa: Math.round((0.35 - newVwc) * 180), statusLabel: 'optimal' },
            ],
          };
        }
        return z;
      })
    );
  };

  // Weather simulation event
  const handleSimulateWeatherEvent = (type: 'dry-spell' | 'heavy-rain') => {
    if (type === 'dry-spell') {
      setWeather((w) => ({
        ...w,
        tempCurrentC: 38.5,
        tempMaxC: 41.0,
        humidityPct: 22,
        condition: 'Hot Dry Spell (Heatwave)',
        hindiCondition: 'लू व तेज सूखा (Dry Heatwave)',
        rainForecastMm: 0,
        rainProbabilityPct: 5,
        etoTodayMm: 7.45,
      }));
      setZones((prev) =>
        prev.map((z) => ({
          ...z,
          currentMoistureVwc: Math.max(0.12, z.currentMoistureVwc - 0.06),
          healthStatus: 'critical',
        }))
      );
    } else {
      setWeather((w) => ({
        ...w,
        tempCurrentC: 24.0,
        tempMaxC: 26.5,
        humidityPct: 88,
        condition: 'Monsoon Showers',
        hindiCondition: 'अच्छी मानसूनी वर्षा (Rain)',
        rainForecastMm: 22,
        rainProbabilityPct: 90,
        etoTodayMm: 2.80,
      }));
      setZones((prev) =>
        prev.map((z) => ({
          ...z,
          currentMoistureVwc: Math.min(0.38, z.currentMoistureVwc + 0.08),
          healthStatus: 'optimal',
        }))
      );
    }
  };

  // Apply AI plan to valve
  const handleApplyPlanToZone = (zoneId: string, durationMinutes: number, volumeLiters: number) => {
    handleToggleValve(zoneId, durationMinutes);
    const targetZone = zones.find((z) => z.id === zoneId);
    if (targetZone) {
      const saved = Math.round(volumeLiters * 0.9);
      const rupeesSaved = Math.round((saved / 1000) * 85);
      setLogs((l) => [
        {
          id: `log-${Date.now()}`,
          timestamp: language === 'hi' ? 'अभी-अभी (AI आदेश)' : 'Just now (AI Trigger)',
          zoneId: targetZone.id,
          zoneName: language === 'hi' ? targetZone.hindiName : targetZone.name,
          action: 'AI_TRIGGERED',
          volumeLiters,
          durationMinutes,
          waterSavedLiters: saved,
          rupeesSavedInr: rupeesSaved,
          status: 'Active',
        },
        ...l,
      ]);
    }
  };

  // Browser Audio Speech Output for rural accessibility
  const handlePlayAudio = (textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } else {
      alert(textToSpeak);
    }
  };

  const activeValvesCount = zones.filter((z) => z.valveStatus === 'OPEN').length;

  // FarmLocation adapter for FarmerProgressView
  const dynamicFarmLocation: FarmLocation = {
    id: currentDistrict.district.toLowerCase(),
    district: `${currentDistrict.district} (${currentDistrict.hindiDistrict})`,
    state: currentState,
    taluk: farmerBiodata.tehsil || currentDistrict.tehsils[0],
    hindiName: `${currentDistrict.hindiDistrict}, ${currentState} (${farmerBiodata.tehsil || currentDistrict.tehsils[0]})`,
    plotNumber: farmerBiodata.khasraPlotNumber || 'Gat No. 142/2B',
    normalRainfallMmYear: 650,
    groundwaterZone: currentDistrict.climate.groundwaterZone,
    kisanName: farmerBiodata.kisanName,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Header with Pan-India Location Dropdown (North, South, East, West, Central), Weather & Farmer Bio-Data Button */}
      <Header
        weather={weather}
        currentDistrict={currentDistrict}
        currentState={currentState}
        onSelectDistrict={handleSelectDistrict}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
        onEmergencyStopAll={handleEmergencyStopAll}
        activeValvesCount={activeValvesCount}
        onOpenAgronomist={() => setIsAgronomistOpen(true)}
        onOpenBiodataModal={() => setIsBiodataModalOpen(true)}
        onOpenPmksyModal={() => setIsPmksyModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onPlayVoiceSummary={() => {
          const summaryText = language === 'hi'
            ? `${farmerBiodata.kisanName}, ${currentDistrict.hindiDistrict} में आज तापमान ${weather.tempCurrentC} डिग्री है। आपके खेत में नमी की स्थिति के अनुसार ड्रिप सिंचाई की सलाह तैयार है। आपके बोरवेल का जल स्तर ${borewell.waterTableDepthFeet} फीट पर है।`
            : `Hello ${farmerBiodata.kisanName}! In ${currentDistrict.district}, current temperature is ${weather.tempCurrentC} degrees. Drip irrigation advice is ready for your farm. Your borewell water table is at ${borewell.waterTableDepthFeet} feet.`;
          handlePlayAudio(summaryText);
        }}
        farmerName={farmerBiodata.kisanName}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 md:px-6 py-6 space-y-6">
        
        {/* Prominent On-Dashboard Farmer Direct Input & Live Calculation Station */}
        <FarmerDirectInputCard
          farmerBiodata={farmerBiodata}
          onUpdateBiodata={handleDirectBiodataUpdate}
          onOpenBiodataModal={() => setIsBiodataModalOpen(true)}
          currentDistrict={currentDistrict}
          currentState={currentState}
          weather={weather}
          language={language}
        />

        {/* KPI Summary Cards (Rupees ₹ & Feet) */}
        <KpiOverview
          zones={zones}
          borewell={borewell}
          totalSavedSeasonLiters={totalWaterSavedLiters}
          totalSavedSeasonInr={savings.moneySavedInr}
          recommendedTodayLiters={recommendedTodayLiters}
          language={language}
        />

        {/* Tab 1: Field & Soil Moisture */}
        {activeTab === 'dashboard' && (
          <FieldSensorsView
            zones={zones}
            weather={weather}
            onToggleValve={handleToggleValve}
            onSelectZoneForAi={() => setActiveTab('recommender')}
            onUpdateZoneMoisture={handleUpdateZoneMoisture}
            onSimulateWeatherEvent={handleSimulateWeatherEvent}
            language={language}
          />
        )}

        {/* Tab 2: Crop Water Advice */}
        {activeTab === 'recommender' && (
          <AiRecommenderView
            zones={zones}
            weather={weather}
            onApplyPlanToZone={handleApplyPlanToZone}
            language={language}
          />
        )}

        {/* Tab 3: Borewell & Groundwater */}
        {activeTab === 'groundwater' && (
          <GroundwaterView
            borewell={borewell}
            language={language}
          />
        )}

        {/* Tab 4: Motor & Valves */}
        {activeTab === 'valves' && (
          <ValveControlView
            zones={zones}
            logs={logs}
            onToggleValve={handleToggleValve}
            onEmergencyStopAll={handleEmergencyStopAll}
            language={language}
          />
        )}

        {/* Tab 5: Farmer Progress & Savings (Kisan Pragati Patra) */}
        {activeTab === 'progress' && (
          <FarmerProgressView
            logs={logs}
            totalSavedLiters={totalWaterSavedLiters}
            totalSavedInr={savings.moneySavedInr}
            borewellDepthM={borewell.waterTableDepthM}
            currentLocation={dynamicFarmLocation}
            language={language}
            onPlayAudioAdvice={handlePlayAudio}
          />
        )}

      </main>

      {/* Farmer Bio-Data & Water Card Input Modal */}
      <FarmerInputBioDataModal
        isOpen={isBiodataModalOpen}
        onClose={() => setIsBiodataModalOpen(false)}
        currentBiodata={farmerBiodata}
        onSaveBiodata={handleSaveBiodata}
        language={language}
      />

      {/* PMKSY & Jal Shakti Abhiyan Compliance Standards Modal */}
      <PmksyInfoModal
        isOpen={isPmksyModalOpen}
        onClose={() => setIsPmksyModalOpen(false)}
        language={language}
      />

      {/* AI Agronomist Chat Modal */}
      <AiAgronomistModal
        isOpen={isAgronomistOpen}
        onClose={() => setIsAgronomistOpen(false)}
        language={language}
        onPlayAudioAdvice={handlePlayAudio}
        farmContext={{
          locationName: `${currentDistrict.district}, ${currentState}`,
          kisanName: farmerBiodata.kisanName,
          avgMoisture: Math.round(
            (zones.reduce((sum, z) => sum + z.currentMoistureVwc, 0) / zones.length) * 100
          ),
          waterTableDepthFeet: borewell.waterTableDepthFeet,
          alertLevel: borewell.alertLevel,
          crops: zones.map((z) => (language === 'hi' ? z.cropHindiName : z.cropName)),
        }}
      />

      {/* Rural-Friendly Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 px-4 text-center text-xs text-slate-400 space-y-1">
        <p className="font-bold text-slate-300">
          HydroSense KISAN • {language === 'hi' ? 'भारतीय किसान सूक्ष्म-सिंचाई व भूजल संरक्षण प्रणाली' : 'Indian Smart Micro-Irrigation & Aquifer Protection'}
        </p>
        <p className="text-[11px] text-slate-500">
          {language === 'hi'
            ? 'जल शक्ति अभियान व प्रधानमंत्री कृषि सिंचाई योजना (PMKSY) के वैज्ञानिक मानकों पर आधारित'
            : 'Aligned with Jal Shakti Abhiyan & Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)'}
        </p>
      </footer>

    </div>
  );
}
