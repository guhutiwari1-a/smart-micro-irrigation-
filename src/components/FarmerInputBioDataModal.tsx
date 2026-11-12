/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, MapPin, X, Check, Droplets, Sparkles, Share2, Layers, Award, FileText, ArrowRight } from 'lucide-react';
import { FarmerBiodata, LanguageMode } from '../types/irrigation';
import { ALL_INDIAN_STATES, IndianDistrictData } from '../data/indianLocations';
import { CROP_DATABASE, SOIL_DATABASE, GrowthStage, generateFarmerBiodataSummary } from '../utils/irrigationMath';

interface FarmerInputBioDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBiodata: FarmerBiodata;
  onSaveBiodata: (updated: FarmerBiodata, districtData: IndianDistrictData) => void;
  language: LanguageMode;
}

export const FarmerInputBioDataModal: React.FC<FarmerInputBioDataModalProps> = ({
  isOpen,
  onClose,
  currentBiodata,
  onSaveBiodata,
  language,
}) => {
  const isHindi = language === 'hi';

  const [kisanName, setKisanName] = useState(currentBiodata.kisanName);
  const [mobileNumber, setMobileNumber] = useState(currentBiodata.mobileNumber);
  const [selectedState, setSelectedState] = useState(currentBiodata.state);
  const [selectedDistrict, setSelectedDistrict] = useState(currentBiodata.district);
  const [selectedTehsil, setSelectedTehsil] = useState(currentBiodata.tehsil);
  const [village, setVillage] = useState(currentBiodata.village);
  const [khasraNumber, setKhasraNumber] = useState(currentBiodata.khasraPlotNumber);
  const [cropId, setCropId] = useState(currentBiodata.primaryCropId);
  const [cropStage, setCropStage] = useState<GrowthStage>(currentBiodata.cropStage);
  const [soilId, setSoilId] = useState(currentBiodata.soilId);
  const [landAcres, setLandAcres] = useState(currentBiodata.totalLandAcres);
  const [borewellDepthFeet, setBorewellDepthFeet] = useState(currentBiodata.borewellDepthFeet);
  const [motorHp, setMotorHp] = useState(currentBiodata.motorHorsepower);
  const [soilTouchFeel, setSoilTouchFeel] = useState<'dry_powdery' | 'slightly_moist' | 'healthy_wet'>(
    currentBiodata.soilTouchFeel
  );

  const [activeTab, setActiveTab] = useState<'form' | 'biodata-card'>('form');

  if (!isOpen) return null;

  // Resolve state and districts
  const stateObj = ALL_INDIAN_STATES.find((s) => s.state === selectedState) || ALL_INDIAN_STATES[0];
  const districtObj = stateObj.districts.find((d) => d.district === selectedDistrict) || stateObj.districts[0];

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const s = ALL_INDIAN_STATES.find((x) => x.state === newState) || ALL_INDIAN_STATES[0];
    const defaultDist = s.districts[0];
    setSelectedDistrict(defaultDist.district);
    setSelectedTehsil(defaultDist.tehsils[0] || 'Sadar');
  };

  const handleDistrictChange = (newDist: string) => {
    setSelectedDistrict(newDist);
    const d = stateObj.districts.find((x) => x.district === newDist) || stateObj.districts[0];
    setSelectedTehsil(d.tehsils[0] || 'Sadar');
  };

  // Live calculation of the biodata metrics
  const calculatedSummary = generateFarmerBiodataSummary({
    cropId,
    cropStage,
    soilId,
    totalLandAcres: landAcres,
    borewellDepthFeet,
    motorHorsepower: motorHp,
    soilTouchFeel,
    tempMaxC: districtObj.climate.tempMaxC,
    tempMinC: districtObj.climate.tempMinC,
    humidityPct: districtObj.climate.humidityPct,
    rainForecastMm: districtObj.climate.rainForecastMm,
    rainProbabilityPct: districtObj.climate.rainProbabilityPct,
  });

  const handleSaveAndApply = () => {
    const updated: FarmerBiodata = {
      kisanName,
      mobileNumber,
      state: selectedState,
      district: selectedDistrict,
      tehsil: selectedTehsil,
      village,
      khasraPlotNumber: khasraNumber,
      primaryCropId: cropId,
      cropStage,
      soilId,
      totalLandAcres: landAcres,
      borewellDepthFeet,
      motorHorsepower: motorHp,
      soilTouchFeel,
      createdAt: new Date().toISOString(),
    };
    onSaveBiodata(updated, districtObj);
    onClose();
  };

  const shareText = `*किसान व खेत बायोडाटा कार्ड (HydroSense AI)*
👤 किसान का नाम: ${kisanName}
📍 स्थान: ${selectedTehsil}, ${districtObj.hindiDistrict}, ${stateObj.hindiState}
📜 खसरा नं: ${khasraNumber} • रकबा: ${landAcres} एकड़
🌾 फसल: ${CROP_DATABASE[cropId]?.hindiName || cropId} (${cropStage})
💧 दैनिक ड्रिप पानी जरूरत: ${calculatedSummary.dailyWaterRequirementLiters.toLocaleString('en-IN')} लीटर (${calculatedSummary.dailyDripMinutes} मिनट)
💰 सीजन में अनुमानित बचत: ₹${calculatedSummary.seasonMoneySavedInr.toLocaleString('en-IN')}
🛡️ बोरवेल गहराई: ${borewellDepthFeet} फीट (स्थिति: ${calculatedSummary.borewellSafetyStatus})`;

  const handleShareWhatsApp = () => {
    navigator.clipboard.writeText(shareText);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-slate-950/85 backdrop-blur overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-4 md:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col my-auto">
        
        {/* Header with Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                {isHindi ? 'किसान इनपुट व खेत बायोडाटा केंद्र' : 'Farmer Input & Farm Bio-Data Center'}
              </h2>
              <p className="text-xs text-slate-400">
                {isHindi
                  ? 'अपना नाम, राज्य, जिला, फसल, जमीन और बोरवेल की जानकारी दर्ज करें'
                  : 'Enter your personal farm details to calculate personalized water & groundwater plans'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-tabs: Ingest Form vs Live Bio-Data Card */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'form'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isHindi ? '1. खेत जानकारी फ़ॉर्म (Input Details)' : '1. Farm Input Form'}
          </button>

          <button
            onClick={() => setActiveTab('biodata-card')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'biodata-card'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-800/80 text-amber-300 hover:bg-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{isHindi ? '2. तैयार किसान बायोडाटा कार्ड (View Bio-Data)' : '2. Generated Bio-Data Card'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {activeTab === 'form' ? (
            <div className="space-y-4 text-xs">
              
              {/* Section 1: Farmer Identity */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-white flex items-center gap-2 text-xs border-b border-slate-800/80 pb-1.5">
                  <User className="w-4 h-4 text-emerald-400" />
                  {isHindi ? 'किसान का परिचय (Farmer Identity)' : 'Farmer Details'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      {isHindi ? 'किसान का नाम *' : 'Farmer Name *'}
                    </label>
                    <input
                      type="text"
                      value={kisanName}
                      onChange={(e) => setKisanName(e.target.value)}
                      placeholder={isHindi ? 'जैसे: रामेश्वर पाटिल' : 'e.g. Rameshwar Patil'}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      {isHindi ? 'मोबाइल नंबर (SMS व WhatsApp रिपोर्ट)' : 'Mobile Number'}
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: All-India Location Hierarchy (State -> District -> Tehsil -> Village) */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                  <h3 className="font-bold text-white flex items-center gap-2 text-xs">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    {isHindi ? 'खेत का स्थान (भारत के सभी राज्य व जिले)' : 'Farm Location (All India Coverage)'}
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {stateObj.zone} India
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* State */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      {isHindi ? '1. राज्य चुनें (State) *' : '1. Select State *'}
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {ALL_INDIAN_STATES.map((s) => (
                        <option key={s.state} value={s.state} className="bg-slate-900 text-white">
                          {s.state} ({s.hindiState}) - {s.zone}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      {isHindi ? '2. जिला चुनें (District) *' : '2. Select District *'}
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {stateObj.districts.map((d) => (
                        <option key={d.district} value={d.district} className="bg-slate-900 text-white">
                          {d.district} ({d.hindiDistrict})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tehsil / Block */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      {isHindi ? '3. तहसील / ब्लॉक (Tehsil) *' : '3. Tehsil / Block *'}
                    </label>
                    <select
                      value={selectedTehsil}
                      onChange={(e) => setSelectedTehsil(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {districtObj.tehsils.map((t) => (
                        <option key={t} value={t} className="bg-slate-900 text-white">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      {isHindi ? 'गांव / कस्बा / ढाणी' : 'Village / Town'}
                    </label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder={isHindi ? 'जैसे: पिंपलगांव / सुखदेव नगर' : 'Village name'}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      {isHindi ? 'खसरा / खाता / सर्वे नंबर' : 'Khasra / Plot / Survey No.'}
                    </label>
                    <input
                      type="text"
                      value={khasraNumber}
                      onChange={(e) => setKhasraNumber(e.target.value)}
                      placeholder={isHindi ? 'खसरा नं. 142/3' : 'Plot 142/3'}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Auto Weather Preview for Chosen Location */}
                <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">
                      ☀️ {districtObj.climate.tempCurrentC}°C ({districtObj.climate.tempMaxC}°C / {districtObj.climate.tempMinC}°C)
                    </span>
                    <span className="text-slate-400">• {isHindi ? districtObj.climate.hindiCondition : districtObj.climate.condition}</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    {isHindi ? 'बारिश संभावना' : 'Rain Prob'}: {districtObj.climate.rainProbabilityPct}%
                  </span>
                </div>
              </div>

              {/* Section 3: Crops, Soil, Land Area & Borewell */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-white flex items-center gap-2 text-xs border-b border-slate-800/80 pb-1.5">
                  <Layers className="w-4 h-4 text-teal-400" />
                  {isHindi ? 'फसल, जमीन, मिट्टी व बोरवेल की स्थिति' : 'Crop, Soil & Borewell Specification'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Crop */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      {isHindi ? 'मुख्य फसल का चुनाव *' : 'Primary Crop *'}
                    </label>
                    <select
                      value={cropId}
                      onChange={(e) => setCropId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {Object.values(CROP_DATABASE).map((c) => (
                        <option key={c.id} value={c.id}>
                          {isHindi ? c.hindiName : c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Crop Stage */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      {isHindi ? 'फसल की अवस्था *' : 'Crop Stage *'}
                    </label>
                    <select
                      value={cropStage}
                      onChange={(e) => setCropStage(e.target.value as GrowthStage)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="initial">{isHindi ? 'अंकुरण व प्रारंभिक (Initial)' : 'Initial / Sowing'}</option>
                      <option value="vegetative">{isHindi ? 'वानस्पतिक वृद्धि (Vegetative)' : 'Vegetative Growth'}</option>
                      <option value="flowering">{isHindi ? 'फूल व फल लगना (Flowering / Fruiting)' : 'Flowering & Fruiting'}</option>
                      <option value="ripening">{isHindi ? 'परिपक्वता व कटाई (Ripening / Harvest)' : 'Ripening / Maturity'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Soil Type */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      {isHindi ? 'खेत की मिट्टी *' : 'Soil Texture *'}
                    </label>
                    <select
                      value={soilId}
                      onChange={(e) => setSoilId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {Object.entries(SOIL_DATABASE).map(([id, s]) => (
                        <option key={id} value={id}>
                          {isHindi ? s.hindiName : s.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Land Area */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      {isHindi ? 'खेत का रकबा (एकड़ में) *' : 'Total Land (Acres) *'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="50"
                      value={landAcres}
                      onChange={(e) => setLandAcres(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Borewell Depth */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      {isHindi ? 'बोरवेल जल स्तर (फीट)' : 'Borewell Depth (Feet)'}
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="30"
                      max="350"
                      value={borewellDepthFeet}
                      onChange={(e) => setBorewellDepthFeet(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Touch-Feel Soil Moisture */}
                <div className="pt-1">
                  <label className="block text-slate-300 font-medium mb-1.5">
                    {isHindi ? 'मिट्टी छूने पर कैसी महसूस हो रही है? (Soil Touch Check)' : 'Soil Touch & Feel Moisture:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'dry_powdery', labelHindi: '🍂 सूखी व भुरभुरी', labelEn: 'Dry & Powdery' },
                      { id: 'slightly_moist', labelHindi: '🌿 हल्की नम', labelEn: 'Slightly Moist' },
                      { id: 'healthy_wet', labelHindi: '💧 भरपूर गीली', labelEn: 'Wet & Saturated' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSoilTouchFeel(opt.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          soilTouchFeel === opt.id
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold shadow'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isHindi ? opt.labelHindi : opt.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save & Preview Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('biodata-card')}
                  className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isHindi ? 'बायोडाटा कार्ड देखें' : 'Preview Bio-Data Card'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSaveAndApply}
                  className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isHindi ? 'जानकारी सहेजें व वेबसाइट पर लागू करें' : 'Save & Apply to Website'}</span>
                </button>
              </div>

            </div>
          ) : (
            /* Tab 2: The Generated Farmer Bio-Data Card */
            <div className="space-y-4">
              
              {/* The Official Kisan Bio-Data Card */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/60 rounded-3xl p-5 md:p-6 shadow-2xl relative space-y-4">
                
                {/* Card Top Title Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-md">
                      <Award className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                        PMKSY & Jal Shakti Aligned
                      </span>
                      <h3 className="text-lg font-black text-white">
                        {isHindi ? 'किसान खेत बायोडाटा व जल रिपोर्ट' : 'Farmer Farm Bio-Data & Water Card'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        HydroSense KISAN ID: <strong className="text-white font-mono">HK-{selectedDistrict.toUpperCase().slice(0, 3)}-{Math.floor(1000 + Math.random() * 9000)}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow">
                      ★ 5-Star Jal Mitra
                    </span>
                  </div>
                </div>

                {/* Farmer Profile Fields Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/90 rounded-2xl p-4 border border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[11px] block">{isHindi ? 'किसान का नाम' : 'Farmer Name'}</span>
                    <strong className="text-white text-sm">{kisanName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">{isHindi ? 'स्थान / जिला' : 'Location / District'}</span>
                    <strong className="text-slate-200">{selectedTehsil}, {districtObj.hindiDistrict}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">{isHindi ? 'राज्य' : 'State'}</span>
                    <strong className="text-slate-200">{stateObj.hindiState} ({stateObj.zone} India)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">{isHindi ? 'खेत का रकबा' : 'Land Area'}</span>
                    <strong className="text-emerald-400 text-sm font-mono">{landAcres} {isHindi ? 'एकड़' : 'Acres'}</strong>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-400 text-[11px] block">{isHindi ? 'फसल' : 'Crop'}</span>
                    <strong className="text-white">{CROP_DATABASE[cropId]?.hindiName || cropId}</strong>
                  </div>
                  <div className="pt-2">
                    <span className="text-slate-400 text-[11px] block">{isHindi ? 'फसल अवस्था' : 'Stage'}</span>
                    <strong className="text-slate-300 capitalize">{cropStage}</strong>
                  </div>
                  <div className="pt-2">
                    <span className="text-slate-400 text-[11px] block">{isHindi ? 'मिट्टी का प्रकार' : 'Soil'}</span>
                    <strong className="text-slate-300">{SOIL_DATABASE[soilId]?.hindiName || soilId}</strong>
                  </div>
                  <div className="pt-2">
                    <span className="text-slate-400 text-[11px] block">{isHindi ? 'बोरवेल स्तर' : 'Borewell'}</span>
                    <strong className="text-sky-300 font-mono">{borewellDepthFeet} {isHindi ? 'फीट' : 'ft'}</strong>
                  </div>
                </div>

                {/* Quantitative Calculations Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-center">
                    <span className="text-[11px] text-slate-400 block mb-1">
                      {isHindi ? 'दैनिक पानी की आवश्यकता' : 'Daily Water Requirement'}
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {calculatedSummary.dailyWaterRequirementLiters.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {isHindi ? `लीटर (${calculatedSummary.dailyDripMinutes} मिनट ड्रिप)` : `Liters (${calculatedSummary.dailyDripMinutes} mins)`}
                    </span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-center">
                    <span className="text-[11px] text-slate-400 block mb-1">
                      {isHindi ? 'सीजन में अनुमानित बचत' : 'Season Water Saved'}
                    </span>
                    <span className="text-2xl font-black font-mono text-sky-400">
                      {calculatedSummary.seasonWaterSavedLakhLiters}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {isHindi ? 'लाख लीटर (vs खुली नाली)' : 'Lakh Liters (vs flood)'}
                    </span>
                  </div>

                  <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-3.5 text-center">
                    <span className="text-[11px] text-slate-400 block mb-1">
                      {isHindi ? 'पैसों की अनुमानित बचत' : 'Estimated ₹ Saved'}
                    </span>
                    <span className="text-2xl font-black font-mono text-amber-300">
                      ₹{calculatedSummary.seasonMoneySavedInr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {isHindi ? 'बिजली बिल व मोटर खर्च में' : 'On electricity & pump'}
                    </span>
                  </div>
                </div>

                {/* Explanation and Advisory */}
                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    {isHindi ? 'कृषि वैज्ञानिक व भूजल सलाह:' : 'Agronomic & Aquifer Advisory:'}
                  </span>
                  <p className="leading-relaxed">
                    {isHindi ? calculatedSummary.hindiSoilStatusExplanation : calculatedSummary.soilStatusExplanation}
                  </p>
                  <p className="text-amber-300 font-medium">
                    {isHindi ? 'सर्वोत्तम सिंचाई समय:' : 'Optimal Irrigation Window:'}{' '}
                    <strong className="text-white">{isHindi ? calculatedSummary.hindiRecommendedTime : calculatedSummary.recommendedTime}</strong>
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>{isHindi ? 'WhatsApp पर बायोडाटा भेजें' : 'Share on WhatsApp'}</span>
                </button>

                <button
                  onClick={handleSaveAndApply}
                  className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isHindi ? 'वेबसाइट पर लागू करें (Apply to Dashboard)' : 'Apply to Dashboard'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
