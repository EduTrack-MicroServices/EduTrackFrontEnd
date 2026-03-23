export interface Program {
  programId?: number;
  name: string;
  description: string;
  durationWeeks: number;
  status: 'ACTIVE' | 'INACTIVE';
  courses?: Course[];
}

export interface Course {
  courseId?: number;
  name: string;
  description: string;
  creditPoints: number;
  status: 'ACTIVE' | 'INACTIVE';
  modules?: Module[];
}

export interface Module {
  moduleId?: number;
  name: string;
  sequenceOrder: number;
  learningObjectives: string;
}