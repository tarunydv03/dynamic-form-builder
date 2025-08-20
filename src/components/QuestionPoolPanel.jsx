// src/components/QuestionPoolPanel.jsx
import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import CustomQuestionModal from './CustomQuestionModal.jsx';

// A single draggable question from the pool
function DraggableQuestion({ question }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: question.id,
    data: { isPoolQuestion: true }, // Custom data to identify this
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="pool-question">
      {question.label}
    </div>
  );
}

// The panel that lists all available questions and includes the custom question button
function QuestionPoolPanel({ questionPool, setFormFields }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // This function is passed to the modal. When the modal saves, this
  // function receives the new question and adds it to the formFields state in App.jsx.
  const handleSaveCustomQuestion = (newQuestion) => {
    setFormFields(prevFields => [...prevFields, newQuestion]);
  };

  return (
    // Use a React Fragment to wrap the panel and the modal
    <>
      <aside className="question-pool-panel">
        <div className="custom-question-section">
          <button
            className="add-custom-btn"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Custom Question
          </button>
        </div>

        <h3>Question Pool</h3>
        {questionPool.map(q => (
          <DraggableQuestion key={q.id} question={q} />
        ))}
      </aside>

      {/* The modal is rendered here but is only visible when isModalOpen is true */}
      {isModalOpen && (
        <CustomQuestionModal
          onSave={handleSaveCustomQuestion}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export default QuestionPoolPanel;