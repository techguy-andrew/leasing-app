'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { Communication, CommunicationType } from '@/types/communication'

// ===================================================================
// TYPE DEFINITIONS (kept here for single-file portability)
// ===================================================================
interface CommunicationBubbleProps {
  personId: number;
  personName: string;
}

interface CommunicationModalProps {
  personId: number;
  personName: string;
  onClose: () => void;
}

interface CommunicationCardProps {
  communication: Communication;
  isSender: boolean;
}

interface CommunicationInputFormProps {
  currentUserName: string;
  currentUserImageUrl: string | null;
  onSubmit: (content: string, type: CommunicationType) => Promise<void>;
}



// ===================================================================
// SUB-COMPONENT: CommunicationCard
// Displays an individual communication message.
// ===================================================================
const CommunicationCard: React.FC<CommunicationCardProps> = ({ communication, isSender }) => {
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const getBadgeColor = () => {
    switch (communication.type) {
      case 'TEXT':
        return 'bg-sky-100 text-sky-800';
      case 'EMAIL':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const senderClass = isSender ? 'flex-row-reverse' : 'flex-row';
  const bubbleClass = isSender
    ? 'bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl'
    : 'bg-slate-100 text-slate-800 rounded-r-2xl rounded-tl-2xl';

  return (
    <div className={`flex items-end gap-3 w-full ${senderClass}`}>
      <img
        src={communication.senderImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(communication.senderName)}&background=random`}
        alt={communication.senderName}
        className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover flex-shrink-0"
      />
      <div className="flex flex-col max-w-prose">
        <div className={`flex items-center gap-2 mb-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
          <span className="text-sm font-semibold text-slate-700">{communication.senderName}</span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getBadgeColor()}`}>
            {communication.type}
          </span>
        </div>
        <div className={`px-4 py-3 ${bubbleClass} whitespace-pre-wrap break-words shadow-sm`}>
          {communication.content}
        </div>
        <span className={`text-xs text-slate-500 mt-1.5 ${isSender ? 'text-right' : 'text-left'}`}>
            {formatTimestamp(communication.createdAt)}
        </span>
      </div>
    </div>
  );
};

// ===================================================================
// SUB-COMPONENT: CommunicationInputForm
// Input form for creating new communications.
// ===================================================================
const CommunicationInputForm: React.FC<CommunicationInputFormProps> = ({ currentUserName, currentUserImageUrl, onSubmit }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<CommunicationType>('TEXT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;

    setIsSubmitting(true);
    await onSubmit(trimmedContent, type);
    setContent('');
    setIsSubmitting(false);
  };
  
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }
  }, [content]);

  const isDisabled = !content.trim() || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4 bg-white">
      <div className="flex items-start gap-3">
         <img
          src={currentUserImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=random`}
          alt={currentUserName}
          className="w-10 h-10 rounded-full border-2 border-slate-200 object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            className="w-full p-4 bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-slate-300 resize-none text-sm transition max-h-48"
          />
          <div className="flex items-center justify-between mt-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CommunicationType)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-slate-300 transition"
            >
              <option value="TEXT">Text Message</option>
              <option value="EMAIL">Email</option>
            </select>
            <button
              type="submit"
              disabled={isDisabled}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center w-28 ${
                isDisabled
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

// ===================================================================
// SUB-COMPONENT: SkeletonLoader
// A placeholder to show while data is loading.
// ===================================================================
const SkeletonLoader: React.FC = () => (
    <div className="space-y-8 p-4 md:p-8">
        {[...Array(3)].map((_, index) => (
            <div key={index} className={`flex items-start gap-3 ${index % 2 !== 0 ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
                <div className={`flex-1 space-y-2 ${index % 2 !== 0 ? 'flex items-end flex-col' : ''}`}>
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-16 bg-slate-200 rounded-lg w-3/4"></div>
                </div>
            </div>
        ))}
    </div>
);


// ===================================================================
// SUB-COMPONENT: CommunicationModal
// The main modal for viewing and sending communications.
// ===================================================================
const CommunicationModal: React.FC<CommunicationModalProps> = ({ personId, personName, onClose }) => {
  const { user } = useUser();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAndSetCommunications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/people/${personId}/communications`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch communications');
        }

        // Convert string dates to Date objects
        const commsWithDates = data.data.map((comm: { createdAt: string | Date; [key: string]: unknown }) => ({
          ...comm,
          createdAt: new Date(comm.createdAt)
        }));

        setCommunications(commsWithDates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load communications');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndSetCommunications();
  }, [personId]);

  useEffect(() => {
    if (scrollRef.current) {
        setTimeout(() => {
             scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
        }, 100);
    }
  }, [communications]);

  const handleAddCommunication = async (content: string, type: CommunicationType) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/people/${personId}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send communication');
      }

      // Add new communication with Date object
      const newComm: Communication = {
        ...data.data,
        createdAt: new Date(data.data.createdAt)
      };

      setCommunications(prev => [...prev, newComm]);
    } catch (err) {
      console.error('Failed to send communication:', err);
      alert(err instanceof Error ? err.message : 'Failed to send communication');
    }
  };

  const currentUserName = user?.fullName || user?.emailAddresses[0]?.emailAddress || 'You';
  const currentUserImageUrl = user?.imageUrl || null;

  return (
    <div className="fixed inset-0 bg-slate-900/75 z-50 md:flex md:items-center md:justify-center md:p-6 md:backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white flex flex-col w-full h-full overflow-hidden animate-slideInUp md:rounded-2xl md:shadow-2xl md:h-auto md:max-h-[calc(100vh-3rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 py-4 bg-white flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Conversation</h2>
            <p className="text-sm text-slate-600 mt-1">with {personName}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <main ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
          {isLoading ? (
            <SkeletonLoader />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-red-600">
                <p>Error: {error}</p>
            </div>
          ) : communications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-20 h-20 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages yet</h3>
              <p className="text-sm text-slate-500 max-w-sm">Start the conversation by sending a message below.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {communications.map((comm) => (
                <CommunicationCard key={comm.id} communication={comm} isSender={comm.senderName === currentUserName} />
              ))}
            </div>
          )}
        </main>
        
        <CommunicationInputForm
          currentUserName={currentUserName}
          currentUserImageUrl={currentUserImageUrl}
          onSubmit={handleAddCommunication}
        />
      </div>
    </div>
  );
};

// ===================================================================
// MAIN EXPORT: CommunicationBubble
// Floating chat bubble button that toggles the modal.
// ===================================================================
export default function CommunicationBubble({ personId, personName }: CommunicationBubbleProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  return (
    <>
      {!isModalOpen && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center z-40 group animate-bubblePop"
          aria-label="Open communications"
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Contact {personName}
          </div>
        </button>
      )}

      {isModalOpen && (
        <CommunicationModal
          personId={personId}
          personName={personName}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
