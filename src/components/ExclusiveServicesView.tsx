import React, { useState, useMemo } from 'react';
import { ShieldCheck, Landmark, ShieldAlert, Truck, ChevronRight, CheckCircle, Calculator, Percent } from 'lucide-react';

export default function ExclusiveServicesView() {
  const [activeSubTab, setActiveSubTab] = useState<'inspection' | 'finance' | 'insurance' | 'transport'>('inspection');

  // Inspection states
  const [inspectPlate, setInspectPlate] = useState('D73822');
  const [inspectGradeReport, setInspectGradeReport] = useState<any | null>(null);

  const performMechanicalCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectPlate.trim()) return;
    setInspectGradeReport({
      status: 'A+',
      mechanic: 'Senior Inspector Kamal Zayed',
      exhaustTemp: 'Normal',
      structuralDamage: 'Zero detected',
      brakePadLife: '85%',
      diagnosticCodes: '0 active faults detected',
      bodyPaintThickness: 'Factory specifications (95-120 um)'
    });
  };

  // Finance states
  const [valuation, setValuation] = useState(250000);
  const [downpaymentPercent, setDownpaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(3.49);
  const [tenure, setTenure] = useState(48); // months

  const monthlyInstallment = useMemo(() => {
    const downAmount = valuation * (downpaymentPercent / 100);
    const loanAmount = valuation - downAmount;
    const annualInterestRate = interestRate / 100;
    const monthlyInterestRate = annualInterestRate / 12;
    
    // Standard PMT formula: P = L * [r * (1 + r)^n] / [(1 + r)^n - 1]
    if (monthlyInterestRate === 0) return Math.round(loanAmount / tenure);
    const pmt = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenure)) / (Math.pow(1 + monthlyInterestRate, tenure) - 1);
    return Math.round(pmt);
  }, [valuation, downpaymentPercent, interestRate, tenure]);

  const downpaymentValue = useMemo(() => {
    return Math.round(valuation * (downpaymentPercent / 100));
  }, [valuation, downpaymentPercent]);

  const totalLoanAmount = useMemo(() => {
    return valuation - downpaymentValue;
  }, [valuation, downpaymentValue]);

  // Insurance states
  const [insuranceCarType, setInsuranceCarType] = useState('Sports');
  const [insuranceType, setInsuranceType] = useState<'comprehensive' | 'thirdparty'>('comprehensive');
  const [driverAge, setDriverAge] = useState<number>(30);
  
  const estimatedInsurancePremium = useMemo(() => {
    let base = 2500;
    if (insuranceCarType === 'Supercar') base = 8500;
    if (insuranceCarType === 'Sports') base = 4200;
    if (insuranceCarType === 'SUV') base = 2900;
    if (insuranceCarType === 'Electric') base = 3300;

    if (insuranceType === 'thirdparty') base = base * 0.45;
    if (driverAge < 25) base = base * 1.35; // higher rate for young drivers

    return Math.round(base);
  }, [insuranceCarType, insuranceType, driverAge]);

  // Transport states
  const [originCity, setOriginCity] = useState('Dubai');
  const [destinationCity, setDestinationCity] = useState('Abu Dhabi');
  const [vehicleClass, setVehicleClass] = useState('Flatbed Tow');

  // Matrix pricing
  const travelCostEstimate = useMemo(() => {
    if (originCity === destinationCity) return 250;
    let base = 450;
    if (originCity === 'Dubai' && destinationCity === 'Abu Dhabi') base = 550;
    if (originCity === 'Abu Dhabi' && destinationCity === 'Dubai') base = 550;
    if (originCity === 'Dubai' && destinationCity === 'Ras Al Khaimah') base = 650;
    if (originCity === 'Sharjah' && destinationCity === 'Abu Dhabi') base = 600;
    
    if (vehicleClass === 'Enclosed Carrier') base = base * 2.2;
    return Math.round(base);
  }, [originCity, destinationCity, vehicleClass]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Services Inner Subtab Navigation - Bento Style */}
      <div className="bg-[#1E293B] border border-white/5 p-2.5 rounded-2xl flex overflow-x-auto gap-2 no-scrollbar font-mono text-[10px] uppercase font-bold tracking-wider shadow-xl select-none">
        <button
          onClick={() => setActiveSubTab('inspection')}
          className={`flex items-center gap-2 px-4.5 py-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 duration-100 ${
            activeSubTab === 'inspection' ? 'bg-[#F97316] text-white shadow-lg shadow-orange-950/20' : 'text-white/40 hover:text-white'
          }`}
        >
          <ShieldCheck size={14} /> 111-Point Inspection
        </button>
        <button
          onClick={() => setActiveSubTab('finance')}
          className={`flex items-center gap-2 px-4.5 py-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 duration-100 ${
            activeSubTab === 'finance' ? 'bg-[#F97316] text-white shadow-lg shadow-orange-950/20' : 'text-white/40 hover:text-white'
          }`}
        >
          <Landmark size={14} /> Finance Installments
        </button>
        <button
          onClick={() => setActiveSubTab('insurance')}
          className={`flex items-center gap-2 px-4.5 py-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 duration-100 ${
            activeSubTab === 'insurance' ? 'bg-[#F97316] text-white shadow-lg shadow-orange-950/20' : 'text-white/40 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined shrink-0 text-sm">shield</span> Premium Quoter
        </button>
        <button
          onClick={() => setActiveSubTab('transport')}
          className={`flex items-center gap-2 px-4.5 py-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 duration-100 ${
            activeSubTab === 'transport' ? 'bg-[#F97316] text-white shadow-lg shadow-orange-950/20' : 'text-white/40 hover:text-white'
          }`}
        >
          <Truck size={14} /> Transport Logistics
        </button>
      </div>

      {/* RENDER ACTIVE TAB VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Dual Input Panels (Lg spans 2) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* 1. INSPECTIONS */}
          {activeSubTab === 'inspection' && (
            <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-6 shadow-xl font-sans text-xs">
              <div className="space-y-1.5 pb-3 border-b border-white/5">
                <h3 className="text-white font-bold text-sm uppercase tracking-tight font-mono">Verify Vehicle Soundness via Plate ID</h3>
                <p className="text-white/50 text-[10px]/relaxed font-sans">Every premium vehicle listed on Bazar360 with a Verified Stamp undergoes physical testing. Enter the registered Dubai plate or chassis token code to inspect active diagnostics.</p>
              </div>

              <form onSubmit={performMechanicalCheck} className="flex gap-2.5 font-mono select-none">
                <input
                  className="bg-[#0F172A] border border-white/10 rounded-xl p-3 flex-grow text-white focus:outline-none focus:border-[#38BDF8] uppercase tracking-wider text-xs font-bold"
                  placeholder="e.g. D73822 or VIN/Chassis..."
                  type="text"
                  value={inspectPlate}
                  onChange={(e) => setInspectPlate(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-[#F97316] hover:bg-orange-600 font-bold px-6 py-3 rounded-xl text-white text-[10px] uppercase tracking-wider cursor-pointer active:scale-95 duration-75"
                >
                  Retrieve Report
                </button>
              </form>

              {inspectGradeReport ? (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center bg-[#0F172A] p-4 rounded-2xl border border-white/5">
                    <div>
                      <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Mechanical Integrity Assessment</span>
                      <h4 className="text-sm font-extrabold text-[#38BDF8] font-mono mt-0.5">Status: Grade {inspectGradeReport.status}</h4>
                    </div>
                    <span className="px-3 py-1 bg-emerald-950/80 text-emerald-400 font-mono text-[10px] uppercase tracking-wider font-bold rounded-xl border border-emerald-900/50">PASS</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-white/70">
                    <div className="p-3 bg-[#0F172A] border border-white/5 rounded-xl space-y-1">
                      <span className="text-white/40 font-mono text-[9px] uppercase font-bold block">Senior Lead Inspector:</span>
                      <span className="font-bold text-white block">{inspectGradeReport.mechanic}</span>
                    </div>
                    <div className="p-3 bg-[#0F172A] border border-white/5 rounded-xl space-y-1">
                      <span className="text-white/40 font-mono text-[9px] uppercase font-bold block">OBD-II Diagnostic codes:</span>
                      <span className="font-bold text-emerald-400 block">{inspectGradeReport.diagnosticCodes}</span>
                    </div>
                    <div className="p-3 bg-[#0F172A] border border-white/5 rounded-xl space-y-1">
                      <span className="text-white/40 font-mono text-[9px] uppercase font-bold block">Brake rotor remaining life:</span>
                      <span className="font-bold text-white block">{inspectGradeReport.brakePadLife}</span>
                    </div>
                    <div className="p-3 bg-[#0F172A] border border-white/5 rounded-xl space-y-1">
                      <span className="text-white/40 font-mono text-[9px] uppercase font-bold block">Paint thickness spectrum:</span>
                      <span className="font-bold text-white block">{inspectGradeReport.bodyPaintThickness}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-white/5 p-8 text-center rounded-2xl space-y-2 text-white/40">
                  <ShieldCheck size={36} className="mx-auto text-white/20 animate-pulse" />
                  <p className="font-mono text-[10px] uppercase">Check mechanical certificates via dynamic registry lookup above.</p>
                </div>
              )}
            </div>
          )}

          {/* 2. FINANCE */}
          {activeSubTab === 'finance' && (
            <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-6 shadow-xl font-sans text-xs select-none">
              <div className="space-y-1.5 border-b border-white/5 pb-3">
                <h3 className="text-white font-bold text-sm uppercase tracking-tight font-mono">Dynamic Installment Calculator</h3>
                <p className="text-white/50 text-[10px]">Tweak parameters and estimate financing solutions connected to top banking indices in the UAE.</p>
              </div>

              <div className="space-y-5">
                {/* Sliders */}
                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-white/60">Vehicle Purchase Value:</span>
                    <span className="text-[#38BDF8] font-black">AED {valuation.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="1000000"
                    step="5000"
                    className="w-full h-1.5 rounded-lg bg-[#0F172A] cursor-pointer accent-[#F97316]"
                    value={valuation}
                    onChange={(e) => setValuation(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-white/60">Equity Down Payment %:</span>
                    <span className="text-[#38BDF8] font-black">{downpaymentPercent}% (AED {downpaymentValue.toLocaleString()})</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="5"
                    className="w-full h-1.5 rounded-lg bg-[#0F172A] cursor-pointer accent-[#F97316]"
                    value={downpaymentPercent}
                    onChange={(e) => setDownpaymentPercent(parseInt(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 bg-[#0F172A] p-3 px-4 rounded-xl border border-white/5 font-mono">
                    <label className="text-white/40 block font-bold text-[9px] uppercase tracking-wider mb-1">Fixed Interest Rate (%):</label>
                    <div className="flex items-center gap-1.5">
                      <Percent size={14} className="text-[#38BDF8]" />
                      <input
                        className="bg-transparent border-none text-white focus:outline-none w-full font-bold text-sm"
                        type="number"
                        step="0.01"
                        min="1"
                        max="15"
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 bg-[#0F172A] p-3 px-4 rounded-xl border border-white/5 font-mono">
                    <label className="text-white/40 block font-bold text-[9px] uppercase tracking-wider mb-1">Tenure Period (Months):</label>
                    <div className="flex items-center gap-1.5">
                      <Calculator size={14} className="text-[#38BDF8]" />
                      <select
                        className="bg-transparent border-none text-white focus:outline-none w-full font-bold text-xs uppercase"
                        value={tenure}
                        onChange={(e) => setTenure(parseInt(e.target.value))}
                      >
                        <option value="12">12 Months (1 Year)</option>
                        <option value="24">24 Months (2 Years)</option>
                        <option value="36">36 Months (3 Years)</option>
                        <option value="48">48 Months (4 Years)</option>
                        <option value="60">60 Months (5 Years)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. INSURANCE */}
          {activeSubTab === 'insurance' && (
            <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-6 shadow-xl font-sans text-xs select-none">
              <div className="space-y-1.5 border-b border-white/5 pb-3">
                <h3 className="text-white font-bold text-sm uppercase tracking-tight font-mono">Instant Premium Auto Quoter</h3>
                <p className="text-white/50 text-[10px]">Retrieve competitive, fully comprehensive insurance ratings across UAE underwriters.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono select-none">
                <div className="space-y-1.5">
                  <label className="text-white/40 font-bold text-[9px] uppercase tracking-widestblock">Vehicle Segment:</label>
                  <select
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] text-xs"
                    value={insuranceCarType}
                    onChange={(e) => setInsuranceCarType(e.target.value)}
                  >
                    <option value="SUV">SUV (Family/Touring)</option>
                    <option value="Sports">Sports Car (Performance)</option>
                    <option value="Supercar">Supercar (Luxury/Exotic)</option>
                    <option value="Electric">Electric Vehicle (EV)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/40 font-bold text-[9px] uppercase tracking-widest block">Coverage Spec:</label>
                  <select
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] text-xs"
                    value={insuranceType}
                    onChange={(e) => setInsuranceType(e.target.value as any)}
                  >
                    <option value="comprehensive">Full Comprehensive</option>
                    <option value="thirdparty">Third-Party Liability</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/40 font-bold text-[9px] uppercase tracking-widest block">Primary Driver Age:</label>
                  <input
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-[#38BDF8] text-xs font-bold"
                    type="number"
                    min="18"
                    max="80"
                    value={driverAge}
                    onChange={(e) => setDriverAge(parseInt(e.target.value) || 30)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <p className="text-white/45 text-[10px] leading-relaxed max-w-sm">Prices are estimated annual base numbers, reflecting high claim protections, emergency roadside help, and customized glass damages.</p>
              </div>
            </div>
          )}

          {/* 4. TRANSPORT */}
          {activeSubTab === 'transport' && (
            <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-6 shadow-xl font-sans text-xs select-none">
              <div className="space-y-1.5 border-b border-white/5 pb-3">
                <h3 className="text-white font-bold text-sm uppercase tracking-tight font-mono">Interstate Logistics Transport Estimator</h3>
                <p className="text-white/50 text-[10px]">Secure multi-vehicle or bespoke tow options directly from showrooms to your driveway.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono select-none">
                <div className="space-y-1.5">
                  <label className="text-white/40 font-bold text-[9px] uppercase block tracking-wider">Origin Location:</label>
                  <select
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] text-xs"
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                  >
                    <option value="Dubai">Dubai Showroom</option>
                    <option value="Abu Dhabi">Abu Dhabi Center</option>
                    <option value="Sharjah">Sharjah Base</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/40 font-bold text-[9px] uppercase block tracking-wider">Destination city:</label>
                  <select
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] text-xs"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                  >
                    <option value="Dubai">Dubai Marina</option>
                    <option value="Abu Dhabi">Yas Island</option>
                    <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                    <option value="Fujairah">Fujairah Coast</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/40 font-bold text-[9px] uppercase block tracking-wider">Trailer Spec:</label>
                  <select
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] text-xs"
                    value={vehicleClass}
                    onChange={(e) => setVehicleClass(e.target.value)}
                  >
                    <option value="Flatbed Tow">Flatbed Tow</option>
                    <option value="Enclosed Carrier">Enclosed Premium (Dust Proof)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Dynamic Summary Cards (Lg spans 1) */}
        <div className="md:col-span-1 space-y-6">
          
          <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-6 shadow-2xl text-center font-sans text-xs relative overflow-hidden select-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F97316] opacity-10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="space-y-2 border-b border-white/5 pb-4 font-mono">
              <span className="text-[9px] uppercase tracking-wider text-[#38BDF8] font-bold block">Exclusive Service Quote</span>
              <h4 className="text-white font-bold text-xs uppercase tracking-tight mt-0.5">
                {activeSubTab === 'inspection' && 'Certified Inspection'}
                {activeSubTab === 'finance' && 'Installment Loan Estimator'}
                {activeSubTab === 'insurance' && 'Premium Quote Estimate'}
                {activeSubTab === 'transport' && 'Secure Transport logistics'}
              </h4>
            </div>

            <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 shadow-inner space-y-1 font-mono">
              {activeSubTab === 'inspection' && (
                <>
                  <span className="text-white/40 block uppercase tracking-wider text-[9px] font-bold">Inspection Cost</span>
                  <span className="text-2xl font-black text-[#38BDF8] block">AED 499</span>
                  <span className="text-[10px] text-white/50 mt-2 block font-sans">100% money back if specs differ</span>
                </>
              )}

              {activeSubTab === 'finance' && (
                <>
                  <span className="text-white/40 block uppercase tracking-wider text-[9px] font-bold">Estimated Monthly PMT</span>
                  <span className="text-3xl font-black text-[#F97316] block py-1">AED {monthlyInstallment.toLocaleString()}</span>
                  <span className="text-[10px] text-white/50 mt-1 block font-sans">Financing Loan amount: AED {totalLoanAmount.toLocaleString()}</span>
                </>
              )}

              {activeSubTab === 'insurance' && (
                <>
                  <span className="text-white/40 block uppercase tracking-wider text-[9px] font-bold">Annual Premium Invoice</span>
                  <span className="text-2xl font-black text-[#38BDF8] block">AED {estimatedInsurancePremium.toLocaleString()}</span>
                  <span className="text-[10px] text-white/50 mt-2 block font-sans">Comprehensive deductibles only AED 1,000</span>
                </>
              )}

              {activeSubTab === 'transport' && (
                <>
                  <span className="text-white/40 block uppercase tracking-wider text-[9px] font-bold">Transit Invoice Cost</span>
                  <span className="text-2xl font-black text-[#F97316] block">AED {travelCostEstimate.toLocaleString()}</span>
                  <span className="text-[10px] text-white/50 mt-2 block font-sans">ETA: 1 - 2 business road days</span>
                </>
              )}
            </div>

            <button className="w-full bg-[#F97316] hover:bg-orange-500 text-slate-950 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-transform duration-75 shadow-lg active:scale-97 cursor-pointer font-mono text-[10px] uppercase tracking-wider">
              {activeSubTab === 'inspection' && 'Book Certified Inspector'}
              {activeSubTab === 'finance' && 'Request Bank Approval Link'}
              {activeSubTab === 'insurance' && 'Acquire Instant Policy'}
              {activeSubTab === 'transport' && 'Schedule Secure Transport'}
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Simple Info Block */}
          <div className="bg-[#1E293B]/40 border border-white/5 p-4 rounded-2xl space-y-2 font-sans text-[10px] text-white/50">
            <span className="font-bold text-white uppercase block font-mono text-[9px] tracking-wider text-white/60">GCC Standard protections:</span>
            <p className="leading-relaxed">Every service computed is backed by fully licensed entities in the United Arab Emirates. Integrated smoothly inside the Bazar360 dealer-buyer mesh networks.</p>
          </div>

        </div>

      </div>

    </div>
  );
}
