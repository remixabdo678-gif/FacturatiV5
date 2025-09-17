import React from 'react';
import { Invoice, Quote } from '../../contexts/DataContext';
import Template1Classic from './Template1Classic';
import Template2Modern from './Template2Modern';
import Template3Minimal from './Template3Minimal';
import Template4Corporate from './Template4Corporate';
import Template5Premium from './Template5Premium';

interface TemplateRendererProps {
  templateId: string;
  data: Invoice | Quote;
  type: 'invoice' | 'quote';
  includeSignature?: boolean;
}

export default function TemplateRenderer({ templateId, data, type, includeSignature = false }: TemplateRendererProps) {
  switch (templateId) {
    case 'template1':
      return <Template1Classic data={data} type={type} includeSignature={includeSignature} />;
    case 'template2':
      return <Template2Modern data={data} type={type} includeSignature={includeSignature} />;
    case 'template3':
      return <Template3Minimal data={data} type={type} includeSignature={includeSignature} />;
    case 'template4':
      return <Template4Corporate data={data} type={type} includeSignature={includeSignature} />;
    case 'template5':
      return <Template5Premium data={data} type={type} includeSignature={includeSignature} />;
    default:
      return <Template1Classic data={data} type={type} includeSignature={includeSignature} />;
  }
}