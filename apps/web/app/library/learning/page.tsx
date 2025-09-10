"use client";
import { useEffect } from 'react';
import { useLearningStore } from '@ria/client';
import { Button, Input, LoadingSpinner, ErrorAlert } from '@ria/web-ui';
import LibraryTabs from '../_components/LibraryTabs';
import CourseCard from './_components/CourseCard';

export default function LearningPage() {
  const { 
    courses, 
    coursesLoading, 
    coursesError, 
    filters, 
    fetchCourses, 
    setFilter, 
    clearFilters 
  } = useLearningStore();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSearch = (value: string) => {
    setFilter('search', value);
  };

  const filteredCourses = courses.filter(course => {
    if (filters.search) {
      return course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
             course.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
             course.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.category) {
      return course.category === filters.category;
    }
    if (filters.level) {
      return course.level === filters.level;
    }
    return true;
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Library - Learning</h1>
      <LibraryTabs />
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Courses & Training</h2>
          <Button>
            + New Course
          </Button>
        </div>
        
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Search courses..." 
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
        
        {coursesError && (
          <ErrorAlert 
            message={coursesError}
            className="mb-6"
          />
        )}
        
        {coursesLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map(course => (
                <CourseCard 
                  key={course.id} 
                  c={{
                    ...course,
                    summary: course.description,
                    status: 'published' // Map from your Course type to CourseCard expected format
                  }} 
                />
              ))}
            </div>
            
            {filteredCourses.length === 0 && !coursesLoading && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No courses found matching your criteria.
                </p>
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 mb-4">
            Ready to create engaging learning content?
          </p>
          <Button variant="success">
            Get Started with Course Builder
          </Button>
        </div>
      </div>
    </div>
  );
}