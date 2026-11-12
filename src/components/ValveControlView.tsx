/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Radio, Power, Clock, Droplets, AlertOctagon, CheckCircle2, ShieldAlert, Filter } from 'lucide-react';
import { FarmZone, IrrigationLog, LanguageMode } from '../types/irrigation';

interface ValveControlViewProps {
  zones: FarmZone[];
  logs: IrrigationLog[];
  onToggleValve: (zoneId: string, durationMin?: number) => void;
  onEmergencyStopAll: () => void;
  language: LanguageMode;
}

export const ValveControlView: React.FC<ValveControlViewProps> = ({
  zones,
  logs,
  onToggleValve,
  onEmergencyStopAll,
  language,
}) => {
  const isHindi = language === 'hi';

  const [pulseModeEnabled, setPulseModeEnabled] = useState<boolean>(true);
  const [fertigationActive, setFertigationActive] = useState<boolean>(false);
  const [simulatedLeak, setSimulatedLeak] = useState<boolean>(false);

  const activeValves = zones.filter((z) => z.valveStatus === 'OPEN');
  const totalFlowLpm = activeValves.reduce((sum, z) => sum + z.valveFlowLpm, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            {isHindi ? 'मोटर पंप व सोलेनोइड ड्रिप वाल्व कंट्रोलर' : 'Motor Pump & Solenoid Valve Control Matrix'}
          </h2>
          <p className="text-xs text-slate-400">
            {isHindi ? 'खेत के चारों प्लाटों के ड्रिप वाल्व चालू या बंद करें और पानी का प्रेशर देखें' : 'Actuate drip line valves and monitor flow rates in Litres/min'}
          </p>
        </div>

        {/* Master Shutoff */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">
              {isHindi ? 'कुल चालू बहाव:' : 'Total Active Flow:'}
            </span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {totalFlowLpm.toFixed(1)} {isHindi ? 'लीटर/मिनट' : 'L/min'}
            </span>
          </div>

          {activeValves.length > 0 && (
            <button
              onClick={onEmergencyStopAll}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-950/40 cursor-pointer"
            >
              {isHindi ? 'सभी मोटर बंद करें' : 'Emergency Stop All'}
            </button>
          )}
        </div>
      </div>

      {/* Control Panel Sub-modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pulse Irrigation Mode */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 mb-0.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              {isHindi ? 'पल्स ड्रिप सिंचाई (15m ON/10m OFF)' : 'Pulse Drip Irrigation'}
            </span>
            <p className="text-[11px] text-slate-400">
              {isHindi ? 'रुक-रुक कर पानी देने से जड़ों में नमी फैलती है' : '15 min pulses eliminate soil runoff'}
            </p>
          </div>
          <button
            onClick={() => setPulseModeEnabled(!pulseModeEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              pulseModeEnabled ? 'bg-emerald-600' : 'bg-slate-700'
            }`}
            aria-label="Toggle pulse drip mode"
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                pulseModeEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Fertigation NPK Dosing */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 mb-0.5">
              <Filter className="w-4 h-4 text-teal-400" />
              {isHindi ? 'फर्टिगेशन (ड्रिप से खाद/दवा)' : 'Fertigation Nutrient Dosing'}
            </span>
            <p className="text-[11px] text-slate-400">
              {isHindi ? 'घुलनशील NPK खाद पानी के साथ मिलाना' : 'Soluble NPK injection during irrigation'}
            </p>
          </div>
          <button
            onClick={() => setFertigationActive(!fertigationActive)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              fertigationActive ? 'bg-teal-600' : 'bg-slate-700'
            }`}
            aria-label="Toggle fertigation nutrient injector"
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                fertigationActive ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Pipe Leak / Burst Simulator */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 mb-0.5">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              {isHindi ? 'पाइप लीकेज व मोटर सुरक्षा' : 'Line Leak & Motor Safety'}
            </span>
            <p className="text-[11px] text-slate-400">
              {simulatedLeak ? (isHindi ? 'प्रेशर ड्रॉप अलार्म सक्रिय!' : 'Pressure drop alarm active!') : (isHindi ? 'सामान्य पाइप प्रेशर (2.1 बार)' : 'Normal pressure (2.1 bar)')}
            </p>
          </div>
          <button
            onClick={() => setSimulatedLeak(!simulatedLeak)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              simulatedLeak
                ? 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            {simulatedLeak ? (isHindi ? 'अलार्म चालू' : 'Alarm Active') : (isHindi ? 'अलार्म टेस्ट' : 'Test Leak')}
          </button>
        </div>

      </div>

      {/* Leak Alert Banner */}
      {simulatedLeak && (
        <div className="bg-rose-950 border border-rose-600 rounded-2xl p-4 text-xs text-rose-200 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <strong>{isHindi ? 'सुरक्षा चेतावनी: ड्रिप पाइप लाइन में अचानक प्रेशर ड्रॉप दर्ज हुआ!' : 'SAFETY TRIP: Pipe Leak Detected!'}</strong>
              <p className="text-rose-300 mt-0.5">
                {isHindi ? 'पानी व बिजली की बर्बादी रोकने के लिए मोटर को ऑटो-शटऑफ किया गया।' : 'Motor auto-tripped to prevent water wastage.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSimulatedLeak(false)}
            className="px-3.5 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            {isHindi ? 'रीसेट करें' : 'Reset'}
          </button>
        </div>
      )}

      {/* 4 Valves Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((zone) => {
          const isOpen = zone.valveStatus === 'OPEN';
          return (
            <div
              key={zone.id}
              className={`bg-slate-900/90 border rounded-2xl p-4 relative transition-all shadow-md ${
                isOpen
                  ? 'border-emerald-500 shadow-emerald-950/40 bg-gradient-to-b from-slate-900 to-emerald-950/20'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-400">
                  {isHindi ? `वाल्व #${zone.id.replace('zone-', '')}` : `VALVE #${zone.id.replace('zone-', '')}`}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isOpen
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700 animate-pulse'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  {isOpen ? (isHindi ? 'चालू (ON)' : 'ACTIVE') : (isHindi ? 'बंद (OFF)' : 'CLOSED')}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-0.5">
                {isHindi ? zone.hindiName : zone.name}
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {isHindi ? zone.cropHindiName : zone.cropName} • {zone.areaAcres} {isHindi ? 'एकड़' : 'Acres'}
              </p>

              {/* Flow and Pressure */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 mb-3">
                <div>
                  <span className="text-[10px] text-slate-500 block">{isHindi ? 'बहाव' : 'Flow'}</span>
                  <span className="font-bold text-white">
                    {isOpen ? `${zone.valveFlowLpm} L/m` : '0.0 L/m'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">{isHindi ? 'प्रेशर' : 'Pressure'}</span>
                  <span className="font-bold text-emerald-400">
                    {isOpen ? '2.1 bar' : '0.0 bar'}
                  </span>
                </div>
              </div>

              {/* Big Valve Toggle Button */}
              <button
                onClick={() => onToggleValve(zone.id, 30)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                  isOpen
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                aria-label={isOpen ? `Close valve for ${zone.name}` : `Open valve for ${zone.name}`}
              >
                <Power className="w-4 h-4" />
                <span>
                  {isOpen
                    ? (isHindi ? 'वाल्व बंद करें' : 'Close Valve')
                    : (isHindi ? '30 मिनट ड्रिप चलाएं' : 'Open Valve (30m)')}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Historical Irrigation Logs with RUPEES (₹) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          {isHindi ? 'हाल ही में संपन्न सिंचाई व ₹ पैसों की बचत बहीखाता' : 'Recent Irrigation History & Rupee (₹) Savings'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2">{isHindi ? 'समय' : 'Timestamp'}</th>
                <th className="pb-2">{isHindi ? 'खेत व फसल' : 'Plot & Crop'}</th>
                <th className="pb-2">{isHindi ? 'पानी दिया' : 'Delivered'}</th>
                <th className="pb-2">{isHindi ? 'समय' : 'Duration'}</th>
                <th className="pb-2">{isHindi ? 'पानी की बचत' : 'Water Saved'}</th>
                <th className="pb-2">{isHindi ? 'पैसों की बचत' : 'Money Saved'}</th>
                <th className="pb-2">{isHindi ? 'स्थिति' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-950/40">
                  <td className="py-2.5 text-slate-400 font-sans">{log.timestamp}</td>
                  <td className="py-2.5 font-sans font-medium text-white">{log.zoneName}</td>
                  <td className="py-2.5 text-emerald-400">{log.volumeLiters.toLocaleString('en-IN')} L</td>
                  <td className="py-2.5">{log.durationMinutes} min</td>
                  <td className="py-2.5 text-sky-300 font-bold">+{log.waterSavedLiters.toLocaleString('en-IN')} L</td>
                  <td className="py-2.5 text-amber-300 font-bold">₹{log.rupeesSavedInr.toLocaleString('en-IN')}</td>
                  <td className="py-2.5">
                    <span className="flex items-center gap-1 text-emerald-400 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isHindi ? 'सफल' : log.status}
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
