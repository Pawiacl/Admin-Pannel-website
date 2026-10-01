import { BrowserRouter, Routes, Route } from "react-router-dom";


// =====================================================
// LOGIN
// =====================================================

import Login from "./pages/Login";


// =====================================================
// REGISTRATION
// =====================================================

import AdminRegister from "./pages/AdminRegister";
import FacultyRegister from "./pages/FacultyRegister";
import StudentRegister from "./pages/StudentRegister";
import ForgotPassword from "./pages/ForgotPassword";


// =====================================================
// LAYOUT
// =====================================================

import PortalLayout from "./Layouts/PortalLayout";


// =====================================================
// COMPONENTS
// =====================================================

import ProtectedRoute from "./components/ProtectedRoute";
import PermissionRoute from "./components/PermissionRoute";


// =====================================================
// PAGES
// =====================================================

import Dashboard from "./pages/Dashboard";
import Roles from "./pages/Roles";

import Classes from "./pages/Classes";
import ClassSections from "./pages/ClassSections";
import ClassAcademicYear from "./pages/ClassAcademicYear";
import ClassStudents from "./pages/ClassStudents";

import Attendance from "./pages/Attendance";
import ClassAttendance from "./pages/ClassAttendance";

import Faculty from "./pages/Faculty";
import ClassTeacherHistory from "./pages/ClassTeacherHistory";
import AssignClassTeacher from "./pages/AssignClassTeacher";

import Students from "./pages/Students";
import UserDataGrid from "./components/UserDataGrid";


// =====================================================
// SUBJECTS
// =====================================================

import Subjects from "./pages/Subjects";
import AddSubject from "./pages/AddSubject";
import SubjectAcademicYears from "./pages/SubjectAcademicYears";
import SubjectTopics from "./pages/SubjectTopics";


// =====================================================
// SYLLABUS
// =====================================================

import Syllabus from "./pages/Syllabus";
import SyllabusTopics from "./pages/SyllabusTopics";


// =====================================================
// EXAM
// =====================================================

import Exam from "./pages/Exam";
import AddExam from "./pages/AddExam";
import ExamTypes from "./pages/ExamTypes";
import ExamTypeManagement from "./pages/ExamTypeManagement";
import ExamSchedule from "./pages/ExamSchedule";


// =====================================================
// RESULT
// =====================================================

import Result from "./pages/Result";
import AddResult from "./pages/AddResult";
import ResultExamType from "./pages/ResultExamType";
import ResultStudents from "./pages/ResultStudents";


// =====================================================
// FOOTER
// =====================================================

import Footer from "./components/Footer";


