import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Plus,
  Save,
  X,
  CheckCircle,
  Loader2,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminPanelProps {
  onBack: () => void;
}

interface QuestionForm {
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  solution_code: string;
  leetcode_url: string;
  tags: string;
}

interface TopicForm {
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  display_order: number;
}

interface Topic {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  display_order: number;
  question_count: number;
  completed_count: number;
  progress_percentage: number;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'questions' | 'topics' | 'sync'>(
    'questions',
  );
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    title: '',
    slug: '',
    difficulty: 'medium',
    description: '',
    solution_code: '',
    leetcode_url: '',
    tags: '',
  });

  // Topics state
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [topicForm, setTopicForm] = useState<TopicForm>({
    name: '',
    slug: '',
    description: '',
    category: 'leetcode',
    icon: '📚',
    color: '#d4745c',
    display_order: 0,
  });

  // Fetch topics when Topics tab is active
  useEffect(() => {
    if (activeTab === 'topics') {
      fetchTopics();
    }
  }, [activeTab]);

  const fetchTopics = async () => {
    try {
      const data = await api.getTopics();
      setTopics(data);
    } catch (error: any) {
      toast.error('Failed to fetch topics: ' + error.message);
    }
  };

  const handleAddOrUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTopicId) {
        await api.updateTopic(editingTopicId, topicForm);
        toast.success('Topic updated!');
      } else {
        await api.createTopic(topicForm);
        toast.success('Topic added!');
      }
      setIsAddingTopic(false);
      setEditingTopicId(null);
      setTopicForm({
        name: '',
        slug: '',
        description: '',
        category: 'leetcode',
        icon: '📚',
        color: '#d4745c',
        display_order: 0,
      });
      fetchTopics();
    } catch (error: any) {
      toast.error(
        `Failed to ${editingTopicId ? 'update' : 'add'} topic: ` +
          error.message,
      );
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setTopicForm({
      name: topic.name,
      slug: topic.slug,
      description: topic.description || '',
      category: topic.category,
      icon: topic.icon || '📚',
      color: topic.color || '#d4745c',
      display_order: topic.display_order,
    });
    setIsAddingTopic(true);
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (
      !confirm(
        'Are you sure you want to delete this topic? All questions in this topic will also be affected.',
      )
    ) {
      return;
    }
    try {
      await api.deleteTopic(topicId);
      toast.success('Topic deleted!');
      fetchTopics();
    } catch (error: any) {
      toast.error('Failed to delete topic: ' + error.message);
    }
  };

  const cancelTopicForm = () => {
    setIsAddingTopic(false);
    setEditingTopicId(null);
    setTopicForm({
      name: '',
      slug: '',
      description: '',
      category: 'leetcode',
      icon: '📚',
      color: '#d4745c',
      display_order: 0,
    });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await api.syncGitHub();
      toast.success(
        `Synced! Created: ${result.created}, Updated: ${result.updated}`,
      );
    } catch (error: any) {
      toast.error('Sync failed: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createQuestion({
        ...questionForm,
        topic_id: 2, // LeetCode topic
        tags: questionForm.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        solution_language: 'python',
      });
      toast.success('Question added!');
      setIsAddingQuestion(false);
      setQuestionForm({
        title: '',
        slug: '',
        difficulty: 'medium',
        description: '',
        solution_code: '',
        leetcode_url: '',
        tags: '',
      });
    } catch (error: any) {
      toast.error('Failed to add question: ' + error.message);
    }
  };

  if (!user?.is_admin) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-center'>
          <Sparkles className='w-12 h-12 text-kaleo-terracotta/30 mx-auto mb-4' />
          <p className='text-kaleo-earth/60 font-sans'>Admin access only 🐱</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-kaleo-sand pb-20'>
      <div className='bg-kaleo-cream border-b border-kaleo-terracotta/10'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center gap-4'>
            <button
              onClick={onBack}
              className='p-2 hover:bg-kaleo-sand rounded-lg transition-colors'
            >
              <ArrowLeft className='w-5 h-5 text-kaleo-charcoal' />
            </button>
            <div>
              <h1 className='font-serif text-3xl text-kaleo-charcoal'>
                Admin Panel
              </h1>
              <p className='text-sm text-kaleo-earth/60 font-sans'>
                Manage your learning content
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex gap-2 mb-8'>
          {['questions', 'topics', 'sync'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-sans text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-kaleo-terracotta text-white'
                  : 'bg-kaleo-cream text-kaleo-earth hover:bg-kaleo-terracotta/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'sync' && (
          <div className='bg-kaleo-cream rounded-2xl p-8 border border-kaleo-terracotta/10'>
            <h2 className='font-serif text-2xl text-kaleo-charcoal mb-4'>
              GitHub Sync
            </h2>
            <p className='text-kaleo-earth/70 font-sans mb-6'>
              Sync your LeetCode solutions from GitHub repository automatically.
            </p>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className='flex items-center gap-2 px-6 py-3 bg-kaleo-terracotta text-white rounded-xl font-sans hover:bg-kaleo-charcoal transition-colors disabled:opacity-50'
            >
              {isSyncing ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                <CheckCircle className='w-5 h-5' />
              )}
              {isSyncing ? 'Syncing...' : 'Sync from GitHub'}
            </button>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className='space-y-6'>
            {!isAddingQuestion ? (
              <button
                onClick={() => setIsAddingQuestion(true)}
                className='flex items-center gap-2 px-4 py-2 bg-kaleo-terracotta text-white rounded-lg font-sans hover:bg-kaleo-charcoal transition-colors'
              >
                <Plus className='w-4 h-4' /> Add Question
              </button>
            ) : (
              <form
                onSubmit={handleAddQuestion}
                className='bg-kaleo-cream rounded-2xl p-6 border border-kaleo-terracotta/10 space-y-4'
              >
                <div className='flex items-center justify-between'>
                  <h3 className='font-serif text-xl text-kaleo-charcoal'>
                    Add New Question
                  </h3>
                  <button
                    type='button'
                    onClick={() => setIsAddingQuestion(false)}
                    className='p-2 hover:bg-kaleo-sand rounded-lg'
                  >
                    <X className='w-5 h-5 text-kaleo-earth' />
                  </button>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <input
                    type='text'
                    placeholder='Title'
                    value={questionForm.title}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        title: e.target.value,
                      })
                    }
                    className='px-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30'
                    required
                  />
                  <input
                    type='text'
                    placeholder='Slug (e.g., two-sum)'
                    value={questionForm.slug}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, slug: e.target.value })
                    }
                    className='px-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30'
                    required
                  />
                </div>
                <select
                  value={questionForm.difficulty}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      difficulty: e.target.value,
                    })
                  }
                  className='px-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30'
                >
                  <option value='easy'>Easy</option>
                  <option value='medium'>Medium</option>
                  <option value='hard'>Hard</option>
                </select>
                <textarea
                  placeholder='Description'
                  value={questionForm.description}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      description: e.target.value,
                    })
                  }
                  className='w-full px-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30'
                  rows={3}
                />
                <textarea
                  placeholder='Solution Code (Python)'
                  value={questionForm.solution_code}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      solution_code: e.target.value,
                    })
                  }
                  className='w-full px-4 py-3 bg-kaleo-charcoal text-kaleo-cream rounded-xl font-mono text-sm focus:outline-none'
                  rows={8}
                />
                <input
                  type='text'
                  placeholder='LeetCode URL'
                  value={questionForm.leetcode_url}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      leetcode_url: e.target.value,
                    })
                  }
                  className='w-full px-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30'
                />
                <input
                  type='text'
                  placeholder='Tags (comma separated)'
                  value={questionForm.tags}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, tags: e.target.value })
                  }
                  className='w-full px-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30'
                />
                <button
                  type='submit'
                  className='flex items-center gap-2 px-6 py-3 bg-kaleo-terracotta text-white rounded-xl font-sans hover:bg-kaleo-charcoal transition-colors'
                >
                  <Save className='w-4 h-4' /> Save Question
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'topics' && (
          <div className='space-y-6'>
            {!isAddingTopic ? (
              <button
                onClick={() => setIsAddingTopic(true)}
                className='flex items-center gap-2 px-4 py-2 bg-kaleo-terracotta text-white rounded-lg font-sans hover:bg-kaleo-charcoal transition-colors'
              >
                <Plus className='w-4 h-4' /> Add Topic
              </button>
            ) : (
              <form
                onSubmit={handleAddOrUpdateTopic}
                className='bg-kaleo-cream rounded-2xl p-6 border border-kaleo-terracotta/10 space-y-4'
              >
                <div className='flex items-center justify-between'>
                  <h3 className='font-serif text-xl text-kaleo-charcoal'>
                    {editingTopicId ? 'Edit Topic' : 'Add New Topic'}
                  </h3>
                  <button
                    type='button'
                    onClick={cancelTopicForm}
                    className='p-2 hover:bg-kaleo-sand rounded-lg'
                  >
                    <X className='w-5 h-5 text-kaleo-earth' />
                  </button>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <input
                    type='text'
                    placeholder='Topic Name'
                    value={topicForm.name}
                    onChange={(e) =>
                      setTopicForm({ ...topicForm, name: e.target.value })
                    }
                    className='px-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30'
                    required
                  />
                  <input
                    type='text'
                    placeholder='Slug (e.g., arrays)'
                    value={topicForm.slug}
                    onChange={(e) =>
                      setTopicForm({ ...topicForm, slug: e.target.value })
                    }
                    className='px-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30'
                    required
                  />
                </div>
                <textarea
                  placeholder='Description'
                  value={topicForm.description}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, description: e.target.value })
                  }
                  className='w-full px-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30'
                  rows={3}
                />
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <input
                    type='text'
                    placeholder='Icon (emoji)'
                    value={topicForm.icon}
                    onChange={(e) =>
                      setTopicForm({ ...topicForm, icon: e.target.value })
                    }
                    className='px-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30'
                  />
                  <input
                    type='text'
                    placeholder='Color (hex)'
                    value={topicForm.color}
                    onChange={(e) =>
                      setTopicForm({ ...topicForm, color: e.target.value })
                    }
                    className='px-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30'
                  />
                  <input
                    type='number'
                    placeholder='Display Order'
                    value={topicForm.display_order}
                    onChange={(e) =>
                      setTopicForm({
                        ...topicForm,
                        display_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className='px-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30'
                  />
                </div>
                <select
                  value={topicForm.category}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, category: e.target.value })
                  }
                  className='px-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30'
                >
                  <option value='leetcode'>LeetCode</option>
                  <option value='general'>General</option>
                  <option value='system-design'>System Design</option>
                </select>
                <button
                  type='submit'
                  className='flex items-center gap-2 px-6 py-3 bg-kaleo-terracotta text-white rounded-xl font-sans hover:bg-kaleo-charcoal transition-colors'
                >
                  <Save className='w-4 h-4' />{' '}
                  {editingTopicId ? 'Update Topic' : 'Save Topic'}
                </button>
              </form>
            )}

            {/* Topics List */}
            <div className='space-y-3'>
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className='bg-kaleo-cream rounded-xl p-5 border border-kaleo-terracotta/10 hover:border-kaleo-terracotta/30 transition-colors'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-3 flex-1'>
                      <div className='text-3xl'>{topic.icon || '📚'}</div>
                      <div className='flex-1'>
                        <h3 className='font-serif text-lg text-kaleo-charcoal'>
                          {topic.name}
                        </h3>
                        {topic.description && (
                          <p className='text-sm text-kaleo-earth/70 font-sans mt-1'>
                            {topic.description}
                          </p>
                        )}
                        <div className='flex items-center gap-4 mt-2 text-xs text-kaleo-earth/60 font-sans'>
                          <span>Slug: {topic.slug}</span>
                          <span>Category: {topic.category}</span>
                          <span>{topic.question_count} questions</span>
                          <span>
                            {topic.progress_percentage.toFixed(0)}% complete
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 ml-4'>
                      <button
                        onClick={() => handleEditTopic(topic)}
                        className='p-2 hover:bg-kaleo-sand rounded-lg transition-colors text-kaleo-earth'
                      >
                        <Edit2 className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        className='p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {topics.length === 0 && !isAddingTopic && (
                <div className='bg-kaleo-cream rounded-2xl p-8 border border-kaleo-terracotta/10 text-center'>
                  <Sparkles className='w-12 h-12 text-kaleo-terracotta/30 mx-auto mb-4' />
                  <p className='text-kaleo-earth/60 font-sans'>
                    No topics yet. Add your first topic!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
