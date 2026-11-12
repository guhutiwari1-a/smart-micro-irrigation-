/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gauge, TrendingDown, Droplets, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { FarmZone, BorewellStatus, LanguageMode } from '../types/irrigation';

interface KpiOverviewProps {
  zones: FarmZone[];
  borewell: BorewellStatus;
  totalSavedSeasonLiters: number;
  totalSavedSeasonInr: number;
  recommendedTodayLiters: number;
  language: LanguageMode;
}

export const KpiOverview: React.FC<KpiOverviewProps> = ({
  zones,
  borewell,
  totalSavedSeasonLiters,
  totalSavedSeasonInr,
  recommendedTodayLiters,
  language,
}) => {
  const isHindi = language === 'hi';

  const avgMoisture = Math.round(
    (zones.reduce((sum, z) => sum + z.currentMoistureVwc, 0) / zones.length) * 100
  );

  const stressedZonesCount = zones.filter(
    (z) => z.healthStatus === 'critical' || z.healthStatus === 'attention'
  ).length;

  const bufferFeet = Number(((borewell.criticalDepthM - borewell.waterTableDepthM) * 3.28084).toFixed(1));
  const lakhLitres = (totalSavedSeasonLiters / 100000).toFixed(2);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Root Zone Soil Moisture */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 relative overflow-hidden backdrop-blur hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-emerald-400" />
            {isHindi ? 'मिट्टी में नमी (नमी स्तर)' : 'Soil Moisture Level'}
          </span>
          {stressedZonesCount > 0 ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              <AlertTriangle className="w-3 h-3" />
              {stressedZonesCount} {isHindi ? 'खेत सूखा' : 'zones dry'}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              <CheckCircle2 className="w-3 h-3" />
              {isHindi ? 'पर्याप्त' : 'Optimal'}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-black font-mono text-white tracking-tight">
            {avgMoisture}%
          </span>
          <span className="text-xs text-slate-400">
            {isHindi ? 'औसत खेत नमी' : 'avg root moisture'}
          </span>
        </div>

        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              avgMoisture < 22
                ? 'bg-rose-500'
                : avgMoisture < 28
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, (avgMoisture / 45) * 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
          <span>{isHindi ? 'सूखा: <15%' : 'Dry: <15%'}</span>
          <span className="text-emerald-400 font-bold">{isHindi ? 'सही: 28-34%' : 'Target: 28-34%'}</span>
          <span>{isHindi ? 'गीला: >38%' : 'Wet: >38%'}</span>
        </div>
      </div>

      {/* 2. Borewell Water Table Depth */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 relative overflow-hidden backdrop-blur hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-sky-400" />
            {isHindi ? 'बोरवेल जल स्तर (गहराई)' : 'Borewell Water Table'}
          </span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
              borewell.alertLevel === 'Safe'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : borewell.alertLevel === 'Semi-Critical'
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : 'bg-rose-950 text-rose-300 border-rose-800'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            {isHindi ? borewell.hindiAlertLevel.split('(')[0] : borewell.alertLevel}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-black font-mono text-white tracking-tight">
            {borewell.waterTableDepthFeet}
          </span>
          <span className="text-xs text-slate-300 font-bold">
            {isHindi ? 'फीट गहरा' : 'Feet deep'} ({borewell.waterTableDepthM}m)
          </span>
        </div>

        <p className="text-xs text-slate-300 flex items-center justify-between mb-1">
          <span>{isHindi ? 'सुरक्षित जल बफर:' : 'Safe Aquifer Headroom:'}</span>
          <strong className="text-sky-300 font-mono">+{bufferFeet} {isHindi ? 'फीट' : 'ft'}</strong>
        </p>
        <p className="text-[11px] text-slate-400">
          {isHindi ? `खतरे का स्तर: ${borewell.criticalDepthFeet} फीट • भूजल सुरक्षित` : `Critical floor: ${borewell.criticalDepthFeet} ft`}
        </p>
      </div>

      {/* 3. AI Water Requirement Today */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 relative overflow-hidden backdrop-blur hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-emerald-400" />
            {isHindi ? 'आज ड्रिप से पानी की जरूरत' : 'AI Recommended Drip'}
          </span>
          <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            92% {isHindi ? 'क्षमता' : 'Eff.'}
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
            {recommendedTodayLiters.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-400">
            {isHindi ? 'लीटर पानी' : 'Liters'}
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-1">
          {isHindi ? 'प्राथमिकता:' : 'Priority:'} <strong className="text-amber-300">{isHindi ? 'खेत 2 (टमाटर)' : 'Plot 2 (Tomato)'}</strong>
        </p>
        <p className="text-[11px] text-slate-400">
          {isHindi ? 'सलाह समय: सुबह 05:30 बजे (धूप से पहले)' : 'Recommended time: 05:30 AM (pre-dawn)'}
        </p>
      </div>

      {/* 4. Seasonal Rupee & Water Savings (IN RUPEES ₹ - NO DOLLAR SIGNS) */}
      <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 relative overflow-hidden backdrop-blur hover:border-emerald-500 transition-all shadow-lg shadow-emerald-950/20">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px]">
              ₹
            </span>
            {isHindi ? 'कुल पैसों की बचत (सीजन)' : 'Total Money Saved (Season)'}
          </span>
          <span className="text-[11px] text-amber-300 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
            ₹ बचत
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-3xl font-black font-mono text-amber-300 tracking-tight">
            ₹{totalSavedSeasonInr.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>{isHindi ? 'पानी की बचत:' : 'Water Saved:'}</span>
          <span className="font-mono text-emerald-400 font-bold">
            {lakhLitres} {isHindi ? 'लाख लीटर' : 'Lakh L'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {isHindi ? 'बिजली बिल व पानी टैंकर के खर्च में सीधी बचत' : 'Saved on pump electricity & tankers'}
        </p>
      </div>

    </div>
  );
};
