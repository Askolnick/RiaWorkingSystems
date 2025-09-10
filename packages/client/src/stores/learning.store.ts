import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { courseRepository, lessonRepository } from '../repositories/learning.repository';
import type { 
  Course,
  Lesson,
  Certificate,
  CreateCourseDTO,
  UpdateCourseDTO,
  EnrollmentDTO,
  ProgressUpdateDTO
} from '../types/learning.types';

interface LearningStore {
  // Courses
  courses: Course[];
  enrolledCourses: Course[];
  recommendedCourses: Course[];
  currentCourse: Course | null;
  coursesLoading: boolean;
  coursesError: string | null;
  
  // Lessons
  currentLesson: Lesson | null;
  lessonLoading: boolean;
  lessonError: string | null;
  
  // Certificates
  certificates: Certificate[];
  certificatesLoading: boolean;
  
  // Filters
  filters: {
    category?: string;
    level?: string;
    search: string;
  };
  
  // Course actions
  fetchCourses: () => Promise<void>;
  fetchCourse: (id: string) => Promise<void>;
  fetchEnrolledCourses: () => Promise<void>;
  fetchRecommendedCourses: () => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  createCourse: (course: CreateCourseDTO) => Promise<Course>;
  updateCourse: (id: string, updates: UpdateCourseDTO) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  
  // Lesson actions
  fetchLesson: (id: string) => Promise<void>;
  completeLesson: (courseId: string, lessonId: string) => Promise<void>;
  getNextLesson: () => Promise<void>;
  
  // Certificate actions
  fetchCertificates: () => Promise<void>;
  
  // Progress actions
  updateProgress: (courseId: string, update: ProgressUpdateDTO) => Promise<void>;
  
  // Filter actions
  setFilter: (key: keyof LearningStore['filters'], value: any) => void;
  clearFilters: () => void;
}

