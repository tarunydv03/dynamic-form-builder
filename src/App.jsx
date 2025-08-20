// src/App.jsx
import React, { useState } from 'react';
import DynamicFormBuilder from './components/DynamicFormBuilder.jsx';
import FormRenderer from './components/FormRenderer.jsx';
import SaveLoadModal from './components/SaveLoadModal.jsx'; // <<<< 1. IMPORT the new modal
import { QUESTION_POOL } from './questions.js';
import './App.css';

function App() {
  const [formFields, setFormFields] = useState([]);
  const [mode, setMode] = useState('build');
  const [isSaveLoadModalOpen, setIsSaveLoadModalOpen] = useState(false); // <<<< 2. ADD state for the modal

  // <<<< 3. ADD the Save and Load functions >>>>
  const handleSaveForm = (formName) => {
    // Get the current index of saved forms, or create a new one
    const savedFormsIndex = JSON.parse(localStorage.getItem('savedFormsIndex')) || [];
    
    // Check if a form with this name already exists
    const existingFormIndex = savedFormsIndex.findIndex(form => form.name === formName);
    
    if (existingFormIndex > -1) {
      // If it exists, ask for confirmation to overwrite
      if (!window.confirm(`A form named "${formName}" already exists. Do you want to overwrite it?`)) {
        return; // User canceled
      }
      // Update the savedAt timestamp
      savedFormsIndex[existingFormIndex].savedAt = new Date().toISOString();
    } else {
      // If it's a new form, add it to the index
      savedFormsIndex.push({ name: formName, savedAt: new Date().toISOString() });
    }

    // Save the updated index and the actual form data
    localStorage.setItem('savedFormsIndex', JSON.stringify(savedFormsIndex));
    localStorage.setItem(`form_${formName}`, JSON.stringify(formFields));
    
    alert(`Form "${formName}" saved successfully!`);
  };

  const handleLoadForm = (formName) => {
    const savedFormJson = localStorage.getItem(`form_${formName}`);
    if (savedFormJson) {
      setFormFields(JSON.parse(savedFormJson));
      alert(`Form "${formName}" loaded successfully!`);
    } else {
      alert(`Error: Could not find a saved form named "${formName}".`);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Dynamic Survey Builder</h1>
        <div className="header-actions">
          {/* <<<< 4. ADD the new button >>>> */}
          <button onClick={() => setIsSaveLoadModalOpen(true)} className="save-load-header-btn">Save / Load</button>
          <div className="mode-switcher">
            <button onClick={() => setMode('build')} disabled={mode === 'build'}>
              Build Mode
            </button>
            <button onClick={() => setMode('preview')} disabled={mode === 'preview'}>
              Preview Mode
            </button>
          </div>
        </div>
      </header>
      <main className="main-content">
        {mode === 'build' ? (
          <DynamicFormBuilder
            formFields={formFields}
            setFormFields={setFormFields}
            questionPool={QUESTION_POOL}
          />
        ) : (
          <FormRenderer formSchema={formFields} />
        )}
      </main>
      
      {/* <<<< 5. RENDER the modal >>>> */}
      {isSaveLoadModalOpen && (
        <SaveLoadModal
            onSave={handleSaveForm}
            onLoad={handleLoadForm}
            onClose={() => setIsSaveLoadModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;