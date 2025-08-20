// src/components/DynamicFormBuilder.jsx
import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { generateCustomUniqueId } from '../utils/idGenerator.js';

import QuestionPoolPanel from './QuestionPoolPanel.jsx';
import FormCanvas from './FormCanvas.jsx';

function DynamicFormBuilder({ formFields, setFormFields, questionPool }) {
  const sensors = useSensors(useSensor(PointerSensor));
  // Handle the drag end event
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      return; // Dropped outside of any valid area
    }

    // Scenario 1: Reordering an existing item within the canvas
    // We check if the active item is NOT from the pool.
    if (!active.data.current?.isPoolQuestion) {
      // If the item is dropped on itself, do nothing
      if (active.id === over.id) {
        return;
      }
      
      setFormFields((fields) => {
        const oldIndex = fields.findIndex((f) => f.id === active.id);
        const newIndex = fields.findIndex((f) => f.id === over.id);
        // This handles reordering correctly
        return arrayMove(fields, oldIndex, newIndex);
      });
      return;
    }

    // Scenario 2: Adding a NEW item from the pool to the canvas
    if (active.data.current?.isPoolQuestion) {
      const originalQuestion = questionPool.find(q => q.id === active.id);
      if (!originalQuestion) return;

      const newQuestion = {
        ...JSON.parse(JSON.stringify(originalQuestion)),
        id: generateCustomUniqueId(),
        name: generateCustomUniqueId(),
        title: originalQuestion.label,
      };
      delete newQuestion.label;

      // Find the drop position
      const overIndex = formFields.findIndex(f => f.id === over.id);

      if (over.id === 'canvas-droppable' || overIndex === -1) {
        // If dropped on the main canvas or an unknown area, add to the end
        setFormFields((fields) => [...fields, newQuestion]);
      } else {
        // If dropped ON an existing question, insert the new question AT that position
        setFormFields((fields) => {
          const newFields = [...fields];
          newFields.splice(overIndex, 0, newQuestion);
          return newFields;
        });
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="form-builder-layout">
        <QuestionPoolPanel
          questionPool={questionPool}
          setFormFields={setFormFields}
        />
        <FormCanvas formFields={formFields} setFormFields={setFormFields} />
      </div>
    </DndContext>
  );
}

export default DynamicFormBuilder;