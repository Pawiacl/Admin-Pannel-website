import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

import {
  sortByClass,
} from "../utils/classSort";

import {
  sortByClassSectionYear,
} from "../utils/classSort";

import CommonCard from "../components/CommonCard";
import UserDataGrid from "../components/UserDataGrid";
import SearchBar from "../components/SearchBar";

import useSearchFilter from "../hooks/useSearchFilter";

import "../Styles/AssignClassTeacher.css";

function AssignClassTeacher() {
  const navigate = useNavigate();

  // ==============================
  // Main data
  // ==============================

  const [faculty, setFaculty] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // ==============================
  // Dynamic Academic Years
  // ==============================

  const [academicYears, setAcademicYears] = useState([]);

  // ==============================
  // Main form
  // ==============================

  const [selectedFacultyId, setSelectedFacultyId] =
    useState("");

  const [selectedClassId, setSelectedClassId] =
    useState("");

  const [selectedClassName, setSelectedClassName] =
    useState("");

  const [selectedSection, setSelectedSection] =
    useState("");

  const [selectedAcademicYear, setSelectedAcademicYear] =
    useState("");

  const [selectedFromMonth, setSelectedFromMonth] =
    useState("");

  const [selectedToMonth, setSelectedToMonth] =
    useState("");

  const [sections, setSections] = useState([]);

  // ==============================
  // Loading
  // ==============================

  const [loadingFaculty, setLoadingFaculty] =
    useState(true);

  const [loadingClasses, setLoadingClasses] =
    useState(true);

  const [loadingAssignments, setLoadingAssignments] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  // ==============================
  // Messages
  // ==============================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] =
    useState("");

  // ==============================
  // Search
  // ==============================

  const [searchTerm, setSearchTerm] =
    useState("");

  // ==============================
  // Edit modal
  // ==============================

  const [editAssignment, setEditAssignment] =
    useState(null);

  const [editFacultyId, setEditFacultyId] =
    useState("");

  const [editClassId, setEditClassId] =
    useState("");

  const [editClassName, setEditClassName] =
    useState("");

  const [editSection, setEditSection] =
    useState("");

  const [editAcademicYear, setEditAcademicYear] =
    useState("");

  const [editFromMonth, setEditFromMonth] =
    useState("");

  const [editToMonth, setEditToMonth] =
    useState("");

  const [editSections, setEditSections] =
    useState([]);

  const [editError, setEditError] =
    useState("");

  // ==============================
  // Token
  // ==============================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ==============================
  // Get Faculty ID
  // ==============================

  const getFacultyId = (member) => {
    return (
      member?._id ||
      member?.id ||
      ""
    );
  };

  // ==============================
  // Get Faculty Academic Year
  // ==============================

  const getFacultyAcademicYear = (member) => {
    return (
      member?.academicYear ||
      member?.academic_year ||
      ""
    );
  };

  // ==============================
  // Build Dynamic Academic Years
  // ==============================

  const buildAcademicYears = (facultyUsers) => {
    const years = facultyUsers
      .map((member) =>
        String(
          getFacultyAcademicYear(member)
        ).trim()
      )
      .filter(Boolean);

    const uniqueYears = [
      ...new Set(years),
    ];

    uniqueYears.sort((a, b) => {
      const yearA = parseInt(
        a.split("-")[0],
        10
      );

      const yearB = parseInt(
        b.split("-")[0],
        10
      );

      return yearA - yearB;
    });

    return uniqueYears;
  };

  // ==============================
  // Initial API calls
  // ==============================

  useEffect(() => {
    fetchFaculty();
    fetchClasses();
    fetchAssignments();
  }, []);

  // ==============================
  // Fetch Faculty
  // ==============================

  const fetchFaculty = async () => {
    try {
      setLoadingFaculty(true);

      const token = getToken();

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

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to fetch faculty"
        );
      }

      const facultyUsers =
        (result.data || []).filter(
          (user) =>
            user.userType?.toLowerCase() ===
              "faculty" &&
            user.status !== false
        );

      setFaculty(facultyUsers);

      const dynamicYears =
        buildAcademicYears(facultyUsers);

      console.log(
        "Dynamic Faculty Academic Years:",
        dynamicYears
      );

      setAcademicYears(dynamicYears);
    } catch (error) {
      console.error(
        "Failed to fetch faculty:",
        error
      );

      setError(
        error.message ||
          "Failed to load faculty members."
      );
    } finally {
      setLoadingFaculty(false);
    }
  };

  // ==============================
  // Fetch Classes
  // ==============================

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);

      const token = getToken();

      const response = await fetch(
        `${API}/classes`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to fetch classes"
        );
      }

      const sortedClasses = sortByClass(
        result.data || []
      );

      setClasses(sortedClasses);
    } catch (error) {
      console.error(
        "Failed to fetch classes:",
        error
      );

      setError(
        error.message ||
          "Failed to load classes."
      );
    } finally {
      setLoadingClasses(false);
    }
  };

  // ==============================
  // Fetch Assignments
  // ==============================

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);

      const token = getToken();

      const response = await fetch(
        `${API}/classTeachers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to fetch class teacher assignments"
        );
      }

      const sortedAssignments =
        sortByClassSectionYear(
          result.data || []
        );

      setAssignments(
        sortedAssignments
      );
    } catch (error) {
      console.error(
        "Failed to fetch class teacher assignments:",
        error
      );

      setError(
        error.message ||
          "Failed to load class teacher assignments."
      );
    } finally {
      setLoadingAssignments(false);
    }
  };

  // ==============================
  // Get class ID
  // ==============================

  const getClassId = (classItem) => {
    return (
      classItem?._id ||
      classItem?.id ||
      ""
    );
  };

  // ==============================
  // Get class name
  // ==============================

  const getClassName = (classItem) => {
    return (
      classItem?.className ||
      classItem?.name ||
      classItem?.class ||
      ""
    );
  };

  // ==============================
  // Get class sections
  // ==============================

  const getClassSections = (classItem) => {
    if (!classItem) {
      return [];
    }

    if (Array.isArray(classItem.sections)) {
      return classItem.sections;
    }

    if (Array.isArray(classItem.section)) {
      return classItem.section;
    }

    if (typeof classItem.sections === "string") {
      return classItem.sections
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof classItem.section === "string") {
      return classItem.section
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  // ==============================
  // Faculty Change
  // ==============================

  const handleFacultyChange = (event) => {
    const facultyId =
      event.target.value;

    setSelectedFacultyId(
      facultyId
    );

    const selectedFaculty =
      faculty.find(
        (member) =>
          getFacultyId(member) ===
          facultyId
      );

    if (selectedFaculty) {
      const facultyAcademicYear =
        getFacultyAcademicYear(
          selectedFaculty
        );

      if (facultyAcademicYear) {
        setSelectedAcademicYear(
          facultyAcademicYear
        );
      } else {
        setSelectedAcademicYear("");
      }
    } else {
      setSelectedAcademicYear("");
    }
  };

  // ==============================
  // Class change
  // ==============================

  const handleClassChange = (event) => {
    const classId =
      event.target.value;

    setSelectedClassId(classId);
    setSelectedSection("");

    const selectedClass =
      classes.find(
        (item) =>
          getClassId(item) ===
          classId
      );

    if (selectedClass) {
      setSelectedClassName(
        getClassName(selectedClass)
      );

      setSections(
        getClassSections(
          selectedClass
        )
      );
    } else {
      setSelectedClassName("");
      setSections([]);
    }
  };

  // ==============================
  // Assign Class Teacher
  // ==============================

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      !selectedFacultyId ||
      !selectedClassId ||
      !selectedSection ||
      !selectedAcademicYear ||
      !selectedFromMonth ||
      !selectedToMonth
    ) {
      setError(
        "Please select all fields."
      );
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      const response = await fetch(
        `${API}/classTeachers`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            facultyId:
              selectedFacultyId,

            classId:
              selectedClassId,

            className:
              selectedClassName,

            section:
              selectedSection,

            academicYear:
              selectedAcademicYear,

            fromMonth:
              selectedFromMonth,

            toMonth:
              selectedToMonth,
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
            "Failed to assign class teacher"
        );
      }

      setMessage(
        "Class teacher assigned successfully."
      );

      await fetchAssignments();

      setSelectedFacultyId("");
      setSelectedClassId("");
      setSelectedClassName("");
      setSelectedSection("");
      setSelectedAcademicYear("");
      setSelectedFromMonth("");
      setSelectedToMonth("");
      setSections([]);

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Assign class teacher error:",
        error
      );

      setError(
        error.message ||
          "Failed to assign class teacher."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // Faculty name
  // ==============================

  const getFacultyName = (
    facultyId
  ) => {
    const member =
      faculty.find(
        (item) =>
          item._id === facultyId ||
          item.id === facultyId
      );

    if (!member) {
      return "Faculty";
    }

    return `${member.firstName || ""} ${
      member.lastName || ""
    }`.trim();
  };

  // ==============================
  // Faculty details
  // ==============================

  const getFacultyDetails = (
    facultyId
  ) => {
    return faculty.find(
      (item) =>
        item._id === facultyId ||
        item.id === facultyId
    );
  };

  // ==============================
  // Open Edit Modal
  // ==============================

  const handleEdit = (
    record
  ) => {
    setEditError("");
    setEditAssignment(record);

    const recordFacultyId =
      record.facultyId?._id ||
      record.facultyId ||
      "";

    setEditFacultyId(
      recordFacultyId
    );

    setEditClassId(
      record.classId?._id ||
        record.classId ||
        ""
    );

    setEditClassName(
      record.className ||
        record.classId?.className ||
        record.classId?.name ||
        ""
    );

    setEditSection(
      record.section || ""
    );

    setEditAcademicYear(
      record.academicYear || ""
    );

    setEditFromMonth(
      record.fromMonth || ""
    );

    setEditToMonth(
      record.toMonth || ""
    );

    const selectedClass =
      classes.find(
        (item) =>
          getClassId(item) ===
          (
            record.classId?._id ||
            record.classId
          )
      );

    if (selectedClass) {
      setEditSections(
        getClassSections(
          selectedClass
        )
      );
    } else {
      setEditSections([]);
    }
  };

  // ==============================
  // Edit Faculty Change
  // ==============================

  const handleEditFacultyChange = (
    event
  ) => {
    const facultyId =
      event.target.value;

    setEditFacultyId(
      facultyId
    );

    const selectedFaculty =
      faculty.find(
        (member) =>
          getFacultyId(member) ===
          facultyId
      );

    if (selectedFaculty) {
      const facultyAcademicYear =
        getFacultyAcademicYear(
          selectedFaculty
        );

      if (facultyAcademicYear) {
        setEditAcademicYear(
          facultyAcademicYear
        );
      }
    }
  };

  // ==============================
  // Edit class change
  // ==============================

  const handleEditClassChange = (
    event
  ) => {
    const classId =
      event.target.value;

    setEditClassId(classId);
    setEditSection("");

    const selectedClass =
      classes.find(
        (item) =>
          getClassId(item) ===
          classId
      );

    if (selectedClass) {
      setEditClassName(
        getClassName(selectedClass)
      );

      setEditSections(
        getClassSections(
          selectedClass
        )
      );
    } else {
      setEditClassName("");
      setEditSections([]);
    }
  };

  // ==============================
  // Close Edit Modal
  // ==============================

  const handleCloseEdit = () => {
    setEditAssignment(null);
    setEditFacultyId("");
    setEditClassId("");
    setEditClassName("");
    setEditSection("");
    setEditAcademicYear("");
    setEditFromMonth("");
    setEditToMonth("");
    setEditSections([]);
    setEditError("");
  };

  // ==============================
  // Update Assignment
  // ==============================

  const handleUpdate = async (
    event
  ) => {
    event.preventDefault();

    setEditError("");

    if (!editAssignment?._id) {
      setEditError(
        "Assignment ID not found."
      );
      return;
    }

    if (
      !editFacultyId ||
      !editClassId ||
      !editSection ||
      !editAcademicYear ||
      !editFromMonth ||
      !editToMonth
    ) {
      setEditError(
        "Please select all fields."
      );
      return;
    }

    try {
      setUpdating(true);

      const token = getToken();

      const response = await fetch(
        `${API}/classTeachers/${editAssignment._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            facultyId:
              editFacultyId,

            classId:
              editClassId,

            className:
              editClassName,

            section:
              editSection,

            academicYear:
              editAcademicYear,

            fromMonth:
              editFromMonth,

            toMonth:
              editToMonth,
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
            "Failed to update class teacher"
        );
      }

      handleCloseEdit();

      await fetchAssignments();

      setMessage(
        "Class teacher updated successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Update class teacher error:",
        error
      );

      setEditError(
        error.message ||
          "Failed to update class teacher."
      );
    } finally {
      setUpdating(false);
    }
  };

  // ==============================
  // Delete Assignment
  // ==============================

  const handleDelete = async (
    record
  ) => {
    if (!record?._id) {
      return;
    }

    const facultyName =
      getFacultyName(
        record.facultyId?._id ||
          record.facultyId
      );

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${facultyName}'s class teacher assignment?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteError("");
      setDeletingId(
        record._id
      );

      const token = getToken();

      const response = await fetch(
        `${API}/classTeachers/${record._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
            "Failed to delete class teacher"
        );
      }

      await fetchAssignments();

      setMessage(
        "Class teacher deleted successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Delete class teacher error:",
        error
      );

      setDeleteError(
        error.message ||
          "Failed to delete class teacher."
      );
    } finally {
      setDeletingId("");
    }
  };

  // ==============================
  // Months
  // ==============================

  const months = [
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
    "April",
    "May",
  ];

  // ==============================
  // DataGrid rows
  // ==============================

  const dataGridRows =
    assignments.map(
      (record) => {
        const facultyId =
          record.facultyId?._id ||
          record.facultyId ||
          "";

        const facultyMember =
          getFacultyDetails(
            facultyId
          );

        const facultyName =
          getFacultyName(
            facultyId
          );

        const subject =
          record.subject ||
          facultyMember?.subject ||
          "-";

        const className =
          record.className ||
          record.classId?.className ||
          record.classId?.name ||
          "-";

        return {
          id: record._id,

          _id: record._id,

          faculty:
            facultyName,

          subject,

          className,

          section:
            record.section || "-",

          academicYear:
            record.academicYear ||
            "-",

          fromMonth:
            record.fromMonth ||
            "-",

          toMonth:
            record.toMonth ||
            "-",

          originalRecord:
            record,
        };
      }
    );

  // ==============================
  // Search Data
  // ==============================

  const filteredDataGridRows =
    useSearchFilter(
      dataGridRows,
      searchTerm,
      [
        "faculty",
        "subject",
        "className",
        "section",
        "academicYear",
        "fromMonth",
        "toMonth",
      ]
    );

  // ==============================
  // Sort Search Results
  // ==============================

  const sortedDataGridRows =
    [...filteredDataGridRows].sort(
      (a, b) => {
        const classOrderA =
          getClassName({
            className:
              a.className,
          });

        const classOrderB =
          getClassName({
            className:
              b.className,
          });

        const classCompare =
          classOrderA.localeCompare(
            classOrderB,
            undefined,
            {
              numeric: true,
              sensitivity: "base",
            }
          );

        if (classCompare !== 0) {
          return classCompare;
        }

        const sectionCompare =
          String(
            a.section || ""
          ).localeCompare(
            String(
              b.section || ""
            ),
            undefined,
            {
              numeric: true,
              sensitivity: "base",
            }
          );

        if (
          sectionCompare !== 0
        ) {
          return sectionCompare;
        }

        return String(
          a.academicYear || ""
        ).localeCompare(
          String(
            b.academicYear || ""
          ),
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          }
        );
      }
    );

  // ==============================
  // DataGrid columns
  // ==============================

  const dataGridColumns = [
    {
      field: "faculty",
      headerName: "Faculty",
      flex: 1.2,
      minWidth: 160,
    },

    {
      field: "subject",
      headerName: "Subject",
      flex: 1,
      minWidth: 130,
    },

    {
      field: "className",
      headerName: "Class",
      flex: 0.8,
      minWidth: 100,
    },

    {
      field: "section",
      headerName: "Section",
      flex: 0.8,
      minWidth: 100,
    },

    {
      field: "academicYear",
      headerName: "Academic Year",
      flex: 1.1,
      minWidth: 130,
    },

    {
      field: "fromMonth",
      headerName: "From Month",
      flex: 1,
      minWidth: 120,
    },

    {
      field: "toMonth",
      headerName: "To Month",
      flex: 1,
      minWidth: 120,
    },

    {
      field: "actions",
      headerName: "Action",
      flex: 1.3,
      minWidth: 190,
      sortable: false,
      filterable: false,

      renderCell: (params) => (
        <div className="assigned-class-teachers-actions-cell">

          <button
            type="button"
            className="assigned-class-teacher-edit-button"
            onClick={() =>
              handleEdit(
                params.row
                  .originalRecord
              )
            }
          >
            Edit
          </button>

          <button
            type="button"
            className="assigned-class-teacher-delete-button"
            onClick={() =>
              handleDelete(
                params.row
                  .originalRecord
              )
            }
            disabled={
              deletingId ===
              params.row
                .originalRecord
                ._id
            }
          >
            {deletingId ===
            params.row
              .originalRecord
              ._id
              ? "Deleting..."
              : "Delete"}
          </button>

        </div>
      ),
    },
  ];

  // ==============================
  // JSX
  // ==============================

  return (
    <div className="assign-class-teacher-page">

      {/* ==============================
          MAIN CARD
      ============================== */}

      <CommonCard
        className="assign-class-teacher-card"
        padding={false}
      >

        <div className="assign-class-teacher-header">

          <div>
            <h1>
              Assign Class Teacher
            </h1>

            <p>
              Assign a faculty member to a
              class section.
            </p>
          </div>

          <button
            type="button"
            className="assign-class-teacher-back-button"
            onClick={() =>
              navigate(-1)
            }
          >
            ← Back
          </button>

        </div>

        <form
          className="assign-class-teacher-form"
          onSubmit={handleSave}
        >

          {/* Faculty */}

          <div className="assign-class-teacher-field">

            <label>
              Select Faculty
            </label>

            <select
              value={
                selectedFacultyId
              }
              onChange={
                handleFacultyChange
              }
              disabled={
                loadingFaculty
              }
            >

              <option value="">
                {loadingFaculty
                  ? "Loading faculty..."
                  : "Select Faculty"}
              </option>

              {faculty.map(
                (member) => {
                  const facultyId =
                    getFacultyId(
                      member
                    );

                  const facultyName =
                    `${member.firstName || ""} ${
                      member.lastName || ""
                    }`.trim();

                  return (
                    <option
                      key={
                        facultyId
                      }
                      value={
                        facultyId
                      }
                    >
                      {facultyName}

                      {member.subject
                        ? ` - ${member.subject}`
                        : ""}
                    </option>
                  );
                }
              )}

            </select>

          </div>

          {/* Class */}

          <div className="assign-class-teacher-field">

            <label>
              Select Class
            </label>

            <select
              value={
                selectedClassId
              }
              onChange={
                handleClassChange
              }
              disabled={
                loadingClasses
              }
            >

              <option value="">
                {loadingClasses
                  ? "Loading classes..."
                  : "Select Class"}
              </option>

              {classes.map(
                (classItem) => {
                  const classId =
                    getClassId(
                      classItem
                    );

                  const className =
                    getClassName(
                      classItem
                    );

                  return (
                    <option
                      key={
                        classId
                      }
                      value={
                        classId
                      }
                    >
                      {className}
                    </option>
                  );
                }
              )}

            </select>

          </div>

          {/* Section */}

          <div className="assign-class-teacher-field">

            <label>
              Select Section
            </label>

            <select
              value={
                selectedSection
              }
              onChange={(event) =>
                setSelectedSection(
                  event.target.value
                )
              }
              disabled={
                !selectedClassId ||
                sections.length === 0
              }
            >

              <option value="">
                Select Section
              </option>

              {sections.map(
                (
                  section,
                  index
                ) => {

                  const sectionValue =
                    typeof section ===
                    "string"
                      ? section
                      : section?.section ||
                        section?.name ||
                        "";

                  return (
                    <option
                      key={`${sectionValue}-${index}`}
                      value={
                        sectionValue
                      }
                    >
                      {sectionValue}
                    </option>
                  );
                }
              )}

            </select>

          </div>

          {/* Academic Year */}

          <div className="assign-class-teacher-field">

            <label>
              Academic Year
            </label>

            <select
              value={
                selectedAcademicYear
              }
              onChange={(event) =>
                setSelectedAcademicYear(
                  event.target.value
                )
              }
              disabled={
                academicYears.length === 0
              }
            >

              <option value="">
                {academicYears.length ===
                0
                  ? "No Academic Year Available"
                  : "Select Academic Year"}
              </option>

              {academicYears.map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                )
              )}

            </select>

          </div>

          {/* From Month */}

          <div className="assign-class-teacher-field">

            <label>
              From Month
            </label>

            <select
              value={
                selectedFromMonth
              }
              onChange={(event) =>
                setSelectedFromMonth(
                  event.target.value
                )
              }
            >

              <option value="">
                Select From Month
              </option>

              {months.map(
                (month) => (
                  <option
                    key={month}
                    value={month}
                  >
                    {month}
                  </option>
                )
              )}

            </select>

          </div>

          {/* To Month */}

          <div className="assign-class-teacher-field">

            <label>
              To Month
            </label>

            <select
              value={
                selectedToMonth
              }
              onChange={(event) =>
                setSelectedToMonth(
                  event.target.value
                )
              }
            >

              <option value="">
                Select To Month
              </option>

              {months.map(
                (month) => (
                  <option
                    key={month}
                    value={month}
                  >
                    {month}
                  </option>
                )
              )}

            </select>

          </div>

          {/* Error */}

          {error && (
            <div className="assign-class-teacher-error">
              {error}
            </div>
          )}

          {/* Success */}

          {message && (
            <div className="assign-class-teacher-success">
              {message}
            </div>
          )}

          {/* Submit */}

          <div className="assign-class-teacher-form-actions">

            <button
              type="submit"
              className="assign-class-teacher-button"
              disabled={saving}
            >
              {saving
                ? "Assigning..."
                : "Assign Class Teacher"}
            </button>

          </div>

        </form>

      </CommonCard>

      {/* ==============================
          ASSIGNMENT DATA GRID
      ============================== */}

      <CommonCard
        className="assigned-class-teachers-card"
        padding={false}
        title="Assigned Class Teachers"
        subtitle="Faculty members assigned to class sections."
        actions={
          <span className="assigned-class-teachers-count">
            {assignments.length}
          </span>
        }
      >

        {deleteError && (
          <div className="assigned-class-teacher-delete-error">
            {deleteError}
          </div>
        )}

        {/* ==============================
            COMMON SEARCH BAR
        ============================== */}

        <div className="assigned-class-teachers-search">

          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search faculty, class, section..."
          />

        </div>

        {/* ==============================
            SEARCH RESULT
        ============================== */}

        {sortedDataGridRows.length ===
        0 ? (
          <div className="assigned-class-teachers-empty">

            <h3>
              No Matching Records
            </h3>

            <p>
              No class teacher assignment
              matches your search.
            </p>

          </div>
        ) : (
          <UserDataGrid
            rows={
              sortedDataGridRows
            }
            columns={
              dataGridColumns
            }
            loading={
              loadingAssignments
            }
          />
        )}

      </CommonCard>

      {/* ==============================
          EDIT MODAL
      ============================== */}

      {editAssignment && (
        <div className="edit-class-teacher-overlay">

          <CommonCard
            className="edit-class-teacher-card"
            padding={false}
            title="Edit Class Teacher"
            subtitle="Update the assigned faculty, class, section, academic year and period."
            actions={
              <button
                type="button"
                className="edit-class-teacher-close"
                onClick={
                  handleCloseEdit
                }
              >
                ×
              </button>
            }
          >

            <form
              className="edit-class-teacher-form"
              onSubmit={
                handleUpdate
              }
            >

              {/* Faculty */}

              <div className="edit-class-teacher-field">

                <label>
                  Select Faculty
                </label>

                <select
                  value={
                    editFacultyId
                  }
                  onChange={
                    handleEditFacultyChange
                  }
                >

                  <option value="">
                    Select Faculty
                  </option>

                  {faculty.map(
                    (member) => {

                      const facultyId =
                        getFacultyId(
                          member
                        );

                      const facultyName =
                        `${member.firstName || ""} ${
                          member.lastName || ""
                        }`.trim();

                      return (
                        <option
                          key={
                            facultyId
                          }
                          value={
                            facultyId
                          }
                        >
                          {facultyName}

                          {member.subject
                            ? ` - ${member.subject}`
                            : ""}
                        </option>
                      );
                    }
                  )}

                </select>

              </div>

              {/* Class */}

              <div className="edit-class-teacher-field">

                <label>
                  Select Class
                </label>

                <select
                  value={
                    editClassId
                  }
                  onChange={
                    handleEditClassChange
                  }
                >

                  <option value="">
                    Select Class
                  </option>

                  {classes.map(
                    (classItem) => {

                      const classId =
                        getClassId(
                          classItem
                        );

                      const className =
                        getClassName(
                          classItem
                        );

                      return (
                        <option
                          key={
                            classId
                          }
                          value={
                            classId
                          }
                        >
                          {className}
                        </option>
                      );
                    }
                  )}

                </select>

              </div>

              {/* Section */}

              <div className="edit-class-teacher-field">

                <label>
                  Select Section
                </label>

                <select
                  value={
                    editSection
                  }
                  onChange={(event) =>
                    setEditSection(
                      event.target.value
                    )
                  }
                  disabled={
                    !editClassId ||
                    editSections.length ===
                      0
                  }
                >

                  <option value="">
                    Select Section
                  </option>

                  {editSections.map(
                    (
                      section,
                      index
                    ) => {

                      const sectionValue =
                        typeof section ===
                        "string"
                          ? section
                          : section?.section ||
                            section?.name ||
                            "";

                      return (
                        <option
                          key={`${sectionValue}-${index}`}
                          value={
                            sectionValue
                          }
                        >
                          {sectionValue}
                        </option>
                      );
                    }
                  )}

                </select>

              </div>

              {/* Academic Year */}

              <div className="edit-class-teacher-field">

                <label>
                  Academic Year
                </label>

                <select
                  value={
                    editAcademicYear
                  }
                  onChange={(event) =>
                    setEditAcademicYear(
                      event.target.value
                    )
                  }
                  disabled={
                    academicYears.length ===
                    0
                  }
                >

                  <option value="">
                    {academicYears.length ===
                    0
                      ? "No Academic Year Available"
                      : "Select Academic Year"}
                  </option>

                  {academicYears.map(
                    (year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* From Month */}

              <div className="edit-class-teacher-field">

                <label>
                  From Month
                </label>

                <select
                  value={
                    editFromMonth
                  }
                  onChange={(event) =>
                    setEditFromMonth(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select From Month
                  </option>

                  {months.map(
                    (month) => (
                      <option
                        key={month}
                        value={month}
                      >
                        {month}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* To Month */}

              <div className="edit-class-teacher-field">

                <label>
                  To Month
                </label>

                <select
                  value={
                    editToMonth
                  }
                  onChange={(event) =>
                    setEditToMonth(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select To Month
                  </option>

                  {months.map(
                    (month) => (
                      <option
                        key={month}
                        value={month}
                      >
                        {month}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* Edit Error */}

              {editError && (
                <div className="edit-class-teacher-error">
                  {editError}
                </div>
              )}

              {/* Actions */}

              <div className="edit-class-teacher-actions">

                <button
                  type="button"
                  className="edit-class-teacher-cancel"
                  onClick={
                    handleCloseEdit
                  }
                  disabled={
                    updating
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="edit-class-teacher-update"
                  disabled={
                    updating
                  }
                >
                  {updating
                    ? "Updating..."
                    : "Update"}
                </button>

              </div>

            </form>

          </CommonCard>

        </div>
      )}

    </div>
  );
}

export default AssignClassTeacher;