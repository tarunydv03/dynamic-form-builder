import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuidv4 } from 'uuid';
import '../App.css';
 
function LogicEditor({ field, formFields, setFormFields, onClose }) {
  // State for the simple, non-conditional "is required" checkbox
  const [isRequired, setIsRequired] = useState(!!field.isRequired);
  const [logicSavedCount, setLogicSavedCount] = useState(null);
  const [logicMode, setLogicMode] = useState('conditional');
  const [rules, setRules] = useState([]);
  const [repeatRule, setRepeatRule] = useState({ sourceQuestionId: '' });
 
  const currentIndex = formFields.findIndex(f => f.id === field.id);
  const availableQuestions = formFields.filter((f, idx) => idx < currentIndex);
 
  useEffect(() => {
    if (field.repeat) {
      setLogicMode('repeat');
      setRepeatRule({ sourceQuestionId: field.repeat.countSource || '' });
    } else {
      setLogicMode('conditional');
      const allRules = [];
      const parseExpression = (expression, type) => {
        if (!expression) return;
        const match = expression.match(/\{([^}]+)\}\s*([<>=!]+|empty|notempty)\s*'([^']*)'?/);
        if (match) {
          allRules.push({ id: uuidv4(), type, sourceQuestionId: match[1], operator: match[2], value: match[3] || '' });
        }
      };
      
      parseExpression(field.visibleIf, 'visible');
      parseExpression(field.enableIf, 'enable');
      
      setRules(allRules);
    }
  }, [field]);
 
  const addRule = () => {
    // Default new rules to 'visible'
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
          // Clear all previous logic properties for a clean update
          delete updatedField.triggers;
          delete updatedField.repeat;
          delete updatedField.visibleIf;
          delete updatedField.enableIf;
          
          // Set the simple, non-conditional isRequired property from the checkbox
          updatedField.isRequired = isRequired;
 
          if (logicMode === 'conditional') {
            let visibleIfExpression = null;
            let enableIfExpression = null;
            
            rules.forEach(rule => {
              const { sourceQuestionId, operator, value, type } = rule;
              let expression = '';
              const refQuestion = availableQuestions.find(q => q.id === sourceQuestionId);
              if (sourceQuestionId && operator) {
                if (refQuestion && (refQuestion.type === 'checkbox' || refQuestion.type === 'ranking')) {
                  // Use 'contains' for multi-select
                  expression = `{${sourceQuestionId}} contains '${value}'`;
                } else {
                  expression = (operator === 'empty' || operator === 'notempty')
                    ? `{${sourceQuestionId}} ${operator}`
                    : `{${sourceQuestionId}} ${operator} '${value}'`;
                }
              }
 
              if (expression) {
                if (type === 'visible') {
                  visibleIfExpression = expression;
                } else if (type === 'enable') {
                  enableIfExpression = expression;
                }
              }
            });
            
            if (visibleIfExpression) updatedField.visibleIf = visibleIfExpression;
            if (enableIfExpression) updatedField.enableIf = enableIfExpression;
 
          } else if (logicMode === 'repeat' && repeatRule.sourceQuestionId) {
            updatedField.repeat = { countSource: repeatRule.sourceQuestionId };
          }
          return updatedField;
        }
        return f;
      })
    );
    // UI feedback for saving
    setLogicSavedCount(rules.length);
    setTimeout(() => {
      setLogicSavedCount(null);
      onClose();
    }, 1200);
  };
 
  const ConditionalLogicBuilder = () => (
    <>
      <div className="rules-container">
        {rules.length === 0 && <p className='logic-note'>No conditional rules defined. Add a rule to make this question dynamic.</p>}
        {rules.map(rule => (
          <div key={rule.id} className="rule-builder">
            <div className="rule-row">
              <select value={rule.type || 'visible'} onChange={e => updateRule(rule.id, 'type', e.target.value)}>
                <option value="visible">Make question Visible</option>
                <option value="enable">Make question Enabled</option>
                {/* "Required" is now handled by the top-level checkbox, so it is removed from here */}
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
              {(rule.operator !== 'empty' && rule.operator !== 'notempty') && (() => {
                const refQuestion = availableQuestions.find(q => q.id === rule.sourceQuestionId);
                if (refQuestion && refQuestion.type === 'boolean') {
                  // Show dropdown for boolean (yes/no) questions
                  return (
                    <select value={rule.value === true ? 'true' : rule.value === false ? 'false' : rule.value || ''} onChange={e => updateRule(rule.id, 'value', e.target.value === 'true' ? true : e.target.value === 'false' ? false : e.target.value)}>
                      <option value="">Select...</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  );
                }
                if (refQuestion && (refQuestion.type === 'radiogroup' || refQuestion.type === 'dropdown') && Array.isArray(refQuestion.choices)) {
                  return (
                    <select value={rule.value || ''} onChange={e => updateRule(rule.id, 'value', e.target.value)}>
                      <option value="">Select choice...</option>
                      {refQuestion.choices.map(opt => (
                        <option key={opt.value || opt.text} value={opt.value || opt.text}>{opt.text || opt.value}</option>
                      ))}
                    </select>
                  );
                }
                if (refQuestion && (refQuestion.type === 'checkbox' || refQuestion.type === 'ranking') && Array.isArray(refQuestion.choices)) {
                  // Show dropdown for multi-select (checkbox/ranking) questions
                  return (
                    <select value={rule.value || ''} onChange={e => updateRule(rule.id, 'value', e.target.value)}>
                      <option value="">Select option...</option>
                      {refQuestion.choices.map(opt => (
                        <option key={opt.value || opt.text} value={opt.value || opt.text}>{opt.text || opt.value}</option>
                      ))}
                    </select>
                  );
                }
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
        {logicSavedCount !== null && (
          <div className="logic-saved-indicator" style={{background:'#2ecc40',color:'#fff',padding:'8px',borderRadius:'4px',marginBottom:'10px',textAlign:'center'}}>
            {logicSavedCount === 0 ? 'Logic cleared.' : `${logicSavedCount} logic rule(s) saved.`}
          </div>
        )}
 
        <div className="top-level-logic">
            <label>
                <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                />
                This question is always required
            </label>
        </div>
 
        <div className="logic-mode-selector">
          <label><input type="radio" value="conditional" checked={logicMode === 'conditional'} onChange={() => setLogicMode('conditional')} /> Conditional Logic (Show/Hide, Enable/Disable)</label>
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