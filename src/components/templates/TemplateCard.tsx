import React from 'react';
import { Clock, Users, Star, Zap } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { QuizTemplate } from '../../types';

interface TemplateCardProps {
  template: QuizTemplate;
  onUse: (template: QuizTemplate) => void;
  onPreview: (template: QuizTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onUse,
  onPreview
}) => {
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      Zap,
      Star,
      Users,
      Clock
    };
    const IconComponent = iconMap[iconName] || Zap;
    return <IconComponent size={24} />;
  };

  return (
    <Card variant="hover" className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: template.color }}
          >
            {getIconComponent(template.icon)}
          </div>
          {template.isPopular && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
              Popular
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="text-gray-500 text-xs">+{template.tags.length - 3} more</span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center">
            <Clock size={14} className="mr-1" />
            {template.estimatedTime}min
          </span>
          <span className="flex items-center">
            <Users size={14} className="mr-1" />
            {template.questionCount} questions
          </span>
          <span className="flex items-center">
            <Star size={14} className="mr-1" />
            {template.usageCount} uses
          </span>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => onPreview(template)}
          >
            Preview
          </Button>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => onUse(template)}
          >
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};