import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { FIELD_TYPES } from '../../utils/constants';

export const ApplicationResponse = ({ 
  field, 
  value, 
  onChange, 
  readOnly = false 
}) => {
  const InputComponent = field.type === FIELD_TYPES.TEXTAREA ? Textarea : Input;
  
  return (
    <div className="space-y-2">
      <Label htmlFor={`field-${field.id}`}>
        {field.name}
        {field.is_required && <span className="text-red-500">*</span>}
      </Label>
      <InputComponent
        id={`field-${field.id}`}
        value={value || ''}
        onChange={e => onChange?.(field.id, e.target.value)}
        placeholder={field.options || ''}
        readOnly={readOnly}
        className={readOnly ? 'bg-gray-50' : ''}
      />
    </div>
  );
};