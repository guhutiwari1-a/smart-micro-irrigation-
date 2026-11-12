/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Droplet, Play, Square, Sparkles, Gauge, Layers, Info, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { FarmZone, LanguageMode, WeatherData } from '../types/irrigation';
import { computeIrrigationPlan } from '../utils/irrigationMath';

interface FieldSensorsViewProps {
  zones: FarmZone[];
  weather: WeatherData;
  onToggleValve: (zoneId: string, durationMin?: number) => void;
  onSelectZoneForAi: (zoneId: string) => void;
  onUpdateZoneMoisture: (zoneId: string, newVwc: number) => void;
  onSimulateWeatherEvent: (type: 'dry-spell' | 'heavy-rain') => void;
  language: LanguageMode;
}

export const FieldSensorsView: React.FC<FieldSensorsViewProps> = ({
  zones,
  weather,
  onToggleValve,
  onSelectZoneForAi,
  onUpdateZoneMoisture,
  onSimulateWeatherEvent,
  language,
}) => {
  const isHindi = language === 'hi';
  const [expandedZoneMathId, setExpandedZoneMathId] = useState<string | null>(null);

  const toggleMathExplanation = (zoneId: string) => {
    setExpandedZoneMathId(expandedZoneMathId === zoneId ? null : zoneId);
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header & Quick Weather Test */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            {isHindi ? 'खेत व मिट्टी नमी सेंसर (Field Moisture Status)' : 'Field IoT Moisture Probes & Valve Grid'}
          </h2>
          <p className="text-xs text-slate-400">
            {isHindi ? 'जड़ों की गहराई (4 इंच, 12 इंच, 24 इंच) पर मिट्टी की नमी व ड्रिप वाल्व की स्थिति' : 'Real-time root depth moisture probes and solenoid valve status'}
          </p>
        </div>

        {/* Quick Simulation Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">
            {isHindi ? 'मौसम जांच:' : 'Weather Test:'}
          </span>
          <button
            onClick={() => onSimulateWeatherEvent('dry-spell')}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
            title="Simulate heatwave"
          >
            {isHindi ? 'सूखा व तेज धूप टेस्ट' : 'Heatwave (+39°C)'}
          </button>
          <button
            onClick={() => onSimulateWeatherEvent('heavy-rain')}
            className="px-2.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold transition-colors cursor-pointer"
            title="Simulate rain showers"
          >
            {isHindi ? '18mm बारिश टेस्ट' : 'Rain (18mm)'}
          </button>
        </div>
      </div>

      {/* Grid of Farm Zones / Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {zones.map((zone) => {
          const isValveOpen = zone.valveStatus === 'OPEN';
          const moisturePct = Math.round(zone.currentMoistureVwc * 100);
          const targetPct = Math.round(zone.targetMoistureVwc * 100);

          // Dynamically compute exact irrigation plan for this zone
          const plan = computeIrrigationPlan({
            cropId: zone.cropId,
            stage: zone.cropStage,
            soilId: zone.soilId,
            currentMoistureVwc: zone.currentMoistureVwc,
            areaSquareMeters: zone.areaSqMeters,
            tempMaxC: weather.tempMaxC,
            tempMinC: weather.tempMinC,
            humidityPct: weather.humidityPct,
            rainForecastMm: weather.rainForecastMm,
            rainProbabilityPct: weather.rainProbabilityPct,
            emitterFlowRateLitersPerMin: zone.emitterFlowRateLpm,
          });

          const isCritical = zone.healthStatus === 'critical' || moisturePct < targetPct * 0.65;
          const isAttention = zone.healthStatus === 'attention' || (moisturePct < targetPct * 0.88 && !isCritical);
          const isMathOpen = expandedZoneMathId === zone.id;

          const recommendedMinutes = plan.shouldIrrigate ? plan.recommendedDurationMinutes : 0;
          const recommendedLitres = plan.shouldIrrigate ? plan.recommendedVolumeLiters : 0;

          return (
            <div
              key={zone.id}
              className={`rounded-2xl border transition-all duration-300 p-5 ${
                isValveOpen
                  ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                  : isCritical
                  ? 'bg-slate-900/90 border-rose-500/50 shadow-md shadow-rose-950/20'
                  : isAttention
                  ? 'bg-slate-900/90 border-amber-500/40'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-white">
                      {isHindi ? zone.hindiName : zone.name}
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isAttention
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {isCritical
                        ? (isHindi ? '⚠️ तुरंत पानी चाहिए' : 'Water Deficit Alert')
                        : isAttention
                        ? (isHindi ? '⚠️ हल्की नमी की कमी' : 'Moderate Dry')
                        : (isHindi ? '✓ पर्याप्त नमी' : 'Optimal')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1">
                    {isHindi ? zone.cropHindiName : zone.cropName} • {isHindi ? zone.soilHindiName : zone.soilName} • <strong className="text-white">{zone.areaAcres} {isHindi ? 'एकड़' : 'Acres'}</strong>
                  </p>
                </div>

                {/* Valve status badge */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                    isValveOpen
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Droplet className={`w-3.5 h-3.5 ${isValveOpen ? 'text-emerald-400 fill-emerald-400' : 'text-slate-500'}`} />
                  <span>{isValveOpen ? `${zone.valveFlowLpm} L/min चालू` : (isHindi ? 'वाल्व बंद' : 'VALVE OFF')}</span>
                </div>
              </div>

              {/* Main Moisture Gauge & Root Zone Slider */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 mb-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    {isHindi ? 'जड़ों की मिट्टी में नमी (Root Zone)' : 'Root Zone Moisture'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">
                      {isHindi ? `लक्षित: ${targetPct}%` : `Target: ${targetPct}%`}
                    </span>
                    <span
                      className={`font-mono text-xs font-black px-2 py-0.5 rounded ${
                        moisturePct < 20
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : moisturePct < targetPct
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {moisturePct}%
                    </span>
                  </div>
                </div>

                {/* Interactive VWC slider to simulate moisture change */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="10"
                    max="45"
                    value={moisturePct}
                    onChange={(e) => onUpdateZoneMoisture(zone.id, Number(e.target.value) / 100)}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    aria-label={`Adjust ${zone.name} soil moisture simulation slider`}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>10% ({isHindi ? 'सूखा' : 'Dry'})</span>
                    <span className="text-emerald-400/80">{isHindi ? 'स्लाइडर से नमी बदलें' : 'Drag slider to test'}</span>
                    <span>45% ({isHindi ? 'भरपूर गीला' : 'Saturated'})</span>
                  </div>
                </div>
              </div>

              {/* Depth Sensors (4", 12", 24") */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>{isHindi ? 'विभिन्न गहराई पर मिट्टी नमी प्रोफ़ाइल:' : 'Multi-depth moisture profile:'}</span>
                  <span className="font-mono text-slate-400">{isHindi ? 'मिट्टी तनाव (kPa)' : 'Tension (kPa)'}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {zone.depthReadings.map((reading) => {
                    const depthPct = Math.round(reading.moistureVwc * 100);
                    return (
                      <div
                        key={reading.depthCm}
                        className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-center"
                      >
                        <div className="text-[11px] font-bold text-slate-300 mb-0.5">
                          {reading.depthInches}" ({reading.depthCm} सेमी)
                        </div>
                        <div className="font-mono text-sm font-black text-white">
                          {depthPct}%
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1 my-1 overflow-hidden">
                          <div
                            className={`h-full ${
                              depthPct < 20
                                ? 'bg-rose-500'
                                : depthPct < 28
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, (depthPct / 40) * 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {reading.tensionKpa} kPa • {reading.soilTempC}°C
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LIVE DYNAMIC ACTION BUTTON & TIME EXPLANATION */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleValve(zone.id, recommendedMinutes > 0 ? recommendedMinutes : 20)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                      isValveOpen
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : !plan.shouldIrrigate
                        ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                    }`}
                    aria-label={isValveOpen ? `Turn OFF valve for ${zone.name}` : `Open valve for ${zone.name}`}
                  >
                    {isValveOpen ? (
                      <>
                        <Square className="w-4 h-4 fill-white" />
                        <span>{isHindi ? 'ड्रिप पानी बंद करें' : 'Stop Irrigation'}</span>
                      </>
                    ) : !plan.shouldIrrigate ? (
                      <>
                        <Droplet className="w-4 h-4 text-emerald-400" />
                        <span>{isHindi ? '✓ पर्याप्त नमी है (सिंचाई की जरूरत नहीं)' : 'Moisture Optimal (No Drip Needed)'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>
                          {isHindi
                            ? `💧 ${recommendedMinutes} मिनट ड्रिप चलाएं (${recommendedLitres.toLocaleString()} L)`
                            : `Run Drip ${recommendedMinutes} min (${recommendedLitres.toLocaleString()} L)`}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => toggleMathExplanation(zone.id)}
                    className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                    title={isHindi ? 'यह समय कैसे निकला? (कैलकुलेशन देखें)' : 'How was this runtime calculated?'}
                  >
                    <Calculator className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isMathOpen ? (isHindi ? 'बंद करें' : 'Close') : (isHindi ? 'समय का गणित' : 'Math')}</span>
                  </button>

                  <button
                    onClick={() => onSelectZoneForAi(zone.id)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                    title="Check AI water requirement"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>{isHindi ? 'AI सलाह' : 'AI Advice'}</span>
                  </button>
                </div>

                {/* MATHEMATICAL BREAKDOWN: Answers "25 मिनट ड्रिप का क्या मतलब है?" */}
                {isMathOpen && (
                  <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3 text-xs space-y-2 mt-2">
                    <div className="font-bold text-amber-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-amber-400" />
                        {isHindi
                          ? `यह ${recommendedMinutes} मिनट का समय कैसे निकला? (कैलकुलेशन का आधार)`
                          : `How is the ${recommendedMinutes} min runtime calculated?`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {zone.areaAcres} {isHindi ? 'एकड़' : 'Acres'} • {zone.emitterFlowRateLpm} LPM
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                      
                      <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-bold">{isHindi ? '१. मिट्टी में पानी का घाटा:' : '1. Soil Deficit'}</span>
                        <p className="font-mono text-emerald-400 font-bold">
                          {isHindi ? `${plan.netIrrigationMm} मिमी पानी` : `${plan.netIrrigationMm} mm`}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {isHindi ? `फसल का दैनिक वाष्पोत्सर्जन ($ET_c$) और वर्तमान नमी के अंतर से।` : `Based on crop $ET_c$ & current moisture.`}
                        </p>
                      </div>

                      <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-bold">{isHindi ? '२. कुल आवश्यक पानी:' : '2. Total Volume Needed'}</span>
                        <p className="font-mono text-sky-400 font-bold">
                          {recommendedLitres.toLocaleString()} {isHindi ? 'लीटर' : 'L'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {isHindi ? `खेत का रकबा (${Math.round(zone.areaSqMeters)} m²) × पानी घाटा।` : `Area (${Math.round(zone.areaSqMeters)} m²) × deficit mm.`}
                        </p>
                      </div>

                      <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-bold">{isHindi ? '३. ड्रिप चलने का समय:' : '3. Drip Duration'}</span>
                        <p className="font-mono text-amber-300 font-bold">
                          {recommendedLitres.toLocaleString()} L ÷ {zone.emitterFlowRateLpm} LPM
                        </p>
                        <p className="text-[11px] font-black text-emerald-400 mt-0.5">
                          = {recommendedMinutes} {isHindi ? 'मिनट' : 'Minutes'}
                        </p>
                      </div>

                    </div>

                    <div className="text-[11px] text-slate-300 bg-amber-950/30 border border-amber-800/40 rounded-lg p-2 leading-relaxed">
                      <strong>💡 {isHindi ? 'सरल भाषा में किसान भाई के लिए अर्थ:' : 'Practical Note:'} </strong>
                      {isHindi ? (
                        <span>
                          {recommendedMinutes > 0 ? (
                            <>
                              इस खेत का रकबा <strong>{zone.areaAcres} एकड़</strong> है और आपकी ड्रिप पाइप लाइन से प्रति मिनट <strong>{zone.emitterFlowRateLpm} लीटर</strong> पानी निकलता है। 
                              जब मोटर <strong>{recommendedMinutes} मिनट</strong> चलेगी, तो कुल <strong>{recommendedLitres.toLocaleString()} लीटर</strong> पानी सीधे पौधों की जड़ों (12 इंच गहराई) तक पहुंचेगा। 
                              यदि आप इससे ज्यादा समय चलाएंगे तो पानी जड़ों से नीचे बहकर बर्बाद हो जाएगा और बिजली बिल बढ़ेगा; यदि कम चलाएंगे तो पौधे सूखे रह जाएंगे।
                            </>
                          ) : (
                            <>
                              आपके खेत में नमी का स्तर लक्षित क्षमता पर है। अभी ड्रिप चलाने पर पानी और बिजली दोनों व्यर्थ होंगे।
                            </>
                          )}
                        </span>
                      ) : (
                        <span>
                          For this {zone.areaAcres}-acre field discharging at {zone.emitterFlowRateLpm} L/min, running the drip for exactly {recommendedMinutes} minutes delivers {recommendedLitres.toLocaleString()} Litres to the 12-inch active root zone.
                        </span>
                      )}
                    </div>

                  </div>
                )}

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
