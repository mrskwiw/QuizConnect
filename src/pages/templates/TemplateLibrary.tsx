import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Sparkles, TrendingUp, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { TemplateCard } from '../../components/templates/TemplateCard';
import { TemplatePreview } from '../../components/templates/TemplatePreview';
import { QuizTemplate, TemplateCategory, QuizCategory, QuizDifficulty } from '../../types';
import { templateService } from '../../lib/database';
import { useToast } from '../../contexts/ToastContext';

const TemplateLibrary = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [templates, setTemplates] = useState<QuizTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<QuizTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | ''>('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'name'>('popular');
  const [previewTemplate, setPreviewTemplate] = useState<QuizTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterAndSortTemplates();
  }, [templates, searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      showToast('Failed to load templates', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTemplates = () => {
    let filtered = [...templates];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Apply difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(template => template.difficulty === selectedDifficulty);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.usageCount - a.usageCount;
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = async (template: QuizTemplate) => {
    try {
      // Increment usage count
      await templateService.incrementUsage(template.id);
      
      // Navigate to create quiz with template data
      navigate('/create-quiz', { 
        state: { 
          template: template,
          fromTemplate: true 
        } 
      });
      
      showToast(`Using template: ${template.name}`, 'success');
    } catch (error) {
      console.error('Error using template:', error);
      showToast('Failed to use template', 'error');
    }
  };

  const handlePreview = (template: QuizTemplate) => {
    setPreviewTemplate(template);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSortBy('popular');
  };

  const popularTemplates = templates.filter(t => t.isPopular).slice(0, 4);
  const recentTemplates = templates.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
          Quiz Templates
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Jump-start your quiz creation with professionally designed templates. 
          Choose from a variety of categories and customize to fit your needs.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{templates.length}</p>
            <p className="text-sm text-gray-600">Available Templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{popularTemplates.length}</p>
            <p className="text-sm text-gray-600">Popular Templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {Math.round(templates.reduce((acc, t) => acc + t.estimatedTime, 0) / templates.length)}
            </p>
            <p className="text-sm text-gray-600">Avg. Time (min)</p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Templates */}
      {popularTemplates.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
            Popular Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
                onPreview={handlePreview}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as QuizCategory | '')}
              className="input min-w-[150px]"
            >
              <option value="">All Categories</option>
              <option value="General Knowledge">General Knowledge</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Sports">Sports</option>
              <option value="Technology">Technology</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Language">Language</option>
              <option value="Art">Art</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as QuizDifficulty | '')}
              className="input min-w-[120px]"
            >
              <option value="">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'popular' | 'recent' | 'name')}
              className="input min-w-[120px]"
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Most Recent</option>
              <option value="name">Name A-Z</option>
            </select>

            <Button variant="secondary" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* All Templates */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            All Templates ({filteredTemplates.length})
          </h2>
        </div>

        {filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or browse all templates.
              </p>
              <Button variant="primary" onClick={resetFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
                onPreview={handlePreview}
              />
            ))}
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={handleUseTemplate}
        />
      )}
    </div>
  );
};

export default TemplateLibrary;