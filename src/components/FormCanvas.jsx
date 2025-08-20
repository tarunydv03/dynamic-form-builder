// src/components/FormCanvas.jsx
import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LogicEditor from './LogicEditor.jsx';
import EditQuestionModal from './EditQuestionModal.jsx';

// A single form field item in the canvas, which is sortable
function SortableFormField({ field, formFields, setFormFields }) {
  const [isLogicEditorOpen, setLogicEditorOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const removeField = () => {
    setFormFields(fields => fields.filter(f => f.id !== field.id));
  };

  const handleSaveChanges = (updatedField) => {
    setFormFields(prevFields => 
      prevFields.map(f => (f.id === updatedField.id ? updatedField : f))
    );
  };

  const renderFieldPreview = () => {
    switch(field.type) {
      case 'text':
      case 'number':
        return <input type={field.type} placeholder={field.placeholder || '...'} disabled />;
      case 'comment':
        return <textarea placeholder="..." rows="2" disabled />;
      case 'radiogroup':
      case 'checkbox':
      case 'dropdown':
      case 'ranking':
        return (
            <select disabled>
                <option>Choices configured...</option>
                {field.choices.map((c, i) => <option key={i}>{c.text || `Choice ${i+1}`}</option>)}
            </select>
        );
      case 'matrix':
         return <p className="preview-text">Matrix: {field.rows.length} rows, {field.columns.length} columns</p>
      default:
        return <p className="preview-text">Type: {field.type}</p>;
    }
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="form-field">
        <div className="drag-handle" {...attributes} {...listeners}>
          <svg viewBox="0 0 20 20" width="12"><path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 6zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 12z"></path></svg>
        </div>

        <div className="field-content">
          <label>{field.title}</label>
          {renderFieldPreview()}
          
          {field.triggers && field.triggers.length > 0 && (
            <p className="logic-indicator"><strong>Conditional Logic:</strong> {field.triggers.length} rule(s) applied.</p>
          )}
          {field.repeat && field.repeat.countSource && (
            <p className="logic-indicator"><strong>Repeat Logic:</strong> Repeats based on "{formFields.find(f => f.id === field.repeat.countSource)?.title}".</p>
          )}
          
          <div className="field-actions">
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                setIsEditModalOpen(true);
              }}
              className="edit-btn"
            >
              Edit
            </button>
            <button onClick={() => setLogicEditorOpen(true)}>Add Logic</button>
            <button onClick={removeField} className="remove-btn">Remove</button>
          </div>
        </div>
      </div>
      
      {isLogicEditorOpen && (
        <LogicEditor
            field={field}
            formFields={formFields}
            setFormFields={setFormFields}
            onClose={() => setLogicEditorOpen(false)}
        />
      )}
      
      {isEditModalOpen && (
        <EditQuestionModal
            field={field}
            onSave={handleSaveChanges}
            onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
}

// The main canvas area where questions are dropped
function FormCanvas({ formFields, setFormFields }) {
  const { setNodeRef } = useDroppable({ id: 'canvas-droppable' });

  return (
    <section ref={setNodeRef} className="form-canvas">
      {formFields.length === 0 ? (
        <p className="canvas-placeholder">Drop questions here to build your form</p>
      ) : (
        <SortableContext items={formFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          {formFields.map(field => (
            <SortableFormField
                key={field.id}
                field={field}
                formFields={formFields}
                setFormFields={setFormFields}
            />
          ))}
        </SortableContext>
      )}
    </section>
  );
}

export default FormCanvas;