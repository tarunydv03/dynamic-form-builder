// src/components/SaveLoadModal.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../App.css';

function SaveLoadModal({ onSave, onLoad, onClose }) {
  const [savedForms, setSavedForms] = useState([]);
  const [formName, setFormName] = useState('');

  // When the modal opens, load the list of saved forms from localStorage
  useEffect(() => {
    const formsIndex = JSON.parse(localStorage.getItem('savedFormsIndex')) || [];
    setSavedForms(formsIndex);
  }, []);

  const handleSave = () => {
    if (!formName.trim()) {
      alert('Please enter a name for the form.');
      return;
    }
    onSave(formName);
    onClose();
  };

  const handleLoad = (name) => {
    onLoad(name);
    onClose();
  };
  
  const handleDelete = (nameToDelete) => {
    if (window.confirm(`Are you sure you want to delete the form "${nameToDelete}"?`)) {
        // Remove from the index
        const newIndex = savedForms.filter(form => form.name !== nameToDelete);
        localStorage.setItem('savedFormsIndex', JSON.stringify(newIndex));
        // Remove the actual form data
        localStorage.removeItem(`form_${nameToDelete}`);
        // Update the UI
        setSavedForms(newIndex);
    }
  }

  const modalContent = (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Save / Load Form</h3>

        <div className="modal-section save-section">
          <h4>Save Current Form</h4>
          <div className="save-row">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter form name..."
            />
            <button onClick={handleSave} className="save-load-btn">Save</button>
          </div>
        </div>
        
        <div className="modal-section load-section">
            <h4>Load an Existing Form</h4>
            <div className="saved-forms-list">
                {savedForms.length === 0 ? (
                    <p>No saved forms found.</p>
                ) : (
                    savedForms.map(form => (
                        <div key={form.name} className="saved-form-row">
                            <span>{form.name} <small>(Saved: {new Date(form.savedAt).toLocaleString()})</small></span>
                            <div className="saved-form-actions">
                                <button onClick={() => handleLoad(form.name)} className="save-load-btn">Load</button>
                                <button onClick={() => handleDelete(form.name)} className="remove-btn">Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">Close</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default SaveLoadModal;