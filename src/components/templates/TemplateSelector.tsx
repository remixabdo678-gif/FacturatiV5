import React from 'react';
import { useLicense } from '../../contexts/LicenseContext';
import { Crown, Check } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  allowProSelection?: boolean;
  disabled?: boolean;
}

const templates = [
  {
    id: 'template1',
    name: 'Classique',
    description: 'Mise en page simple et sobre',
    isPro: false,
    preview: '/api/placeholder/200/150'
  },
  {
    id: 'template2',
    name: 'Moderne Coloré',
    description: 'Design moderne avec dégradés',
    isPro: true,
    preview: '/api/placeholder/200/150'
  },
  {
    id: 'template3',
    name: 'Minimaliste',
    description: 'Design épuré noir & blanc',
    isPro: true,
    preview: '/api/placeholder/200/150'
  },
  {
    id: 'template4',
    name: 'Corporate',
    description: 'Professionnel et structuré',
    isPro: true,
    preview: '/api/placeholder/200/150'
  },
  {
    id: 'template5',
    name: 'Premium Élégant',
    description: 'Design luxueux doré/noir',
    isPro: true,
    preview: '/api/placeholder/200/150'
  }
];

export default function TemplateSelector({ selectedTemplate, onTemplateSelect, allowProSelection = true, disabled = false }: TemplateSelectorProps) {
  const { licenseType } = useLicense();

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Choisir un modèle</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {templates.map((template) => {
          const isLocked = template.isPro && licenseType !== 'pro' && !allowProSelection;
          const isSelected = selectedTemplate === template.id;
          
          return (
            <div
              key={template.id}
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                disabled ? 'opacity-50 cursor-not-allowed' :
                isSelected 
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20'
              }`}
              onClick={() => !disabled && onTemplateSelect(template.id)}
            >
              {/* Preview placeholder */}
              <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded mb-3 flex items-center justify-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Aperçu</span>
              </div>
              
              {/* Template info */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">{template.name}</h4>
                  {template.isPro && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{template.description}</p>
                
                {template.isPro && (
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                    licenseType === 'pro' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {licenseType === 'pro' ? 'Disponible' : 'Pro'}
                  </span>
                )}
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {licenseType !== 'pro' && (
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <Crown className="w-4 h-4 inline mr-1" />
            Les modèles Pro sont disponibles en aperçu. Pour les télécharger en PDF, passez à la version Pro !
          </p>
        </div>
      )}
    </div>
  );
}