export const useLearningStore = create<LearningStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      courses: [],
      enrolledCourses: [],
      recommendedCourses: [],
      currentCourse: null,
      coursesLoading: false,
      coursesError: null,
      
      currentLesson: null,
      lessonLoading: false,
      lessonError: null,
      
      certificates: [],
      certificatesLoading: false,
      
      filters: {
        search: '',
      },
      
      // Course actions
      fetchCourses: async () => {
        set(state => {
          state.coursesLoading = true;
          state.coursesError = null;
        });
        
        try {
          const response = await courseRepository.findAll();
          set(state => {
            state.courses = response.data;
            state.coursesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.coursesError = error instanceof Error ? error.message : 'Failed to fetch courses';
            state.coursesLoading = false;
          });
        }
      },
      
      fetchCourse: async (id: string) => {
        set(state => {
          state.coursesLoading = true;
          state.coursesError = null;
        });
        
        try {
          const course = await courseRepository.findById(id);
          set(state => {
            state.currentCourse = course;
            state.coursesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.coursesError = error instanceof Error ? error.message : 'Failed to fetch course';
            state.coursesLoading = false;
          });
        }
      },
      
      fetchEnrolledCourses: async () => {
        set(state => {
          state.coursesLoading = true;
        });
        
        try {
          const courses = await courseRepository.getEnrolledCourses();
          set(state => {
            state.enrolledCourses = courses;
            state.coursesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.coursesError = error instanceof Error ? error.message : 'Failed to fetch enrolled courses';
            state.coursesLoading = false;
          });
        }
      },
      
      fetchRecommendedCourses: async () => {
        try {
          const courses = await courseRepository.getRecommendedCourses();
          set(state => {
            state.recommendedCourses = courses;
          });
        } catch (error) {
          console.error('Failed to fetch recommended courses:', error);
        }
      },
      
      enrollInCourse: async (courseId: string) => {
        try {
          await courseRepository.enrollInCourse({ courseId, userId: 'current-user' });
          
          // Update local state
          set(state => {
            const course = state.courses.find(c => c.id === courseId);
            if (course) {
              course.progress = 0;
              course.enrolledAt = new Date().toISOString();
              state.enrolledCourses.push(course);
              state.recommendedCourses = state.recommendedCourses.filter(c => c.id !== courseId);
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      createCourse: async (course: CreateCourseDTO) => {
        try {
          const newCourse = await courseRepository.create(course);
          set(state => {
            state.courses.push(newCourse);
          });
          return newCourse;
        } catch (error) {
          throw error;
        }
      },
      
      updateCourse: async (id: string, updates: UpdateCourseDTO) => {
        try {
          const updatedCourse = await courseRepository.update(id, updates);
          set(state => {
            const index = state.courses.findIndex(c => c.id === id);
            if (index !== -1) {
              state.courses[index] = updatedCourse;
            }
            if (state.currentCourse?.id === id) {
              state.currentCourse = updatedCourse;
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      deleteCourse: async (id: string) => {
        try {
          await courseRepository.delete(id);
          set(state => {
            state.courses = state.courses.filter(c => c.id !== id);
            if (state.currentCourse?.id === id) {
              state.currentCourse = null;
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      // Lesson actions
      fetchLesson: async (id: string) => {
        set(state => {
          state.lessonLoading = true;
          state.lessonError = null;
        });
        
        try {
          const lesson = await lessonRepository.findById(id);
          set(state => {
            state.currentLesson = lesson;
            state.lessonLoading = false;
          });
        } catch (error) {
          set(state => {
            state.lessonError = error instanceof Error ? error.message : 'Failed to fetch lesson';
            state.lessonLoading = false;
          });
        }
      },
      
      completeLesson: async (courseId: string, lessonId: string) => {
        try {
          await lessonRepository.markAsComplete(lessonId);
          await courseRepository.updateProgress(courseId, {
            lessonId,
            completed: true,
            completedAt: new Date().toISOString(),
          });
          
          // Update local state
          set(state => {
            if (state.currentCourse?.id === courseId) {
              for (const module of state.currentCourse.modules) {
                const lesson = module.lessons.find(l => l.id === lessonId);
                if (lesson) {
                  lesson.completed = true;
                  lesson.completedAt = new Date().toISOString();
                  
                  // Recalculate progress
                  const totalLessons = state.currentCourse.modules.reduce(
                    (sum, m) => sum + m.lessons.length,
                    0
                  );
                  const completedLessons = state.currentCourse.modules.reduce(
                    (sum, m) => sum + m.lessons.filter(l => l.completed).length,
                    0
                  );
                  state.currentCourse.progress = Math.round((completedLessons / totalLessons) * 100);
                  break;
                }
              }
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      getNextLesson: async () => {
        if (!get().currentLesson) return;
        
        try {
          const nextLesson = await lessonRepository.getNextLesson(get().currentLesson!.id);
          if (nextLesson) {
            set(state => {
              state.currentLesson = nextLesson;
            });
          }
        } catch (error) {
          console.error('Failed to get next lesson:', error);
        }
      },
      
      // Certificate actions
      fetchCertificates: async () => {
        set(state => {
          state.certificatesLoading = true;
        });
        
        try {
          const certificates = await courseRepository.getCertificates();
          set(state => {
            state.certificates = certificates;
            state.certificatesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.certificatesLoading = false;
          });
        }
      },
      
      // Progress actions
      updateProgress: async (courseId: string, update: ProgressUpdateDTO) => {
        try {
          await courseRepository.updateProgress(courseId, update);
          
          // Update local state
          set(state => {
            const course = state.courses.find(c => c.id === courseId);
            if (course) {
              // Update lesson completion status
              for (const module of course.modules) {
                const lesson = module.lessons.find(l => l.id === update.lessonId);
                if (lesson) {
                  lesson.completed = update.completed;
                  lesson.completedAt = update.completedAt;
                  break;
                }
              }
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      // Filter actions
      setFilter: (key, value) => {
        set(state => {
          state.filters[key] = value;
        });
      },
      
      clearFilters: () => {
        set(state => {
          state.filters = { search: '' };
        });
      },
    }))
  )
);