/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, TrendingUp, Droplets, Zap, ShieldCheck, Share2, CheckCircle2, Volume2, Calendar, FileText, ArrowUpRight } from 'lucide-react';
import { IrrigationLog, LanguageMode } from '../types/irrigation';
import { FarmLocation } from '../utils/irrigationMath';

interface FarmerProgressViewProps {
  logs: IrrigationLog[];
  totalSavedLiters: number;
  totalSavedInr: number;
  borewellDepthM: number;
  currentLocation: FarmLocation;
  language: LanguageMode;
  onPlayAudioAdvice: (text: string) => void;
}

export const FarmerProgressView: React.FC<FarmerProgressViewProps> = ({
  logs,
  totalSavedLiters,
  totalSavedInr,
  borewellDepthM,
  currentLocation,
  language,
  onPlayAudioAdvice,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  // Convert liters to Lakh Litres for Indian format
  const lakhLitres = (totalSavedLiters / 100000).toFixed(2);
  const tankerCount = Math.round(totalSavedLiters / 4000); // 4,000L standard rural water tanker

  // Estimate electricity units saved (kWh)
  const unitsSavedKwh = Math.round((totalSavedLiters / 1000) * 4.9);
  const feetPreserved = Number((totalSavedLiters / 25000).toFixed(1)); // feet of aquifer drawdown prevented

  const isHindi = language === 'hi';

  const shareText = `*किसान प्रगति पत्र (HydroSense AI Progress Report)*
किसान: ${currentLocation.kisanName}
स्थान: ${currentLocation.district}, ${currentLocation.state}
खेत: ${currentLocation.plotNumber}
💧 कुल पानी की बचत: ${lakhLitres} लाख लीटर (~${tankerCount} टैंकर पानी)
💰 कुल पैसों की बचत: ₹${totalSavedInr.toLocaleString('en-IN')}
⚡ बिजली बचत: ${unitsSavedKwh} यूनिट (kWh)
🛡️ बोरवेल जल स्तर सुरक्षा: +${feetPreserved} फीट सुरक्षित
🏆 जल मित्र रेटिंग: 5-Star ★★★★★ (Jal Champion)`;

  const handleShare = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleVoiceReadout = () => {
    const audioText = isHindi
      ? `नमस्ते ${currentLocation.kisanName} जी! इस सीजन में आपने हाइड्रोसेंस ड्रिप सिंचाई से ${lakhLitres} लाख लीटर पानी और लगभग ₹${totalSavedInr.toLocaleString('en-IN')} की बचत की है। आपका बोरवेल जल स्तर सुरक्षित है और आपको 5-स्टार जल मित्र सम्मान मिला है।`
      : `Hello ${currentLocation.kisanName}! This season you have saved ${lakhLitres} lakh litres of water and approximately ${totalSavedInr.toLocaleString('en-IN')} rupees with smart drip irrigation. Your borewell water table is protected and you hold a 5-star Jal Mitra rating.`;
    onPlayAudioAdvice(audioText);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Kisan Pragati Patra */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-950/50 shrink-0">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  {isHindi ? '★ 5-स्टार जल मित्र किसान' : '★ 5-Star Jal Mitra Champion'}
                </span>
                <span className="text-xs text-emerald-400 font-mono font-medium">
                  {currentLocation.plotNumber}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-white mt-1 tracking-tight">
                {isHindi ? 'किसान प्रगति व बचत रिपोर्ट' : 'Farmer Season Progress & Savings'}
              </h2>
              <p className="text-xs text-slate-300">
                {currentLocation.kisanName} • {currentLocation.hindiName}
              </p>
            </div>
          </div>

          {/* Action Buttons: Audio Voice & WhatsApp Share */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleVoiceReadout}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 shadow-md transition-all cursor-pointer"
              title={isHindi ? 'बोलकर रिपोर्ट सुनें' : 'Listen to report voice summary'}
            >
              <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>{isHindi ? 'रिपोर्ट सुनें (Voice)' : 'Listen Report'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 border border-emerald-400/30 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedShare ? (isHindi ? 'कॉपी हो गया!' : 'Copied!') : (isHindi ? 'WhatsApp पर भेजें' : 'Share on WhatsApp')}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4 Big High-Contrast Visual Cards (Extremely clear for rural mobile use) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Water Saved in Lakh Litres */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Droplets className="w-5 h-5 text-sky-400" />
              {isHindi ? 'कुल पानी की बचत' : 'Total Water Saved'}
            </span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              52% {isHindi ? 'बचत' : 'Saved'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl md:text-4xl font-black font-mono text-emerald-400 tracking-tight">
              {lakhLitres}
            </span>
            <span className="text-sm font-bold text-slate-300">
              {isHindi ? 'लाख लीटर' : 'Lakh Litres'}
            </span>
          </div>

          <p className="text-xs text-sky-300 font-medium mt-2 flex items-center gap-1">
            <span>≈ {tankerCount} {isHindi ? 'पानी के बड़े टैंकर बचाए' : 'Water tankers saved'}</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {isHindi ? 'खुली नाली (Flood) की बर्बादी रोकी गई' : 'Prevented open flood evaporation'}
          </p>
        </div>

        {/* 2. Total Rupees Saved (₹) */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                ₹
              </span>
              {isHindi ? 'कुल पैसों की बचत' : 'Total Money Saved'}
            </span>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              {isHindi ? 'बचत' : 'Profit'}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl md:text-4xl font-black font-mono text-amber-300 tracking-tight">
              ₹{totalSavedInr.toLocaleString('en-IN')}
            </span>
          </div>

          <p className="text-xs text-amber-200/90 font-medium mt-2">
            {isHindi ? 'बिजली बिल + मोटर मेंटनेंस में बचत' : 'Electricity bill + motor maintenance saved'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {isHindi ? `प्रति एकड़ लगभग ₹${Math.round(totalSavedInr / 5.5).toLocaleString('en-IN')} का शुद्ध लाभ` : `Net benefit ~₹${Math.round(totalSavedInr / 5.5)}/acre`}
          </p>
        </div>

        {/* 3. Borewell Protection Status */}
        <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-5 relative overflow-hidden backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              {isHindi ? 'बोरवेल जल स्तर सुरक्षा' : 'Borewell Aquifer Protection'}
            </span>
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              {isHindi ? 'सुरक्षित' : 'Safe'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl md:text-4xl font-black font-mono text-white tracking-tight">
              +{feetPreserved}
            </span>
            <span className="text-sm font-bold text-slate-300">
              {isHindi ? 'फीट सुरक्षित' : 'Feet Protected'}
            </span>
          </div>

          <p className="text-xs text-emerald-300 font-medium mt-2">
            {isHindi ? 'भूजल अत्यधिक नीचे जाने से बचा' : 'Prevented critical water table drop'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {isHindi ? `वर्तमान जल स्तर: 93.3 फीट (${borewellDepthM}m)` : `Current water table: 93.3 ft (${borewellDepthM}m)`}
          </p>
        </div>

        {/* 4. Electricity Units Saved (kWh) */}
        <div className="bg-slate-900/90 border border-teal-500/30 rounded-2xl p-5 relative overflow-hidden backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Zap className="w-5 h-5 text-amber-400" />
              {isHindi ? 'बिजली यूनिट्स की बचत' : 'Electricity Units Saved'}
            </span>
            <span className="text-[11px] font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
              kWh Units
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl md:text-4xl font-black font-mono text-teal-300 tracking-tight">
              {unitsSavedKwh}
            </span>
            <span className="text-sm font-bold text-slate-300">
              {isHindi ? 'यूनिट' : 'Units (kWh)'}
            </span>
          </div>

          <p className="text-xs text-teal-200/90 font-medium mt-2">
            {isHindi ? 'मोटर का ड्राई रन व ओवरलोड रोका गया' : 'Prevented pump dry run & motor heating'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {isHindi ? 'कार्बन उत्सर्जन में 530 किग्रा की कमी' : 'Reduced 530 kg carbon footprint'}
          </p>
        </div>

      </div>

      {/* Comparison: Smart Micro-Drip vs Traditional Open Flood */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          {isHindi ? 'ड्रिप सिंचाई बनाम पारंपरिक खुली नाली सिंचाई (फायदा विश्लेषण)' : 'Smart Drip vs Traditional Flood Irrigation Comparison'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Traditional Flood */}
          <div className="bg-slate-950/70 border border-rose-900/50 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase">
                {isHindi ? 'पारंपरिक खुली नाली सिंचाई' : 'Traditional Flood Irrigation'}
              </span>
              <span className="text-[11px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                {isHindi ? '45% बर्बादी' : '45% Water Waste'}
              </span>
            </div>

            <ul className="text-xs text-slate-300 space-y-1.5">
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>{isHindi ? 'धूप में 40% पानी सीधे हवा में भाप बनकर उड़ जाता है।' : '40% water lost to surface evaporation.'}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>{isHindi ? 'अत्यधिक पानी से जड़ों में फंगस, विल्ट और रोग लगते हैं।' : 'Root rot and fungal diseases from waterlogging.'}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>{isHindi ? 'बोरवेल 8-10 घंटे लगातार चलने से मोटर जलने का खतरा रहता है।' : 'Borewell runs 8-10 hours continuously, risking motor coil burn.'}</span>
              </li>
            </ul>
          </div>

          {/* Smart Micro-Drip */}
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase">
                {isHindi ? 'HydroSense AI स्मार्ट ड्रिप सिंचाई' : 'HydroSense AI Smart Drip System'}
              </span>
              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                {isHindi ? '92% पानी पौधों की जड़ों में' : '92% Root Application'}
              </span>
            </div>

            <ul className="text-xs text-slate-200 space-y-1.5">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{isHindi ? 'बूंद-बूंद पानी सीधे जड़ों में जाता है; खरपतवार नहीं उगते।' : 'Targeted drop-by-drop delivery prevents weeds.'}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{isHindi ? 'फसल की पैदावार में 15% से 22% की बढ़ोतरी होती है।' : 'Increases crop yield by 15% to 22%.'}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{isHindi ? 'बोरवेल केवल 1.5 से 3 घंटे चलता है, भूजल स्तर हमेशा सुरक्षित रहता है।' : 'Borewell runs only 1.5 - 3 hours daily, keeping aquifer stable.'}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Kisan Weekly Log & Water Calendar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            {isHindi ? 'दैनिक सिंचाई इतिहास व बचत बहीखाता' : 'Daily Irrigation & Savings Passbook'}
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {logs.length} {isHindi ? 'सिंचाई चक्र दर्ज' : 'cycles recorded'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2.5">{isHindi ? 'तारीख व समय' : 'Date & Time'}</th>
                <th className="pb-2.5">{isHindi ? 'खेत व फसल' : 'Plot & Crop'}</th>
                <th className="pb-2.5">{isHindi ? 'पानी दिया (लीटर)' : 'Volume (Liters)'}</th>
                <th className="pb-2.5">{isHindi ? 'ड्रिप का समय' : 'Drip Runtime'}</th>
                <th className="pb-2.5">{isHindi ? 'पानी की बचत' : 'Water Saved'}</th>
                <th className="pb-2.5">{isHindi ? 'पैसों की बचत (₹)' : 'Money Saved (₹)'}</th>
                <th className="pb-2.5">{isHindi ? 'स्थिति' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-950/40">
                  <td className="py-3 text-slate-400 font-sans">{l.timestamp}</td>
                  <td className="py-3 font-sans font-medium text-white">{l.zoneName}</td>
                  <td className="py-3 text-emerald-400">{l.volumeLiters.toLocaleString('en-IN')} L</td>
                  <td className="py-3">{l.durationMinutes} min</td>
                  <td className="py-3 text-sky-300 font-bold">+{l.waterSavedLiters.toLocaleString('en-IN')} L</td>
                  <td className="py-3 text-amber-300 font-bold">₹{l.rupeesSavedInr.toLocaleString('en-IN')}</td>
                  <td className="py-3">
                    <span className="flex items-center gap-1 text-emerald-400 font-sans text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isHindi ? 'सफल' : 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
