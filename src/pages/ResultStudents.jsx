import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";
import UserDataGrid from "../components/UserDataGrid";
import SearchBar from "../components/SearchBar";

import useSearchFilter from "../hooks/useSearchFilter";

import "../Styles/ResultStudents.css";

function ResultStudents() {
  const navigate = useNavigate();

  const { className, examId } = useParams();

  const [searchParams] = useSearchParams();

  const academicYear =
    searchParams.get("academicYear") || "";

  const [exam, setExam] = useState(null);

  const [results, setResults] = useState([]);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Common search state
  const [searchTerm, setSearchTerm] =
    useState("");

  const token = localStorage.getItem("token");

  // =====================================================
  // GET ARRAY DATA
  // =====================================================

  const getArrayData = (data, keys = []) => {
    if (Array.isArray(data)) {
      return data;
    }

    for (const key of keys) {
      if (Array.isArray(data?.[key])) {
        return data[key];
      }
    }

    return [];
  };

  // =====================================================
  // FETCH EXAM AND RESULTS
  // =====================================================

  useEffect(() => {
    fetchStudentResults();
  }, [examId]);

  const fetchStudentResults = async () => {
    try {
      setLoading(true);
      setError("");
      setSelectedStudent(null);
      setSearchTerm("");

      if (!examId) {
        setError("Exam ID is missing.");
        setExam(null);
        setResults([]);
        return;
      }

      // =================================================
      // FETCH EXAMS
      // =================================================

      const examResponse = await fetch(
        `${API}/exams`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const examData =
        await examResponse.json();

      if (!examResponse.ok) {
        throw new Error(
          examData?.message ||
            "Failed to fetch exams"
        );
      }

      const examList = getArrayData(
        examData,
        ["exams", "data"]
      );

      // =================================================
      // FIND SELECTED EXAM
      // =================================================

      const selectedExam = examList.find(
        (item) =>
          item?._id?.toString() ===
          examId?.toString()
      );

      console.log(
        "Selected Exam:",
        selectedExam
      );

      setExam(
        selectedExam || null
      );

      // =================================================
      // FETCH RESULTS
      // =================================================

      const resultResponse = await fetch(
        `${API}/results`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const resultData =
        await resultResponse.json();

      if (!resultResponse.ok) {
        throw new Error(
          resultData?.message ||
            "Failed to fetch results"
        );
      }

      const resultList = getArrayData(
        resultData,
        ["results", "data"]
      );

      console.log(
        "All Results:",
        resultList
      );

      // =================================================
      // FILTER RESULTS BY EXAM ID
      // =================================================

      const examResults =
        resultList.filter((result) => {
          const resultExamId =
            result?.examId?._id ||
            result?.examId;

          return (
            resultExamId?.toString() ===
            examId?.toString()
          );
        });

      console.log(
        "Selected Exam Results:",
        examResults
      );

      setResults(examResults);
    } catch (error) {
      console.error(
        "Student Result Fetch Error:",
        error
      );

      setResults([]);
      setExam(null);

      setError(
        error?.message ||
          "Failed to load student results."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STUDENT ROWS
  // BACKEND VALUES ONLY
  // =====================================================

  const studentRows = useMemo(() => {
    return results.map(
      (result, index) => {
        return {
          _id:
            result?._id ||
            `result-${index}`,

          studentName:
            result?.studentName ||
            "-",

          totalMarks:
            result?.totalMarks ?? 0,

          percentage:
            result?.percentage ?? 0,

          status:
            result?.status || "-",

          subjects:
            Array.isArray(
              result?.subjects
            )
              ? result.subjects
              : [],
        };
      }
    );
  }, [results]);

  // =====================================================
  // COMMON SEARCH
  // =====================================================

  const filteredStudentRows =
    useSearchFilter(
      studentRows,
      searchTerm,
      ["studentName",
        "percentage",
        "status"
      ]
    );

  // =====================================================
  // STUDENT COLUMNS
  // =====================================================

  const studentColumns = useMemo(() => {
    return [
      {
        field: "studentName",
        headerName: "Student Name",
        flex: 1.5,
        minWidth: 180,
      },

      {
        field: "totalMarks",
        headerName: "Total Marks",
        flex: 1,
        minWidth: 140,
      },

      {
        field: "percentage",
        headerName: "Percentage",
        flex: 1,
        minWidth: 130,

        valueGetter: (
          value,
          row
        ) => {
          return `${Number(
            row?.percentage ?? 0
          ).toFixed(1)}%`;
        },
      },

      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 120,

        renderCell: (params) => {
          return (
            <span
              className={
                params.value === "Fail"
                  ? "result-status-fail"
                  : "result-status-pass"
              }
            >
              {params.value}
            </span>
          );
        },
      },

      {
        field: "action",
        headerName: "Action",
        flex: 0.8,
        minWidth: 110,
        sortable: false,

        renderCell: (params) => {
          return (
            <button
              type="button"
              className="result-student-view-button"
              onClick={() =>
                setSelectedStudent(
                  params.row
                )
              }
            >
              View
            </button>
          );
        },
      },
    ];
  }, []);

  // =====================================================
  // SUBJECT ROWS
  // BACKEND VALUES ONLY
  // =====================================================

  const subjectRows = useMemo(() => {
    if (!selectedStudent) {
      return [];
    }

    const subjects =
      Array.isArray(
        selectedStudent.subjects
      )
        ? selectedStudent.subjects
        : [];

    return subjects.map(
      (item, index) => {
        return {
          _id:
            `${item?.subject || "subject"}-${index}`,

          subject:
            item?.subject || "-",

          marks:
            item?.marks ?? 0,

          // Grade comes directly from backend
          grade:
            item?.grade || "-",

          // Status comes directly from backend
          // If subject-level status is not stored,
          // "-" will be displayed.
          status:
            item?.status || "-",
        };
      }
    );
  }, [selectedStudent]);

  // =====================================================
  // SUBJECT COLUMNS
  // =====================================================

  const subjectColumns = useMemo(() => {
    return [
      {
        field: "subject",
        headerName: "Subject",
        flex: 1.5,
        minWidth: 180,
      },

      {
        field: "marks",
        headerName: "Marks",
        flex: 1,
        minWidth: 120,
      },

      {
        field: "grade",
        headerName: "Grade",
        flex: 1,
        minWidth: 120,

        renderCell: (params) => {
          return (
            <span className="result-subject-grade">
              {params.value || "-"}
            </span>
          );
        },
      },

      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 120,

        renderCell: (params) => {
          const status =
            params.value || "-";

          return (
            <span
              className={
                status === "Fail"
                  ? "result-status-fail"
                  : status === "Pass"
                  ? "result-status-pass"
                  : ""
              }
            >
              {status}
            </span>
          );
        },
      },
    ];
  }, []);

  // =====================================================
  // BACK BUTTON
  // =====================================================

  const handleBack = () => {
    if (selectedStudent) {
      setSelectedStudent(null);
      setSearchTerm("");
      return;
    }

    const encodedClassName =
      encodeURIComponent(
        decodeURIComponent(
          className || ""
        )
      );

    const year =
      academicYear ||
      exam?.academicYear ||
      "";

    if (year) {
      navigate(
        `/dashboard/results/class/${encodedClassName}?academicYear=${encodeURIComponent(
          year
        )}`
      );
    } else {
      navigate(
        `/dashboard/results/class/${encodedClassName}`
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="result-students-page">

        <div className="result-students-header">

          <div>
            <h1>
              Student Results
            </h1>

            <p>
              Loading student results...
            </p>
          </div>

        </div>

        <CommonCard>
          <div className="result-students-loading">
            Loading student results...
          </div>
        </CommonCard>

      </div>
    );
  }

  // =====================================================
  // STUDENT DETAIL
  // =====================================================

  if (selectedStudent) {
    return (
      <div className="result-students-page">

        <div className="result-students-header">

          <div>
            <h1>
              Student Result
            </h1>

            <p>
              {selectedStudent.studentName}
              {" • "}
              {exam?.examType ||
                "Exam"}
            </p>
          </div>

          <button
            type="button"
            className="result-back-button"
            onClick={handleBack}
          >
            ← Back
          </button>

        </div>

        <CommonCard
          className="result-student-detail-card"
          padding={false}
        >

          <div className="result-student-detail">

            {/* =========================================
                STUDENT HEADER
            ========================================= */}

            <div className="result-student-detail-header">

              <div>

                <h2>
                  {selectedStudent.studentName}
                </h2>

                <p>
                  {exam?.examType ||
                    "Exam"}

                  {(exam?.academicYear ||
                    academicYear) && (
                    <>
                      {" • "}
                      {exam?.academicYear ||
                        academicYear}
                    </>
                  )}

                </p>

              </div>

            </div>

            {/* =========================================
                TOTAL MARKS + PERCENTAGE
            ========================================= */}

            <div className="result-student-summary">

              <div>
                <span>
                  Total Marks
                </span>

                <strong>
                  {selectedStudent.totalMarks}
                </strong>
              </div>

              <div>
                <span>
                  Percentage
                </span>

                <strong>
                  {Number(
                    selectedStudent.percentage ?? 0
                  ).toFixed(1)}
                  %
                </strong>
              </div>

            </div>

            {/* =========================================
                SUBJECT DETAILS
            ========================================= */}

            <div className="result-grid-wrapper">

              {subjectRows.length === 0 ? (

                <div className="result-students-empty">
                  No subject results found.
                </div>

              ) : (

                <UserDataGrid
                  rows={subjectRows}
                  columns={subjectColumns}
                  loading={false}
                />

              )}

            </div>

          </div>

        </CommonCard>

      </div>
    );
  }

  // =====================================================
  // STUDENT LIST
  // =====================================================

  return (
    <div className="result-students-page">

      <div className="result-students-header">

        <div>

          <h1>
            Student Results
          </h1>

          <p>
            {decodeURIComponent(
              className || ""
            )}

            {" • "}

            {exam?.examType ||
              "Exam"}

            {(exam?.academicYear ||
              academicYear) && (
              <>
                {" • "}
                {exam?.academicYear ||
                  academicYear}
              </>
            )}

          </p>

        </div>

        <button
          type="button"
          className="result-back-button"
          onClick={handleBack}
        >
          ← Back
        </button>

      </div>

      {/* =================================================
          COMMON SEARCH
      ================================================= */}

      <div className="result-students-search">

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search student..."
        />

      </div>

      {error ? (

        <CommonCard>

          <div className="result-students-empty">
            {error}
          </div>

        </CommonCard>

      ) : (

        <CommonCard
          title="Student Results"
          subtitle="Overall examination results"
          className="result-students-card"
          padding={false}
        >

          {filteredStudentRows.length === 0 ? (

            <div className="result-students-empty">

              {searchTerm
                ? "No matching students found."
                : "No student results found for this exam."}

            </div>

          ) : (

            <div className="result-grid-wrapper">

              <UserDataGrid
                rows={filteredStudentRows}
                columns={studentColumns}
                loading={false}
              />

            </div>

          )}

        </CommonCard>

      )}

    </div>
  );
}

export default ResultStudents;