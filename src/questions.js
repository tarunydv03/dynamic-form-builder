// src/questions.js

// This list now includes a variety of powerful SurveyJS question types.
// We use the 'type' property exactly as SurveyJS expects it.
export const QUESTION_POOL = [
  // --- Basic Inputs ---
  {
    id: 'pool-text',
    type: 'text',
    label: 'Single Line Text',
  },
  {
    id: 'pool-comment',
    type: 'comment',
    label: 'Paragraph Text',
  },
  {
    id: 'pool-text-number',
    type: 'text',
    inputType: 'number', // SurveyJS specific property
    label: 'Number Input',
  },
  
  // --- Choice-Based Questions ---
  {
    id: 'pool-radiogroup',
    type: 'radiogroup',
    label: 'Radio Buttons (Select One)',
    choices: [
      { value: 'item1', text: 'Option 1' },
      { value: 'item2', text: 'Option 2' },
    ],
  },
  {
    id: 'pool-checkbox',
    type: 'checkbox',
    label: 'Checkboxes (Select Many)',
    choices: [
      { value: 'item1', text: 'Choice A' },
      { value: 'item2', text: 'Choice B' },
    ],
  },
  {
    id: 'pool-dropdown',
    type: 'dropdown',
    label: 'Dropdown (Select One)',
    choices: [
      { value: 'item1', text: 'Option 1' },
      { value: 'item2', text: 'Option 2' },
    ],
  },
  
  // --- Advanced & Specialized Questions ---
  {
    id: 'pool-rating',
    type: 'rating',
    label: 'Rating Scale (Stars)',
  },
  {
    id: 'pool-boolean',
    type: 'boolean',
    label: 'Yes/No Switch',
    labelTrue: 'Yes', // SurveyJS specific
    labelFalse: 'No', // SurveyJS specific
  },
  {
    id: 'pool-matrix',
    type: 'matrix',
    label: 'Matrix (Single Choice Grid)',
    columns: [
        { value: 'col1', text: 'Column 1' },
        { value: 'col2', text: 'Column 2' },
    ],
    rows: [
        { value: 'row1', text: 'Row 1' },
        { value: 'row2', text: 'Row 2' },
    ]
  },
  {
    id: 'pool-ranking',
    type: 'ranking',
    label: 'Ranking',
    choices: [
        { value: 'item1', text: 'First Item' },
        { value: 'item2', text: 'Second Item' },
        { value: 'item3', text: 'Third Item' },
    ]
  },
  {
    id: 'pool-file',
    type: 'file',
    label: 'File Upload',
  },
];