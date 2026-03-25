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
import { HomeComponent } from './features/home/home';
import { Analysispage } from './features/analysispage/analysispage';

export const routes: Routes = [
    {
        path: 'login', component: LoginComponent
    },
    {
        path:'home',component:HomeComponent
    },
    {
        path: 'register', component: RegisterComponent
    },
    {
        path: 'dashboard', component: DashboardComponent,
          canActivate: [authGuard],

    },
    {
        path: 'admin-dashboard',
        component: AdminDashboardComponent,
        canActivate: [authGuard, roleGuard],
        data: { role: 'ADMIN' }
    },
    {
        path: 'program-list', component: ProgramListComponent,
        canActivate: [authGuard],

    },

    {
        path: 'programs/new', component: ProgramFormComponent,
        canActivate: [authGuard, roleGuard],
        data: { role: 'INSTRUCTOR' }
    },
    {
        path: 'programs/edit/:id',
        component: ProgramFormComponent,
        canActivate: [authGuard, roleGuard],
        data: { role: 'INSTRUCTOR' }
    },
    {
        path:'analysispage',
        component:Analysispage,
        canActivate: [authGuard, roleGuard],
        data:{role:'STUDENT'}

    },

    {
        path: 'programs/:id', component: ProgramDetailsComponent, canActivate: [authGuard]
    },

    {
        path: 'programs/:programId/add-course',
        component: CourseFormComponent, canActivate: [authGuard, roleGuard],
        data: { role: 'INSTRUCTOR' }
    },
    {
        path: 'courses/edit/:courseId', component: CourseFormComponent, canActivate: [authGuard, roleGuard],
        data: { role: 'INSTRUCTOR' }
    },
    {
        path: 'programs/:programId/courses/:courseId',
        component: CourseDetailsComponent, canActivate: [authGuard],
    
    },

    {
        path: 'programs/:programId/courses/:courseId/add-module',
        component: ModuleFormComponent,
        canActivate: [authGuard]
    },
    {
        path: 'modules/edit/:moduleId',
        component: ModuleFormComponent,
        canActivate: [authGuard]
    },

    {
        path: 'programs/:programId/courses/:courseId/modules/:moduleId/viewer', 
        component: ModuleViewerComponent, canActivate: [authGuard]
    },
    {
            path: 'modules/:moduleId/add-content', 
            component: ContentFormComponent, canActivate: [authGuard]
    },
    {
        path: '', redirectTo: 'home', pathMatch: 'full'
    }
];
