import React from 'react';
import { useState } from 'react';
import { useLicense } from '../../contexts/LicenseContext';
import { Crown, Check, X } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  allowProSelection?: boolean;
  disabled?: boolean;
}

const templates = [
  {
    id: 'template1',
    name: 'Classic Free',
    description: 'Mise en page simple et sobre (gratuit)',
    isPro: false,
    preview: 'https://i.ibb.co/YBV0zw2v/T1.png'
  },
  {
    id: 'template2',
    name: 'Noir Classique Pro',
    description: 'Design classique avec fond noir',
    isPro: true,
    preview: 'https://i.ibb.co/d4xfv93F/T2.png'
  },
  {
    id: 'template3',
    name: 'Moderne avec formes vertes Pro',
    description: 'Design moderne avec éléments verts',
    isPro: true,
    preview: 'https://i.ibb.co/wh4V38jY/T3.png'
  },
  {
    id: 'template4',
    name: 'Bleu Élégant Pro',
    description: 'Design élégant avec thème bleu',
    isPro: true,
    preview: 'https://i.ibb.co/cPChhS4/T4.png'
  },
  {
    id: 'template5',
    name: 'Minimal Bleu Pro',
    description: 'Design minimaliste avec accents bleus',
    isPro: true,
    preview: 'https://i.ibb.co/p64GL1nQ/T5.png'
  }
];

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  allowProSelection?: boolean;
  disabled?: boolean;
  showPreviewButton?: boolean;
}

export default function TemplateSelector({ selectedTemplate, onTemplateSelect, allowProSelection = true, disabled = false, showPreviewButton = false }: TemplateSelectorProps) {
  const { licenseType } = useLicense();
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  return (
    <>
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
              <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded mb-3 flex items-center justify-center relative overflow-hidden">
                <img 
                  src={template.preview} 
                  alt={`Aperçu ${template.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Aperçu</span>
                </div>
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
              
              {/* Preview button */}
              {showPreviewButton && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewTemplate(template.id);
                  }}
                  className="w-full mt-2 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Aperçu
                </button>
              )}
              
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
    
    {/* Preview Modal */}
    {previewTemplate && (
      <div className="fixed inset-0 z-[70] bg-black bg-opacity-75 flex items-center justify-center p-4">
        <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Aperçu - {templates.find(t => t.id === previewTemplate)?.name}
            </h3>
            <button
              onClick={() => setPreviewTemplate(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-4">
            <img 
              src={templates.find(t => t.id === previewTemplate)?.preview}
              alt={`Aperçu ${templates.find(t => t.id === previewTemplate)?.name}`}
              className="w-full h-auto max-h-[70vh] object-contain rounded"
            />
          </div>
        </div>
      </div>
    )}
    </>
  );
}