function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/"
          element={
            <Login />
          }
        />


        {/* =================================================
            REGISTRATION
        ================================================= */}

        <Route
          path="/admin/register"
          element={
            <AdminRegister />
          }
        />


        <Route
          path="/faculty/register"
          element={
            <FacultyRegister />
          }
        />


        <Route
          path="/student/register"
          element={
            <StudentRegister />
          }
        />


        {/* =================================================
            FORGOT PASSWORD
        ================================================= */}

        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />


        {/* =================================================
            PROTECTED PORTAL
        ================================================= */}

        <Route
          element={
            <ProtectedRoute>

              <PortalLayout />

            </ProtectedRoute>
          }
        >


          {/* =================================================
              DASHBOARD
          ================================================= */}

          <Route
            path="/dashboard"
            element={
              <PermissionRoute pageName="Dashboard">

                <Dashboard />

              </PermissionRoute>
            }
          />


          {/* =================================================
              ROLES
          ================================================= */}

          <Route
            path="/dashboard/roles"
            element={
              <PermissionRoute pageName="Roles">

                <Roles />

              </PermissionRoute>
            }
          />


          {/* =================================================
              CLASSES
          ================================================= */}

          <Route
            path="/dashboard/classes"
            element={
              <PermissionRoute pageName="Classes">

                <Classes />

              </PermissionRoute>
            }
          />


          {/* =================================================
              CLASS SECTIONS
          ================================================= */}

          <Route
            path="/dashboard/classes/:classId"
            element={
              <PermissionRoute pageName="Classes">

                <ClassSections />

              </PermissionRoute>
            }
          />


          {/* =================================================
              CLASS ACADEMIC YEAR
          ================================================= */}

          <Route
            path="/dashboard/classes/:classId/:section"
            element={
              <PermissionRoute pageName="Classes">

                <ClassAcademicYear />

              </PermissionRoute>
            }
          />


          {/* =================================================
              CLASS STUDENTS
          ================================================= */}

          <Route
            path="/dashboard/classes/:classId/:section/:academicYear"
            element={
              <PermissionRoute pageName="Classes">

                <ClassStudents />

              </PermissionRoute>
            }
          />


          {/* =================================================
              ATTENDANCE
          ================================================= */}

          <Route
            path="/dashboard/attendance"
            element={
              <PermissionRoute pageName="Attendance">

                <Attendance />

              </PermissionRoute>
            }
          />


          {/* =================================================
              CLASS ATTENDANCE
          ================================================= */}

          <Route
            path="/dashboard/attendance/classes/:classId"
            element={
              <PermissionRoute pageName="Attendance">

                <ClassAttendance />

              </PermissionRoute>
            }
          />


          {/* =================================================
              FACULTY
          ================================================= */}

          <Route
            path="/dashboard/faculty"
            element={
              <PermissionRoute pageName="Faculty">

                <Faculty />

              </PermissionRoute>
            }
          />


          {/* =================================================
              ASSIGN CLASS TEACHER
          ================================================= */}

          <Route
            path="/dashboard/faculty/assign-class-teacher"
            element={
              <PermissionRoute pageName="Faculty">

                <AssignClassTeacher />

              </PermissionRoute>
            }
          />


          {/* =================================================
              CLASS TEACHER HISTORY
          ================================================= */}

          <Route
            path="/dashboard/faculty/:facultyId/class-teacher"
            element={
              <PermissionRoute pageName="Faculty">

                <ClassTeacherHistory />

              </PermissionRoute>
            }
          />


          {/* =================================================
              STUDENTS
          ================================================= */}

          <Route
            path="/dashboard/students"
            element={
              <PermissionRoute pageName="Students">

                <Students />

              </PermissionRoute>
            }
          />


          {/* =================================================
              SUBJECTS
          ================================================= */}

          <Route
            path="/dashboard/subjects"
            element={
              <PermissionRoute pageName="Subjects">

                <Subjects />

              </PermissionRoute>
            }
          />


          {/* =================================================
              ADD SUBJECT
          ================================================= */}

          <Route
            path="/dashboard/subjects/add"
            element={
              <PermissionRoute pageName="Subjects">

                <AddSubject />

              </PermissionRoute>
            }
          />


          {/* =================================================
              SUBJECT ACADEMIC YEARS
          ================================================= */}

          <Route
            path="/dashboard/subjects/:subjectId/academic-years"
            element={
              <PermissionRoute pageName="Subjects">

                <SubjectAcademicYears />

              </PermissionRoute>
            }
          />


          {/* =================================================
              SUBJECT TOPICS
          ================================================= */}

          <Route
            path="/dashboard/subjects/:subjectId/academic-years/:academicYearId/topics"
            element={
              <PermissionRoute pageName="Subjects">

                <SubjectTopics />

              </PermissionRoute>
            }
          />


          {/* =================================================
              SYLLABUS
          ================================================= */}

          <Route
            path="/dashboard/syllabus"
            element={
              <PermissionRoute pageName="Syllabus">

                <Syllabus />

              </PermissionRoute>
            }
          />


          {/* =================================================
              SYLLABUS TOPICS
          ================================================= */}

          <Route
            path="/dashboard/syllabus/:subjectId/:academicYearId"
            element={
              <PermissionRoute pageName="Syllabus">

                <SyllabusTopics />

              </PermissionRoute>
            }
          />


          {/* =================================================
              EXAM
          ================================================= */}

          <Route
            path="/dashboard/exams"
            element={
              <PermissionRoute pageName="Exam">

                <Exam />

              </PermissionRoute>
            }
          />


          {/* =================================================
              ADD EXAM
          ================================================= */}

          <Route
            path="/dashboard/exams/add"
            element={
              <PermissionRoute pageName="Exam">

                <AddExam />

              </PermissionRoute>
            }
          />


          {/* =================================================
              EXAM TYPE MANAGEMENT
          ================================================= */}

          <Route
            path="/dashboard/exam-type-management"
            element={
              <PermissionRoute pageName="Exam">

                <ExamTypeManagement />

              </PermissionRoute>
            }
          />


          {/* =================================================
              EXAM TYPES
          ================================================= */}

          <Route
            path="/dashboard/exams/class/:className"
            element={
              <PermissionRoute pageName="Exam">

                <ExamTypes />

              </PermissionRoute>
            }
          />


          {/* =================================================
              EXAM SCHEDULE
          ================================================= */}

          <Route
            path="/dashboard/exams/:examId/schedule"
            element={
              <PermissionRoute pageName="Exam">

                <ExamSchedule />

              </PermissionRoute>
            }
          />


          {/* =================================================
              RESULT
              CLASS LIST
          ================================================= */}

          <Route
            path="/dashboard/results"
            element={
              <PermissionRoute pageName="Result">

                <Result />

              </PermissionRoute>
            }
          />


          {/* =================================================
              ADD RESULT
              RESULT → ADD RESULT
          ================================================= */}

          <Route
            path="/dashboard/results/add"
            element={
              <PermissionRoute pageName="Result">

                <AddResult />

              </PermissionRoute>
            }
          />


          {/* =================================================
              RESULT EXAM TYPES
              CLASS → EXAM TYPES
          ================================================= */}

          <Route
            path="/dashboard/results/class/:className"
            element={
              <PermissionRoute pageName="Result">

                <ResultExamType />

              </PermissionRoute>
            }
          />


          {/* =================================================
              RESULT STUDENTS
              CLASS → EXAM TYPE → STUDENTS
          ================================================= */}

          <Route
            path="/dashboard/results/class/:className/exam/:examId"
            element={
              <PermissionRoute pageName="Result">

                <ResultStudents />

              </PermissionRoute>
            }
          />


        </Route>


        {/* =================================================
            USER DATA GRID
        ================================================= */}

        <Route
          path="/data-grid/users"
          element={
            <ProtectedRoute>

              <div className="user-data-grid-page">

                <UserDataGrid />

              </div>

            </ProtectedRoute>
          }
        />


      </Routes>


      {/* =================================================
          COMMON FOOTER
      ================================================= */}

      <Footer />


    </BrowserRouter>

  );

}


export default App;