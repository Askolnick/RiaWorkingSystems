"use client";

import { useState } from 'react';
import LibraryTabs from '../../../_components/LibraryTabs';
import QuizBuilder from '../../_components/QuizBuilder';
import AttachmentPicker from '../../../_components/AttachmentPicker';

// Mock lesson data
const mockLesson = {
  id: '3',
  courseId: '1',
  courseName: 'Customer Service Excellence',
  title: 'Handling Difficult Customers',
  duration: '60 min',
  content: `
# Handling Difficult Customers

## Learning Objectives
- Understand different types of difficult customers
- Learn de-escalation techniques
- Practice active listening in challenging situations
- Develop strategies for maintaining professionalism

## Introduction
Dealing with difficult customers is one of the most challenging aspects of customer service. This lesson will equip you with the skills and strategies needed to handle these situations effectively.

## Key Concepts

### 1. Types of Difficult Customers
- The Angry Customer
- The Demanding Customer
- The Indecisive Customer
- The Know-It-All Customer

### 2. De-escalation Techniques
- Remain calm and composed
- Listen actively without interrupting
- Acknowledge their feelings
- Find common ground
- Offer solutions

### 3. Communication Strategies
- Use positive language
- Avoid defensive responses
- Ask clarifying questions
- Summarize and confirm understanding

## Practice Scenarios
Work through the following scenarios to apply what you've learned...
  `,
  attachments: [
    { id: '1', name: 'Difficult Customer Scenarios.pdf', type: 'pdf' },
    { id: '2', name: 'De-escalation Flowchart.png', type: 'image' },
  ]
};

export default function LessonDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'content' | 'quiz' | 'attachments'>('content');
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [attachments, setAttachments] = useState(mockLesson.attachments);

  const handleAttachFile = (file: any) => {
    setAttachments([...attachments, file]);
    setShowAttachmentPicker(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Library - Learning</h1>
      <LibraryTabs />
      
      <div className="mt-6 max-w-6xl">
        {/* Lesson Header */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">
              <a href="#" className="text-blue-600 hover:underline">{mockLesson.courseName}</a> / Lesson {params.id}
            </div>
            <h2 className="text-2xl font-bold mb-2">{mockLesson.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>⏱️ Duration: {mockLesson.duration}</span>
              <span>📎 {attachments.length} attachments</span>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('content')}
                className={`py-2 px-4 border-b-2 transition-colors ${
                  activeTab === 'content' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                📖 Content
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`py-2 px-4 border-b-2 transition-colors ${
                  activeTab === 'quiz' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                📝 Quiz
              </button>
              <button
                onClick={() => setActiveTab('attachments')}
                className={`py-2 px-4 border-b-2 transition-colors ${
                  activeTab === 'attachments' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                📎 Attachments
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border rounded-lg p-6">
          {activeTab === 'content' && (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{mockLesson.content}</div>
              <div className="mt-8 flex justify-between">
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                  ← Previous Lesson
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Next Lesson →
                </button>
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Lesson Quiz</h3>
                <p className="text-gray-600">
                  Test your understanding with these questions. You can add multiple choice, 
                  single choice, or free text questions.
                </p>
              </div>
              <QuizBuilder />
              <div className="mt-6 pt-6 border-t">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Save Quiz
                </button>
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Lesson Attachments</h3>
                  <button 
                    onClick={() => setShowAttachmentPicker(!showAttachmentPicker)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    + Add Attachment
                  </button>
                </div>
                
                {showAttachmentPicker && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-3">Select a file to attach:</h4>
                    <AttachmentPicker onSelect={handleAttachFile} />
                  </div>
                )}
                
                <div className="grid gap-3">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          {attachment.type === 'pdf' ? '📄' : '🖼️'}
                        </div>
                        <div>
                          <h4 className="font-medium">{attachment.name}</h4>
                          <p className="text-sm text-gray-500">Type: {attachment.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:underline text-sm">
                          Download
                        </button>
                        <button className="text-red-600 hover:underline text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {attachments.length === 0 && !showAttachmentPicker && (
                  <p className="text-gray-500 text-center py-8">
                    No attachments yet. Click "Add Attachment" to get started.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}