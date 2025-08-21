// src/utils/surveyJsAdapter.js

/**
 * Translates the array of fields from our custom builder into the
 * structured JSON format that the SurveyJS library requires.
 * This is the core of our hybrid architecture.
 * @param {Array} formFields - The array of question objects from our builder state.
 * @returns {Object} A SurveyJS-compatible JSON object.
 */
export function translateToSurveyJS(formFields) {
  const surveyJson = {
    pages: [
      {
        name: 'page1',
        elements: [],
      },
    ],
    showQuestionNumbers: 'on',
    completedHtml: '<h3>Thank you for completing the survey!</h3>',
  };

  if (!formFields || formFields.length === 0) {
    return surveyJson;
  }

  // Map over our field objects and convert them to the SurveyJS format
  const surveyJsElements = formFields.map(field => {
    // Start with properties that map directly
    const newElement = {
      type: field.type,
      name: field.id, // We use our builder's unique ID as the SurveyJS question name
      title: field.title,
      inputType: field.inputType,
      choices: field.choices,
      columns: field.columns,
      rows: field.rows,
      isRequired: field.isRequired,
      labelTrue: field.labelTrue,
      labelFalse: field.labelFalse,
      visibleIf: field.visibleIf,
      enableIf: field.enableIf,
      triggers: field.triggers,
    };

    // Handle our custom 'repeat' logic and translate it to a SurveyJS 'paneldynamic'
    if (field.repeat && field.repeat.countSource) {
      newElement.type = 'paneldynamic';
      newElement.title = field.title;
      newElement.allowAddPanel = false;
      newElement.allowRemovePanel = false;
      
      newElement.visibleIf = `{${field.repeat.countSource}} > 0`;

      newElement.bindings = {
          panelCount: field.repeat.countSource
      };
      newElement.templateElements = [
        {
          type: field.type,
          name: `${field.id}_child`,
          title: "Response",
          choices: field.choices,
          isRequired: true,
        },
      ];
    }
    
    return newElement;
  });

  surveyJson.pages[0].elements = surveyJsElements;
  return surveyJson;
}