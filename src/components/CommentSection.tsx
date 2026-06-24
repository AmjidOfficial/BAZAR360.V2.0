import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageCircle } from 'lucide-react';
import { dbAddComment, dbFetchComments, ListingComment } from '../lib/dbService';

interface CommentSectionProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  currentUserName: string;
  currentUserId?: string;
}

export default function CommentSection({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  currentUserName,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<ListingComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && listingId) {
      const loadComments = async () => {
        setLoading(true);
        try {
          const res = await dbFetchComments(listingId);
          setComments(res);
        } catch (err) {
          console.error('Error fetching comments:', err);
        } finally {
          setLoading(false);
        }
      };
      loadComments();
    }
  }, [isOpen, listingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    const commentPayload: ListingComment = {
      id: `comment-${Date.now()}`,
      listingId,
      text: newComment.trim(),
      userName: currentUserName || 'Guest Visitor',
      userId: currentUserId || 'guest',
      createdAt: new Date().toISOString(),
    };

    setSubmitting(true);
    // Optimistic UI update
    setComments((prev) => [...prev, commentPayload]);
    setNewComment('');

    try {
      await dbAddComment(listingId, commentPayload);
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-sm"
          />

          {/* Comment Drawer Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-bg-secondary border-t border-border-main rounded-t-[32px] p-6 pb-8 z-[101] shadow-[0_-12px_40px_rgba(0,0,0,0.6)] text-text-main flex flex-col max-h-[85vh]"
          >
            {/* Header notch */}
            <div className="w-12 h-1.5 bg-border-main rounded-full mx-auto mb-5 shrink-0" />

            <div className="flex items-center justify-between mb-4 shrink-0">
              <div>
                <h3 className="text-base font-extrabold uppercase tracking-tight text-text-main">
                  Social Discussion
                </h3>
                <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider truncate max-w-[320px]">
                  {listingTitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-bg-primary border border-border-main flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Comments List Area */}
            <div className="flex-grow overflow-y-auto py-2 space-y-4 pr-1 min-h-[250px] max-h-[45vh]">
              {loading ? (
                // Skeleton Screen for fast/instant feel
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex gap-3 animate-pulse">
                      <div className="w-9 h-9 bg-border-main rounded-full shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-2.5 bg-border-main rounded w-1/4" />
                        <div className="h-3 bg-border-main rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted">
                  <div className="w-12 h-12 rounded-full bg-border-main flex items-center justify-center text-text-muted/60 mb-3">
                    <MessageCircle size={20} />
                  </div>
                  <p className="text-xs font-medium">No comments on this listing yet.</p>
                  <p className="text-[10px] text-text-muted/70 mt-0.5">Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3 text-left">
                    <div className="w-9 h-9 bg-accent-main/10 border border-accent-main/20 text-accent-main font-bold rounded-full flex items-center justify-center shrink-0 uppercase text-xs">
                      {c.userName.substring(0, 2)}
                    </div>
                    <div className="flex-1 bg-bg-primary border border-border-main rounded-2xl px-4 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-text-main uppercase tracking-tight">
                          {c.userName}
                        </span>
                        <span className="text-[9px] font-mono text-text-muted">
                          {new Date(c.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-text-main mt-1.5 leading-relaxed break-words">
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Send Comment form */}
            <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-border-main flex gap-2 shrink-0">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write an public comment..."
                className="flex-grow bg-bg-primary text-xs text-text-main py-3 px-4 rounded-xl border border-border-main focus:outline-none focus:border-accent-main transition-colors"
                maxLength={250}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="w-11 h-11 bg-accent-main hover:bg-accent-main/90 disabled:bg-border-main disabled:text-text-muted text-stone-950 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md disabled:cursor-not-allowed shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
