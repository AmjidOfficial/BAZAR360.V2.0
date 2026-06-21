import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ShieldCheck, 
  Video, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Plus, 
  Eye,
  Lock,
  Unlock,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { Dealer } from '../types';
import { UserProfile } from '../lib/dbService';

interface VideoFeedItem {
  id: string;
  dealerId: string;
  dealerName: string;
  title: string;
  description: string;
  videoUrl: string;
  videoDuration: number; // in seconds, must be > 30s
  imageUrl: string;
  status: 'approved' | 'pending_approval';
  timestamp: string;
  category: 'Walkaround' | 'Test Drive' | 'Delivery' | 'Exhaust Sound';
}

interface MediaFeedViewProps {
  dealers: Dealer[];
  currentUser: UserProfile | null;
  onForceLogin?: () => void;
}

const PRELOADED_VIDEOS: VideoFeedItem[] = [
  {
    id: 'vid-1',
    dealerId: 'auto-choice-peshawar',
    dealerName: 'Auto Choice',
    title: 'Porsche 911 Carrera S Cold Start & Exhaust Soundcheck',
    description: 'Listen to the roaring twin-turbo flat-six engine of the gorgeous 911 Carrera S live on our showroom floor. Certified inspected specs.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-at-night-42294-large.mp4',
    videoDuration: 52,
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    status: 'approved',
    timestamp: '2 hours ago',
    category: 'Exhaust Sound'
  },
  {
    id: 'vid-2',
    dealerId: 'auto-choice-peshawar',
    dealerName: 'Auto Choice',
    title: 'Toyota Fortuner Legender 2024 Ultimate Walkaround',
    description: 'Full walking tour of the pristine white Legender detailing interior diamond leather and spec parameters. Delivered with standard specs nationwide.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-luxury-suv-interior-details-42295-large.mp4',
    videoDuration: 120,
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
    status: 'approved',
    timestamp: '5 hours ago',
    category: 'Walkaround'
  },
  {
    id: 'vid-3',
    dealerId: 'almas-car-valley',
    dealerName: 'Almas Car Valley',
    title: 'Mercedes Benz G63 AMG VIP Delivery Vlog',
    description: 'Welcoming our luxury buyer from Lahore to inspect and take immediate delivery of the rare Obsidian Black AMG G63. Transparent transfer processed.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-driving-in-a-dark-tunnel-with-a-car-42293-large.mp4',
    videoDuration: 85,
    imageUrl: 'https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?auto=format&fit=crop&q=80&w=800',
    status: 'approved',
    timestamp: '1 day ago',
    category: 'Delivery'
  },
  {
    id: 'vid-4',
    dealerId: 'auto-choice-peshawar',
    dealerName: 'Auto Choice',
    title: 'BYD Sealion 6 Electric SUV Highway Flight Test',
    description: 'Testing range parameters, lane keep assistance, and dual-motor torque of the next-generation premium BYD electric crossover.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-electric-car-charging-at-station-42296-large.mp4',
    videoDuration: 45,
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800',
    status: 'pending_approval',
    timestamp: 'Just Now',
    category: 'Test Drive'
  }
];

