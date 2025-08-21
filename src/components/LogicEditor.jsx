// src/components/LogicEditor.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuidv4 } from 'uuid';
import '../App.css';

function LogicEditor({ field, formFields, setFormFields, onClose }) {
  const [logicMode, setLogicMode] = useState('conditional');
  const [rules, setRules] = useState([]);
  const [repeatRule, setRepeatRule] = useState({ sourceQuestionId: '' });

  const currentIndex = formFields.findIndex(f => f.id === field.id);
  const availableQuestions = formFields.slice(0, currentIndex);

  // This effect runs once when the modal opens to pre-fill the UI with any existing logic.
  useEffect(() => {
    // Check if repeat logic exists
    if (field.repeat) {
      setLogicMode('repeat');
      setRepeatRule({ sourceQuestionId: field.repeat.countSource || '' });
    } else {
      // Otherwise, default to conditional and populate its rules
      setLogicMode('conditional');
      const allRules = [];
      
      // If a visibleIf rule exists, add it to our UI state. This is the primary visibility rule.
      if (field.visibleIf) {
        // Use a regex to parse the expression back into UI-friendly parts
        const match = field.visibleIf.match(/\{([^}]+)\}\s*([<>=!]+|empty|notempty)\s*'([^']*)'?/);
        if (match) {
          allRules.push({ id: uuidv4(), type: 'visible', sourceQuestionId: match[1], operator: match[2], value: match[3] || '' });
        }
      }
      
      // If other triggers exist (like 'enable' or 'require'), add them too.
      if (field.triggers) {
        field.triggers.forEach(t => {
           const match = t.expression.match(/\{([^}]+)\}\s*([<>=!]+|empty|notempty)\s*'([^']*)'?/);
           if(match) {
             allRules.push({ id: uuidv4(), type: t.type, sourceQuestionId: match[1], operator: match[2], value: match[3] || '' });
           }
        });
      }
      setRules(allRules);
    }
  }, [field]); // Dependency array ensures this runs only once when 'field' is first passed in.

  const addRule = () => {
    const newRule = { id: uuidv4(), type: 'visible', operator: '=', value: '', sourceQuestionId: '' };
    setRules([...rules, newRule]);
  };
  
  const updateRule = (id, property, value) => {
    setRules(rules.map(rule => (rule.id === id ? { ...rule, [property]: value } : rule)));
  };
  
  const handleSave = () => {
    setFormFields(prevFields =>
      prevFields.map(f => {
        if (f.id === field.id) {
          const updatedField = { ...f };
          // Clear all previous logic properties to ensure a clean state
          delete updatedField.triggers;
          delete updatedField.repeat;
          delete updatedField.visibleIf;

          if (logicMode === 'conditional') {
            let visibleIfExpression = null;
            const finalTriggers = [];
            
            rules.forEach(rule => {
              const { sourceQuestionId, operator, value, type } = rule;
              let expression = '';
              // Construct the expression string that SurveyJS understands
              if (sourceQuestionId && operator) {
                if (operator === 'empty' || operator === 'notempty') {
                  expression = `{${sourceQuestionId}} ${operator}`;
                } else if (value.trim() !== '') {
                  expression = `{${sourceQuestionId}} ${operator} '${value}'`;
                }
              }
              if (expression) {
                if (type === 'visible') {
                  visibleIfExpression = expression;
                } else if (type === 'enable') {
                  updatedField.enableIf = expression;
                } else {
                  finalTriggers.push({ type, expression });
                }
              }
            });
            if (visibleIfExpression) {
              updatedField.visibleIf = visibleIfExpression;
            }
            if (finalTriggers.length > 0) {
              updatedField.triggers = finalTriggers;
            }

          } else if (logicMode === 'repeat' && repeatRule.sourceQuestionId) {
            updatedField.repeat = { countSource: repeatRule.sourceQuestionId };
          }
          return updatedField;
        }
        return f;
      })
    );
    onClose();
  };

  const ConditionalLogicBuilder = () => (
    <>
      <div className="rules-container">
        {rules.length === 0 && <p className='logic-note'>No rules defined. Add a rule to make this question dynamic.</p>}
        {rules.map(rule => (
          <div key={rule.id} className="rule-builder">
            <div className="rule-row">
              <select value={rule.type || 'visible'} onChange={e => updateRule(rule.id, 'type', e.target.value)}>
                <option value="visible">Make question Visible</option>
                <option value="enable">Make question Enabled</option>
                <option value="require">Make question Required</option>
              </select>
              <span>if</span>
              <select value={rule.sourceQuestionId || ''} onChange={e => updateRule(rule.id, 'sourceQuestionId', e.target.value)}>
                <option value="">Select question...</option>
                {availableQuestions.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
              </select>
              <select value={rule.operator || '='} onChange={e => updateRule(rule.id, 'operator', e.target.value)}>
                <option value="=">is equal to</option>
                <option value="<>">is not equal to</option>
                <option value="empty">is empty</option>
                <option value="notempty">is not empty</option>
              </select>
              {/* Only show the value input if the operator needs one */}
              {(rule.operator !== 'empty' && rule.operator !== 'notempty') && (() => {
                // Find the referenced question
                const refQuestion = availableQuestions.find(q => q.id === rule.sourceQuestionId);
                if (refQuestion && (refQuestion.type === 'radiogroup' || refQuestion.type === 'dropdown') && Array.isArray(refQuestion.choices)) {
                  // Show a dropdown of choices for radio/dropdown
                  return (
                    <select value={rule.value || ''} onChange={e => updateRule(rule.id, 'value', e.target.value)}>
                      <option value="">Select choice...</option>
                      {refQuestion.choices.map(opt => (
                        <option key={opt.value || opt.text} value={opt.value || opt.text}>{opt.text || opt.value}</option>
                      ))}
                    </select>
                  );
                }
                // Fallback to text input for other question types
                return (
                  <input type="text" value={rule.value || ''} placeholder="value..." onChange={e => updateRule(rule.id, 'value', e.target.value)} />
                );
              })()}
              <button onClick={() => setRules(rules.filter(r => r.id !== rule.id))} className="remove-choice-btn">-</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addRule} className="add-choice-btn">+ Add a new conditional rule</button>
    </>
  );

  const RepeatLogicBuilder = () => (
     <div className="logic-builder">
        Repeat this question based on the answer to
        <select value={repeatRule.sourceQuestionId} onChange={e => setRepeatRule({ sourceQuestionId: e.target.value })}>
            <option value="">Select a question (must be a number)...</option>
            {availableQuestions.filter(q => q.inputType === 'number').map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
        </select>
        <p className='logic-note'>Note: The selected source question must be a Number Input type.</p>
    </div>
  );

  const modalContent = (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Logic for "{field.title}"</h3>
        <div className="logic-mode-selector">
          <label><input type="radio" value="conditional" checked={logicMode === 'conditional'} onChange={() => setLogicMode('conditional')} /> Conditional Logic (Show/Hide, etc.)</label>
          <label><input type="radio" value="repeat" checked={logicMode === 'repeat'} onChange={() => setLogicMode('repeat')} /> Repeat Logic (Loop)</label>
        </div>
        
        {logicMode === 'conditional' ? <ConditionalLogicBuilder /> : <RepeatLogicBuilder />}
        
        <div className="modal-actions">
          <button onClick={handleSave}>Save Logic</button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default LogicEditor;