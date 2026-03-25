/**
 * LEVEL 1: Module Progress
 * Represents a single record in the 'module_progress' table.
 */
export interface ModuleProgress {
  id?: number;
  userId: number;
  courseId: number;
  moduleId: number;
  completedAt?: Date;
}

/**
 * LEVEL 2: Course Completion
 * Represents a record in the 'course_completion' table, created after passing an assessment.
 */
export interface CourseCompletion {
  id?: number;
  userId: number;
  programId: number;
  courseId: number;
  assessmentScore: number;
  isPassed: boolean;
  completedAt?: Date;
}

/**
 * API Response for Course Status
 * Used to toggle the "Start Assessment" button in Course Details.
 */
export interface ProgressStatusResponse {
  completedModules: number;
  totalModules: number;
  canTakeAssessment: boolean;
  isCourseCompleted: boolean;
}

/**
 * API Response for Program Progress
 * Used on the Dashboard to show overall completion percentages.
 */
export interface ProgramProgressResponse {
  programId: number;
  completedCourses: number;
  totalCourses: number;
  completionPercentage: number;
  isProgramCompleted: boolean;
}