export default function MediaFeedView({ dealers, currentUser, onForceLogin }: MediaFeedViewProps) {
  const [videoFeed, setVideoFeed] = useState<VideoFeedItem[]>(() => {
    const saved = localStorage.getItem('bazar360_videos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        // fallback
      }
    }
    return PRELOADED_VIDEOS;
  });

  const [activePlaybackId, setActivePlaybackId] = useState<string | null>(null);
  const [isAdminOverlayOpen, setIsAdminOverlayOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authGateIntercept, setAuthGateIntercept] = useState(false);

  // Form Submit states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDuration, setNewDuration] = useState<number>(45);
  const [newCategory, setNewCategory] = useState<'Walkaround' | 'Test Drive' | 'Delivery' | 'Exhaust Sound'>('Walkaround');
  const [selectedDealerId, setSelectedDealerId] = useState('auto-choice-peshawar');
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  useEffect(() => {
    localStorage.setItem('bazar360_videos', JSON.stringify(videoFeed));
  }, [videoFeed]);

  // Is current logged in user an admin?
  const hasSystemAdminRoots = currentUser?.role === 'Admin' || currentUser?.email === 'amjid.bisconni@gmail.com';

  const handleTogglePlay = (id: string) => {
    if (activePlaybackId === id) {
      setActivePlaybackId(null);
    } else {
      setActivePlaybackId(id);
    }
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '360admin' || adminPassword === 'bazar360' || hasSystemAdminRoots) {
      setIsAdminAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid Admin security passcode credential.');
    }
  };

  const promoteToApproved = (id: string) => {
    setVideoFeed(prev => 
      prev.map(vid => vid.id === id ? { ...vid, status: 'approved' } : vid)
    );
  };

  const rejectOrDeleteVideo = (id: string) => {
    setVideoFeed(prev => prev.filter(vid => vid.id !== id));
  };

  const handleSubmitVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    // Enforce authentication & role requirements
    const isOwnerOrModerator = currentUser && (
      currentUser.role === 'Showroom Owner' || 
      currentUser.role === 'Dealer' || 
      currentUser.role === 'Admin' || 
      currentUser.email === 'amjid.bisconni@gmail.com'
    );

    // If duration exceeds 30 seconds, enforce matching credentials
    if (newDuration > 30) {
      if (!isOwnerOrModerator) {
        setAuthGateIntercept(true);
        return;
      }
    }

    // Require basic login authentication for any asset upload
    if (!currentUser) {
      setAuthGateIntercept(true);
      return;
    }

    const chosenDealerName = dealers.find(d => d.id === selectedDealerId)?.name || 'Auto Choice';

    const newReel: VideoFeedItem = {
      id: `vid-${Date.now()}`,
      dealerId: selectedDealerId,
      dealerName: chosenDealerName,
      title: newTitle,
      description: newDesc,
      // Fallback beautiful stock drone video if not specified
      videoUrl: newUrl.trim() || 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-at-night-42294-large.mp4',
      videoDuration: Number(newDuration) || 45,
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
      status: hasSystemAdminRoots ? 'approved' : 'pending_approval', // auto approved for admins only
      timestamp: 'Just now',
      category: newCategory
    };

    setVideoFeed(prev => [newReel, ...prev]);
    setIsSubmitSuccessful(true);

    // reset forms
    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
    setNewDuration(45);

    setTimeout(() => {
      setIsSubmitSuccessful(false);
    }, 4000);
  };

  // Only approved posts go to the public stream
  const publicApprovedFeed = videoFeed.filter(vid => vid.status === 'approved');
  const pendingModerationFeed = videoFeed.filter(vid => vid.status === 'pending_approval');

  return (
    <div className="space-y-8 pb-20">
      {/* Top Banner */}
      <section className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#0c1322] via-[#060a12] to-[#121c32] p-6 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#38BDF8] opacity-5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl space-y-3">
          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black tracking-widest text-orange-500 uppercase bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/25">
            <Video size={11} className="animate-pulse" /> LIVEWALK VIDEO DESK
          </span>
          <h2 className="text-xl md:text-3xl font-sans font-black uppercase text-white tracking-tight">
            Chronological Media Feed & Reels
          </h2>
          <p className="text-white/60 text-xs max-w-2xl font-sans leading-relaxed">
            Exclusively view high-fidelity, walkarounds, exhaust sound checks, and verified delivery stories by our flagship partner <span className="text-orange-500 font-extrabold">Auto Choice</span>. Strictly verified walkthrough duration logs.
          </p>
        </div>
      </section>

      {/* Admin Operations Access Button Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-[#111928]/90 border border-white/5 p-4 rounded-2xl">
        <div className="space-y-1">
          <p className="text-xs font-black text-white uppercase font-sans">Ecosystem Media Pipelines</p>
          <p className="text-[10px] text-gray-400 font-sans">Registered showroom owners or system moderators can upload walks exceeding 30 seconds.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {pendingModerationFeed.length > 0 && (
            <span className="bg-orange-500/20 text-orange-400 font-black text-[9px] font-mono uppercase px-2.5 py-1 rounded border border-orange-500/30 animate-pulse">
              {pendingModerationFeed.length} Pending Approval
            </span>
          )}
          <button
            onClick={() => {
              if (hasSystemAdminRoots) setIsAdminAuthenticated(true);
              setIsAdminOverlayOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-slate-900 to-blue-950 border border-blue-500/30 text-sky-400 rounded-xl text-[10px] font-mono font-extrabold uppercase tracking-wider hover:border-sky-400 duration-150 active:scale-95 flex items-center gap-1.5"
          >
            {isAdminAuthenticated ? <Unlock size={12} /> : <Lock size={12} />} Manage Video Approvals
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Columns: Chronological Video List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 font-mono">
            <span>● Verified Walkaround Reel Logs</span>
            <span className="text-[10px] text-[#38BDF8] lowercase font-normal">({publicApprovedFeed.length} live feeds)</span>
          </h3>

          {publicApprovedFeed.length === 0 ? (
            <div className="bg-[#0c1221] border border-[#1e293b] rounded-3xl p-12 text-center space-y-4">
              <Video className="mx-auto text-gray-600 animate-pulse" size={36} />
              <div className="space-y-1">
                <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">No Video walkarounds live right now</h4>
                <p className="text-gray-500 text-xs">Switch to admin control panel to approve preloaded demo video clips instantly.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {publicApprovedFeed.map((vid) => {
                const isPlaybackActive = activePlaybackId === vid.id;
                return (
                  <div 
                    key={vid.id}
                    className="bg-[#0c1221] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl relative transition-all hover:border-orange-500/20 group"
                  >
                    {/* Video Area */}
                    <div className="relative aspect-video bg-black/90 overflow-hidden flex items-center justify-center">
                      {isPlaybackActive ? (
                        <video 
                          src={vid.videoUrl}
                          className="w-full h-full object-cover"
                          controls
                          autoPlay
                          playsInline
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full font-sans">
                          <img 
                            src={vid.imageUrl}
                            alt={vid.title}
                            className="w-full h-full object-cover opacity-60 group-hover:scale-[1.02] transition-all duration-500"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                          
                          {/* Play Button overlay */}
                          <button
                            onClick={() => handleTogglePlay(vid.id)}
                            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-2xl transition-all duration-150 active:scale-90 group-hover:scale-110 z-10 cursor-pointer"
                          >
                            <Play size={24} className="fill-white pl-1 text-white" />
                          </button>
                        </div>
                      )}

                      {/* Top Labels */}
                      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                        <span className="px-2 py-0.5 rounded bg-orange-500 text-slate-950 font-black text-[9px] uppercase tracking-wider font-mono">
                          {vid.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[#38BDF8] text-[8px] font-mono border border-white/5 flex items-center gap-1 uppercase font-bold">
                          <ShieldCheck size={10} /> {vid.videoDuration} seconds
                        </span>
                      </div>

                      {/* Right Duration Stamp */}
                      <span className="absolute bottom-3 right-3 text-[10px] font-mono font-bold bg-[#070c18]/90 py-0.5 px-2 rounded border border-white/5 text-gray-300 z-10">
                        {Math.floor(vid.videoDuration / 60)}:{(vid.videoDuration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>

                    {/* Metadata summary */}
                    <div className="p-5 space-y-3 bg-[#0d1526]/80">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-orange-400 font-extrabold uppercase flex items-center gap-1">
                          🏬 @{vid.dealerName} Flagship
                        </span>
                        <span className="text-gray-500">{vid.timestamp}</span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-white text-sm font-black uppercase tracking-tight leading-snug group-hover:text-orange-500 duration-150">
                          {vid.title}
                        </h4>
                        <p className="text-[#a3b3cc] text-xs leading-relaxed font-sans mt-1">
                          {vid.description}
                        </p>
                      </div>

                      {/* Subtle branding anchor */}
                      <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-[#38BDF8]/80">
                        <span>BAZAR360 Verified Broadcast Stream</span>
                        <span className="flex items-center gap-0.5 uppercase tracking-wider font-bold">Approved Spec <CheckCircle size={12} className="text-emerald-500" /></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Submit walkthrough form */}
        <div className="bg-[#121a2a] border border-[#1e293b] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-white/5 pb-2.5">
            <h3 className="text-white font-black text-xs uppercase tracking-widest font-mono flex items-center gap-2">
              <Plus size={14} className="text-orange-500" /> Upload Walker Reel
            </h3>
            <p className="text-[10px] text-gray-400 font-sans mt-1">Submit high-definition vehicle diagnostics, client handovers, or showroom events.</p>
          </div>

          <form onSubmit={handleSubmitVideo} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">Associated Corporate Partner</label>
              <select
                value={selectedDealerId}
                onChange={(e) => setSelectedDealerId(e.target.value)}
                className="w-full bg-[#080d19] border border-[#1e293b] rounded-xl text-white font-mono text-[10px] py-2 px-3 focus:outline-none focus:border-orange-500 uppercase h-10 font-bold"
              >
                {dealers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">Reel Category</label>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] font-bold uppercase">
                {['Walkaround', 'Test Drive', 'Delivery', 'Exhaust Sound'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat as any)}
                    className={`py-2 rounded-lg border text-center cursor-pointer transition-colors ${
                      newCategory === cat
                        ? 'bg-orange-500/10 text-orange-500 border-orange-500'
                        : 'bg-[#080d19] text-gray-400 border-white/5 hover:border-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">Reel Video Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Brand New Zeekr 009 Premium Electric MPV walkaround"
                className="w-full bg-[#080d19] border border-[#1e293b] rounded-xl text-white text-xs py-2.5 px-3 focus:outline-none focus:border-orange-500 placeholder-white/20 h-10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">Walkaround Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Outline premium chassis variables, interior specs, or exhaust notes..."
                rows={3}
                className="w-full bg-[#080d19] border border-[#1e293b] rounded-xl text-white text-xs py-2 px-3 focus:outline-none focus:border-orange-500 placeholder-white/20 font-sans"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">Simulated Video Source URL</label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Can leave blank for premium default demo loop"
                className="w-full bg-[#080d19] border border-[#1e293b] rounded-xl text-white text-xs py-2.5 px-3 focus:outline-none focus:border-orange-500 placeholder-white/20 font-mono h-10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">Logged Walk Duration</label>
                <span className="text-[#38BDF8] text-[10px] font-mono font-bold">{newDuration} seconds</span>
              </div>
              <input
                type="range"
                min="31"
                max="300"
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="w-full accent-orange-500 bg-[#080d19]"
              />
              <p className="text-[9px] text-gray-500 font-mono font-bold uppercase">✓ Strictly enforces unlimited video logs (min 31s)</p>
            </div>

            {isSubmitSuccessful && (
              <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-mono text-center">
                ✓ Video logged successfully! {hasSystemAdminRoots ? 'Skipped moderation (Super-Admin Bypass)' : 'Defaulted state to "pending_approval" for review deck.'}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 duration-100 cursor-pointer"
            >
              Push Video To Pipeline
            </button>
          </form>
        </div>

      </div>

      {/* Moderation overlay Modal */}
      {isAdminOverlayOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b121f] border border-[#1e293b] rounded-2xl w-full max-w-2xl p-6 text-xs font-sans relative shadow-2xl flex flex-col max-h-[85vh]">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3 shrink-0">
              <h4 className="text-white font-mono font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                <Video size={14} className="text-orange-500" /> BAZAR360 Video moderation Control Panel
              </h4>
              <button 
                onClick={() => {
                  setIsAdminOverlayOpen(false);
                  setAdminPassword('');
                }}
                className="text-gray-400 hover:text-white px-2 py-1 bg-white/5 rounded border border-white/10"
              >
                ✕ Close
              </button>
            </div>

            {/* Authentication Guard */}
            {!isAdminAuthenticated ? (
              <div className="py-12 px-6 flex-grow overflow-y-auto space-y-4 text-center">
                <p className="text-white/60 text-xs">Access to live video approvals dashboard is restricted. Enter security passcode or have Admin session privileges.</p>
                <form onSubmit={handleAdminAuth} className="max-w-xs mx-auto space-y-3">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password (use 'bazar360')"
                    className="w-full bg-[#080d19] border border-white/10 rounded-xl py-2 px-3 tracking-widest text-[#38BDF8] text-center focus:outline-none focus:border-[#38BDF8]"
                    required
                  />
                  {authError && <p className="text-[#EF4444] text-[9px] uppercase font-mono font-bold">{authError}</p>}
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#38BDF8] hover:bg-sky-500 text-black font-black uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Authenticate Terminal
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto space-y-4 py-4 pr-1">
                
                {hasSystemAdminRoots && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-2 px-3 text-[10px] font-mono uppercase mb-2">
                    Super admin privilege session active: password checks bypassed automatically.
                  </div>
                )}
                
                <h5 className="font-mono font-bold uppercase tracking-wider text-orange-400">Pending Reels Stream ({pendingModerationFeed.length} Items)</h5>
                
                {pendingModerationFeed.length === 0 ? (
                  <div className="text-center py-10 bg-white/[0.01] border border-white/5 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-mono">No pending videos awaiting system moderation approvals today.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingModerationFeed.map(vid => (
                      <div 
                        key={vid.id}
                        className="bg-[#080d19] border border-white/5 p-3 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 duration-150 hover:border-white/10"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono text-[8px] uppercase tracking-wide">
                              {vid.category}
                            </span>
                            <span className="text-[8px] text-[#38BDF8] font-mono">Duration: {vid.videoDuration}s</span>
                          </div>
                          <h6 className="text-white font-bold text-xs uppercase truncate pr-3">{vid.title}</h6>
                          <p className="text-gray-400 text-[10px] line-clamp-1 pr-3">{vid.description}</p>
                          <p className="text-[9px] text-gray-500 font-mono">Submitter showroom ID: @{vid.dealerId}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => promoteToApproved(vid.id)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black uppercase text-[8px] tracking-wider rounded-lg transition-transform duration-100 active:scale-90 cursor-pointer"
                          >
                            Approve Live
                          </button>
                          <button
                            onClick={() => rejectOrDeleteVideo(vid.id)}
                            className="bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] p-1.5 rounded-lg border border-[#EF4444]/20 transition-transform duration-100 active:scale-90 cursor-pointer"
                            title="Reject/Delete walkaround upload"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* List fully approved videos in moderation for easy deletion */}
                <h5 className="font-mono font-bold uppercase tracking-wider text-emerald-500 mt-6 pt-4 border-t border-white/5">Active Public Reels ({publicApprovedFeed.length} Items)</h5>
                <div className="space-y-2">
                  {publicApprovedFeed.map(vid => (
                    <div 
                      key={vid.id}
                      className="bg-white/[0.01] border border-white/5 p-2 rounded-lg flex items-center justify-between gap-3 text-[10px]"
                    >
                      <span className="text-white font-bold truncate flex-1 leading-none uppercase">{vid.title}</span>
                      <button
                        onClick={() => rejectOrDeleteVideo(vid.id)}
                        className="text-[#EF4444] hover:text-white p-1 rounded hover:bg-[#EF4444]/25 shrink-0"
                        title="Remove live stream video"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            )}
            
          </div>
        </div>
      )}

      {/* Security Verification Gateway Intercept Modal */}
      {authGateIntercept && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b121f] border border-[#EF4444]/30 rounded-2xl w-full max-w-md p-6 text-xs font-sans relative shadow-2xl flex flex-col space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-[#EF4444]/10 p-2.5 rounded-xl border border-[#EF4444]/20 shrink-0">
                <Lock size={20} className="text-[#EF4444] animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[#EF4444] font-mono font-black text-xs uppercase tracking-widest">
                  Security Gateway Intercept
                </h4>
                <p className="text-white mt-1 font-bold text-[11px] leading-tight-none uppercase font-mono">
                  Owner/Moderator Only Authorization
                </p>
              </div>
            </div>

            <p className="text-gray-300 text-[10.5px] leading-relaxed">
              To upload high-resolution showcase walkaround clips exceeding 30 seconds, you must have an active authenticated and verified <span className="text-orange-500 font-extrabold">Showroom Owner</span> or <span className="text-sky-400 font-extrabold">System Moderator</span> profile session.
            </p>

            <div className="bg-[#070c12] p-3 rounded-xl border border-white/5 space-y-1">
              <p className="text-[9px] font-mono text-gray-500 uppercase font-black">Current session profile:</p>
              <p className="text-white font-mono font-bold text-[10px] uppercase">
                {currentUser ? `${currentUser.displayName} (${currentUser.role})` : 'Guest Visitor Session (Offline)'}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setAuthGateIntercept(false);
                  if (onForceLogin) {
                    onForceLogin();
                  }
                }}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg text-center cursor-pointer font-sans"
              >
                Authenticate / Register Dealer Portal 🔑
              </button>
              <button
                onClick={() => setAuthGateIntercept(false)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-400 font-mono text-[9px] uppercase rounded-xl transition-all border border-white/10 cursor-pointer"
              >
                ✕ Cancel and Keep Demo Loop
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
