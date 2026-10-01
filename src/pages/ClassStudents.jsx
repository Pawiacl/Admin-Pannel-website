import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import API from "../services/api";

import UserDataGrid from "../components/UserDataGrid";
import CommonCard from "../components/CommonCard";
import SearchBar from "../components/SearchBar";

import useSearchFilter from "../hooks/useSearchFilter";

import "../Styles/ClassStudents.css";

function ClassStudents() {
  const { classId, section, academicYear } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [originalStudents, setOriginalStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  /* =========================================
     SEARCH
  ========================================= */

  const [searchTerm, setSearchTerm] = useState("");

  /* =========================================
     CLASS TEACHER
  ========================================= */

  const [classTeacher, setClassTeacher] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =========================================
     STATUS REMARKS MODAL
  ========================================= */

  const [statusModalOpen, setStatusModalOpen] =
    useState(false);

  const [statusStudentId, setStatusStudentId] =
    useState(null);

  const [statusModalType, setStatusModalType] =
    useState("");

  const [statusRemarks, setStatusRemarks] =
    useState("");

  /* =========================================
     PASS MODAL
  ========================================= */

  const [passModalOpen, setPassModalOpen] =
    useState(false);

  const [passStudentId, setPassStudentId] =
    useState(null);

  const [passRemarks, setPassRemarks] =
    useState("");

  const [passStudentType, setPassStudentType] =
    useState("");

  /* =========================================
     FAIL MODAL
  ========================================= */

  const [failModalOpen, setFailModalOpen] =
    useState(false);

  const [failStudentId, setFailStudentId] =
    useState(null);

  const [
    selectedFailSubjects,
    setSelectedFailSubjects,
  ] = useState([]);

  const [failRemarks, setFailRemarks] =
    useState("");

  const [failStudentType, setFailStudentType] =
    useState("");

  /* =========================================
     PAGE DETAILS
  ========================================= */

  const className =
    location.state?.className || "Class";

  const decodedSection =
    decodeURIComponent(section || "");

  const decodedAcademicYear =
    decodeURIComponent(academicYear || "");

  /* =========================================
     FETCH STUDENTS
  ========================================= */

  useEffect(() => {
    fetchStudents();
  }, [classId, section, academicYear]);

  /* =========================================
     FETCH CLASS TEACHER
  ========================================= */

  useEffect(() => {
    fetchClassTeacher();
  }, [classId, section, academicYear]);

  /* =========================================
     FETCH SUBJECTS
  ========================================= */

  useEffect(() => {
    fetchSubjects();
  }, []);

  /* =========================================
     FETCH CLASS TEACHER
  ========================================= */

  const fetchClassTeacher = async () => {
    try {
      const token = localStorage.getItem("token");

      const teacherResponse = await fetch(
        `${API}/classTeachers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const teacherResult =
        await teacherResponse.json();

      console.log(
        "Class Teacher API Response:",
        teacherResult
      );

      if (
        !teacherResult.success ||
        !Array.isArray(teacherResult.data)
      ) {
        setClassTeacher("");
        return;
      }

      const assignment =
        teacherResult.data.find(
          (item) =>
            item.classId?.toString() ===
              classId?.toString() &&
            item.section
              ?.toString()
              .trim()
              .toLowerCase() ===
              decodedSection
                .toString()
                .trim()
                .toLowerCase() &&
            item.academicYear
              ?.toString()
              .trim()
              .toLowerCase() ===
              decodedAcademicYear
                .toString()
                .trim()
                .toLowerCase()
        );

      console.log(
        "Matching Class Teacher Assignment:",
        assignment
      );

      if (!assignment) {
        setClassTeacher("");
        return;
      }

      const facultyResponse = await fetch(
        `${API}/data-grid/users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const facultyResult =
        await facultyResponse.json();

      console.log(
        "Faculty API Response:",
        facultyResult
      );

      if (
        !facultyResult.success ||
        !Array.isArray(facultyResult.data)
      ) {
        setClassTeacher("");
        return;
      }

      const faculty =
        facultyResult.data.find(
          (user) =>
            (
              user._id ||
              user.userId ||
              user.id
            )?.toString() ===
            assignment.facultyId?.toString()
        );

      if (!faculty) {
        setClassTeacher("");
        return;
      }

      const facultyName =
        `${faculty.firstName || ""} ${
          faculty.lastName || ""
        }`.trim();

      setClassTeacher(
        facultyName || "Faculty"
      );
    } catch (error) {
      console.error(
        "Failed to fetch class teacher:",
        error
      );

      setClassTeacher("");
    }
  };

  /* =========================================
     FETCH SUBJECTS
  ========================================= */

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API}/subjects`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      console.log(
        "Subjects API Response:",
        result
      );

      if (result.success) {
        setSubjects(
          Array.isArray(result.data)
            ? result.data
            : []
        );
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch subjects:",
        error
      );

      setSubjects([]);
    }
  };

  /* =========================================
     FETCH STUDENTS
  ========================================= */

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API}/data-grid/users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      console.log(
        "Class Students API Response:",
        result
      );

      if (!result.success) {
        setStudents([]);
        setOriginalStudents([]);
        return;
      }

      const filteredStudents =
        result.data
          .filter(
            (student) =>
              student.userType
                ?.toString()
                .trim()
                .toLowerCase() ===
              "student"
          )
          .filter(
            (student) =>
              student.className
                ?.toString()
                .trim()
                .toLowerCase() ===
              className
                .toString()
                .trim()
                .toLowerCase()
          )
          .filter(
            (student) =>
              student.section
                ?.toString()
                .trim()
                .toLowerCase() ===
              decodedSection
                .toString()
                .trim()
                .toLowerCase()
          )
          .filter(
            (student) =>
              student.academicYear
                ?.toString()
                .trim()
                .toLowerCase() ===
              decodedAcademicYear
                .toString()
                .trim()
                .toLowerCase()
          )
          .map((student) => ({
            _id: student._id,
            userId: student.userId,

            rollNumber:
              student.rollNumber || "",

            firstName:
              student.firstName || "",

            lastName:
              student.lastName || "",

            email:
              student.email || "",

            dateOfBirth:
              student.dateOfBirth || "",

            academicYear:
              student.academicYear ||
              decodedAcademicYear,

            status:
              student.status || "Active",

            statusRemarks:
              student.statusRemarks || "",

            pass:
              student.pass === true,

            passRemarks:
              student.passRemarks || "",

            fail:
              student.fail === true,

            failSubjects:
              Array.isArray(
                student.failSubjects
              )
                ? student.failSubjects
                : student.failSubject
                  ? [student.failSubject]
                  : [],

            failRemarks:
              student.failRemarks || "",

            studentType:
              student.studentType || "",

            performanceHistory:
              Array.isArray(
                student.performanceHistory
              )
                ? student.performanceHistory
                : [],
          }));

      setStudents(filteredStudents);

      setOriginalStudents(
        JSON.parse(
          JSON.stringify(filteredStudents)
        )
      );
    } catch (error) {
      console.error(
        "Failed to fetch students:",
        error
      );

      setStudents([]);
      setOriginalStudents([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     COMMON SEARCH FILTER
  ========================================= */

  const filteredStudents =
    useSearchFilter(
      students,
      searchTerm,
      [
        "firstName",
        "lastName",
        "rollNumber",
        "email",
      ]
    );

  /* =========================================
     STATUS CHANGE
  ========================================= */

  const handleStatusChange = (
    studentId,
    newStatus
  ) => {
    if (
      newStatus === "Inactive" ||
      newStatus === "Irregular"
    ) {
      const student = students.find(
        (item) =>
          item._id === studentId
      );

      setStatusStudentId(studentId);

      setStatusModalType(newStatus);

      setStatusRemarks(
        student?.statusRemarks || ""
      );

      setStatusModalOpen(true);

      return;
    }

    setStudents(
      (previousStudents) =>
        previousStudents.map(
          (student) => {
            if (
              student._id !== studentId
            ) {
              return student;
            }

            return {
              ...student,
              status: "Active",
              statusRemarks: "",
            };
          }
        )
    );
  };

  /* =========================================
     STATUS MODAL SUBMIT
  ========================================= */

  const handleStatusModalSubmit = () => {
    if (!statusRemarks.trim()) {
      alert(
        `Remarks are required for ${statusModalType.toLowerCase()} student.`
      );

      return;
    }

    setStudents(
      (previousStudents) =>
        previousStudents.map(
          (student) => {
            if (
              student._id !==
              statusStudentId
            ) {
              return student;
            }

            return {
              ...student,
              status: statusModalType,
              statusRemarks:
                statusRemarks.trim(),
            };
          }
        )
    );

    closeStatusModal();
  };

  /* =========================================
     CLOSE STATUS MODAL
  ========================================= */

  const closeStatusModal = () => {
    setStatusModalOpen(false);
    setStatusStudentId(null);
    setStatusModalType("");
    setStatusRemarks("");
  };

  /* =========================================
     PASS / FAIL CHANGE
  ========================================= */

  const handleResultChange = (
    studentId,
    resultType
  ) => {
    const student = students.find(
      (item) =>
        item._id === studentId
    );

    if (!student) {
      return;
    }

    /* =====================================
       PASS
    ===================================== */

    if (resultType === "pass") {
      const newPass = !student.pass;

      if (!newPass) {
        setStudents(
          (previousStudents) =>
            previousStudents.map(
              (item) => {
                if (
                  item._id !== studentId
                ) {
                  return item;
                }

                return {
                  ...item,
                  pass: false,
                  passRemarks: "",
                  fail: false,
                  failSubjects: [],
                  failRemarks: "",
                  studentType: "",
                };
              }
            )
        );

        return;
      }

      setPassStudentId(studentId);

      setPassRemarks(
        student.passRemarks || ""
      );

      setPassStudentType(
        student.studentType || ""
      );

      setPassModalOpen(true);

      return;
    }

    /* =====================================
       FAIL
    ===================================== */

    if (resultType === "fail") {
      const newFail = !student.fail;

      if (!newFail) {
        setStudents(
          (previousStudents) =>
            previousStudents.map(
              (item) => {
                if (
                  item._id !== studentId
                ) {
                  return item;
                }

                return {
                  ...item,
                  fail: false,
                  failSubjects: [],
                  failRemarks: "",
                  studentType: "",
                };
              }
            )
        );

        return;
      }

      setFailStudentId(studentId);

      setSelectedFailSubjects(
        student.failSubjects || []
      );

      setFailRemarks(
        student.failRemarks || ""
      );

      setFailStudentType(
        student.studentType || ""
      );

      setFailModalOpen(true);
    }
  };

  /* =========================================
     PASS MODAL SUBMIT
  ========================================= */

  const handlePassModalSubmit = () => {
    if (!passStudentType) {
      alert(
        "Please select student type."
      );

      return;
    }

    if (!passRemarks.trim()) {
      alert(
        "Please enter pass remarks."
      );

      return;
    }

    setStudents(
      (previousStudents) =>
        previousStudents.map(
          (student) => {
            if (
              student._id !==
              passStudentId
            ) {
              return student;
            }

            return {
              ...student,

              pass: true,

              passRemarks:
                passRemarks.trim(),

              fail: false,

              failSubjects: [],

              failRemarks: "",

              studentType:
                passStudentType,
            };
          }
        )
    );

    closePassModal();
  };

  /* =========================================
     CLOSE PASS MODAL
  ========================================= */

  const closePassModal = () => {
    setPassModalOpen(false);
    setPassStudentId(null);
    setPassRemarks("");
    setPassStudentType("");
  };

  /* =========================================
     FAIL SUBJECT CHECKBOX
  ========================================= */

  const handleFailSubjectChange = (
    subjectName
  ) => {
    setSelectedFailSubjects(
      (previousSubjects) => {
        if (
          previousSubjects.includes(
            subjectName
          )
        ) {
          return previousSubjects.filter(
            (subject) =>
              subject !== subjectName
          );
        }

        return [
          ...previousSubjects,
          subjectName,
        ];
      }
    );
  };

  /* =========================================
     FAIL MODAL SUBMIT
  ========================================= */

  const handleFailModalSubmit = () => {
    if (
      selectedFailSubjects.length === 0
    ) {
      alert(
        "Please select at least one failed subject."
      );

      return;
    }

    if (!failStudentType) {
      alert(
        "Please select student type."
      );

      return;
    }

    if (!failRemarks.trim()) {
      alert(
        "Please enter fail remarks."
      );

      return;
    }

    setStudents(
      (previousStudents) =>
        previousStudents.map(
          (student) => {
            if (
              student._id !==
              failStudentId
            ) {
              return student;
            }

            return {
              ...student,

              fail: true,

              pass: false,

              passRemarks: "",

              failSubjects:
                selectedFailSubjects,

              failRemarks:
                failRemarks.trim(),

              studentType:
                failStudentType,
            };
          }
        )
    );

    closeFailModal();
  };

  /* =========================================
     CLOSE FAIL MODAL
  ========================================= */

  const closeFailModal = () => {
    setFailModalOpen(false);
    setFailStudentId(null);
    setSelectedFailSubjects([]);
    setFailRemarks("");
    setFailStudentType("");
  };

  /* =========================================
     SUBMIT ALL
  ========================================= */

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const token =
        localStorage.getItem("token");

      /* =====================================
         VALIDATION
      ===================================== */

      for (const student of students) {
        if (
          student.status === "Inactive" ||
          student.status === "Irregular"
        ) {
          if (
            !student.statusRemarks?.trim()
          ) {
            alert(
              `Please enter remarks for ${student.firstName} ${student.lastName}.`
            );

            setSaving(false);

            return;
          }
        }

        if (student.pass === true) {
          if (!student.studentType) {
            alert(
              `Please select student type for ${student.firstName} ${student.lastName}.`
            );

            setSaving(false);

            return;
          }

          if (
            !student.passRemarks?.trim()
          ) {
            alert(
              `Please enter pass remarks for ${student.firstName} ${student.lastName}.`
            );

            setSaving(false);

            return;
          }
        }

        if (student.fail === true) {
          if (
            !student.failSubjects ||
            student.failSubjects.length === 0
          ) {
            alert(
              `Please select failed subjects for ${student.firstName} ${student.lastName}.`
            );

            setSaving(false);

            return;
          }

          if (!student.studentType) {
            alert(
              `Please select student type for ${student.firstName} ${student.lastName}.`
            );

            setSaving(false);

            return;
          }

          if (
            !student.failRemarks?.trim()
          ) {
            alert(
              `Please enter fail remarks for ${student.firstName} ${student.lastName}.`
            );

            setSaving(false);

            return;
          }
        }
      }

      /* =====================================
         UPDATE STUDENTS
      ===================================== */

      await Promise.all(
        students.map(async (student) => {
          const history =
            Array.isArray(
              student.performanceHistory
            )
              ? [
                  ...student.performanceHistory,
                ]
              : [];

          const currentYearIndex =
            history.findIndex(
              (item) =>
                item.academicYear
                  ?.toString()
                  .trim()
                  .toLowerCase() ===
                decodedAcademicYear
                  .toString()
                  .trim()
                  .toLowerCase()
            );

          /* =================================
             CURRENT YEAR HISTORY
          ================================= */

          const currentHistory = {
            academicYear:
              decodedAcademicYear,

            status:
              student.status,

            statusRemarks:
              student.status ===
                "Inactive" ||
              student.status ===
                "Irregular"
                ? student.statusRemarks ||
                  ""
                : "",

            pass:
              student.pass === true,

            passRemarks:
              student.pass === true
                ? student.passRemarks ||
                  ""
                : "",

            fail:
              student.fail === true,

            failSubjects:
              student.fail === true
                ? student.failSubjects ||
                  []
                : [],

            failRemarks:
              student.fail === true
                ? student.failRemarks ||
                  ""
                : "",

            studentType:
              student.pass === true ||
              student.fail === true
                ? student.studentType ||
                  ""
                : "",
          };

          if (
            currentYearIndex !== -1
          ) {
            history[
              currentYearIndex
            ] = currentHistory;
          } else {
            history.push(
              currentHistory
            );
          }

          /* =================================
             API UPDATE
          ================================= */

          const response =
            await fetch(
              `${API}/students/${student._id}`,
              {
                method: "PUT",

                headers: {
                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },

                body: JSON.stringify({
                  status:
                    student.status,

                  statusRemarks:
                    student.status ===
                      "Inactive" ||
                    student.status ===
                      "Irregular"
                      ? student.statusRemarks ||
                        ""
                      : "",

                  pass:
                    student.pass === true,

                  passRemarks:
                    student.pass === true
                      ? student.passRemarks ||
                        ""
                      : "",

                  fail:
                    student.fail === true,

                  failSubjects:
                    student.fail === true
                      ? student.failSubjects ||
                        []
                      : [],

                  failRemarks:
                    student.fail === true
                      ? student.failRemarks ||
                        ""
                      : "",

                  studentType:
                    student.pass === true ||
                    student.fail === true
                      ? student.studentType ||
                        ""
                      : "",

                  performanceHistory:
                    history,
                }),
              }
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
                `Failed to update ${student.firstName} ${student.lastName}`
            );
          }
        })
      );

      alert(
        "Student details updated successfully"
      );

      await fetchStudents();
    } catch (error) {
      console.error(
        "Failed to submit student details:",
        error
      );

      alert(
        error.message ||
          "Failed to update student details"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     CANCEL MAIN CHANGES
  ========================================= */

  const handleCancel = () => {
    setStudents(
      JSON.parse(
        JSON.stringify(
          originalStudents
        )
      )
    );

    closeStatusModal();
    closePassModal();
    closeFailModal();
  };

  /* =========================================
     BACK
  ========================================= */

  const handleBack = () => {
    navigate(
      `/dashboard/classes/${classId}/${section}`,
      {
        state: {
          className,

          section:
            decodedSection,

          academicYear:
            location.state
              ?.academicYear ||
            decodedAcademicYear,
        },
      }
    );
  };

  /* =========================================
     DATE FORMAT
  ========================================= */

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return "";
    }

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  /* =========================================
     DATAGRID COLUMNS
  ========================================= */

  const studentColumns = [
    {
      field: "rollNumber",
      headerName: "Roll Number",
      flex: 1,
      minWidth: 120,
    },

    {
      field: "firstName",
      headerName: "First Name",
      flex: 1,
      minWidth: 130,
    },

    {
      field: "lastName",
      headerName: "Last Name",
      flex: 1,
      minWidth: 130,
    },

    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 220,
    },

    {
      field: "dateOfBirth",
      headerName: "Date Of Birth",
      flex: 1,
      minWidth: 140,
      valueFormatter: (value) =>
        formatDate(value),
    },

    /* =====================================
       STATUS
    ===================================== */

    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      sortable: false,

      renderCell: (params) => {
        const status =
          params.value || "Active";

        const statusClass =
          status
            .toString()
            .toLowerCase()
            .replace(/\s+/g, "-");

        return (
          <select
            className={`class-student-status-dropdown ${statusClass}`}
            value={status}
            onChange={(event) =>
              handleStatusChange(
                params.row._id,
                event.target.value
              )
            }
            disabled={saving}
          >
            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

            <option value="Irregular">
              Irregular
            </option>
          </select>
        );
      },
    },

    /* =====================================
       PASS
    ===================================== */

    {
      field: "pass",
      headerName: "Pass",
      flex: 0.7,
      minWidth: 90,
      sortable: false,
      filterable: false,

      renderCell: (params) => (
        <input
          type="checkbox"
          className="class-student-result-checkbox"
          checked={
            params.row.pass === true
          }
          onChange={() =>
            handleResultChange(
              params.row._id,
              "pass"
            )
          }
          disabled={saving}
        />
      ),
    },

    /* =====================================
       FAIL
    ===================================== */

    {
      field: "fail",
      headerName: "Fail",
      flex: 0.7,
      minWidth: 90,
      sortable: false,
      filterable: false,

      renderCell: (params) => (
        <input
          type="checkbox"
          className="class-student-result-checkbox"
          checked={
            params.row.fail === true
          }
          onChange={() =>
            handleResultChange(
              params.row._id,
              "fail"
            )
          }
          disabled={saving}
        />
      ),
    },
  ];

  /* =========================================
     JSX
  ========================================= */

  return (
    <div className="class-students-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="class-students-header">

        <button
          type="button"
          className="class-students-back-button"
          onClick={handleBack}
        >
          ← Back
        </button>

        <div>

          <h1>
            {className}
          </h1>

          <p>
            Section {decodedSection}
          </p>

          <span>
            Academic Year:{" "}
            <strong>
              {decodedAcademicYear}
            </strong>
          </span>

          <span className="class-teacher-info">
            Class Teacher:{" "}
            <strong>
              {classTeacher ||
                "Not Assigned"}
            </strong>
          </span>

        </div>

      </div>

      {/* =====================================
          TITLE + SEARCH
      ===================================== */}

      <div className="class-students-title">

        <div>
          <h2>
            Students
          </h2>

          <span>
            Total Students:{" "}
            {students.length}
          </span>
        </div>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search student or roll number"
        />

      </div>

      {/* =====================================
          COMMON DATA GRID
      ===================================== */}

      <UserDataGrid
        rows={filteredStudents}
        loading={loading}
        columns={studentColumns}
      />

      {/* =====================================
          MAIN ACTIONS
      ===================================== */}

      <div className="class-students-actions">

        <button
          type="button"
          className="class-students-submit-button"
          onClick={handleSubmit}
          disabled={
            saving || loading
          }
        >
          {saving
            ? "Submitting..."
            : "Submit"}
        </button>

        <button
          type="button"
          className="class-students-cancel-button"
          onClick={handleCancel}
          disabled={
            saving || loading
          }
        >
          Cancel
        </button>

      </div>

      {/* =====================================
          INACTIVE / IRREGULAR MODAL
      ===================================== */}

      {statusModalOpen && (
        <div className="class-student-modal-overlay">

          <CommonCard
            className="class-student-modal"
            title={`${statusModalType} Student Remarks`}
            actions={
              <button
                type="button"
                className="class-student-modal-close"
                onClick={
                  closeStatusModal
                }
              >
                ×
              </button>
            }
          >

            <div className="class-student-modal-content">

              <div className="class-student-form-group">

                <label>
                  Remarks
                </label>

                <textarea
                  value={statusRemarks}
                  onChange={(event) =>
                    setStatusRemarks(
                      event.target.value
                    )
                  }
                  placeholder={
                    statusModalType ===
                    "Inactive"
                      ? "Enter inactive reason..."
                      : "Enter irregular reason..."
                  }
                  rows={5}
                />

              </div>

              <div className="class-student-modal-actions">

                <button
                  type="button"
                  className="class-student-modal-cancel"
                  onClick={
                    closeStatusModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="class-student-modal-submit"
                  onClick={
                    handleStatusModalSubmit
                  }
                >
                  Submit
                </button>

              </div>

            </div>

          </CommonCard>

        </div>
      )}

      {/* =====================================
          PASS MODAL
      ===================================== */}

      {passModalOpen && (
        <div className="class-student-modal-overlay">

          <CommonCard
            className="class-student-modal"
            title="Passed Student Details"
            actions={
              <button
                type="button"
                className="class-student-modal-close"
                onClick={
                  closePassModal
                }
              >
                ×
              </button>
            }
          >

            <div className="class-student-modal-content">

              <div className="class-student-form-group">

                <label>
                  Student Type
                </label>

                <div className="class-student-radio-group">

                  <label>
                    <input
                      type="radio"
                      name="passStudentType"
                      value="Same School Student"
                      checked={
                        passStudentType ===
                        "Same School Student"
                      }
                      onChange={(event) =>
                        setPassStudentType(
                          event.target.value
                        )
                      }
                    />

                    <span>
                      Same School Student
                    </span>
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="passStudentType"
                      value="New Student - Other School"
                      checked={
                        passStudentType ===
                        "New Student - Other School"
                      }
                      onChange={(event) =>
                        setPassStudentType(
                          event.target.value
                        )
                      }
                    />

                    <span>
                      New Student - Other School
                    </span>
                  </label>

                </div>

              </div>

              <div className="class-student-form-group">

                <label>
                  Remarks
                </label>

                <textarea
                  value={passRemarks}
                  onChange={(event) =>
                    setPassRemarks(
                      event.target.value
                    )
                  }
                  placeholder="Enter pass remarks..."
                  rows={5}
                />

              </div>

              <div className="class-student-modal-actions">

                <button
                  type="button"
                  className="class-student-modal-cancel"
                  onClick={
                    closePassModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="class-student-modal-submit"
                  onClick={
                    handlePassModalSubmit
                  }
                >
                  Submit
                </button>

              </div>

            </div>

          </CommonCard>

        </div>
      )}

      {/* =====================================
          FAIL MODAL
      ===================================== */}

      {failModalOpen && (
        <div className="class-student-modal-overlay">

          <CommonCard
            className="class-student-modal class-student-performance-modal"
            title="Failed Student Details"
            actions={
              <button
                type="button"
                className="class-student-modal-close"
                onClick={
                  closeFailModal
                }
              >
                ×
              </button>
            }
          >

            <div className="class-student-modal-content">

              <div className="class-student-form-group">

                <label>
                  Failed Subjects
                </label>

                <div className="class-student-subject-list">

                  {subjects.length === 0 ? (
                    <p>
                      No subjects available.
                    </p>
                  ) : (
                    subjects.map(
                      (subject) => {

                        const subjectName =
                          subject.subjectName ||
                          subject.name ||
                          subject.subject ||
                          "";

                        if (!subjectName) {
                          return null;
                        }

                        return (
                          <label
                            key={
                              subject._id ||
                              subjectName
                            }
                            className="class-student-subject-item"
                          >

                            <input
                              type="checkbox"
                              checked={selectedFailSubjects.includes(
                                subjectName
                              )}
                              onChange={() =>
                                handleFailSubjectChange(
                                  subjectName
                                )
                              }
                            />

                            <span>
                              {subjectName}
                            </span>

                          </label>
                        );
                      }
                    )
                  )}

                </div>

              </div>

              <div className="class-student-form-group">

                <label>
                  Student Type
                </label>

                <div className="class-student-radio-group">

                  <label>
                    <input
                      type="radio"
                      name="failStudentType"
                      value="Same School Student"
                      checked={
                        failStudentType ===
                        "Same School Student"
                      }
                      onChange={(event) =>
                        setFailStudentType(
                          event.target.value
                        )
                      }
                    />

                    <span>
                      Same School Student
                    </span>
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="failStudentType"
                      value="New Student - Other School"
                      checked={
                        failStudentType ===
                        "New Student - Other School"
                      }
                      onChange={(event) =>
                        setFailStudentType(
                          event.target.value
                        )
                      }
                    />

                    <span>
                      New Student - Other School
                    </span>
                  </label>

                </div>

              </div>

              <div className="class-student-form-group">

                <label>
                  Remarks
                </label>

                <textarea
                  value={failRemarks}
                  onChange={(event) =>
                    setFailRemarks(
                      event.target.value
                    )
                  }
                  placeholder="Enter fail remarks..."
                  rows={5}
                />

              </div>

              <div className="class-student-modal-actions">

                <button
                  type="button"
                  className="class-student-modal-cancel"
                  onClick={
                    closeFailModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="class-student-modal-submit"
                  onClick={
                    handleFailModalSubmit
                  }
                >
                  Submit
                </button>

              </div>

            </div>

          </CommonCard>

        </div>
      )}

    </div>
  );
}

export default ClassStudents;