/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Droplets, Clock, ArrowRight, ShieldCheck, Sun, Leaf, Check, SlidersHorizontal, CloudRain } from 'lucide-react';
import { FarmZone, WeatherData, LanguageMode } from '../types/irrigation';
import {
  CROP_DATABASE,
  SOIL_DATABASE,
  GrowthStage,
  computeIrrigationPlan,
  calculateETo,
  calculateETc,
} from '../utils/irrigationMath';

interface AiRecommenderViewProps {
  zones: FarmZone[];
  weather: WeatherData;
  onApplyPlanToZone: (zoneId: string, durationMinutes: number, volumeLiters: number) => void;
  language: LanguageMode;
}

export const AiRecommenderView: React.FC<AiRecommenderViewProps> = ({
  zones,
  weather,
  onApplyPlanToZone,
  language,
}) => {
  const isHindi = language === 'hi';

  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[1]?.id || zones[0].id);
  const activeZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  const [cropId, setCropId] = useState<string>(activeZone.cropId);
  const [growthStage, setGrowthStage] = useState<GrowthStage>(activeZone.cropStage);
  const [soilId, setSoilId] = useState<string>(activeZone.soilId);
  const [currentMoisture, setCurrentMoisture] = useState<number>(activeZone.currentMoistureVwc);
  const [tempMax, setTempMax] = useState<number>(weather.tempMaxC);
  const [tempMin, setTempMin] = useState<number>(weather.tempMinC);
  const [humidity, setHumidity] = useState<number>(weather.humidityPct);
  const [rainForecastMm, setRainForecastMm] = useState<number>(weather.rainForecastMm);
  const [rainProbPct, setRainProbPct] = useState<number>(weather.rainProbabilityPct);
  const [areaSqM, setAreaSqM] = useState<number>(activeZone.areaSqMeters);
  const [flowRateLpm, setFlowRateLpm] = useState<number>(activeZone.emitterFlowRateLpm);

  const handleZoneChange = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    const z = zones.find((x) => x.id === zoneId);
    if (z) {
      setCropId(z.cropId);
      setGrowthStage(z.cropStage);
      setSoilId(z.soilId);
      setCurrentMoisture(z.currentMoistureVwc);
      setAreaSqM(z.areaSqMeters);
      setFlowRateLpm(z.emitterFlowRateLpm);
    }
  };

  const plan = computeIrrigationPlan({
    cropId,
    stage: growthStage,
    soilId,
    currentMoistureVwc: currentMoisture,
    areaSquareMeters: areaSqM,
    tempMaxC: tempMax,
    tempMinC: tempMin,
    humidityPct: humidity,
    rainForecastMm,
    rainProbabilityPct: rainProbPct,
    emitterFlowRateLitersPerMin: flowRateLpm,
  });

  const eto = calculateETo(tempMax, tempMin, humidity);
  const etc = calculateETc(eto, cropId, growthStage);
  const crop = CROP_DATABASE[cropId] || CROP_DATABASE['tomato'];
  const soil = SOIL_DATABASE[soilId] || SOIL_DATABASE['clay-loam'];

  // Value in rupees saved vs flood: ~₹75 per 1,000L water value + electricity
  const estimatedRupeesSaved = Math.round((plan.waterSavedLitersVsFlood / 1000) * 85);

  const [appliedNotice, setAppliedNotice] = useState<boolean>(false);

  const handleApply = () => {
    onApplyPlanToZone(selectedZoneId, plan.recommendedDurationMinutes, plan.recommendedVolumeLiters);
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            {isHindi ? 'AI फसल जल आवश्यकता व सिंचाई सिफारिश' : 'AI Precision Irrigation & Crop Water Advice'}
          </h2>
          <p className="text-xs text-slate-400">
            {isHindi ? 'फसल, मिट्टी, तापमान और बारिश के अनुसार कब और कितना पानी देना है' : 'Calculates exact crop water deficit and recommended drip duration'}
          </p>
        </div>

        {/* Plot Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium">
            {isHindi ? 'खेत चुनें:' : 'Select Plot:'}
          </span>
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => handleZoneChange(z.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedZoneId === z.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isHindi ? z.hindiName.split('•')[0] : z.name.split('•')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Agronomic Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              {isHindi ? 'खेत व फसल की जानकारी' : 'Field & Crop Inputs'}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              {activeZone.areaAcres} {isHindi ? 'एकड़' : 'Acres'}
            </span>
          </h3>

          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              {isHindi ? 'फसल का प्रकार' : 'Crop Variety'}
            </label>
            <select
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {Object.values(CROP_DATABASE).map((c) => (
                <option key={c.id} value={c.id}>
                  {isHindi ? c.hindiName : c.name} ({isHindi ? 'जड़ गहराई' : 'Root'} {c.rootDepthMeters}m)
                </option>
              ))}
            </select>
          </div>

          {/* Growth Stage */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              {isHindi ? 'फसल की अवस्था (वृद्धि चक्र)' : 'Growth Stage'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['initial', 'vegetative', 'flowering', 'ripening'] as GrowthStage[]).map((stage) => {
                const stageHindiLabel = {
                  initial: 'बुवाई/अंकुरण',
                  vegetative: 'वानस्पतिक वृद्धि',
                  flowering: 'फूल व फल लगना',
                  ripening: 'पकना/कटाई',
                }[stage];
                return (
                  <button
                    key={stage}
                    onClick={() => setGrowthStage(stage)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      growthStage === stage
                        ? 'bg-emerald-600 text-white font-bold border border-emerald-400 shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isHindi ? stageHindiLabel : stage}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Soil Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              {isHindi ? 'खेत की मिट्टी का प्रकार' : 'Soil Texture'}
            </label>
            <select
              value={soilId}
              onChange={(e) => setSoilId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {Object.entries(SOIL_DATABASE).map(([id, s]) => (
                <option key={id} value={id}>
                  {isHindi ? s.hindiName : s.type}
                </option>
              ))}
            </select>
          </div>

          {/* Current Measured Moisture */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">
                {isHindi ? 'सेंसर द्वारा मापी गई मिट्टी नमी' : 'Measured Soil Moisture'}
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {Math.round(currentMoisture * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.08"
              max="0.42"
              step="0.01"
              value={currentMoisture}
              onChange={(e) => setCurrentMoisture(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Weather Glance */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              {isHindi ? 'स्थानीय मौसम व बारिश अनुमान' : 'Local Weather & Rain'}
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="bg-slate-900 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400 block">{isHindi ? 'अधिकतम तापमान' : 'Max Temp'}</span>
                <span className="font-bold">{tempMax}°C</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400 block">{isHindi ? 'हवा में नमी' : 'Humidity'}</span>
                <span className="font-bold">{humidity}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right: AI Recommendation Card (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/50 rounded-2xl p-5 md:p-6 shadow-xl shadow-emerald-950/20 relative">
            
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                {isHindi ? 'सिंचाई सलाह:' : 'Prescription:'} {isHindi ? activeZone.cropHindiName : activeZone.cropName}
              </span>

              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  plan.urgency === 'critical'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : plan.urgency === 'high'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {plan.urgency === 'critical'
                  ? (isHindi ? 'तुरंत आवश्यक' : 'Critical')
                  : plan.urgency === 'high'
                  ? (isHindi ? 'शीघ्र आवश्यक' : 'High')
                  : (isHindi ? 'सामान्य' : 'Normal')}
              </span>
            </div>

            {/* Main Quantitative Prescriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">
                  {isHindi ? 'ड्रिप से पानी दें' : 'Target Water'}
                </span>
                <span className="text-2xl md:text-3xl font-black font-mono text-emerald-400">
                  {plan.recommendedVolumeLiters.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 block font-medium">
                  {isHindi ? 'लीटर पानी' : 'Liters'}
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">
                  {isHindi ? 'ड्रिप मोटर का समय' : 'Drip Runtime'}
                </span>
                <span className="text-2xl md:text-3xl font-black font-mono text-white">
                  {plan.recommendedDurationMinutes}
                </span>
                <span className="text-xs text-slate-400 block font-medium">
                  {isHindi ? 'मिनट' : 'Minutes'}
                </span>
              </div>

              {/* RUPEES SAVED (₹) */}
              <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">
                  {isHindi ? 'पैसों की सीधी बचत' : 'Money Saved vs Flood'}
                </span>
                <span className="text-2xl md:text-3xl font-black font-mono text-amber-300">
                  ₹{estimatedRupeesSaved.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 block font-medium">
                  {isHindi ? `बचत (${(plan.waterSavedLitersVsFlood / 1000).toFixed(1)}k L)` : `Saved (${(plan.waterSavedLitersVsFlood / 1000).toFixed(1)}k L)`}
                </span>
              </div>

            </div>

            {/* Rationale & Suggested Time */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 mb-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isHindi ? 'कृषि वैज्ञानिक व AI सलाह:' : 'Agronomic Rationale:'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isHindi ? plan.hindiReason : plan.reason}
              </p>
              <div className="pt-1 flex items-center gap-2 text-xs text-amber-300">
                <Clock className="w-4 h-4" />
                <span>
                  {isHindi ? 'सर्वोत्तम समय:' : 'Optimal Window:'}{' '}
                  <strong className="text-white">{isHindi ? plan.hindiSuggestedStartTime : plan.suggestedStartTime}</strong>
                </span>
              </div>
            </div>

            {/* Big 1-Click Action Button */}
            <button
              onClick={handleApply}
              disabled={!plan.shouldIrrigate}
              className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all cursor-pointer ${
                plan.shouldIrrigate
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-950/50'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              aria-label={`Apply recommendation to ${activeZone.name}`}
            >
              {appliedNotice ? (
                <>
                  <Check className="w-5 h-5 text-slate-950" />
                  <span>{isHindi ? 'सिंचाई आदेश वाल्व को भेजा गया!' : 'Applied to Solenoid Valve!'}</span>
                </>
              ) : (
                <>
                  <Droplets className="w-5 h-5 text-slate-950" />
                  <span>
                    {isHindi ? `${activeZone.hindiName} में ड्रिप चालू करें` : `Start Drip for ${activeZone.name}`}
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </>
              )}
            </button>

          </div>

          {/* Quick Farmer Tip */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-1">
            <span className="font-bold text-emerald-400 block">
              💡 {isHindi ? 'किसान मित्र टिप (Farmer Tip):' : 'Farmer Tip:'}
            </span>
            <p className="text-slate-300 leading-relaxed">
              {isHindi
                ? 'दोपहर के समय धूप में सिंचाई करने से बचें। सुबह 5:30 से 8:30 बजे के बीच ड्रिप चलाने से पानी भाप नहीं बनता और खाद-दवाएं सीधे जड़ों को मिलती हैं।'
                : 'Avoid irrigating during peak midday heat. Morning drip cycles (05:30 - 08:30 AM) eliminate evaporative loss and protect soil health.'}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
