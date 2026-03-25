
export interface Assessment {
    assessmentId: number;
    courseId: number;
    type: 'QUIZ';
    maxMarks: number;
    dueDate: string;
    status:  'ASSIGNED' | 'DRAFT' | 'PUBLISHED' | 'CLOSE';
}
