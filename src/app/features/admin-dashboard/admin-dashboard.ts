import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { timeout } from 'rxjs';
import { toast } from 'ngx-sonner';

// Services
import { AuthService } from '../../core/services/auth';
import { AttendanceService } from '../../core/services/attendance';
import { EnrollmentService } from '../../core/services/enrollment-service';
import { CourseService } from '../../core/services/course-service';

// Models
import { UserResponse } from '../../core/models/auth';
import { AttendanceSummaryResponse } from '../../core/models/attendance';
import { EnrollmentResponse } from '../../core/models/enrollment';
import { Program } from '../../core/models/course';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  // --- Services ---
  private authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);
  private enrollmentService = inject(EnrollmentService);
  private courseService = inject(CourseService);
  private route = inject(ActivatedRoute);

  // --- State Signals ---
  users = signal<UserResponse[]>([]);
  loading = signal<boolean>(false);
  selectedUserRole = signal<string>('');
  attendanceMap = signal<Map<number, AttendanceSummaryResponse>>(new Map());
  enrollments = signal<EnrollmentResponse[]>([]);
  enrollmentLoading = signal<boolean>(false);
  selectedStudentId = signal<number | ''>('');
  selectedProgramId = signal<number | ''>('');
  programs = signal<Program[]>([]);

  // Track active views from the Sidebar URL params
  activeViews = signal<string[]>(['USERS']);

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['views']) {
        this.activeViews.set(params['views'].split(','));
      } else {
        this.activeViews.set(['USERS']);
      }
    });
  }

  // --- Computed Values ---
  filteredUsers = computed(() => {
    const role = this.selectedUserRole();
    if (!role) return this.users(); 
    return this.users().filter(user => user.role === role);
  });

  totalInstructors = computed(() => this.users().filter(u => u.role === 'INSTRUCTOR').length);
  totalStudents = computed(() => this.users().filter(u => u.role === 'STUDENT').length);

  ngOnInit() {
    this.loadUsers();
    this.loadAllEnrollments();
    this.loadPrograms();
  }

  loadPrograms() {
    this.courseService.getAllPrograms().subscribe({
      next: (res) => this.programs.set(res.data || []),
      error: () => toast.error('Failed to load programs.')
    });
  }

  getProgramName(programId: number): string {
    const prog = this.programs().find(p => p.programId === programId);
    return prog ? prog.name : 'Unknown Program';
  }

  loadUsers() {
    this.loading.set(true);
    this.selectedUserRole.set('');
    this.authService.getAllUsers().subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.loading.set(false);
        this.loadAllAttendances();
      },
      error: () => {
        this.loading.set(false);
        toast.error('Failed to load users');
      }
    });
  }

  getUserName(userId: number): string {
    const user = this.users().find(u => u.userId === userId);
    return user ? user.userName : 'Unknown User';
  }

  approveInstructor(email: string) {
    if (confirm(`Approve instructor ${email}?`)) {
      this.authService.approveInstructor(email).subscribe({
        next: () => {
          toast.success('Instructor APPROVED');
          this.loadUsers();
        }
      });
    }
  }

  rejectInstructor(email: string) {
    if (confirm(`Reject instructor ${email}? This will set status to REJECTED.`)) {
      this.authService.rejectInstructor(email).subscribe({
        next: () => {
          toast.warning('Instructor REJECTED');
          this.loadUsers();
        }
      });
    }
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.')) {
      this.authService.deleteUser(userId).subscribe({
        next: () => {
          toast.success('User deleted successfully');
          this.loadUsers();
        },
        error: (err) => toast.error(err.error?.message || 'Delete failed')
      });
    }
  }

  loadAllAttendances() {
    const currentUsers = this.users();
    currentUsers.forEach(user => {
      this.attendanceService.getAttendanceSummary(user.userId)
        .pipe(timeout(4000))
        .subscribe({
          next: (response) => {
            const map = new Map(this.attendanceMap());
            if (response && response.success && response.data) {
              map.set(user.userId, response.data);
            } else {
              map.set(user.userId, { userId: user.userId, totalDays: 0, presentDays: 0, absentDays: 0 });
            }
            this.attendanceMap.set(map);
          },
          error: () => {
            const map = new Map(this.attendanceMap());
            map.set(user.userId, { userId: user.userId, totalDays: 0, presentDays: 0, absentDays: 0 });
            this.attendanceMap.set(map);
          }
        });
    });
  }
  
  getAttendancePercentage(present: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  }

  loadAllEnrollments() {
    this.selectedStudentId.set('');
    this.selectedProgramId.set('');
    this.enrollmentLoading.set(true);
    this.enrollmentService.getAllEnrollments().subscribe({
      next: (res) => {
        this.enrollments.set(res.data || []);
        this.enrollmentLoading.set(false);
      },
      error: () => {
        this.enrollments.set([]);
        this.enrollmentLoading.set(false);
        toast.error('Failed to load enrollments.');
      }
    });
  }

  onStudentFilterChange(userId: any) {
    if (!userId) {
      this.loadAllEnrollments();
      return;
    }
    this.selectedProgramId.set('');
    this.enrollmentLoading.set(true);
    this.enrollmentService.getEnrollmentsByStudent(Number(userId)).subscribe({
      next: (res) => {
        this.enrollments.set(res.data || []);
        this.enrollmentLoading.set(false);
      },
      error: () => {
        this.enrollments.set([]);
        this.enrollmentLoading.set(false);
        toast.error('Failed to fetch enrollments for this student.');
      }
    });
  }

  onProgramFilterChange(programId: any) {
    if (!programId) {
      this.loadAllEnrollments();
      return;
    }
    this.selectedStudentId.set('');
    this.enrollmentLoading.set(true);
    this.enrollmentService.getEnrollmentsByProgram(Number(programId)).subscribe({
      next: (res) => {
        this.enrollments.set(res.data || []);
        this.enrollmentLoading.set(false);
      },
      error: () => {
        this.enrollments.set([]);
        this.enrollmentLoading.set(false);
        toast.error('Failed to fetch enrollments for this program.');
      }
    });
  }

  deleteEnrollmentRecord(enrollmentId: number) {
    if (confirm('Are you sure you want to permanently delete this enrollment record?')) {
      this.enrollmentService.deleteEnrollment(enrollmentId).subscribe({
        next: () => {
          toast.success('Enrollment deleted successfully.');
          const studentId = this.selectedStudentId();
          const programId = this.selectedProgramId();
          
          if (studentId) {
            this.onStudentFilterChange(studentId);
          } else if (programId) {
            this.onProgramFilterChange(programId);
          } else {
            this.loadAllEnrollments();
          }
        },
        error: (err) => toast.error(err.error?.message || 'Failed to delete enrollment.')
      });
    }
  }
}