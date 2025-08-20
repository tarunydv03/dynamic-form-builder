// src/components/FormRenderer.jsx
import React from 'react';

// Import SurveyJS components
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/defaultV2.min.css'; // Import a default theme

// Import our new, powerful translator
import { translateToSurveyJS } from '../utils/surveyJsAdapter.js';

function FormRenderer({ formSchema }) {
  // 1. Translate our builder's format into the SurveyJS format
  const surveyJson = translateToSurveyJS(formSchema);
  
  // Create an instance of the SurveyJS Model.
  // The 'new Model()' constructor is smart and will automatically re-create
  // the survey model whenever the surveyJson object changes.
  const survey = new Model(surveyJson);

  // You can listen to any SurveyJS event here for rich functionality
  survey.onComplete.add((sender) => {
    alert("Survey Data:\n" + JSON.stringify(sender.data, null, 2));
  });

  // 2. Render the powerful SurveyJS component
  return <Survey model={survey} />;
}

export default FormRenderer;