import { BaseRepository } from './base.repository';
import type { 
  Course,
  Lesson,
  Certificate,
  CreateCourseDTO,
  UpdateCourseDTO,
  EnrollmentDTO,
  ProgressUpdateDTO
} from '../types/learning.types';

/**
 * Mock course data generator
 */
const generateMockCourses = (): Course[] => {
  return [
    {
      id: '1',
      title: 'Introduction to React',
      description: 'Learn the fundamentals of React including components, state, and hooks',
      category: 'Development',
      thumbnail: '/images/react-course.jpg',
      duration: '8 hours',
      level: 'beginner',
      instructor: 'John Doe',
      rating: 4.8,
      studentsCount: 1250,
      progress: 65,
      tags: ['react', 'javascript', 'frontend'],
      modules: [
        {
          id: 'm1',
          courseId: '1',
          title: 'Getting Started',
          description: 'Setup and basics',
          order: 1,
          duration: '2 hours',
          completed: true,
          lessons: [
            {
              id: 'l1',
              moduleId: 'm1',
              title: 'What is React?',
              type: 'video',
              videoUrl: '/videos/intro.mp4',
              duration: '15 min',
              order: 1,
              completed: true,
            },
            {
              id: 'l2',
              moduleId: 'm1',
              title: 'Setting up your environment',
              type: 'text',
              content: 'Step by step guide...',
              duration: '20 min',
              order: 2,
              completed: true,
            },
          ],
        },
        {
          id: 'm2',
          courseId: '1',
          title: 'Components and Props',
          description: 'Understanding React components',
          order: 2,
          duration: '3 hours',
          completed: false,
          lessons: [
            {
              id: 'l3',
              moduleId: 'm2',
              title: 'Function Components',
              type: 'video',
              videoUrl: '/videos/components.mp4',
              duration: '25 min',
              order: 1,
              completed: true,
            },
            {
              id: 'l4',
              moduleId: 'm2',
              title: 'Props and State',
              type: 'video',
              duration: '30 min',
              order: 2,
              completed: false,
            },
          ],
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: '2',
      title: 'Advanced TypeScript',
      description: 'Master TypeScript with advanced patterns and best practices',
      category: 'Development',
      thumbnail: '/images/typescript-course.jpg',
      duration: '12 hours',
      level: 'advanced',
      instructor: 'Jane Smith',
      rating: 4.9,
      studentsCount: 850,
      progress: 30,
      tags: ['typescript', 'javascript', 'types'],
      modules: [
        {
          id: 'm3',
          courseId: '2',
          title: 'Advanced Types',
          order: 1,
          duration: '4 hours',
          completed: true,
          lessons: [
            {
              id: 'l5',
              moduleId: 'm3',
              title: 'Union and Intersection Types',
              type: 'video',
              duration: '45 min',
              order: 1,
              completed: true,
            },
          ],
        },
      ],
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-10T00:00:00Z',
    },
    {
      id: '3',
      title: 'UI/UX Design Fundamentals',
      description: 'Learn the principles of good design and user experience',
      category: 'Design',
      thumbnail: '/images/design-course.jpg',
      duration: '6 hours',
      level: 'beginner',
      instructor: 'Alice Johnson',
      rating: 4.7,
      studentsCount: 2100,
      progress: 0,
      tags: ['design', 'ux', 'ui'],
      modules: [],
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-03-01T00:00:00Z',
    },
  ];
};

/**
 * Repository for course operations
 */
export class CourseRepository extends BaseRepository<Course, CreateCourseDTO, UpdateCourseDTO> {
  protected endpoint = '/api/learning/courses';
  private mockData: Course[] = generateMockCourses();

  async findAll() {
    // Return mock data for development
    return {
      data: this.mockData,
      total: this.mockData.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    };
  }

  async findById(id: string): Promise<Course> {
    const course = this.mockData.find(c => c.id === id);
    if (!course) throw new Error('Course not found');
    return course;
  }

  async getEnrolledCourses(): Promise<Course[]> {
    // Return courses where user has progress
    return this.mockData.filter(c => c.progress && c.progress > 0);
  }

  async getRecommendedCourses(): Promise<Course[]> {
    // Return courses user hasn't started
    return this.mockData.filter(c => !c.progress || c.progress === 0);
  }

  async enrollInCourse(enrollment: EnrollmentDTO): Promise<void> {
    const course = this.mockData.find(c => c.id === enrollment.courseId);
    if (course) {
      course.progress = 0;
      course.enrolledAt = new Date().toISOString();
    }
  }

  async updateProgress(courseId: string, update: ProgressUpdateDTO): Promise<void> {
    const course = this.mockData.find(c => c.id === courseId);
    if (course) {
      // Find and update the lesson
      for (const module of course.modules) {
        const lesson = module.lessons.find(l => l.id === update.lessonId);
        if (lesson) {
          lesson.completed = update.completed;
          lesson.completedAt = update.completedAt;
          
          // Recalculate course progress
          const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
          const completedLessons = course.modules.reduce(
            (sum, m) => sum + m.lessons.filter(l => l.completed).length,
            0
          );
          course.progress = Math.round((completedLessons / totalLessons) * 100);
          break;
        }
      }
    }
  }

  async getCertificates(): Promise<Certificate[]> {
    // Return mock certificates for completed courses
    return [
      {
        id: '1',
        courseId: '1',
        courseName: 'Introduction to React',
        studentName: 'Current User',
        issuedAt: '2024-01-20T00:00:00Z',
        certificateUrl: '/certificates/react-cert.pdf',
      },
    ];
  }
}

/**
 * Repository for lesson operations
 */
export class LessonRepository {
  private endpoint = '/api/learning/lessons';

  async findById(id: string): Promise<Lesson> {
    // Mock implementation
    const courses = generateMockCourses();
    for (const course of courses) {
      for (const module of course.modules) {
        const lesson = module.lessons.find(l => l.id === id);
        if (lesson) return lesson;
      }
    }
    throw new Error('Lesson not found');
  }

  async markAsComplete(id: string): Promise<void> {
    // In production, this would update the backend
    console.log(`Marking lesson ${id} as complete`);
  }

  async getNextLesson(currentLessonId: string): Promise<Lesson | null> {
    const courses = generateMockCourses();
    let foundCurrent = false;
    
    for (const course of courses) {
      for (const module of course.modules) {
        for (let i = 0; i < module.lessons.length; i++) {
          if (foundCurrent) {
            return module.lessons[i];
          }
          if (module.lessons[i].id === currentLessonId) {
            foundCurrent = true;
            // Check if there's a next lesson in the same module
            if (i + 1 < module.lessons.length) {
              return module.lessons[i + 1];
            }
          }
        }
      }
    }
    return null;
  }
}

// Export singleton instances
export const courseRepository = new CourseRepository();
export const lessonRepository = new LessonRepository();