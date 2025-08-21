// src/components/FormRenderer.jsx
import React from 'react';

// Import SurveyJS components
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/defaultV2.min.css'; // Import a default theme

// Import our new, powerful translator
import { translateToSurveyJS } from '../utils/surveyJsAdapter.js';

function groupQuestionsForSurvey(formSchema) {
  // Group questions by their group property
  const grouped = {};
  formSchema.forEach(q => {
    const key = q.group || '__ungrouped__';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(q);
  });
  // Convert to SurveyJS panels
  const elements = [];
  Object.entries(grouped).forEach(([group, questions]) => {
    if (group === '__ungrouped__') {
      questions.forEach(q => elements.push(q));
    } else {
      elements.push({
        type: 'panel',
        name: `panel_${group.replace(/\s+/g,'_')}`,
        title: group,
        elements: questions
      });
    }
  });
  return elements;
}

function FormRenderer({ formSchema }) {
  // 1. Group questions for SurveyJS
  const groupedElements = groupQuestionsForSurvey(formSchema);
  // 2. Translate to SurveyJS format
  const surveyJson = translateToSurveyJS(groupedElements);
  const survey = new Model(surveyJson);
  survey.onComplete.add((sender) => {
    alert("Survey Data:\n" + JSON.stringify(sender.data, null, 2));
  });
  return <Survey model={survey} />;
}

export default FormRenderer;