import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Code, Terminal, Server, ChevronRight, 
  TrendingUp, BookOpen, Star, Sparkles 
} from 'lucide-react';
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
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-kaleo-terracotta">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kaleo-sand">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome message */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-kaleo-terracotta/10 rounded-full mb-6">
              <span className="text-2xl">🐱</span>
              <span className="text-sm font-sans text-kaleo-terracotta tracking-wide">
                Welcome back, {user?.username}!
              </span>
            </div>
            
            <h1 className="font-serif text-5xl sm:text-6xl text-kaleo-charcoal mb-6">
              Learning Progress
            </h1>
            
            <p className="font-sans text-lg text-kaleo-earth/70 max-w-2xl mx-auto">
              Track your journey through Python, Data Structures & Algorithms, and System Design
            </p>
          </div>

          {/* Overall Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="bg-kaleo-cream rounded-2xl p-8 border border-kaleo-terracotta/10 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-kaleo-terracotta/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-kaleo-terracotta" />
                  </div>
                  <div>
                    <p className="text-sm text-kaleo-earth/60 font-sans">Total Questions</p>
                    <p className="text-3xl font-serif text-kaleo-charcoal">
                      {stats.overall.total_questions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-kaleo-cream rounded-2xl p-8 border border-kaleo-terracotta/10 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-kaleo-earth/60 font-sans">Completed</p>
                    <p className="text-3xl font-serif text-kaleo-charcoal">
                      {stats.overall.completed_questions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-kaleo-cream rounded-2xl p-8 border border-kaleo-terracotta/10 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-kaleo-earth/60 font-sans">Progress</p>
                    <p className="text-3xl font-serif text-kaleo-charcoal">
                      {stats.overall.progress_percentage}%
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-kaleo-sand rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-kaleo-terracotta to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${stats.overall.progress_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Topic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topics.map((topic, index) => {
              const IconComponent = iconMap[topic.icon] || Code;
              
              return (
                <button
                  key={topic.id}
                  onClick={() => onTopicClick(topic.slug)}
                  className="group relative bg-kaleo-cream rounded-2xl p-8 border border-kaleo-terracotta/10 shadow-sm hover:shadow-lg transition-all duration-300 text-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Icon */}
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${topic.color}20` }}
                  >
                    <IconComponent 
                      className="w-8 h-8" 
                      style={{ color: topic.color }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="font-serif text-2xl text-kaleo-charcoal mb-2">
                    {topic.name}
                  </h3>
                  <p className="text-kaleo-earth/70 font-sans text-sm mb-6 line-clamp-2">
                    {topic.description}
                  </p>

                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-kaleo-earth/60 font-sans">
                        {topic.completed_count} / {topic.question_count} done
                      </span>
                      <span className="font-sans font-medium" style={{ color: topic.color }}>
                        {topic.progress_percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-kaleo-sand rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${topic.progress_percentage}%`,
                          backgroundColor: topic.color 
                        }}
                      />
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-6 h-6 text-kaleo-terracotta" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
