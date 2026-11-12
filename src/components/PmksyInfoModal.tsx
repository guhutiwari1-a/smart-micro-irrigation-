/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Award, ShieldCheck, Droplets, CheckCircle2, ExternalLink, FileText, Sparkles } from 'lucide-react';
import { LanguageMode } from '../types/irrigation';

interface PmksyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageMode;
}

export const PmksyInfoModal: React.FC<PmksyInfoModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  const isHindi = language === 'hi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 to-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PMKSY & Jal Shakti Aligned
                </span>
                <span className="text-[10px] font-bold text-amber-400">
                  🇮🇳 भारत सरकार
                </span>
              </div>
              <h2 className="text-base md:text-lg font-black text-white mt-0.5">
                {isHindi
                  ? 'भारतीय किसान सूक्ष्म-सिंचाई व भूजल संरक्षण प्रणाली'
                  : 'Indian Smart Micro-Irrigation & Groundwater Conservation System'}
              </h2>
              <p className="text-xs text-slate-400">
                {isHindi
                  ? 'जल शक्ति अभियान व प्रधानमंत्री कृषि सिंचाई योजना (PMKSY) के वैज्ञानिक मानकों का संपूर्ण विवरण'
                  : 'Standards and guidelines aligned with Jal Shakti Abhiyan and PMKSY'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 text-xs text-slate-200">
          
          {/* Mission Card */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-black text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {isHindi ? 'राष्ट्रीय मिशन: प्रति बूंद अधिक फसल (Per Drop More Crop)' : 'National Mission: Per Drop More Crop'}
            </h3>
            <p className="text-slate-300 leading-relaxed">
              {isHindi ? (
                <>
                  यह सॉफ्टवेयर (हाइड्रोसेंस किसान) <strong>प्रधानमंत्री कृषि सिंचाई योजना (PMKSY)</strong> तथा <strong>जल शक्ति अभियान</strong> के 
                  वैज्ञानिक सिद्धांतों पर विकसित किया गया है। इसका उद्देश्य प्रत्येक खेत में खुली नाली (Flooding) की तुलना में <strong>60% से 70% जल की बचत</strong> करना 
                  तथा ग्रामीण भारत में गिरते भूजल स्तर (Aquifer Depletion) को रोकना है।
                </>
              ) : (
                <>
                  HydroSense KISAN is built on the scientific guidelines of <strong>Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)</strong> and the 
                  <strong>Jal Shakti Abhiyan</strong>. It ensures 60–70% water savings over conventional flood irrigation while preserving rural groundwater aquifers.
                </>
              )}
            </p>
          </div>

          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Pillar 1: PMKSY */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Droplets className="w-4 h-4 text-amber-400" />
                <span>{isHindi ? '१. पीएमकेएसवाई (PMKSY) सब्सिडी व मानक' : '1. PMKSY Subsidy Norms'}</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
                <li>
                  <strong>{isHindi ? 'लघु व सीमांत किसान (Small/Marginal Farmers)' : 'Small/Marginal Farmers'}</strong>: 
                  {isHindi ? ' ड्रिप व माइक्रो-स्प्रिंकलर संयंत्र स्थापना पर 55% तक सरकारी सब्सिडी।' : ' Up to 55% financial assistance.'}
                </li>
                <li>
                  <strong>{isHindi ? 'अन्य सामान्य किसान (Other Farmers)' : 'Other Farmers'}</strong>: 
                  {isHindi ? ' 45% तक वित्तीय सहायता।' : ' Up to 45% subsidy.'}
                </li>
                <li>
                  <strong>{isHindi ? 'ड्रिप एमिटर क्षमता (Drip Efficiency)' : 'Drip Efficiency'}</strong>: 
                  {isHindi ? ' BIS मानकों के अनुसार 90%+ जल वितरण एकरूपता।' : ' 90%+ water distribution uniformity as per BIS.'}
                </li>
              </ul>
            </div>

            {/* Pillar 2: Jal Shakti Abhiyan */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span>{isHindi ? '२. जल शक्ति अभियान (Catch The Rain)' : '2. Jal Shakti Abhiyan Norms'}</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
                <li>
                  <strong>{isHindi ? 'भूजल रिचार्ज मॉनिटरिंग' : 'Groundwater Monitoring'}</strong>: 
                  {isHindi ? ' बोरवेल के सुरक्षित, सेमी-क्रिटिकल और ओवर-एक्सप्लॉइटेड जोन की पहचान।' : ' Classifies Safe, Semi-Critical, and Over-Exploited blocks.'}
                </li>
                <li>
                  <strong>{isHindi ? 'वर्षा जल संचयन (Rain Harvesting)' : 'Rainwater Harvesting'}</strong>: 
                  {isHindi ? ' बारिश होने पर ड्रिप स्वतः बंद करने की सलाह।' : ' Drip auto-postponement when effective rain is forecast.'}
                </li>
                <li>
                  <strong>{isHindi ? 'बोरवेल सुरक्षा बफर' : 'Aquifer Buffer'}</strong>: 
                  {isHindi ? ' संकट सीमा से बोरवेल को कम से कम 20 फीट ऊपर सुरक्षित रखना।' : ' Maintains 20+ feet safe operational buffer.'}
                </li>
              </ul>
            </div>

          </div>

          {/* Scientific Calculation Standards */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {isHindi ? 'वैज्ञानिक मानकों का आधार (FAO-56 व ICAR-KVK)' : 'Scientific Algorithms (FAO-56 & ICAR-KVK)'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">ETo (वाष्पीकरण)</span>
                <p className="text-slate-400">तापमान, आर्द्रता व धूप अनुसार पेनमैन-मोंटेथ विधि से दैनिक पानी हानि गणना।</p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-teal-400 font-bold block mb-1">Kc (फसल गुणांक)</span>
                <p className="text-slate-400">भारतीय कृषि अनुसंधान परिषद (ICAR) के फसल वृद्धि अवस्था मानक।</p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">मिट्टी तनाव (Tension kPa)</span>
                <p className="text-slate-400">जड़ों की 12 इंच गहराई पर 20-35 kPa का सर्वोत्तम नमी स्तर बनाए रखना।</p>
              </div>
            </div>
          </div>

          {/* Farmer Advisory Callout */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-amber-200">
              <strong>{isHindi ? 'किसान भाइयों के लिए जरूरी सलाह: ' : 'Farmer Advice: '}</strong>
              {isHindi
                ? 'अपने जिले के कृषि विभाग या नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करके PMKSY ड्रिप सब्सिडी का लाभ अवश्य उठाएं। यह सॉफ्टवेयर आपको अपने खेत के अनुसार सही पानी देने और भूजल सुरक्षित रखने में पूरी मदद करता है।'
                : 'Contact your district Agriculture Department or nearest Krishi Vigyan Kendra (KVK) to apply for PMKSY drip irrigation subsidies. This software helps maximize your farm productivity.'}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400">
            HydroSense KISAN • {isHindi ? 'जल शक्ति अभियान एवं PMKSY आधारित' : 'PMKSY & Jal Shakti Compliant'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {isHindi ? 'समझ गया (Close)' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
