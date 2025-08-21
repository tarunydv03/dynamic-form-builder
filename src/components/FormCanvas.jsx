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
          {/* Show logic indicator as a green box if any logic is present or isRequired is true */}
          {(field.triggers && field.triggers.length > 0 || field.repeat && field.repeat.countSource || field.visibleIf || field.enableIf || field.requireIf || field.isRequired) && (
            <div style={{background:'#d4f8e8',color:'#222',padding:'8px',borderRadius:'4px',margin:'8px 0',fontSize:'0.95em'}}>
              <strong>Logic applied:</strong>
              {field.triggers && field.triggers.length > 0 && (
                <span> {field.triggers.length} conditional rule(s),</span>
              )}
              {field.visibleIf && <span> Visibility condition,</span>}
              {field.enableIf && <span> Enable condition,</span>}
              {field.requireIf && <span> Required condition,</span>}
              {field.isRequired && <span> Always required,</span>}
              {field.repeat && field.repeat.countSource && (
                <span> Repeat based on "{formFields.find(f => f.id === field.repeat.countSource)?.title}",</span>
              )}
            </div>
          )}
          {renderFieldPreview()}
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

function GroupQuestionsModal({ formFields, onGroup, onClose }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [groupName, setGroupName] = useState('');

  const handleToggle = (id) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };

  const handleSubmit = () => {
    if (!groupName.trim() || selectedIds.length === 0) return;
    onGroup(selectedIds, groupName.trim());
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{minWidth:350}}>
        <h3>Group Questions</h3>
        <label>Group Heading:</label>
        <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Personal Info" />
        <div style={{margin:'12px 0'}}>
          <label>Select questions to group:</label>
          {formFields.map(q => (
            <div key={q.id}>
              <input type="checkbox" checked={selectedIds.includes(q.id)} onChange={() => handleToggle(q.id)} />
              <span style={{marginLeft:8}}>{q.title}</span>
            </div>
          ))}
        </div>
        <div style={{marginTop:16}}>
          <button onClick={handleSubmit} disabled={!groupName.trim() || selectedIds.length === 0}>OK</button>
          <button onClick={onClose} style={{marginLeft:8}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// The main canvas area where questions are dropped
function FormCanvas({ formFields, setFormFields }) {
  const { setNodeRef } = useDroppable({ id: 'canvas-droppable' });
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);

  // Grouping logic
  const handleGroupQuestions = (ids, groupName) => {
    setFormFields(fields => fields.map(f => ids.includes(f.id) ? { ...f, group: groupName } : f));
  };

  // Group questions by group property
  const grouped = {};
  formFields.forEach(q => {
    const key = q.group || '__ungrouped__';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(q);
  });

  return (
    <section ref={setNodeRef} className="form-canvas">
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
        <button onClick={() => setGroupModalOpen(true)}>Group Questions</button>
      </div>
      {isGroupModalOpen && (
        <GroupQuestionsModal
          formFields={formFields}
          onGroup={handleGroupQuestions}
          onClose={() => setGroupModalOpen(false)}
        />
      )}
      {Object.entries(grouped).map(([group, questions]) => (
        <div key={group} style={{marginBottom:24}}>
          {group !== '__ungrouped__' && (
            <div style={{background:'#e3e3ff',padding:'8px 12px',borderRadius:'6px',fontWeight:'bold',marginBottom:8}}>{group}</div>
          )}
          <SortableContext items={questions.map(f => f.id)} strategy={verticalListSortingStrategy}>
            {questions.map(field => (
              <SortableFormField
                key={field.id}
                field={field}
                formFields={formFields}
                setFormFields={setFormFields}
              />
            ))}
          </SortableContext>
        </div>
      ))}
    </section>
  );
};

export default FormCanvas;