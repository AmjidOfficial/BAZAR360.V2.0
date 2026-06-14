import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Phone, MessageSquare, ShieldCheck, Star, Users, Award, CornerDownRight, Send } from 'lucide-react';
import { Dealer, CarListing, Review, ChatMessage } from '../types';

interface DealerStorefrontViewProps {
  dealer: Dealer;
  listings: CarListing[];
  reviews: Review[];
  onAddReview: (comment: string, rating: number) => void;
  onSelectListing: (listing: CarListing) => void;
}

export default function DealerStorefrontView({
  dealer,
  listings,
  reviews,
  onAddReview,
  onSelectListing,
}: DealerStorefrontViewProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'inventory' | 'reviews' | 'about'>('feed');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(dealer.followersCount);

  // Reviews states
  const [commentText, setCommentText] = useState('');
  const [starRating, setStarRating] = useState(5);

  // Dials mockup state
  const [showDialer, setShowDialer] = useState(false);

  // Chatbot states
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: `Hello! Welcome to ${dealer.name}. I am your dedicated digital sales assistant. Feel free to ask me anything about our current vehicles, finance packages, or to schedule a GCC delivery!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, showChat]);

  const handleFollowToggle = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowers(dealer.followersCount);
    } else {
      setIsFollowing(true);
      // Mock follow increment
      setFollowers((prev) => {
        const numeric = parseFloat(prev.replace('k', ''));
        return (numeric + 0.1).toFixed(1) + 'k';
      });
    }
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddReview(commentText, starRating);
    setCommentText('');
    setStarRating(5);
  };

  const dealerCars = listings.filter((l) => l.dealerId === dealer.id);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const requestedInput = userInput;
    setUserInput('');
    setIsChatLoading(true);

    try {
      // Connects to our server-side proxy route
      const response = await fetch('/api/dealer/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerName: dealer.name,
          dealerBio: dealer.description,
          inventorySummary: dealerCars.map((c) => `${c.title} (AED ${c.price.toLocaleString()}, ${c.mileage} km, ${c.fuelType})`).join(', '),
          message: requestedInput,
          history: chatMessages.map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reply from AI agent.');
      }

      const data = await response.json();
      
      const replyMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'agent',
        text: data.reply || "I'm sorry, I was unable to process that. Please try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, replyMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'agent',
        text: `Error connecting to ${dealer.name} agent. Please make sure the server status is established.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Dealership Info Header Area - Bento Card */}
      <section className="mt-4 bg-[#1E293B] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative shadow-2xl overflow-hidden select-none">
        {/* Glow styling */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#38BDF8] opacity-10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#38BDF8] overflow-hidden bg-[#0F172A] flex items-center justify-center shadow-lg">
            {dealer.avatarUrl ? (
              <img
                src={dealer.avatarUrl}
                alt={dealer.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-sans font-extrabold text-4xl text-white">
                {dealer.avatarLetter}
              </span>
            )}
          </div>
          <span className="absolute bottom-1 right-1 bg-emerald-500 w-4 h-4 rounded-full border-4 border-[#1E293B]"></span>
        </div>

        <div className="flex-grow text-center md:text-left space-y-4">
          <div>
            <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2.5 justify-center md:justify-start">
              <h2 className="font-sans font-black text-2xl md:text-3xl text-white uppercase tracking-tight">
                {dealer.name}
              </h2>
              <span className="px-2.5 py-1 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] select-none text-[9px] uppercase tracking-widest font-mono font-bold border border-white/5 flex items-center gap-1">
                <ShieldCheck size={10} /> Certified Showroom
              </span>
            </div>
            <p className="text-white/60 text-xs font-sans mt-1.5">{dealer.subtitle}</p>
          </div>

          <div className="grid grid-cols-3 max-w-sm mx-auto md:mx-0 text-center md:text-left pt-2.5 border-t border-white/5 font-mono">
            <div>
              <p className="text-lg font-black text-white">{dealerCars.length}</p>
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Units</p>
            </div>
            <div>
              <p className="text-lg font-black text-white">{followers}</p>
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Followers</p>
            </div>
            <div>
              <p className="text-lg font-black text-white flex items-center justify-center md:justify-start gap-1">
                {dealer.rating} <Star size={12} className="fill-[#F97316] stroke-[#F97316]" />
              </p>
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Rating</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto h-full justify-between font-mono">
          <button
            onClick={handleFollowToggle}
            className={`w-full md:w-40 py-2.5 px-4 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-transform duration-100 cursor-pointer ${
              isFollowing
                ? 'bg-[#0F172A] border border-white/10 text-white hover:bg-slate-800'
                : 'bg-[#F97316] border border-white/5 text-white hover:bg-orange-600'
            }`}
          >
            {isFollowing ? '✓ Following' : 'Follow Showroom'}
          </button>
          
          <div className="flex justify-center md:justify-end gap-3 mt-2 text-white/40">
            <span className="text-[10px] uppercase font-bold">{dealer.location}</span>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="flex overflow-x-auto gap-8 border-b border-white/5 pb-2.5 no-scrollbar font-mono text-xs uppercase">
        <button
          onClick={() => setActiveTab('feed')}
          className={`font-bold pb-2 whitespace-nowrap transition-all duration-150 cursor-pointer select-none ${
            activeTab === 'feed' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-white/40 hover:text-white'
          }`}
        >
          Activity Feed
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`font-bold pb-2 whitespace-nowrap transition-all duration-150 cursor-pointer select-none ${
            activeTab === 'inventory' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-white/40 hover:text-white'
          }`}
        >
          All Inventory ({dealerCars.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`font-bold pb-2 whitespace-nowrap transition-all duration-150 cursor-pointer select-none ${
            activeTab === 'reviews' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-white/40 hover:text-white'
          }`}
        >
          Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`font-bold pb-2 whitespace-nowrap transition-all duration-150 cursor-pointer select-none ${
            activeTab === 'about' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-white/40 hover:text-white'
          }`}
        >
          Showroom Specs
        </button>
      </nav>

      {/* Dynamic columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TAB CONTENTS: LEFT COLUMN (Lg spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {dealer.activityFeed.map((post) => (
                <article key={post.id} className="bg-[#1E293B] border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-xl select-none">
                  <div className="p-4 px-5 flex items-center justify-between border-b border-white/5 font-mono">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold px-3 py-1 bg-[#38BDF8]/15 text-[#38BDF8] rounded-xl uppercase tracking-wider border border-[#38BDF8]/20">
                        {post.badge}
                      </span>
                      <span className="text-[10px] text-white/40 uppercase font-semibold">{post.timestamp}</span>
                    </div>
                  </div>
                  <div className="relative h-64 bg-[#0F172A] overflow-hidden group">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-5 space-y-4 bg-gradient-to-b from-[#1E293B] to-[#121A2A]">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-bold text-white hover:text-[#38BDF8] transition-colors uppercase tracking-tight">{post.title}</h3>
                      <span className="text-[#F97316] font-black text-lg font-mono">{post.price}</span>
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed font-sans">{post.description}</p>
                    <div className="flex justify-end pt-3 border-t border-white/5">
                      <button
                        onClick={() => {
                          const linked = listings.find((l) => l.id === post.carId);
                          if (linked) onSelectListing(linked);
                        }}
                        className="px-4 py-2 border border-[#38BDF8] text-[#38BDF8] text-[10px] uppercase tracking-wider font-mono font-bold rounded-xl hover:bg-[#38BDF8]/10 active:scale-95 transition-all cursor-pointer"
                      >
                        Inspect Specifications
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dealerCars.map((car) => (
                <div
                  key={car.id}
                  onClick={() => onSelectListing(car)}
                  className="bg-[#1E293B] border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:border-[#38BDF8] hover:shadow-2xl transition-all duration-300"
                >
                  <div className="h-44 bg-[#0F172A] relative">
                    <img
                      src={car.imageUrl}
                      alt={car.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {car.verified && (
                      <div className="absolute top-2.5 left-2.5 bg-[#0F172A]/90 px-2.5 py-1 border border-white/15 rounded-xl text-[9px] text-[#38BDF8] font-mono font-bold uppercase tracking-wider">
                        Verified Spec
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-2.5">
                    <h4 className="font-bold text-white text-sm truncate uppercase tracking-tight">{car.title}</h4>
                    <p className="text-[10px] text-white/50 font-mono uppercase">
                      {car.mileage.toLocaleString()} KM • {car.fuelType} • {car.transmission}
                    </p>
                    <p className="text-[#F97316] font-black text-base pt-1 font-mono">
                      AED {car.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl select-none">
                <h3 className="text-white font-bold text-xs uppercase tracking-wider block border-b border-white/5 pb-3">Write a Customer Review</h3>
                <form onSubmit={submitComment} className="space-y-4 font-sans text-xs">
                  <div className="flex gap-4 items-center">
                    <label className="text-xs text-white/55 font-mono uppercase font-semibold">Score:</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStarRating(s)}
                          className="focus:outline-none cursor-pointer"
                        >
                          <Star
                            size={18}
                            className={s <= starRating ? 'fill-[#F97316] text-[#F97316]' : 'text-slate-600'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <textarea
                      rows={3}
                      className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-3.5 text-white focus:outline-none focus:border-[#38BDF8] text-xs placeholder-white/30 font-sans"
                      placeholder={`Share your experience buying from ${dealer.name}...`}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#F97316] text-white px-5 py-2.5 rounded-xl font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-orange-600 active:scale-95 duration-75 shadow-lg shadow-orange-950/20 cursor-pointer"
                    >
                      Post Store Review
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-white/40 text-center py-6 font-mono uppercase">No reviews posted yet for this dealership.</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="bg-[#1E293B] border border-white/5 p-5 rounded-3xl space-y-3.5 shadow-md font-sans">
                      <div className="flex justify-between items-center bg-[#0F172A] p-2.5 px-3.5 rounded-xl border border-white/5 font-mono">
                        <div>
                          <span className="font-bold text-white text-xs block uppercase tracking-tight">{rev.author}</span>
                          <span className="text-[9px] text-[#38BDF8] font-bold uppercase">{rev.date}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              className={i < rev.rating ? 'fill-[#F97316] text-[#F97316]' : 'text-slate-700'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-white/70 text-xs px-2 pt-0.5 leading-relaxed font-sans">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-6 shadow-xl font-sans select-none">
              <div className="space-y-2">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider font-mono">Who We Are</h3>
                <p className="text-white/70 text-xs leading-relaxed">{dealer.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-white/5">
                <div className="space-y-3">
                  <h4 className="text-[#38BDF8] font-bold text-[10px] uppercase tracking-widest font-mono">Dealer Logistics</h4>
                  <div className="space-y-2 text-xs text-white/70 font-sans">
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#38BDF8]" /> {dealer.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-[#38BDF8]" /> {dealer.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-white/40">schedule</span>
                      <span className="font-mono text-[10px] uppercase">Mon - Sat: 9:00 AM - 9:00 PM</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[#38BDF8] font-bold text-[10px] uppercase tracking-widest font-mono">Authorized Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Bespoke Imports', 'Direct Leasing', 'Trade-In Welcome', '111-Point Certifications', 'GCC Home Shipping'].map((tag) => (
                      <span key={tag} className="bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[10px] text-[#38BDF8] px-3 py-1.5 rounded-xl font-mono uppercase font-bold tracking-tight">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* TAB CONTENTS: RIGHT COLUMN / SIDEPANEL */}
        <div className="lg:col-span-1 space-y-6 select-none font-mono">
          <div className="bg-[#1E293B] border border-white/5 p-5 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider block border-b border-white/5 pb-2.5">Dealership Highlights</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-[#38BDF8]/10 text-[#38BDF8] p-2.5 rounded-xl mt-0.5 border border-[#38BDF8]/10">
                  <Users size={16} />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-white tracking-widest leading-relaxed">Scale Network</h4>
                  <p className="text-[9px] text-white/50 leading-relaxed font-sans">Serving the GCC with multi-office logistics & trade connections.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-[#38BDF8]/10 text-[#38BDF8] p-2.5 rounded-xl mt-0.5 border border-[#38BDF8]/10">
                  <Award size={16} />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-white tracking-widest leading-relaxed">Award-Winning Trust</h4>
                  <p className="text-[9px] text-white/50 leading-relaxed font-sans">Recognized for premium customer scorecards for 3 consecutive years.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-[#38BDF8]/10 text-[#38BDF8] p-2.5 rounded-xl mt-0.5 border border-[#38BDF8]/10">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-white tracking-widest leading-relaxed">Full Financial Verification</h4>
                  <p className="text-[9px] text-white/50 leading-relaxed font-sans">Every transaction is routed securely with regulatory backing.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1E293B] border border-white/5 p-5 rounded-3xl text-center space-y-3 shadow-xl">
            <p className="text-[10px] text-white/55 uppercase font-bold">Have dynamic inquiries?</p>
            <button
              onClick={() => setShowChat(true)}
              className="bg-[#0F172A] border border-white/10 hover:border-[#38BDF8] text-[#38BDF8] w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 duration-100 cursor-pointer"
            >
              <MessageSquare size={14} /> Talk to {dealer.name} Helper
            </button>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Action Bar for Contact (Desktop & Mobile) */}
      <div className="fixed bottom-16 md:bottom-0 left-0 w-full bg-[#1E293B]/95 border-t border-white/15 p-4 flex justify-center gap-4 z-40 backdrop-blur-md shadow-2xl font-mono text-xs uppercase">
        <button
          onClick={() => setShowDialer(true)}
          className="w-full max-w-xs py-3.5 px-6 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-orange-950/20 cursor-pointer tracking-wider"
        >
          <Phone size={15} /> Call Dealer
        </button>

        <button
          onClick={() => setShowChat(true)}
          className="w-full max-w-xs py-3.5 px-6 border border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8]/10 font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all bg-[#0F172A] cursor-pointer tracking-wider"
        >
          <MessageSquare size={15} /> Live AI Chat
        </button>
      </div>

      {/* MODAL: CALL DIALER */}
      {showDialer && (
         <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono select-none">
          <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-6 text-center shadow-2xl relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#F97316] opacity-10 rounded-full blur-[50px] pointer-events-none"></div>

            <div className="space-y-2">
              <div className="w-12 h-12 bg-[#F97316]/10 text-[#F97316] rounded-full flex items-center justify-center mx-auto">
                <Phone size={24} className="animate-bounce" />
              </div>
              <h3 className="font-extrabold text-white text-base uppercase tracking-wider">Contacting Dealer</h3>
              <p className="text-white/50 text-[10px] font-sans">Direct secure line connected via Bazar360 routing</p>
            </div>

            <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4 md:p-6 space-y-1 shadow-inner">
              <span className="text-[9px] uppercase tracking-widest text-[#38BDF8] font-bold block">Hotline</span>
              <span className="text-xl font-bold text-white block">{dealer.phone}</span>
              <span className="text-[9px] text-white/40 mt-2 block">Available GCC Time: 9AM - 9PM</span>
            </div>

            <div className="flex gap-3 text-[10px] uppercase font-bold tracking-wider">
              <button
                onClick={() => setShowDialer(false)}
                className="flex-1 bg-red-600/15 border border-red-500/20 hover:bg-red-600/30 text-red-400 py-2.5 rounded-xl transition-colors active:scale-95 cursor-pointer"
              >
                Cancel Call
              </button>
              <a
                href={`tel:${dealer.phone}`}
                onClick={() => setShowDialer(false)}
                className="flex-1 bg-[#F97316] hover:bg-orange-600 text-white py-2.5 rounded-xl text-center active:scale-95 cursor-pointer flex items-center justify-center"
              >
                Call Directly
              </a>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER MODAL: SOCIAL ROLEPLAY CHAT */}
      {showChat && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-end z-50 select-none">
          <div className="bg-[#0F172A] border-l border-white/5 w-full max-w-md h-full flex flex-col relative shadow-2xl font-sans">
            {/* Header */}
            <div className="p-4 px-5 border-b border-white/5 bg-[#1E293B] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white text-[#1E293B] font-black text-xs flex items-center justify-center border-2 border-[#38BDF8]">
                  {dealer.avatarLetter}
                </div>
                <div>
                  <h3 className="font-black text-white text-xs uppercase tracking-tight leading-tight">{dealer.name} Assistant</h3>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-mono uppercase font-bold mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Representative Live
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-white/50 hover:text-white text-[9px] uppercase tracking-wider font-mono font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-950">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  {msg.sender !== 'user' && (
                    <div className="w-6 h-6 rounded-full bg-white text-[#0F172A] font-extrabold text-[9px] flex items-center justify-center shrink-0 self-end border border-white/15">
                      {dealer.avatarLetter}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-3 px-4 text-xs leading-relaxed shadow ${
                      msg.sender === 'user'
                        ? 'bg-[#F97316] text-white rounded-br-none'
                        : 'bg-[#1E293B] border border-white/5 text-white rounded-bl-none'
                    }`}
                  >
                    <p className="font-sans">{msg.text}</p>
                    <span className="text-[8px] text-white/40 mt-1.5 block text-right font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex gap-2 mr-auto max-w-[80%] items-center text-white/50 pl-8">
                  <div className="flex space-x-1 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full"></div>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold tracking-tight">AI Sales assistant typing...</span>
                </div>
              )}
              <div ref={chatEndRef}></div>
            </div>

            {/* Input Footer Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#1E293B] flex gap-2 shrink-0">
              <input
                className="flex-grow bg-[#0F172A] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#38BDF8] font-sans"
                placeholder={`Ask about regional specifications, pricing, deliveries...`}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isChatLoading}
              />
              <button
                type="submit"
                className="bg-[#F97316] hover:bg-orange-600 disabled:opacity-40 text-white p-3 rounded-xl flex items-center justify-center transition-all shadow cursor-pointer shrink-0"
                disabled={isChatLoading || !userInput.trim()}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
