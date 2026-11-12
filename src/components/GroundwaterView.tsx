/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Droplet, AlertTriangle, ShieldCheck, TrendingDown, Layers, Waves, Activity, RefreshCw } from 'lucide-react';
import { BorewellStatus, LanguageMode } from '../types/irrigation';
import { predictGroundwaterStatus } from '../utils/irrigationMath';

interface GroundwaterViewProps {
  borewell: BorewellStatus;
  language: LanguageMode;
}

export const GroundwaterView: React.FC<GroundwaterViewProps> = ({
  borewell,
  language,
}) => {
  const isHindi = language === 'hi';

  const [currentDepth, setCurrentDepth] = useState<number>(borewell.waterTableDepthM);
  const [rainfallDeficitPct, setRainfallDeficitPct] = useState<number>(30);
  const [dailyPumpingHours, setDailyPumpingHours] = useState<number>(4.5);
  const [dripAdoptionPct, setDripAdoptionPct] = useState<number>(85);

  const dailyExtractionLiters = Math.round(borewell.pumpingDischargeLps * 3600 * dailyPumpingHours);
  const simulatedRainfallMm = Math.max(0, 3.2 * (1 - rainfallDeficitPct / 100));

  const forecast = predictGroundwaterStatus({
    currentDepthM: currentDepth,
    criticalThresholdDepthM: borewell.criticalDepthM,
    aquiferSpecificYield: 0.10,
    catchmentAreaHectares: 12,
    dailyRainfallMm: simulatedRainfallMm,
    dailyExtractionLiters,
    activeBorewells: 3,
    dripAdoptionPct,
  });

  const maxDepthM = 45;
  const waterTablePct = (currentDepth / maxDepthM) * 100;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Droplet className="w-5 h-5 text-sky-400" />
            {isHindi ? 'बोरवेल जल स्तर निगरानी व भूजल बचत मॉडल' : 'Groundwater & Borewell Aquifer Monitor'}
          </h2>
          <p className="text-xs text-slate-400">
            {isHindi ? 'बोरवेल मोटर का पानी, भूजल स्तर (फीट में) और अगले 90 दिनों का सूखा पूर्वानुमान' : 'Borewell water table depth (in feet), extraction tracking, and 90-day depletion forecasting'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">
              {isHindi ? 'भूजल स्थिरता स्कोर' : 'Aquifer Health Score'}
            </span>
            <span className="text-lg font-black font-mono text-emerald-400">
              {forecast.sustainabilityIndexPct}/100
            </span>
          </div>
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              forecast.alertLevel === 'Safe'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : forecast.alertLevel === 'Semi-Critical'
                ? 'bg-amber-950 text-amber-300 border-amber-700'
                : 'bg-rose-950 text-rose-300 border-rose-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{isHindi ? forecast.hindiAlertLevel : forecast.alertLevel}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Hydrogeological Cross-Section (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            {isHindi ? 'जमीन के अंदर पानी का स्तर (Cross-Section)' : 'Subsurface Hydrogeological Profile'}
          </h3>

          <div className="relative h-80 w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col">
            
            {/* Ground Surface (0 ft) */}
            <div className="h-10 bg-amber-950/60 border-b border-amber-800/40 p-2 flex items-center justify-between text-xs font-bold text-amber-300">
              <span>{isHindi ? 'जमीन की सतह (0 फीट)' : 'Ground Surface (0 ft)'}</span>
              <span>{isHindi ? 'खेत की मिट्टी' : 'Topsoil Layer'}</span>
            </div>

            {/* Unsaturated Zone */}
            <div
              className="bg-amber-950/20 relative flex flex-col justify-center items-center text-slate-400 text-xs transition-all duration-500"
              style={{ height: `${Math.max(20, waterTablePct * 2.2)}px` }}
            >
              <span className="text-[11px] font-bold text-slate-300 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800 shadow">
                {isHindi ? `सूखी परत (${forecast.currentWaterTableDepthFeet} फीट गहराई)` : `Vadose Zone (${forecast.currentWaterTableDepthFeet} ft depth)`}
              </span>

              {/* Borewell Pipe Casing */}
              <div className="absolute top-0 bottom-0 left-7 w-3 bg-slate-600 border-x border-slate-500 flex flex-col items-center">
                <div className="w-1.5 h-full bg-slate-800"></div>
              </div>
            </div>

            {/* Water Table Line */}
            <div className="relative w-full z-10 flex items-center">
              <div className="w-full border-t-2 border-dashed border-sky-400 animate-pulse" />
              <span className="absolute right-2 -top-3.5 text-[11px] font-mono font-black px-2.5 py-0.5 rounded-lg bg-sky-950 text-sky-200 border border-sky-600 shadow-lg">
                💧 {isHindi ? 'जल स्तर:' : 'Water Table:'} {forecast.currentWaterTableDepthFeet} {isHindi ? 'फीट' : 'ft'}
              </span>
            </div>

            {/* Saturated Aquifer */}
            <div className="flex-1 bg-gradient-to-b from-sky-950/70 to-blue-950 relative p-3 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-xs text-sky-300 font-bold">
                <Waves className="w-4 h-4 text-sky-400 animate-pulse" />
                <span>{isHindi ? 'भूजल एक्विफर (जल भंडार)' : 'Saturated Aquifer'}</span>
              </div>

              {/* Critical Floor Line */}
              <div className="relative w-full border-t-2 border-rose-600 my-2 flex items-center justify-between text-[11px] font-mono text-rose-300">
                <span className="bg-slate-950 px-2 py-0.5 rounded">
                  {isHindi ? `खतरे का स्तर (${forecast.criticalThresholdDepthFeet} फीट)` : `Critical Floor (${forecast.criticalThresholdDepthFeet} ft)`}
                </span>
                <span className="bg-rose-950 text-rose-200 px-1.5 py-0.5 rounded border border-rose-800 font-bold">
                  {isHindi ? 'सुरक्षित बफर: +' : 'Buffer: +'}{(borewell.criticalDepthFeet - forecast.currentWaterTableDepthFeet).toFixed(1)} ft
                </span>
              </div>

              <div className="text-[10px] text-slate-500 font-mono text-right">
                {isHindi ? 'कठोर चट्टान तल (147 फीट)' : 'Impermeable Bedrock (147 ft)'}
              </div>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">{isHindi ? 'दैनिक मोटर पंपिंग' : 'Daily Pumping'}</span>
              <span className="font-bold text-white text-sm">{(dailyExtractionLiters / 1000).toFixed(0)}k {isHindi ? 'लीटर' : 'Liters'}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">{isHindi ? 'प्राकृतिक रिचार्ज' : 'Natural Recharge'}</span>
              <span className="font-bold text-emerald-400 text-sm">{forecast.rechargeRateM3Day} m³/day</span>
            </div>
          </div>

        </div>

        {/* Right: Sliders & 90 Days Depletion Trajectory (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                {isHindi ? 'सूखा व बोरवेल मोटर सिमुलेटर (Stress Test)' : 'Drought & Pumping Stress Simulator'}
              </h3>
              <button
                onClick={() => {
                  setRainfallDeficitPct(0);
                  setDailyPumpingHours(3.5);
                  setDripAdoptionPct(90);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isHindi ? 'रीसेट करें' : 'Reset'}</span>
              </button>
            </div>

            {/* Slider 1: Rainfall Deficit */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-bold">
                  {isHindi ? 'मानसूनी बारिश में कमी (कम बारिश की स्थिति)' : 'Monsoon Rainfall Deficit'}
                </span>
                <span className={`font-mono font-bold ${rainfallDeficitPct > 40 ? 'text-rose-400' : 'text-amber-300'}`}>
                  {rainfallDeficitPct}% {isHindi ? 'कम बारिश' : 'Below Normal'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={rainfallDeficitPct}
                onChange={(e) => setRainfallDeficitPct(Number(e.target.value))}
                className="w-full accent-sky-500 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                <span>{isHindi ? '0% (सामान्य मानसून)' : '0% (Normal)'}</span>
                <span>{isHindi ? '40% (हल्का सूखा)' : '40% (Mild Drought)'}</span>
                <span>{isHindi ? '80% (गंभीर सूखा)' : '80% (Severe Drought)'}</span>
              </div>
            </div>

            {/* Slider 2: Pumping Hours */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-bold">
                  {isHindi ? 'प्रतिदिन बोरवेल मोटर चलने का समय' : 'Daily Borewell Pumping Duration'}
                </span>
                <span className="font-mono font-bold text-white">
                  {dailyPumpingHours} {isHindi ? 'घंटे/दिन' : 'Hours/Day'} ({(dailyExtractionLiters / 1000).toFixed(0)}k L)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={dailyPumpingHours}
                onChange={(e) => setDailyPumpingHours(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                <span>{isHindi ? '1 घंटा (कम दोहन)' : '1 hr'}</span>
                <span>{isHindi ? '4.5 घंटे (औसत ड्रिप)' : '4.5 hrs (Optimal)'}</span>
                <span>{isHindi ? '10 घंटे (अत्यधिक दोहन)' : '10 hrs (Over-Pumping)'}</span>
              </div>
            </div>

            {/* Slider 3: Drip Adoption */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-bold">
                  {isHindi ? 'खेत में ड्रिप तकनीक का उपयोग' : 'Micro-Drip Adoption Rate'}
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {dripAdoptionPct}% {isHindi ? 'ड्रिप (बनाम खुली नाली)' : 'Drip (vs Flood)'}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={dripAdoptionPct}
                onChange={(e) => setDripAdoptionPct(Number(e.target.value))}
                className="w-full accent-teal-500 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

          </div>

          {/* 30 / 60 / 90 Days Depletion in Feet */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-sky-400" />
              {isHindi ? 'आगामी 90 दिनों में जल स्तर का पूर्वानुमान' : 'Next 90 Days Water Table Forecast'}
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {isHindi ? '30 दिन बाद' : 'In 30 Days'}
                </span>
                <span className="text-xl font-bold font-mono text-white">
                  {forecast.forecast30DaysDepthFeet} {isHindi ? 'फीट' : 'ft'}
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {isHindi ? '60 दिन बाद' : 'In 60 Days'}
                </span>
                <span className="text-xl font-bold font-mono text-white">
                  {forecast.forecast60DaysDepthFeet} {isHindi ? 'फीट' : 'ft'}
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {isHindi ? '90 दिन बाद' : 'In 90 Days'}
                </span>
                <span className={`text-xl font-bold font-mono ${forecast.forecast90DaysDepthFeet >= borewell.criticalDepthFeet ? 'text-rose-400' : 'text-amber-400'}`}>
                  {forecast.forecast90DaysDepthFeet} {isHindi ? 'फीट' : 'ft'}
                </span>
              </div>
            </div>

            {/* Mitigation Advice in Hindi */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-300 block mb-1.5">
                {isHindi ? 'भूजल सुरक्षा हेतु कृषि वैज्ञानिक सलाह:' : 'Groundwater Protection Steps:'}
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(isHindi ? forecast.hindiMitigationAdvice : forecast.mitigationAdvice).map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
