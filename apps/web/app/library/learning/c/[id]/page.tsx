import LibraryTabs from '../../../_components/LibraryTabs';

// Mock course with lessons
const mockCourse = {
  id: '1',
  title: 'Customer Service Excellence',
  level: 'beginner',
  status: 'published',
  summary: 'Learn the fundamentals of exceptional customer service',
  description: 'This comprehensive course covers everything you need to know about delivering exceptional customer service. From communication skills to conflict resolution, you\'ll learn practical techniques that can be applied immediately.',
  tags: ['customer-service', 'communication', 'soft-skills'],
  duration: '4 hours',
  lessons: [
    { id: '1', title: 'Introduction to Customer Service', duration: '30 min', completed: true },
    { id: '2', title: 'Active Listening Skills', duration: '45 min', completed: true },
    { id: '3', title: 'Handling Difficult Customers', duration: '60 min', completed: false },
    { id: '4', title: 'Building Customer Relationships', duration: '45 min', completed: false },
    { id: '5', title: 'Service Recovery Strategies', duration: '60 min', completed: false },
    { id: '6', title: 'Final Assessment', duration: '30 min', completed: false },
  ]
};

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Library - Learning</h1>
      <LibraryTabs />
      
      <div className="mt-6 max-w-6xl">
        {/* Course Header */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{mockCourse.title}</h2>
              <p className="text-gray-600 mb-3">{mockCourse.summary}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {mockCourse.level}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {mockCourse.status}
                </span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  📕 {mockCourse.duration}
                </span>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Edit Course
            </button>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Course Description</h3>
            <p className="text-gray-600">{mockCourse.description}</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lessons Column */}
          <div className="lg:col-span-2">
            <div className="bg-white border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Course Lessons</h3>
                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                  + Add Lesson
                </button>
              </div>
              
              <div className="space-y-3">
                {mockCourse.lessons.map((lesson, index) => (
                  <div key={lesson.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-sm text-gray-500">Duration: {lesson.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.completed && (
                          <span className="text-green-600">✓ Completed</span>
                        )}
                        <button className="text-blue-600 hover:underline text-sm">
                          View →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Progress: {mockCourse.lessons.filter(l => l.completed).length} of {mockCourse.lessons.length} lessons completed
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(mockCourse.lessons.filter(l => l.completed).length / mockCourse.lessons.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Resources */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Course Resources</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 border rounded hover:bg-gray-50">
                  📄 Course Syllabus
                </button>
                <button className="w-full text-left p-3 border rounded hover:bg-gray-50">
                  📚 Reading Materials
                </button>
                <button className="w-full text-left p-3 border rounded hover:bg-gray-50">
                  🎥 Video Resources
                </button>
                <button className="w-full text-left p-3 border rounded hover:bg-gray-50">
                  📝 Practice Exercises
                </button>
              </div>
            </div>

            {/* Course Stats */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Course Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Enrolled Students</span>
                  <span className="font-medium">142</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Score</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}