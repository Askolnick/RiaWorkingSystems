/**
 * Learning module types
 */

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  modules: CourseModule[];
  instructor?: string;
  rating?: number;
  studentsCount?: number;
  progress?: number;
  enrolledAt?: string;
  completedAt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  duration?: string;
  completed?: boolean;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  content?: string;
  videoUrl?: string;
  duration?: string;
  order: number;
  completed?: boolean;
  completedAt?: string;
  resources?: Resource[];
}

export interface Resource {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'link' | 'download';
  url: string;
  size?: number;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  questions: Question[];
  passingScore: number;
  attempts?: QuizAttempt[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  answers: number[];
  completedAt: string;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  studentName: string;
  issuedAt: string;
  certificateUrl?: string;
}

export interface CreateCourseDTO {
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  thumbnail?: string;
  instructor?: string;
  tags?: string[];
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  thumbnail?: string;
  instructor?: string;
  tags?: string[];
}

export interface EnrollmentDTO {
  courseId: string;
  userId: string;
}

export interface ProgressUpdateDTO {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}