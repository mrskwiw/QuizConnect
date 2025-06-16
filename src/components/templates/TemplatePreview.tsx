import React from 'react';
import { X, Clock, Users, Star, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { QuizTemplate } from '../../types';

interface TemplatePreviewProps {
  template: QuizTemplate;
  onClose: () => void;
  onUse: (template: QuizTemplate) => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onClose,
  onUse
}) => {
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      CheckCircle,
      Star,
      Users,
      Clock
    };
    const IconComponent = iconMap[iconName] || CheckCircle;
    return <IconComponent size={24} />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: template.color }}
            >
              {getIconComponent(template.icon)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{template.name}</h2>
              <p className="text-gray-600">{template.category} • {template.difficulty}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} icon={<X size={20} />} />
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{template.estimatedTime}</p>
                <p className="text-sm text-gray-600">Minutes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{template.questionCount}</p>
                <p className="text-sm text-gray-600">Questions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{template.usageCount}</p>
                <p className="text-sm text-gray-600">Times Used</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{template.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Sample Questions</h3>
            <div className="space-y-4">
              {template.questions.slice(0, 3).map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="text-base">Question {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium mb-3">{question.text}</p>
                    {question.type === 'MultipleChoice' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 border rounded ${
                              question.correctOptions?.includes(optIndex)
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-200'
                            }`}
                          >
                            {option}
                            {question.correctOptions?.includes(optIndex) && (
                              <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {question.type === 'TrueFalse' && (
                      <div className="space-y-2">
                        <div className={`p-2 border rounded ${
                          question.correctOptions?.[0] === 0 ? 'border-green-300 bg-green-50' : 'border-gray-200'
                        }`}>
                          True
                          {question.correctOptions?.[0] === 0 && (
                            <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className={`p-2 border rounded ${
                          question.correctOptions?.[0] === 1 ? 'border-green-300 bg-green-50' : 'border-gray-200'
                        }`}>
                          False
                          {question.correctOptions?.[0] === 1 && (
                            <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    )}
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {template.questions.length > 3 && (
                <p className="text-center text-gray-500 text-sm">
                  And {template.questions.length - 3} more questions...
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" onClick={() => onUse(template)}>
              Use This Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};