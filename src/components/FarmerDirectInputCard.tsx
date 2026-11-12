/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, MapPin, Sprout, Layers, Droplet, Clock, Calculator, ArrowRight, FileText, ChevronDown, ChevronUp, Check, Sparkles } from 'lucide-react';
import { FarmerBiodata, LanguageMode, WeatherData } from '../types/irrigation';
import { ALL_INDIAN_STATES, IndianDistrictData } from '../data/indianLocations';
import { CROP_DATABASE, SOIL_DATABASE, GrowthStage, generateFarmerBiodataSummary, calculateETo, calculateETc } from '../utils/irrigationMath';

interface FarmerDirectInputCardProps {
  farmerBiodata: FarmerBiodata;
  onUpdateBiodata: (updated: FarmerBiodata, districtData?: IndianDistrictData) => void;
  onOpenBiodataModal: () => void;
  currentDistrict: IndianDistrictData;
  currentState: string;
  weather: WeatherData;
  language: LanguageMode;
}

export const FarmerDirectInputCard: React.FC<FarmerDirectInputCardProps> = ({
  farmerBiodata,
  onUpdateBiodata,
  onOpenBiodataModal,
  currentDistrict,
  currentState,
  weather,
  language,
}) => {
  const isHindi = language === 'hi';
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showFormulaExplanation, setShowFormulaExplanation] = useState<boolean>(false);

  // Calculate live summary based on the farmer's current biodata and local climate
  const summary = generateFarmerBiodataSummary({
    cropId: farmerBiodata.primaryCropId,
    cropStage: farmerBiodata.cropStage,
    soilId: farmerBiodata.soilId,
    totalLandAcres: farmerBiodata.totalLandAcres,
    borewellDepthFeet: farmerBiodata.borewellDepthFeet,
    motorHorsepower: farmerBiodata.motorHorsepower,
    soilTouchFeel: farmerBiodata.soilTouchFeel,
    tempMaxC: weather.tempMaxC,
    tempMinC: weather.tempMinC,
    humidityPct: weather.humidityPct,
    rainForecastMm: weather.rainForecastMm,
    rainProbabilityPct: weather.rainProbabilityPct,
  });

  const crop = CROP_DATABASE[farmerBiodata.primaryCropId] || CROP_DATABASE['tomato'];
  const soil = SOIL_DATABASE[farmerBiodata.soilId] || SOIL_DATABASE['clay-loam'];
  const eto = calculateETo(weather.tempMaxC, weather.tempMinC, weather.humidityPct);
  const etc = calculateETc(eto, farmerBiodata.primaryCropId, farmerBiodata.cropStage);

  // Handle direct field edits
  const handleStateSelect = (newStateName: string) => {
    const stateObj = ALL_INDIAN_STATES.find((s) => s.state === newStateName) || ALL_INDIAN_STATES[0];
    const firstDist = stateObj.districts[0];
    const updated: FarmerBiodata = {
      ...farmerBiodata,
      state: newStateName,
      district: firstDist.district,
      tehsil: firstDist.tehsils[0]?.split('(')[0].trim() || firstDist.district,
      borewellDepthFeet: firstDist.climate.groundwaterDepthFeet,
    };
    onUpdateBiodata(updated, firstDist);
  };

  const handleDistrictSelect = (newDistName: string) => {
    const stateObj = ALL_INDIAN_STATES.find((s) => s.state === currentState) || ALL_INDIAN_STATES[0];
    const distObj = stateObj.districts.find((d) => d.district === newDistName) || stateObj.districts[0];
    const updated: FarmerBiodata = {
      ...farmerBiodata,
      district: distObj.district,
      tehsil: distObj.tehsils[0]?.split('(')[0].trim() || distObj.district,
      borewellDepthFeet: distObj.climate.groundwaterDepthFeet,
    };
    onUpdateBiodata(updated, distObj);
  };

  const handleCropChange = (newCropId: string) => {
    onUpdateBiodata({
      ...farmerBiodata,
      primaryCropId: newCropId,
    });
  };

  const handleStageChange = (newStage: GrowthStage) => {
    onUpdateBiodata({
      ...farmerBiodata,
      cropStage: newStage,
    });
  };

  const handleSoilChange = (newSoilId: string) => {
    onUpdateBiodata({
      ...farmerBiodata,
      soilId: newSoilId,
    });
  };

  const handleAcresChange = (newAcres: number) => {
    onUpdateBiodata({
      ...farmerBiodata,
      totalLandAcres: Math.max(0.1, Number(newAcres.toFixed(1))),
    });
  };

  const handleTouchFeelChange = (touch: 'dry_powdery' | 'slightly_moist' | 'healthy_wet') => {
    onUpdateBiodata({
      ...farmerBiodata,
      soilTouchFeel: touch,
    });
  };

  const currentStateObj = ALL_INDIAN_STATES.find((s) => s.state === currentState) || ALL_INDIAN_STATES[0];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/30 rounded-2xl p-4 md:p-5 shadow-xl transition-all">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                {isHindi ? '१. किसान खेत विवरण इनपुट व लाइव गणना केंद्र' : '1. Farmer Farm Input & Live Calculation Station'}
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {isHindi ? 'यहाँ इनपुट बदलें' : 'Live Interactive Input'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isHindi
                ? 'यहाँ अपनी फसल, ज़मीन, राज्य, जिला व मिट्टी चुनें — नीचे लाइव देखें कि ड्रिप कितने मिनट चलानी है और कितना पानी बचेगा।'
                : 'Enter your farm details here to calculate exact daily drip runtime, water needed in Litres, and ₹ savings.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={onOpenBiodataModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isHindi ? 'तैयार बायोडाटा कार्ड देखें' : 'View Full Bio-Data'}</span>
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          
          {/* Main Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            
            {/* Input 1: Farmer Name & Mobile */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHindi ? 'किसान का नाम' : 'Farmer Name'}</span>
              </label>
              <input
                type="text"
                value={farmerBiodata.kisanName}
                onChange={(e) => onUpdateBiodata({ ...farmerBiodata, kisanName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
                placeholder={isHindi ? 'जैसे: रामेश्वर पाटिल' : 'e.g. Rameshwar Patil'}
              />
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>{isHindi ? 'मोबाइल:' : 'Mobile:'}</span>
                <span className="font-mono text-slate-300">{farmerBiodata.mobileNumber}</span>
              </div>
            </div>

            {/* Input 2: State & District */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{isHindi ? 'राज्य व जिला चुनें' : 'State & District'}</span>
              </label>
              <div className="space-y-1.5">
                <select
                  value={currentState}
                  onChange={(e) => handleStateSelect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {ALL_INDIAN_STATES.map((s) => (
                    <option key={s.state} value={s.state}>
                      {s.state} ({s.hindiState}) - {s.zone}
                    </option>
                  ))}
                </select>

                <select
                  value={currentDistrict.district}
                  onChange={(e) => handleDistrictSelect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {currentStateObj.districts.map((d) => (
                    <option key={d.district} value={d.district}>
                      {d.district} ({d.hindiDistrict})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input 3: Crop & Growth Stage */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-teal-400" />
                <span>{isHindi ? 'फसल व अवस्था' : 'Crop & Stage'}</span>
              </label>
              <div className="space-y-1.5">
                <select
                  value={farmerBiodata.primaryCropId}
                  onChange={(e) => handleCropChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {Object.values(CROP_DATABASE).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.hindiName})
                    </option>
                  ))}
                </select>

                <select
                  value={farmerBiodata.cropStage}
                  onChange={(e) => handleStageChange(e.target.value as GrowthStage)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="initial">{isHindi ? 'अंकुरण (Initial Kc 0.45)' : 'Initial'}</option>
                  <option value="vegetative">{isHindi ? 'बढ़वार (Vegetative Kc 0.85)' : 'Vegetative'}</option>
                  <option value="flowering">{isHindi ? 'फूल/फल (Flowering Kc 1.15)' : 'Flowering / Fruiting'}</option>
                  <option value="ripening">{isHindi ? 'कटाई (Ripening Kc 0.70)' : 'Ripening / Maturity'}</option>
                </select>
              </div>
            </div>

            {/* Input 4: Acres & Soil Moisture Touch Feel */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isHindi ? 'रकबा व मिट्टी जांच' : 'Acres & Soil Touch'}</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="50"
                    value={farmerBiodata.totalLandAcres}
                    onChange={(e) => handleAcresChange(Number(e.target.value))}
                    className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center font-bold text-emerald-400 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400">{isHindi ? 'एकड़' : 'Acres'}</span>
                </div>
              </div>

              {/* Touch Feel 3 Buttons */}
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => handleTouchFeelChange('dry_powdery')}
                  className={`p-1 rounded text-[10px] font-bold transition-all text-center cursor-pointer ${
                    farmerBiodata.soilTouchFeel === 'dry_powdery'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  🍂 {isHindi ? 'सूखी' : 'Dry'}
                </button>
                <button
                  type="button"
                  onClick={() => handleTouchFeelChange('slightly_moist')}
                  className={`p-1 rounded text-[10px] font-bold transition-all text-center cursor-pointer ${
                    farmerBiodata.soilTouchFeel === 'slightly_moist'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  🌿 {isHindi ? 'हल्की नम' : 'Moist'}
                </button>
                <button
                  type="button"
                  onClick={() => handleTouchFeelChange('healthy_wet')}
                  className={`p-1 rounded text-[10px] font-bold transition-all text-center cursor-pointer ${
                    farmerBiodata.soilTouchFeel === 'healthy_wet'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  💧 {isHindi ? 'गीली' : 'Wet'}
                </button>
              </div>

              <div className="text-[10px] text-slate-400 text-center">
                {isHindi ? 'मिट्टी छूने पर कैसा महसूस हो रहा है?' : 'Physical touch soil test'}
              </div>
            </div>

          </div>

          {/* LIVE CALCULATION RESULT STRIP (Shows exact basis & formula) */}
          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3.5 text-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              
              {/* Output 1: Today's water requirement */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0">
                  <Droplet className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide font-bold">
                    {isHindi ? 'आज के लिए पानी की कुल जरूरत' : 'Total Water Needed Today'}
                  </span>
                  <div className="text-base font-black text-white flex items-baseline gap-1.5">
                    <span>{summary.dailyWaterRequirementLiters.toLocaleString()}</span>
                    <span className="text-xs font-normal text-slate-400">{isHindi ? 'लीटर पानी' : 'Litres'}</span>
                    <span className="text-xs text-sky-400 font-mono">({farmerBiodata.totalLandAcres} {isHindi ? 'एकड़ हेतु' : 'Acres'})</span>
                  </div>
                </div>
              </div>

              {/* Output 2: Recommended Drip Runtime Minutes */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide font-bold">
                    {isHindi ? 'ड्रिप चलाने का सटीक समय' : 'Recommended Drip Duration'}
                  </span>
                  <div className="text-base font-black text-emerald-400 flex items-baseline gap-1.5">
                    <span>{summary.dailyDripMinutes}</span>
                    <span className="text-xs font-normal text-slate-400">{isHindi ? 'मिनट' : 'Minutes'}</span>
                    <span className="text-xs text-slate-400">
                      ({isHindi ? `सुबह 05:30 बजे` : 'at 05:30 AM'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Output 3: Season savings in Litres & ₹ Rupees */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <span className="text-base font-black text-amber-400">₹</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide font-bold">
                    {isHindi ? 'सीजन की बचत (अनुमानित)' : 'Estimated Season Savings'}
                  </span>
                  <div className="text-base font-black text-amber-400 flex items-baseline gap-1.5">
                    <span>₹{summary.seasonMoneySavedInr.toLocaleString()}</span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs font-medium text-emerald-400">
                      {summary.seasonWaterSavedLakhLiters} {isHindi ? 'लाख लीटर' : 'Lakh Litres'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formula explanation toggle */}
              <button
                onClick={() => setShowFormulaExplanation(!showFormulaExplanation)}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {showFormulaExplanation
                    ? (isHindi ? 'गणना छिपाएं' : 'Hide Math')
                    : (isHindi ? 'यह समय कैसे निकला? (गणित देखें)' : 'How was this calculated?')}
                </span>
              </button>

            </div>

            {/* DETAILED FORMULA BREAKDOWN: Answers "25 या 40 मिनट ड्रिप का क्या मतलब है?" */}
            {showFormulaExplanation && (
              <div className="mt-3 pt-3 border-t border-slate-800 bg-slate-900/60 rounded-xl p-3 text-xs space-y-2">
                <div className="font-bold text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isHindi
                      ? `ड्रिप समय (${summary.dailyDripMinutes} मिनट) और पानी (${summary.dailyWaterRequirementLiters.toLocaleString()} L) का पूरा गणित:`
                      : `Mathematical calculation for Drip Runtime (${summary.dailyDripMinutes} min):`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-300">
                  
                  {/* Step 1 */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">{isHindi ? 'स्टेप १: मौसम व फसल का वाष्पीकरण' : 'Step 1: Crop Evapotranspiration'}</span>
                    <p className="font-mono text-emerald-400">
                      ETc = ETo ({eto} mm) × Kc ({crop.stageKc[farmerBiodata.cropStage]}) = <strong>{etc} mm/दिन</strong>
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      {isHindi ? `${currentDistrict.district} के तापमान (${weather.tempCurrentC}°C) और धूप अनुसार फसल की दैनिक पानी मांग।` : `Based on local temperature and sunshine.`}
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">{isHindi ? 'स्टेप २: खेत का कुल पानी (लीटर)' : 'Step 2: Total Volume Required'}</span>
                    <p className="font-mono text-sky-400">
                      {farmerBiodata.totalLandAcres} एकड़ = <strong>{Math.round(farmerBiodata.totalLandAcres * 4046.86).toLocaleString()} m²</strong>
                    </p>
                    <p className="text-slate-300 text-[10px]">
                      {isHindi ? `पानी घाटा × गीला जड़ क्षेत्र = ` : 'Deficit × Area = '}
                      <strong className="text-white">{summary.dailyWaterRequirementLiters.toLocaleString()} लीटर</strong>
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">{isHindi ? 'स्टेप ३: ड्रिप चलने का समय (मिनट)' : 'Step 3: Drip Pumping Duration'}</span>
                    <p className="font-mono text-amber-300">
                      समय = कुल पानी (L) ÷ ड्रिप बहाव (LPM)
                    </p>
                    <p className="font-bold text-emerald-400">
                      = {summary.dailyDripMinutes} {isHindi ? 'मिनट ड्रिप चलेगी' : 'Minutes'}
                    </p>
                  </div>

                </div>

                <div className="text-[11px] text-slate-300 bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-2 leading-relaxed">
                  <strong>💡 {isHindi ? 'किसान भाइयों के लिए सरल अर्थ:' : 'Practical Explanation:'} </strong>
                  {isHindi ? (
                    <span>
                      {summary.dailyDripMinutes} मिनट का मतलब है कि जब आपकी मोटर और ड्रिप लाइन {summary.dailyDripMinutes} मिनट चलेगी, 
                      तो मिट्टी की 12 इंच गहराई (जड़ क्षेत्र) तक ठीक {summary.dailyWaterRequirementLiters.toLocaleString()} लीटर पानी समान रूप से पहुंच जाएगा। 
                      इससे ज्यादा चलाने पर पानी नीचे बेकार रिसकर व्यर्थ बह जाएगा, और कम चलाने पर पौधे प्यासे रह जाएंगे। इसलिए {summary.dailyDripMinutes} मिनट चलाना ही वैज्ञानिक रूप से सही है।
                    </span>
                  ) : (
                    <span>
                      {summary.dailyDripMinutes} minutes means that running the drip pump for exactly this duration supplies {summary.dailyWaterRequirementLiters.toLocaleString()} Litres uniformly to the root zone (12-inch depth). Running it longer wastes water below the roots, while less under-irrigates.
                    </span>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
