import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Code, Terminal, Server, ChevronRight } from 'lucide-react';
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

interface ProgressStats {
  overall: {
    total_questions: number;
    completed_questions: number;
    progress_percentage: number;
  };
  by_topic: Array<{
    topic: string;
    slug: string;
    total: number;
    completed: number;
    progress: number;
  }>;
}

const iconMap: Record<string, React.ElementType> = {
  code: Code,
  terminal: Terminal,
  server: Server,
};

interface DashboardProps {
  onTopicClick: (slug: string) => void;
}

export default function Dashboard({ onTopicClick }: DashboardProps) {
  const { user, token } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [topicsData, statsData] = await Promise.all([
        api.getTopics(),
        api.getProgressStats(),
      ]);
      setTopics(topicsData);
      setStats(statsData);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-kaleo-sand flex items-center justify-center'>
        <div className='text-kaleo-terracotta text-xl'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-kaleo-sand'>
      {/* Hero Section */}
      <div className='px-8 pt-16 pb-12 text-center'>
        {/* Welcome message */}
        <div className='inline-flex items-center gap-2 bg-kaleo-cream rounded-full px-4 py-2 mb-8 text-sm text-kaleo-brown border border-kaleo-terracotta/20'>
          <span>🐱</span>
          <span> Welcome back, {user?.username}! </span>
        </div>

        <h1 className='font-playfair text-6xl md:text-7xl font-bold text-kaleo-brown mb-6'>
          Learning Progress
        </h1>
        <p className='text-kaleo-brown/70 text-xl max-w-2xl mx-auto'>
          Track your journey through Python, Data Structures & Algorithms, and
          System Design
        </p>
      </div>

      {/* Overall Stats */}
      {stats && (
        <div className='px-8 pb-8 max-w-4xl mx-auto'>
          <div className='grid grid-cols-3 gap-4 bg-kaleo-cream rounded-2xl p-6 border border-kaleo-terracotta/10'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-kaleo-brown'>
                {stats.overall.total_questions}
              </div>
              <div className='text-kaleo-brown/60 text-sm mt-1'>
                Total Questions
              </div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-kaleo-terracotta'>
                {stats.overall.completed_questions}
              </div>
              <div className='text-kaleo-brown/60 text-sm mt-1'>Completed</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-kaleo-brown'>
                {stats.overall.progress_percentage}%
              </div>
              <div className='text-kaleo-brown/60 text-sm mt-1'>Progress</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className='mt-3 h-2 bg-kaleo-cream rounded-full overflow-hidden border border-kaleo-terracotta/10'>
            <div
              className='h-full bg-kaleo-terracotta rounded-full transition-all duration-1000'
              style={{ width: `${stats.overall.progress_percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Topic Cards */}
      <div className='px-8 pb-16 max-w-4xl mx-auto grid gap-4'>
        {topics.map((topic, index) => {
          const IconComponent = iconMap[topic.icon] || Code;
          return (
            <button
              key={topic.id}
              onClick={() => onTopicClick(topic.slug)}
              className='group relative bg-kaleo-cream rounded-2xl p-8 border border-kaleo-terracotta/10 shadow-sm hover:shadow-lg transition-all duration-300 text-left'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div
                className='w-12 h-12 rounded-xl flex items-center justify-center mb-4'
                style={{
                  backgroundColor: topic.color + '20',
                  color: topic.color,
                }}
              >
                <IconComponent className='w-6 h-6' />
              </div>

              {/* Content */}
              <h3 className='font-playfair text-2xl font-bold text-kaleo-brown mb-2'>
                {topic.name}
              </h3>
              <p className='text-kaleo-brown/60 text-sm mb-4'>
                {topic.description}
              </p>

              {/* Progress */}
              <div className='flex items-center gap-2 text-xs text-kaleo-brown/50'>
                <span>
                  {topic.completed_count} / {topic.question_count} done
                </span>
                <span> </span>
                <span>{topic.progress_percentage}%</span>
              </div>

              {/* Arrow */}
              <ChevronRight className='absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-kaleo-terracotta/40 group-hover:text-kaleo-terracotta group-hover:translate-x-1 transition-all duration-200' />
            </button>
          );
        })}
      </div>
    </div>
  );
}
