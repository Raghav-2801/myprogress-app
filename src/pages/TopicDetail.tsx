import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Topic {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  question_count: number;
  completed_count: number;
  progress_percentage: number;
}

interface TopicDetailProps {
  topicId: number;
  onBack: () => void;
}

export default function TopicDetail({ topicId, onBack }: TopicDetailProps) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTopic();
  }, [topicId]);

  const loadTopic = async () => {
    try {
      const data = await api.getTopics();
      const found = data.find((t: Topic) => t.id === topicId);
      if (found) setTopic(found);
    } catch (error: any) {
      toast.error('Failed to load topic');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-kaleo-terracotta animate-spin" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-kaleo-earth/60 font-sans">Topic not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kaleo-sand pb-20">
      <div className="bg-kaleo-cream border-b border-kaleo-terracotta/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-kaleo-sand rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-kaleo-charcoal" />
            </button>
            <div>
              <h1 className="font-serif text-3xl text-kaleo-charcoal">{topic.name}</h1>
              <p className="text-sm text-kaleo-earth/60 font-sans">{topic.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-kaleo-cream rounded-2xl p-8 border border-kaleo-terracotta/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${topic.color}20` }}>
              <BookOpen className="w-8 h-8" style={{ color: topic.color }} />
            </div>
            <div>
              <p className="text-sm text-kaleo-earth/60 font-sans">Progress</p>
              <p className="text-2xl font-serif text-kaleo-charcoal">{topic.progress_percentage}%</p>
            </div>
          </div>
          <div className="w-full h-3 bg-kaleo-sand rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${topic.progress_percentage}%`, backgroundColor: topic.color }} />
          </div>
          <p className="mt-4 text-kaleo-earth/70 font-sans">
            {topic.completed_count} of {topic.question_count} questions completed
          </p>
        </div>
      </div>
    </div>
  );
}
