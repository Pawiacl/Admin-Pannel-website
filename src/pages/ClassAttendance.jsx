import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "../services/api";

import CommonCard from "../components/CommonCard";
import UserDataGrid from "../components/UserDataGrid";
import SearchBar from "../components/SearchBar";

import useSearchFilter from "../hooks/useSearchFilter";
import { sortStudents } from "../utils/classSort";

import "../Styles/ClassAttendance.css";

function ClassAttendance() {
  const navigate = useNavigate();
  const { classId } = useParams();

  const [students, setStudents] = useState([]);

  const [selectedSection, setSelectedSection] =
    useState("All");

  const [searchText, setSearchText] =
    useState("");

  const [attendance, setAttendance] =
    useState({});

  // Faculty remarks
  const [remarks, setRemarks] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  // =====================================================
  // SELECTED CLASS DISPLAY NAME
  // =====================================================

  const [classDisplayName, setClassDisplayName] =
    useState("");

  // =====================================================
  // LOAD STUDENTS + EXISTING ATTENDANCE
  // =====================================================

  useEffect(() => {
    fetchData();
  }, [classId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      setError("");
      setMessage("");

      const token =
        localStorage.getItem("token");

      // =================================================
      // 1. GET STUDENTS
      // =================================================

      const studentsResponse =
        await fetch(
          `${API}/students`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const studentsResult =
        await studentsResponse.json();

      console.log(
        "Students API Response:",
        studentsResult
      );

      if (
        !studentsResponse.ok ||
        !studentsResult.success
      ) {
        throw new Error(
          studentsResult.message ||
            "Failed to fetch students"
        );
      }

      const studentData =
        studentsResult.data || [];

      console.log(
        "Route Class ID:",
        classId
      );

      console.log(
        "Students Received:",
        studentData
      );

      if (studentData.length > 0) {
        console.log(
          "First Student:",
          studentData[0]
        );
      }

      // =================================================
      // COMMON STUDENT SORTING
      //
      // LKG → UKG → 1 → 2 → 3...
      // Section → Academic Year → Roll Number
      // =================================================

      const sortedStudents =
        sortStudents(studentData);

      setStudents(sortedStudents);

      // =================================================
      // 2. TODAY'S DATE
      // =================================================

      const today = new Date();

      const year =
        today.getFullYear();

      const month =
        String(
          today.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          today.getDate()
        ).padStart(2, "0");

      const todayDate =
        `${year}-${month}-${day}`;

      // =================================================
      // FIND CURRENT CLASS
      // =================================================

      const routeClassId =
        classId?.toString();

      const currentClass =
        studentData.find(
          (student) => {

            const studentClassId =
              student.classId
                ?.toString();

            const studentClassName =
              student.className
                ?.toString();

            return (
              studentClassId ===
                routeClassId ||
              studentClassName ===
                routeClassId
            );
          }
        );

      console.log(
        "Current Class Student:",
        currentClass
      );

      // =================================================
      // SET CLASS DISPLAY NAME
      // =================================================

      setClassDisplayName(
        currentClass?.className || ""
      );

      const selectedClassId =
        currentClass?.classId ||
        classId;

      console.log(
        "Selected Class ID:",
        selectedClassId
      );

      if (!selectedClassId) {
        setAttendance({});
        setRemarks({});
        return;
      }

      // =================================================
      // GET TODAY'S ATTENDANCE
      // =================================================

      const attendanceResponse =
        await fetch(
          `${API}/attendance/class/${encodeURIComponent(
            selectedClassId
          )}?date=${todayDate}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const attendanceResult =
        await attendanceResponse.json();

      console.log(
        "Attendance API Response:",
        attendanceResult
      );

      if (
        !attendanceResponse.ok ||
        !attendanceResult.success
      ) {
        throw new Error(
          attendanceResult.message ||
            "Failed to fetch attendance"
        );
      }

      const attendanceData =
        attendanceResult.data || [];

      // =================================================
      // 3. KEEP LATEST ATTENDANCE
      // =================================================

      const latestAttendance = {};

      attendanceData.forEach(
        (record) => {

          const studentId =
            record.studentId;

          const existing =
            latestAttendance[
              studentId
            ];

          if (
            !existing ||
            new Date(
              record.updatedAt
            ) >
              new Date(
                existing.updatedAt
              )
          ) {
            latestAttendance[
              studentId
            ] = record;
          }
        }
      );

      // =================================================
      // 4. CREATE ATTENDANCE STATE
      // =================================================

      const attendanceState = {};

      const remarksState = {};

      Object.values(
        latestAttendance
      ).forEach(
        (record) => {

          // Attendance status
          attendanceState[
            record.studentId
          ] = record.status;

          // Faculty remarks
          remarksState[
            record.studentId
          ] =
            record.remarks || "";
        }
      );

      console.log(
        "Latest Attendance:",
        latestAttendance
      );

      console.log(
        "Attendance State:",
        attendanceState
      );

      console.log(
        "Remarks State:",
        remarksState
      );

      setAttendance(
        attendanceState
      );

      setRemarks(
        remarksState
      );

    } catch (error) {

      console.error(
        "Fetch Attendance Data Error:",
        error
      );

      setError(
        error.message ||
          "Unable to load attendance"
      );

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // CHANGE PRESENT / ABSENT
  // =====================================================

  const handleAttendanceChange = (
    studentId,
    status
  ) => {

    setAttendance(
      (previousAttendance) => ({
        ...previousAttendance,

        [studentId]:
          status,
      })
    );

    setMessage("");
    setError("");
  };

  // =====================================================
  // CHANGE REMARKS
  // =====================================================

  const handleRemarksChange = (
    studentId,
    value
  ) => {

    setRemarks(
      (previousRemarks) => ({
        ...previousRemarks,

        [studentId]:
          value,
      })
    );

    setMessage("");
    setError("");
  };

  // =====================================================
  // FILTER STUDENTS BY CLASS + SECTION
  // =====================================================

  const sectionStudents =
    students.filter(
      (student) => {

        const routeClassId =
          classId?.toString();

        const studentClassId =
          student.classId
            ?.toString();

        const studentClassName =
          student.className
            ?.toString();

        const classMatch =
          studentClassId ===
            routeClassId ||
          studentClassName ===
            routeClassId;

        const sectionMatch =
          selectedSection ===
            "All" ||
          student.section
            ?.toString() ===
            selectedSection
              ?.toString();

        return (
          classMatch &&
          sectionMatch
        );
      }
    );

  console.log(
    "Filtered Section Students:",
    sectionStudents
  );

  // =====================================================
  // SUMMARY COUNTS
  // =====================================================

  const totalStudents =
    sectionStudents.length;

  const presentCount =
    sectionStudents.filter(
      (student) =>
        attendance[
          student._id
        ] === "Present"
    ).length;

  const absentCount =
    sectionStudents.filter(
      (student) =>
        attendance[
          student._id
        ] === "Absent"
    ).length;

  // =====================================================
  // PREPARE SEARCH DATA
  // =====================================================

  const searchableStudents =
    sectionStudents.map(
      (student) => {

        const firstName =
          student.firstName
            ?.toString()
            .trim() || "";

        const lastName =
          student.lastName
            ?.toString()
            .trim() || "";

        return {
          ...student,

          name:
            `${firstName} ${lastName}`.trim(),

          fullName:
            `${firstName} ${lastName}`.trim(),

          reverseFullName:
            `${lastName} ${firstName}`.trim(),
        };
      }
    );

  // =====================================================
  // COMMON SEARCH
  // =====================================================

  const searchedStudents =
    useSearchFilter(
      searchableStudents,
      searchText,
      [
        "firstName",
        "lastName",
        "name",
        "fullName",
        "reverseFullName",
        "rollNumber",
      ]
    );

  // =====================================================
  // PREPARE GRID ROWS
  // =====================================================

  const filteredStudents =
    searchedStudents.map(
      (student) => ({

        ...student,

        id: student._id,

        name:
          `${student.firstName || ""} ${
            student.lastName || ""
          }`.trim(),
      })
    );

  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = () => {

    setMessage(
      "Attendance and remarks saved temporarily."
    );

    setError("");
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async () => {

    try {

      setSubmitting(true);

      setMessage("");
      setError("");

      if (
        sectionStudents.length ===
        0
      ) {

        setError(
          "No students found for this class and section."
        );

        return;
      }

      // =================================================
      // CHECK ATTENDANCE
      // =================================================

      const incompleteStudents =
        sectionStudents.filter(
          (student) =>
            !attendance[
              student._id
            ]
        );

      if (
        incompleteStudents.length >
        0
      ) {

        setError(
          `Please mark attendance for all ${incompleteStudents.length} remaining student(s).`
        );

        return;
      }

      // =================================================
      // CHECK ABSENT STUDENTS REMARKS
      // =================================================

      const absentStudentsWithoutRemarks =
        sectionStudents.filter(
          (student) =>
            attendance[
              student._id
            ] === "Absent" &&
            !remarks[
              student._id
            ]?.trim()
        );

      if (
        absentStudentsWithoutRemarks.length >
        0
      ) {

        setError(
          `Please enter remarks for ${absentStudentsWithoutRemarks.length} absent student(s).`
        );

        return;
      }

      const token =
        localStorage.getItem(
          "token"
        );

      // =================================================
      // SUBMIT EACH STUDENT
      // =================================================

      for (
        const student of sectionStudents
      ) {

        const response =
          await fetch(
            `${API}/attendance`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({

                studentId:
                  student._id,

                classId:
                  student.classId,

                className:
                  student.className,

                section:
                  student.section,

                date:
                  new Date(),

                status:
                  attendance[
                    student._id
                  ],

                remarks:
                  remarks[
                    student._id
                  ] || "",
              }),
            }
          );

        const result =
          await response.json();

        console.log(
          "Attendance Submit Response:",
          result
        );

        if (
          !response.ok ||
          !result.success
        ) {

          throw new Error(
            result.message ||
              `Failed to save attendance for ${student.firstName}`
          );
        }
      }

      setMessage(
        "Attendance and remarks submitted successfully."
      );

      // Reload DB data
      await fetchData();

    } catch (error) {

      console.error(
        "Submit Attendance Error:",
        error
      );

      setError(
        error.message ||
          "Failed to submit attendance."
      );

    } finally {

      setSubmitting(false);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {

    setAttendance({});
    setRemarks({});

    setMessage("");
    setError("");
  };

  // =====================================================
  // DATA GRID COLUMNS
  // =====================================================

  const columns = [

    {
      field: "rollNumber",

      headerName:
        "Roll Number",

      flex: 1,

      minWidth: 150,
    },

    {
      field: "name",

      headerName:
        "Student Name",

      flex: 1.5,

      minWidth: 200,
    },

    {
      field: "section",

      headerName:
        "Section",

      flex: 1,

      minWidth: 150,
    },

    // =================================================
    // ATTENDANCE COLUMN
    // =================================================

    {
      field: "attendance",

      headerName:
        "Attendance",

      flex: 2,

      minWidth: 300,

      sortable: false,

      filterable: false,

      renderCell: (params) => {

        const studentId =
          params.row.id;

        return (

          <div className="attendance-radio-group">

            <label>

              <input
                type="radio"

                name={`attendance-${studentId}`}

                value="Present"

                checked={
                  attendance[
                    studentId
                  ] === "Present"
                }

                onChange={() =>
                  handleAttendanceChange(
                    studentId,
                    "Present"
                  )
                }
              />

              Present

            </label>

            <label>

              <input
                type="radio"

                name={`attendance-${studentId}`}

                value="Absent"

                checked={
                  attendance[
                    studentId
                  ] === "Absent"
                }

                onChange={() =>
                  handleAttendanceChange(
                    studentId,
                    "Absent"
                  )
                }
              />

              Absent

            </label>

          </div>
        );
      },
    },

    // =================================================
    // REMARKS COLUMN
    // =================================================

    {
      field: "remarks",

      headerName:
        "Remarks",

      flex: 2,

      minWidth: 280,

      sortable: false,

      filterable: false,

      renderCell: (params) => {

        const studentId =
          params.row.id;

        const isAbsent =
          attendance[
            studentId
          ] === "Absent";

        return (

          <input
            type="text"

            className={`attendance-remarks-input ${
              isAbsent
                ? "remarks-required"
                : ""
            }`}

            placeholder={
              isAbsent
                ? "Remarks required for absent student"
                : "Enter remarks"
            }

            value={
              remarks[
                studentId
              ] || ""
            }

            onChange={(e) =>
              handleRemarksChange(
                studentId,
                e.target.value
              )
            }
          />
        );
      },
    },
  ];

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="class-attendance-page">

        <div className="class-attendance-header">

          <div>

            <button
              type="button"

              className="attendance-back-button"

              onClick={() =>
                navigate(-1)
              }
            >
              ← Go Back
            </button>

            <h1>
              Class {classDisplayName ||
                "Loading"} -
              Attendance
            </h1>

            <p className="class-attendance-subtitle">
              Loading attendance...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (
    error &&
    students.length === 0
  ) {

    return (

      <div className="class-attendance-page">

        <div className="class-attendance-header">

          <div>

            <button
              type="button"

              className="attendance-back-button"

              onClick={() =>
                navigate(-1)
              }
            >
              ← Go Back
            </button>

            <h1>
              Class {classDisplayName ||
                "Selected Class"} -
              Attendance
            </h1>

            <p className="class-attendance-subtitle">
              {error}
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (

    <div className="class-attendance-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="class-attendance-header">

        <div>

          <button
            type="button"

            className="attendance-back-button"

            onClick={() =>
              navigate(-1)
            }
          >
            ← Go Back
          </button>

          <h1>
            Class {classDisplayName ||
              "Selected Class"} -
            Attendance
          </h1>

          <p className="class-attendance-subtitle">
            Manage Student Attendance
          </p>

        </div>

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="attendance-summary">

        <CommonCard
          variant="summary"
          padding={false}
          className="attendance-summary-card"
        >

          <h3>
            Total Students
          </h3>

          <p>
            {totalStudents}
          </p>

        </CommonCard>

        <CommonCard
          variant="summary"
          padding={false}
          className="attendance-summary-card"
        >

          <h3>
            Present
          </h3>

          <p>
            {presentCount}
          </p>

        </CommonCard>

        <CommonCard
          variant="summary"
          padding={false}
          className="attendance-summary-card"
        >

          <h3>
            Absent
          </h3>

          <p>
            {absentCount}
          </p>

        </CommonCard>

      </div>

      {/* =================================================
          CONTROLS
      ================================================= */}

      <div className="class-attendance-controls">

        <div className="section-control">

          <label htmlFor="section">
            Section
          </label>

          <select
            id="section"

            value={
              selectedSection
            }

            onChange={(e) =>
              setSelectedSection(
                e.target.value
              )
            }
          >

            <option value="All">
              All
            </option>

            <option value="A">
              A
            </option>

            <option value="B">
              B
            </option>

            <option value="C">
              C
            </option>

          </select>

        </div>

        {/* =================================================
            COMMON SEARCH BAR
        ================================================= */}

        <div className="search-control">

          <label>
            Search
          </label>

          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search name or roll number"
          />

        </div>

      </div>

      {/* =================================================
          MESSAGES
      ================================================= */}

      {message && (

        <p className="attendance-success-message">
          {message}
        </p>

      )}

      {error &&
        students.length > 0 && (

          <p className="attendance-error-message">
            {error}
          </p>

        )}

      {/* =================================================
          COMMON USER DATA GRID
      ================================================= */}

      <div className="attendance-grid-container">

        <UserDataGrid
          rows={filteredStudents}
          loading={loading}
          columns={columns}
        />

      </div>

      {/* =================================================
          ACTION BUTTONS
      ================================================= */}

      <div className="attendance-action-buttons">

        <button
          type="button"

          className="attendance-save-button"

          onClick={
            handleSave
          }
        >
          Save
        </button>

        <button
          type="button"

          className="attendance-submit-button"

          onClick={
            handleSubmit
          }

          disabled={
            submitting
          }
        >

          {submitting
            ? "Submitting..."
            : "Submit"}

        </button>

        <button
          type="button"

          className="attendance-cancel-button"

          onClick={
            handleCancel
          }

          disabled={
            submitting
          }
        >
          Cancel
        </button>

      </div>

    </div>
  );
}

export default ClassAttendance;