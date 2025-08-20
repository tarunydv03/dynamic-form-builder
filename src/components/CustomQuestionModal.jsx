// src/components/CustomQuestionModal.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { generateCustomUniqueId } from '../utils/idGenerator.js';
import '../App.css';

// Use the custom unique ID generator for question names
const generateUniqueName = () => generateCustomUniqueId();

function CustomQuestionModal({ onSave, onClose }) {
  const [title, setTitle] = useState(''); // SurveyJS uses 'title' for the main label
  const [type, setType] = useState('text');

  // State for simple choices (for radiogroup, checkbox, dropdown, ranking)
  const [choices, setChoices] = useState([{ value: 'item1', text: '' }]);
  
  // State for Matrix questions
  const [matrixRows, setMatrixRows] = useState([{ value: 'row1', text: '' }]);
  const [matrixCols, setMatrixCols] = useState([{ value: 'col1', text: '' }]);

  // Generic handler for updating text in a list (choices, rows, cols)
  const handleListTextChange = (list, setList, index, newText) => {
    const updatedList = list.map((item, i) =>
      i === index ? { ...item, text: newText } : item
    );
    setList(updatedList);
  };
  
  // Generic handler for adding a new item to a list
  const handleListAddItem = (list, setList, prefix) => {
    const newItem = { value: `${prefix}${list.length + 1}`, text: '' };
    setList([...list, newItem]);
  };

  // Generic handler for removing an item from a list
  const handleListRemoveItem = (list, setList, index) => {
    setList(list.filter((_, i) => i !== index));
  }

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a question title.');
      return;
    }

    const newQuestion = {
      id: generateCustomUniqueId(), // Internal ID for dnd-kit
      name: generateUniqueName(), // Unique name for SurveyJS
      type,
      title, // SurveyJS uses 'title', not 'label'
    };
    
    // For Number inputs, add the correct inputType property for SurveyJS
    if (type === 'text-number') {
        newQuestion.type = 'text'; // It's still a 'text' question...
        newQuestion.inputType = 'number'; // ...but of input type 'number'
    }

    // Add choices if the question type requires them
    if (['radiogroup', 'checkbox', 'dropdown', 'ranking'].includes(type)) {
      newQuestion.choices = choices.filter(c => c.text.trim() !== '');
      if(newQuestion.choices.length < 1) {
          alert('Please add at least one choice.');
          return;
      }
    }

    // Add matrix properties if the question type is 'matrix'
    if (type === 'matrix') {
      newQuestion.rows = matrixRows.filter(r => r.text.trim() !== '');
      newQuestion.columns = matrixCols.filter(c => c.text.trim() !== '');
      if(newQuestion.rows.length < 1 || newQuestion.columns.length < 1) {
          alert('Please add at least one row and one column for the matrix.');
          return;
      }
    }
    
    // Add default boolean labels if type is 'boolean'
    if (type === 'boolean') {
        newQuestion.labelTrue = 'Yes';
        newQuestion.labelFalse = 'No';
    }

    onSave(newQuestion);
    onClose();
  };
  
  // Reusable UI component for editing a list of items (choices, rows, or columns)
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
                        onChange={(e) => handleListTextChange(list, setList, index, e.target.value)}
                    />
                    {list.length > 1 && (
                        <button onClick={() => handleListRemoveItem(list, setList, index)} className="remove-choice-btn">-</button>
                    )}
                </div>
            ))}
            <button onClick={() => handleListAddItem(list, setList, prefix)} className="add-choice-btn">Add {prefix}</button>
        </div>
    </div>
  );
  
  // Determine which specialized editor to show based on the selected question type
  const showChoicesEditor = ['radiogroup', 'checkbox', 'dropdown', 'ranking'].includes(type);
  const showMatrixEditor = type === 'matrix';

  const modalContent = (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Create Custom Question</h3>

        <div className="modal-section">
          <label htmlFor="question-title">Question Title</label>
          <input id="question-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., How satisfied are you with our service?"/>
        </div>

        <div className="modal-section">
          <label htmlFor="question-type">Question Type</label>
          <select id="question-type" value={type} onChange={(e) => setType(e.target.value)}>
            <optgroup label="Basic Inputs">
              <option value="text">Single Line Text</option>
              <option value="comment">Paragraph Text</option>
              <option value="text-number">Number Input</option>
            </optgroup>
            <optgroup label="Choices">
              <option value="radiogroup">Radio Buttons (Select One)</option>
              <option value="checkbox">Checkboxes (Select Many)</option>
              <option value="dropdown">Dropdown (Select One)</option>
              <option value="boolean">Yes/No Switch</option>
            </optgroup>
             <optgroup label="Advanced">
              <option value="rating">Rating (Stars)</option>
              <option value="matrix">Matrix (Grid)</option>
              <option value="ranking">Ranking</option>
              <option value="file">File Upload</option>
            </optgroup>
          </select>
        </div>

        {/* Conditionally render the correct editor for the selected type */}
        {showChoicesEditor && <ListEditor title="Choices" list={choices} setList={setChoices} prefix="Choice" />}
        {showMatrixEditor && (
            <>
                <ListEditor title="Rows (the questions on the left)" list={matrixRows} setList={setMatrixRows} prefix="Row" />
                <ListEditor title="Columns (the answer options at the top)" list={matrixCols} setList={setMatrixCols} prefix="Column" />
            </>
        )}

        <div className="modal-actions">
          <button onClick={handleSave}>Add Question to Form</button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default CustomQuestionModal;