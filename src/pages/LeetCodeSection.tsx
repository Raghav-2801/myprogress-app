import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, Search, CheckCircle, Circle, 
  ExternalLink, Github, ChevronDown, ChevronUp,
  Tag, Sparkles, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: number;
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  solution_code: string;
  github_url: string;
  leetcode_url: string;
  is_completed: boolean;
  tags: string[];
}

interface LeetCodeData {
  topic: { id: number; name: string; description: string; color: string } | null;
  questions: Question[];
  stats: { total: number; completed: number; progress: number };
}

interface LeetCodeSectionProps {
  onBack: () => void;
}

const difficultyColors: Record<string, string> = {
  easy: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  hard: 'text-red-600 bg-red-50',
};

export default function LeetCodeSection({ onBack }: LeetCodeSectionProps) {
  const { user } = useAuth();
  const [data, setData] = useState<LeetCodeData | null>(null);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (data) filterQuestions(); }, [searchQuery, difficultyFilter, data]);

  const loadData = async () => {
    try {
      const leetcodeData = await api.getLeetCodeProgress();
      setData(leetcodeData);
      setFilteredQuestions(leetcodeData.questions);
    } catch (error: any) {
      toast.error('Failed to load LeetCode data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuestions = () => {
    if (!data) return;
    let filtered = data.questions;
    if (searchQuery) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(q => q.difficulty === difficultyFilter);
    }
    setFilteredQuestions(filtered);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await api.syncGitHub();
      toast.success(`Synced ${result.created} new, ${result.updated} updated!`);
      await loadData();
    } catch (error: any) {
      toast.error('Failed to sync with GitHub');
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleExpand = (questionId: number) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-kaleo-terracotta animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kaleo-sand pb-20">
      <div className="bg-kaleo-cream border-b border-kaleo-terracotta/10 sticky top-20 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-kaleo-sand rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-kaleo-charcoal" />
              </button>
              <div>
                <h1 className="font-serif text-3xl text-kaleo-charcoal">LeetCode Solutions</h1>
                <p className="text-sm text-kaleo-earth/60 font-sans">Data Structures & Algorithms</p>
              </div>
            </div>
            {user?.is_admin && (
              <button onClick={handleSync} disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-kaleo-terracotta text-white rounded-lg font-sans text-sm hover:bg-kaleo-charcoal transition-colors disabled:opacity-50">
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                Sync from GitHub
              </button>
            )}
          </div>
          {data?.stats && (
            <div className="flex items-center gap-8 mt-6 pt-6 border-t border-kaleo-terracotta/10">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif text-kaleo-charcoal">{data.stats.completed}</span>
                <span className="text-sm text-kaleo-earth/60 font-sans">/ {data.stats.total} solved</span>
              </div>
              <div className="flex-1 max-w-xs">
                <div className="w-full h-2 bg-kaleo-sand rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-kaleo-terracotta to-orange-400 rounded-full"
                    style={{ width: `${data.stats.progress}%` }} />
                </div>
              </div>
              <span className="text-sm font-sans font-medium text-kaleo-terracotta">{data.stats.progress}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-kaleo-earth/40" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems or tags..."
              className="w-full pl-12 pr-4 py-3 bg-kaleo-cream border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal placeholder:text-kaleo-earth/50 focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30" />
          </div>
          <div className="flex gap-2">
            {['all', 'easy', 'medium', 'hard'].map((diff) => (
              <button key={diff} onClick={() => setDifficultyFilter(diff)}
                className={`px-4 py-2 rounded-lg font-sans text-sm capitalize transition-colors ${
                  difficultyFilter === diff ? 'bg-kaleo-terracotta text-white' : 'bg-kaleo-cream text-kaleo-earth hover:bg-kaleo-terracotta/10'
                }`}>
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 text-kaleo-terracotta/30 mx-auto mb-4" />
            <p className="text-kaleo-earth/60 font-sans">No questions found. {user?.is_admin && 'Sync from GitHub!'}</p>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <div key={question.id} className="bg-kaleo-cream rounded-2xl border border-kaleo-terracotta/10 overflow-hidden">
              <button onClick={() => toggleExpand(question.id)}
                className="w-full p-6 flex items-center gap-4 hover:bg-kaleo-sand/50 transition-colors">
                {question.is_completed ? <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" /> : <Circle className="w-6 h-6 text-kaleo-earth/30 flex-shrink-0" />}
                <div className="flex-1 text-left">
                  <h3 className="font-serif text-xl text-kaleo-charcoal">{question.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-sans capitalize ${difficultyColors[question.difficulty]}`}>
                      {question.difficulty}
                    </span>
                    {question.tags?.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-xs text-kaleo-earth/60">
                        <Tag className="w-3 h-3" />{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {question.leetcode_url && (
                    <a href={question.leetcode_url} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-kaleo-sand rounded-lg transition-colors" title="Open on LeetCode">
                      <ExternalLink className="w-5 h-5 text-kaleo-earth/60" />
                    </a>
                  )}
                  {expandedQuestion === question.id ? <ChevronUp className="w-5 h-5 text-kaleo-earth/60" /> : <ChevronDown className="w-5 h-5 text-kaleo-earth/60" />}
                </div>
              </button>

              {expandedQuestion === question.id && (
                <div className="border-t border-kaleo-terracotta/10 p-6">
                  {question.description && (
                    <div className="mb-6">
                      <h4 className="font-sans font-medium text-kaleo-charcoal mb-2">Problem Description</h4>
                      <p className="text-kaleo-earth/80 font-sans text-sm leading-relaxed">{question.description}</p>
                    </div>
                  )}
                  {question.solution_code ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-sans font-medium text-kaleo-charcoal">Solution</h4>
                        {question.github_url && (
                          <a href={question.github_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1 bg-kaleo-sand rounded-lg text-xs font-sans text-kaleo-earth hover:text-kaleo-charcoal transition-colors">
                            <Github className="w-3 h-3" />View on GitHub
                          </a>
                        )}
                      </div>
                      <pre className="bg-kaleo-charcoal text-kaleo-cream p-4 rounded-xl overflow-x-auto text-sm font-mono">
                        <code>{question.solution_code}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-kaleo-earth/60 font-sans">No solution code available yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
