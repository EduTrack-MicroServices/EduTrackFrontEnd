import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { ProgramListComponent } from './features/programs/program-list/program-list';
import { ProgramFormComponent } from './features/programs/program-form/program-form';
import { ProgramDetailsComponent } from './features/programs/program-details/program-details';
import { CourseFormComponent } from './features/courses/course-form/course-form';
import { CourseDetailsComponent } from './features/courses/course-details/course-details';
import { ModuleFormComponent } from './features/modules/module-form/module-form';
import { ModuleViewerComponent } from './features/contents/module-viewer/module-viewer';
import { ContentFormComponent } from './features/contents/content-form/content-form';
import { AssessmentScoreComponent } from './features/assessment/assessment-score/assessment-score';
import { AssessmentTakeComponent } from './features/assessment/assessment-take/assessment-take';
import { AssessmentViewComponent } from './features/assessment/assessment-view/assessment-view';
import { AssessmentCreateComponent } from './features/assessment/assessment-create/assessment-create';
import { HomeComponent } from './features/home/home';
import { Analysispage } from './features/analysispage/analysispage';
import { Studentprogress } from './features/studentprogress/studentprogress';
import { Profilepage } from './features/profilepage/profilepage';
import { guestGuard } from './core/guards/guest-guard';
 
export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'program-list',
    component: ProgramListComponent,
    canActivate: [authGuard],
  },

  {
    path: 'programs/new',
    component: ProgramFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['INSTRUCTOR', 'ADMIN'] },
  },
  {
    path: 'programs/edit/:id',
    component: ProgramFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['INSTRUCTOR', 'ADMIN'] },
  },
  {
    path: 'student-progress',
    component: Studentprogress,
    canActivate: [authGuard],
  },
  {
    path: 'analysispage/:studentId',
    component: Analysispage,
    canActivate: [authGuard],
  },
  { path: 'profile', component: Profilepage },

  {
    path: 'programs/:id',
    component: ProgramDetailsComponent,
    canActivate: [authGuard],
  },

  {
    path: 'programs/:programId/add-course',
    component: CourseFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['INSTRUCTOR', 'ADMIN'] },
  },
  {
    path: 'courses/edit/:courseId',
    component: CourseFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['INSTRUCTOR', 'ADMIN'] },
  },
  {
    path: 'programs/:programId/courses/:courseId',
    component: CourseDetailsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'courses/:courseId',
    component: CourseDetailsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'programs/:programId/courses/:courseId/add-module',
    component: ModuleFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'modules/edit/:moduleId',
    component: ModuleFormComponent,
    canActivate: [authGuard],
  },

  {
    path: 'programs/:programId/courses/:courseId/modules/:moduleId/viewer',
    component: ModuleViewerComponent,
    canActivate: [authGuard],
  },
  {
    path: 'modules/:moduleId/add-content',
    component: ContentFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'modules/:moduleId/edit-content/:contentId',
    component: ContentFormComponent,
    canActivate: [authGuard],
  },

  {
    path: 'courses/:courseId/assessment/create',
    component: AssessmentCreateComponent,
  },
  {
    path: 'courses/:courseId/assessment',
    component: AssessmentViewComponent,
  },
  {
    path: 'courses/:courseId/assessment/:assessmentId/take',
    component: AssessmentTakeComponent,
  },
  {
    path: 'courses/:courseId/assessment/score',
    component: AssessmentScoreComponent,
  },
  {
    path: 'courses/:courseId/assessment/create',
    component: AssessmentCreateComponent,
  },
  {
    path: 'courses/:courseId/assessment/:assessmentId/edit',
    component: AssessmentCreateComponent,
  },
  {
    path: 'courses/:courseId/assessment',
    component: AssessmentViewComponent,
  },
  {
    path: 'courses/:courseId/assessment/:assessmentId/take',
    component: AssessmentTakeComponent,
  },
  {
    path: 'courses/:courseId/assessment/result',
    component: AssessmentScoreComponent,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
 
 