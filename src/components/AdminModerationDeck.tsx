import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  ShieldAlert, 
  Clock, 
  Car, 
  User, 
  Users, 
  TrendingUp, 
  Phone, 
  Mail, 
  FileText, 
  MapPin, 
  Calendar, 
  BadgeAlert,
  Search,
  RefreshCw
} from 'lucide-react';
import { CarListing, Dealer } from '../types';
import { 
  Bargain, 
  Lead, 
  UserProfile, 
  dbFetchBargains, 
  dbFetchLeads, 
  dbFetchAllUsers,
  dbApproveListing
} from '../lib/dbService';

interface AdminModerationDeckProps {
  listings: CarListing[];
  dealers: Dealer[];
  onApproveListing: (id: string) => void;
  onRejectListing: (id: string) => void; // local state delete
}

export default function AdminModerationDeck({
  listings,
  dealers,
  onApproveListing,
  onRejectListing
}: AdminModerationDeckProps) {
  const pendingListings = listings.filter((l) => l.approved === false);

  // Advanced Multi-Tab states
  const [activeTab, setActiveTab] = useState<'pending' | 'bargains' | 'leads' | 'users'>('pending');
  const [bargains, setBargains] = useState<Bargain[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-fetch database records when component mounts or tab transitions
  const loadDatabaseRecords = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (activeTab === 'bargains') {
        const records = await dbFetchBargains();
        setBargains(records.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else if (activeTab === 'leads') {
        const records = await dbFetchLeads();
        setLeads(records.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else if (activeTab === 'users') {
        const records = await dbFetchAllUsers();
        setUsers(records.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (err: any) {
      console.warn("Error fetching administrative records:", err);
      setErrorMsg('Failed to fetch persistent Firestore records. Displaying local cache.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseRecords();
  }, [activeTab]);

  // Combined search term filter helper
  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBargains = bargains.filter(b => 
    b.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.vehicleTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.buyerPhone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeads = leads.filter(l => 
    l.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="bg-slate-900/90 border border-white/10 p-4 sm:p-6 rounded-3xl space-y-6 shadow-2xl font-sans text-xs" id="admin-moderation-deck-root">
      
      {/* Moderation Head Console */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20 uppercase tracking-widest">
            <ShieldAlert size={10} className="animate-pulse" /> Master Control Hub Active
          </span>
          <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            🚗 BAZAR360 Ecosystem Portal Diagnostics
          </h2>
          <p className="text-gray-400 text-[11px] font-sans">
            Oversee active negotiations, lead queues, client registrations, and pending inventory listing validations.
          </p>
        </div>
        
        {/* Interactive action to trigger a hot refresh */}
        <button 
          onClick={loadDatabaseRecords}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121c32] hover:bg-[#1C2C4E] text-[#38BDF8] border border-[#38BDF8]/20 hover:border-[#38BDF8]/50 rounded-xl text-[10px] font-mono font-bold uppercase transition duration-150 cursor-pointer"
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          Force Sync Live Database
        </button>
      </div>

      {/* Admin Tab Switching Navigation */}
      <div className="flex border-b border-white/5 pb-2 gap-1 overflow-x-auto no-scrollbar scroll-smooth">
        <button 
          onClick={() => { setActiveTab('pending'); setSearchTerm(''); }}
          className={`px-4 py-2 font-mono font-black uppercase text-[10px] tracking-wider rounded-xl transition duration-100 shrink-0 cursor-pointer flex items-center gap-1.5 border ${
            activeTab === 'pending'
              ? 'bg-orange-500 text-slate-950 border-orange-500 shadow'
              : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/5'
          }`}
        >
          <Clock size={12} />
          Pendings Queue ({pendingListings.length})
        </button>

        <button 
          onClick={() => { setActiveTab('bargains'); setSearchTerm(''); }}
          className={`px-4 py-2 font-mono font-black uppercase text-[10px] tracking-wider rounded-xl transition duration-100 shrink-0 cursor-pointer flex items-center gap-1.5 border ${
            activeTab === 'bargains'
              ? 'bg-orange-500 text-slate-950 border-orange-500 shadow'
              : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/5'
          }`}
        >
          <TrendingUp size={12} />
          Bargains Board ({bargains.length})
        </button>

        <button 
          onClick={() => { setActiveTab('leads'); setSearchTerm(''); }}
          className={`px-4 py-2 font-mono font-black uppercase text-[10px] tracking-wider rounded-xl transition duration-100 shrink-0 cursor-pointer flex items-center gap-1.5 border ${
            activeTab === 'leads'
              ? 'bg-orange-500 text-slate-950 border-orange-500 shadow'
              : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/5'
          }`}
        >
          <FileText size={12} />
          Leads Generation Log ({leads.length})
        </button>

        <button 
          onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
          className={`px-4 py-2 font-mono font-black uppercase text-[10px] tracking-wider rounded-xl transition duration-100 shrink-0 cursor-pointer flex items-center gap-1.5 border ${
            activeTab === 'users'
              ? 'bg-orange-500 text-slate-950 border-orange-500 shadow'
              : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/5'
          }`}
        >
          <Users size={12} />
          Registered Users ({users.length})
        </button>
      </div>

      {/* Database status overlay warning */}
      {errorMsg && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-2.5 rounded-xl font-mono text-[10px] flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Universal Search Filter Field (Hides for simple queues) */}
      {activeTab !== 'pending' && (
        <div className="bg-white/5 rounded-xl border border-white/5 p-2.5 flex items-center gap-2">
          <Search size={14} className="text-gray-500" />
          <input
            type="text"
            placeholder={`Search and filter table logs by name, keyword, phone, or tags...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none w-full placeholder-gray-600 block text-xs"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="text-[#38BDF8] text-[9px] font-mono hover:underline uppercase font-bold"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* TAB SUB-PANEL 1: PENDING approvals */}
      {activeTab === 'pending' && (
        <div>
          {pendingListings.length === 0 ? (
            <div className="p-8 text-center bg-white/[0.02] rounded-2xl border border-dashed border-white/10 max-w-md mx-auto space-y-3">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mx-auto border border-emerald-500/20">
                <Check size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-bold uppercase tracking-tight text-[11px]">Audit Queue Clean</h4>
                <p className="text-gray-500 text-[10px] leading-relaxed">
                  No outstanding products or vehicle posts require approval at this time. All system catalogs are live.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingListings.map((car) => {
                const dealerName = dealers.find((d) => d.id === car.dealerId)?.name || 'Private Collector';
                return (
                  <div 
                    key={car.id} 
                    className="bg-[#0c1220]/80 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4 hover:border-orange-500/30 transition duration-150"
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/5 relative">
                        <img 
                          src={car.imageUrl} 
                          alt={car.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[8px] font-mono text-gray-400 font-bold">
                          {car.year}
                        </span>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <span className="text-[8px] font-mono font-bold bg-[#1e293b] text-[#38bdf8] px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {car.fuelType} • {car.transmission}
                        </span>
                        <h4 className="text-white font-bold text-[11px] truncate uppercase pr-1 block leading-tight">
                          {car.title}
                        </h4>
                        <p className="text-gray-500 text-[9px] font-mono truncate">
                          Submitted by: <span className="text-[#38bdf8] font-semibold">{dealerName}</span>
                        </p>
                        <p className="text-amber-500 text-xs font-black font-mono">
                          Rs. {car.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold font-mono block">AI Optimized Content Draft:</span>
                      <p className="text-gray-400 text-[10px] leading-relaxed line-clamp-2 pr-1 font-sans">
                        {car.description || 'No custom description. AI generator draft missing.'}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2 justify-end">
                      <button
                        onClick={() => onRejectListing(car.id)}
                        className="p-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-100 font-bold rounded-lg uppercase tracking-wider text-[9px] flex items-center gap-1 active:scale-95 duration-100 cursor-pointer"
                      >
                        <X size={10} /> Delete/Reject
                      </button>
                      <button
                        onClick={() => onApproveListing(car.id)}
                        className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-black rounded-lg uppercase tracking-wider text-[9px] flex items-center gap-1 active:scale-95 duration-100 shadow shadow-emerald-950/20 cursor-pointer"
                      >
                        <Check size={11} /> Approve Listing
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB SUB-PANEL 2: ACTIVE BARGAINS */}
      {activeTab === 'bargains' && (
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Querying Firestore collection 'bargains'...</div>
          ) : filteredBargains.length === 0 ? (
            <div className="p-8 text-center bg-white/[0.01] rounded-2xl border border-white/5 text-gray-500 font-sans">
              No active vehicle bargains or offer logs registered yet matching '{searchTerm}'.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 font-mono text-[9px] uppercase tracking-wider pb-2">
                    <th className="py-2 font-black">Bargain Target</th>
                    <th className="py-2 font-black">Buyer Client</th>
                    <th className="py-2 font-black">Negotiated Bid Amount</th>
                    <th className="py-2 font-black">Contact hotline</th>
                    <th className="py-2 font-black">Timestamp</th>
                    <th className="py-2 font-black">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {filteredBargains.map((b) => (
                    <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-semibold text-white uppercase">{b.vehicleTitle}</td>
                      <td className="py-3">
                        <div className="font-bold flex items-center gap-1">
                          <User size={11} className="text-[#38BDF8]" />
                          {b.buyerName}
                        </div>
                        <span className="text-[9px] text-gray-500 font-mono block">{b.buyerEmail}</span>
                      </td>
                      <td className="py-3 font-mono font-black text-emerald-400">
                        Rs. {b.bidAmount.toLocaleString()}
                      </td>
                      <td className="py-3 font-mono text-[10px] text-gray-400 font-bold">
                        <div className="flex items-center gap-1 hover:text-[#38BDF8]">
                          <Phone size={10} className="text-gray-500" />
                          <a href={`tel:${b.buyerPhone}`}>{b.buyerPhone}</a>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-gray-500 text-[10px]">
                        {new Date(b.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-black tracking-wider ${
                          b.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400' :
                          b.status === 'Rejected' ? 'bg-red-500/15 text-red-400' :
                          'bg-amber-500/15 text-amber-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB SUB-PANEL 3: LEADS LOG */}
      {activeTab === 'leads' && (
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Querying Firestore collection 'leads'...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center bg-white/[0.01] rounded-2xl border border-white/5 text-gray-500 font-sans">
              No service booking leads, valuations, or inquiries found matching '{searchTerm}'.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 font-mono text-[9px] uppercase tracking-wider pb-2">
                    <th className="py-2 font-black">Lead Category</th>
                    <th className="py-2 font-black">Visitor / Prospect</th>
                    <th className="py-2 font-black">Contact hotline</th>
                    <th className="py-2 font-black">Log details</th>
                    <th className="py-2 font-black">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {filteredLeads.map((l) => (
                    <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3">
                        <span className="px-2 py-1 bg-[#38BDF8]/10 text-[#38BDF8] rounded-lg font-mono text-[9px] uppercase font-black tracking-wider">
                          {l.type}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-white flex items-center gap-1.5">
                        <User size={11} className="text-orange-400" />
                        <div>
                          <span>{l.userName || 'Anonymous'}</span>
                          <span className="text-[9px] text-gray-500 font-mono block">{l.userEmail || 'No Email'}</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-gray-400 font-bold text-[10px]">
                        <div className="flex items-center gap-1 hover:text-orange-400">
                          <Phone size={10} className="text-gray-500" />
                          <a href={`tel:${l.userPhone}`}>{l.userPhone || 'N/A'}</a>
                        </div>
                      </td>
                      <td className="py-3 font-sans max-w-sm">
                        <p className="text-gray-200 text-xs font-semibold leading-relaxed line-clamp-2">{l.details}</p>
                        {l.city && <span className="text-[9px] text-gray-500 font-mono flex items-center gap-0.5 mt-0.5"><MapPin size={9} /> {l.city}</span>}
                      </td>
                      <td className="py-3 font-mono text-gray-500 text-[10px]">
                        {new Date(l.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB SUB-PANEL 4: REGISTERED USERS */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Querying Firestore collection 'users'...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center bg-white/[0.01] rounded-2xl border border-white/5 text-gray-500 font-sans">
              No registered user profiles found matching '{searchTerm}'.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 font-mono text-[9px] uppercase tracking-wider pb-2">
                    <th className="py-2 font-black">Full Name</th>
                    <th className="py-2 font-black">Email Identifier</th>
                    <th className="py-2 font-black">Phone Connection (Leads Source)</th>
                    <th className="py-2 font-black">Location City</th>
                    <th className="py-2 font-black">Auth Privilege Role</th>
                    <th className="py-2 font-black">Created date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-orange-500 text-slate-950 flex items-center justify-center font-black text-[10px] uppercase">
                            {u.displayName?.substring(0,2) || 'US'}
                          </div>
                          <div>
                            <span className="font-extrabold text-white text-xs block leading-tight">{u.displayName}</span>
                            <span className="text-[8px] text-gray-500 font-mono tracking-tighter block uppercase">UID: {u.uid.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-[10px] text-gray-400 font-bold">{u.email}</td>
                      <td className="py-3 font-mono text-gray-300 font-black">
                        {u.phoneNumber ? (
                          <div className="flex items-center gap-1.5 hover:text-[#38BDF8]">
                            <Phone size={10} className="text-gray-500" />
                            <a href={`tel:${u.phoneNumber}`}>{u.phoneNumber}</a>
                          </div>
                        ) : (
                          <span className="text-gray-600 font-normal">Not Provided</span>
                        )}
                      </td>
                      <td className="py-3 font-sans text-gray-400">
                        {u.city ? (
                          <span className="flex items-center gap-1"><MapPin size={11} className="text-gray-500" /> {u.city}, {u.state || 'PK'}</span>
                        ) : (
                          <span className="italic text-gray-600">Global</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-[8px] font-mono uppercase font-black tracking-wider ${
                          u.role === 'Admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          u.role === 'Showroom Owner' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          u.role === 'Sales Rep' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                          u.role === 'Private Seller' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-gray-500/10 text-gray-400 border border-gray-500/25'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-gray-500 text-[10px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Pre-seeded'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </section>
  );
}
