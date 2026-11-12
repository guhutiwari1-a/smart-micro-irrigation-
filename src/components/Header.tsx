/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Droplets, Activity, CloudSun, PowerOff, Sparkles, MapPin, Volume2, Globe2, Award, FileText, Radio, ShieldCheck } from 'lucide-react';
import { WeatherData, LanguageMode } from '../types/irrigation';
import { ALL_INDIAN_STATES, IndianDistrictData } from '../data/indianLocations';

interface HeaderProps {
  weather: WeatherData;
  currentDistrict: IndianDistrictData;
  currentState: string;
  onSelectDistrict: (district: IndianDistrictData, stateName: string) => void;
  language: LanguageMode;
  onToggleLanguage: () => void;
  onEmergencyStopAll: () => void;
  activeValvesCount: number;
  onOpenAgronomist: () => void;
  onOpenBiodataModal: () => void;
  onOpenPmksyModal?: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onPlayVoiceSummary: () => void;
  farmerName: string;
}

export const Header: React.FC<HeaderProps> = ({
  weather,
  currentDistrict,
  currentState,
  onSelectDistrict,
  language,
  onToggleLanguage,
  onEmergencyStopAll,
  activeValvesCount,
  onOpenAgronomist,
  onOpenBiodataModal,
  onOpenPmksyModal,
  activeTab,
  onSelectTab,
  onPlayVoiceSummary,
  farmerName,
}) => {
  const isHindi = language === 'hi';

  const handleDistrictDropdown = (val: string) => {
    // val format: "State|District"
    const [st, dt] = val.split('|');
    const stateObj = ALL_INDIAN_STATES.find((s) => s.state === st);
    if (stateObj) {
      const distObj = stateObj.districts.find((d) => d.district === dt);
      if (distObj) {
        onSelectDistrict(distObj, st);
      }
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/98 backdrop-blur sticky top-0 z-30 transition-all">
      
      {/* Top Prestigious National Scheme Ribbon (PMKSY & Jal Shakti Abhiyan) */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/30 px-3 py-1 text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span className="text-amber-400 font-bold">🇮🇳 भारत सरकार •</span>
            <span className="text-emerald-300 font-bold">
              {isHindi
                ? 'जल शक्ति अभियान एवं प्रधानमंत्री कृषि सिंचाई योजना (PMKSY) के वैज्ञानिक मानकों पर आधारित'
                : 'Aligned with Jal Shakti Abhiyan & PMKSY (Per Drop More Crop) Scientific Standards'}
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-amber-200">
              {isHindi ? 'प्रति बूंद अधिक फसल' : 'Per Drop More Crop'}
            </span>
          </div>

          {onOpenPmksyModal && (
            <button
              onClick={onOpenPmksyModal}
              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <Award className="w-3 h-3 text-amber-400" />
              <span>{isHindi ? 'योजना के मानक व सब्सिडी देखें' : 'View Scheme Standards & Subsidy'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Brand & Indian Location Selector */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-950/50 border border-emerald-400/40 shrink-0">
            <Droplets className="w-6 h-6 text-slate-950 fill-emerald-100" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base md:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                {isHindi ? 'हाइड्रोसेंस किसान' : 'HydroSense'} 
                <span className="text-emerald-400 font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                  {isHindi ? 'KISAN' : 'KISAN'}
                </span>
              </h1>
              
              {/* Nationwide Location Dropdown (North, South, East, West, Central) */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <select
                  value={`${currentState}|${currentDistrict.district}`}
                  onChange={(e) => handleDistrictDropdown(e.target.value)}
                  className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer pr-1"
                  aria-label="Select location across India"
                >
                  {ALL_INDIAN_STATES.map((state) => (
                    <optgroup key={state.state} label={`📍 ${state.state} (${state.hindiState}) - ${state.zone} India`}>
                      {state.districts.map((d) => (
                        <option
                          key={`${state.state}-${d.district}`}
                          value={`${state.state}|${d.district}`}
                          className="bg-slate-900 text-white"
                        >
                          {d.district} ({d.hindiDistrict})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Tagline & Farmer context */}
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-emerald-400 font-bold">
                {isHindi ? 'भारतीय किसान सूक्ष्म-सिंचाई व भूजल संरक्षण प्रणाली' : 'Smart Micro-Irrigation & Aquifer Protection'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-medium">{farmerName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300 font-bold">
                {weather.tempCurrentC}°C ({isHindi ? weather.hindiCondition : weather.condition})
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Weather Glance Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <CloudSun className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-white font-bold">{weather.tempCurrentC}°C</strong> ({weather.tempMaxC}°C / {weather.tempMinC}°C)
            </span>
            <span className="text-slate-600">|</span>
            <span className={weather.rainProbabilityPct > 30 ? 'text-sky-300 font-bold' : 'text-slate-400'}>
              {isHindi ? 'बारिश' : 'Rain'}: {weather.rainProbabilityPct}%
            </span>
          </div>

          {/* PMKSY Scheme Details Button */}
          {onOpenPmksyModal && (
            <button
              onClick={onOpenPmksyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title={isHindi ? 'PMKSY व जल शक्ति अभियान के मानक' : 'PMKSY & Jal Shakti Standards'}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHindi ? 'PMKSY मानक' : 'PMKSY Standards'}</span>
            </button>
          )}

          {/* Farm Bio-Data Input Center Button */}
          <button
            onClick={onOpenBiodataModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer"
            title={isHindi ? 'अपना खेत विवरण दर्ज करें व बायोडाटा कार्ड देखें' : 'Input farm details and generate bio-data card'}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isHindi ? 'बायोडाटा कार्ड' : 'Bio-Data Card'}</span>
          </button>

          {/* Voice Speaker Button */}
          <button
            onClick={onPlayVoiceSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title={isHindi ? 'आज की सिंचाई सलाह बोलकर सुनें' : 'Listen to voice advisory'}
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{isHindi ? 'आवाज़ में सुनें' : 'Voice Advice'}</span>
          </button>

          {/* AI Agronomist Button */}
          <button
            onClick={onOpenAgronomist}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
            aria-label="Open AI Agronomist Advisor"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>{isHindi ? 'AI सलाहकार' : 'AI Advice'}</span>
          </button>

          {/* Bilingual Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
            title="Switch Language / भाषा बदलें"
          >
            <Globe2 className="w-3.5 h-3.5 text-teal-400" />
            <span>{isHindi ? 'English' : '🇮🇳 हिंदी'}</span>
          </button>

          {/* Emergency Stop All Pumps */}
          {activeValvesCount > 0 && (
            <button
              onClick={onEmergencyStopAll}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/40 transition-all animate-pulse cursor-pointer"
              aria-label="Emergency Shutoff all active valves"
            >
              <PowerOff className="w-3.5 h-3.5" />
              <span>{isHindi ? `मोटर बंद (${activeValvesCount})` : `Stop (${activeValvesCount})`}</span>
            </button>
          )}

        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-3 md:px-6 pt-2 pb-2 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-medium">
        {[
          { id: 'dashboard', label: isHindi ? '1. खेत व मिट्टी नमी' : '1. Field & Soil Moisture', icon: Activity },
          { id: 'recommender', label: isHindi ? '2. फसल सिंचाई सलाह' : '2. Crop Water Advice', icon: Sparkles },
          { id: 'groundwater', label: isHindi ? '3. बोरवेल व भूजल' : '3. Borewell & Groundwater', icon: Droplets },
          { id: 'valves', label: isHindi ? '4. मोटर व ड्रिप वाल्व' : '4. Pump & Drip Valves', icon: Radio },
          { id: 'progress', label: isHindi ? '5. किसान प्रगति व बचत' : '5. Farmer Progress & Savings', icon: Award, highlight: true },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : tab.highlight
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
