// src/components/EditQuestionModal.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../App.css';

function EditQuestionModal({ field, onSave, onClose }) {
  const [title, setTitle] = useState(field.title);
  const [choices, setChoices] = useState(field.choices || [{ value: 'item1', text: '' }]);
  const [matrixRows, setMatrixRows] = useState(field.rows || [{ value: 'row1', text: '' }]);
  const [matrixCols, setMatrixCols] = useState(field.columns || [{ value: 'col1', text: '' }]);

  // Generic handler for updating text in lists
  const handleListChange = (list, setList, index, newText) => {
    const updatedList = list.map((item, i) =>
      i === index ? { ...item, text: newText } : item
    );
    setList(updatedList);
  };
  
  // Generic handler for adding items to lists
  const handleListAdd = (list, setList, prefix) => {
    const newItem = { value: `${prefix}${list.length + 1}`, text: '' };
    setList([...list, newItem]);
  };
  
  // Generic handler for removing items from lists
  const handleListRemove = (list, setList, index) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Question title cannot be empty.');
      return;
    }
    const updatedField = { ...field, title };
    if (['radiogroup', 'checkbox', 'dropdown', 'ranking'].includes(field.type)) {
      updatedField.choices = choices.filter(c => c.text.trim() !== '');
    }
    if (field.type === 'matrix') {
      updatedField.rows = matrixRows.filter(r => r.text.trim() !== '');
      updatedField.columns = matrixCols.filter(c => c.text.trim() !== '');
    }
    onSave(updatedField);
    onClose();
  };
  
  // A sub-component for rendering the list editors
  const ListEditor = ({ title, list, setList, prefix }) => (
     <div className="modal-section">
        <label>{title}</label>
        <div className="choice-editor">
            {list.map((item, index) => (
                <div key={index} className="choice-row">
                    <input
                        type="text"
                        value={item.text}
                        placeholder={`${prefix} ${index + 1}`}
                        onChange={(e) => handleListChange(list, setList, index, e.target.value)}
                    />
                     {list.length > 1 && (
              
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => handleListRemove(list, setList, index)}
                          className="remove-choice-btn"
                        >
                          -
                        </button>
                    )}
                </div>
            ))}
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => handleListAdd(list, setList, prefix)}
              className="add-choice-btn"
            >
              Add {prefix}
            </button>
        </div>
    </div>
  );
  
  const showChoicesEditor = ['radiogroup', 'checkbox', 'dropdown', 'ranking'].includes(field.type);
  const showMatrixEditor = field.type === 'matrix';

  const modalContent = (
    // Add onMouseDown to the backdrop to prevent clicks on it from closing the modal via the "Save" button
    <div className="modal-backdrop" onMouseDown={(e) => e.stopPropagation()}>
      <div className="modal-content">
        <h3>Edit Question</h3>

        <div className="modal-section">
          <label htmlFor="question-title">Question Title</label>
          <input id="question-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        
        <div className="modal-section">
            <label>Question Type</label>
            <input type="text" value={field.type} disabled />
        </div>

        {showChoicesEditor && <ListEditor title="Choices" list={choices} setList={setChoices} prefix="Choice" />}
        {showMatrixEditor && (
            <>
                <ListEditor title="Rows" list={matrixRows} setList={setMatrixRows} prefix="Row" />
                <ListEditor title="Columns" list={matrixCols} setList={setMatrixCols} prefix="Column" />
            </>
        )}

        <div className="modal-actions">
          <button onClick={handleSave}>Save Changes</button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default EditQuestionModal;