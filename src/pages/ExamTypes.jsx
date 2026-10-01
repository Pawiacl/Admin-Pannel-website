import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";
import SearchBar from "../components/SearchBar";

import useSearchFilter from "../hooks/useSearchFilter";
import { sortAscending } from "../utils/classSort";

import "../Styles/ExamTypes.css";

function ExamTypes() {
  const navigate = useNavigate();

  const { className } =
    useParams();

  const [searchParams] =
    useSearchParams();

  const academicYear =
    searchParams.get(
      "academicYear"
    ) || "";

  const [exams, setExams] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const token =
    localStorage.getItem("token");

  // =====================================================
  // FETCH EXAMS
  // =====================================================

  const fetchExams = async () => {
    try {
      setLoading(true);

      const response =
        await fetch(
          `${API}/exams`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const result =
        await response.json();

      console.log(
        "Exam Types API Response:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to fetch exams"
        );
      }

      const allExams =
        result.data || [];

      // =================================================
      // FILTER SELECTED CLASS AND ACADEMIC YEAR
      // =================================================

      const filteredExams =
        allExams.filter(
          (exam) => {
            const classMatches =
              exam.className ===
              className;

            const yearMatches =
              !academicYear ||
              exam.academicYear ===
                academicYear;

            return (
              classMatches &&
              yearMatches
            );
          }
        );

      setExams(
        filteredExams
      );
    } catch (error) {
      console.error(
        "Fetch Exam Types Error:",
        error
      );

      alert(
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    fetchExams();
  }, [
    className,
    academicYear,
  ]);

  // =====================================================
  // UNIQUE EXAM TYPES
  // =====================================================

  const examTypeCards =
    Array.from(
      new Map(
        exams.map(
          (exam) => [
            exam.examType,
            exam,
          ]
        )
      ).values()
    );

  // =====================================================
  // COMMON SEARCH
  // =====================================================

  const filteredExamTypes =
    useSearchFilter(
      examTypeCards,
      searchTerm,
      [
        "examType",
        "academicYear",
      ]
    );

  // =====================================================
  // COMMON SORTING
  // =====================================================

  const sortedExamTypes =
    sortAscending(
      filteredExamTypes,
      "examType"
    );

  // =====================================================
  // EXAM TYPE CLICK
  // =====================================================

  const handleExamTypeClick =
    (exam) => {
      navigate(
        `/dashboard/exams/${exam._id}/schedule`
      );
    };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    navigate(
      "/dashboard/exams"
    );
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="exam-types-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="exam-types-header">

        <div>

          <button
            type="button"
            className="exam-types-back-button"
            onClick={
              handleBack
            }
          >
            ← Back
          </button>

          <h1>
            {className}
          </h1>

          <p>
            Academic Year:{" "}
            {academicYear || "-"}
          </p>

        </div>

      </div>

      {/* =================================================
          SEARCH BAR
      ================================================= */}

      {!loading &&
        examTypeCards.length > 0 && (
          <div className="exam-types-search">

            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search exam type..."
            />

          </div>
        )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div className="exam-types-loading">
          Loading exam types...
        </div>
      )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading &&
        sortedExamTypes.length === 0 && (

          <div className="exam-types-empty">

            {searchTerm
              ? `No exam types found matching "${searchTerm}".`
              : "No exam types found."}

          </div>

        )}

      {/* =================================================
          EXAM TYPE CARDS
      ================================================= */}

      {!loading &&
        sortedExamTypes.length > 0 && (

          <div className="exam-types-grid">

            {sortedExamTypes.map(
              (exam) => (

                <CommonCard
                  key={exam._id}
                  variant="grid"
                  hover
                  clickable
                  padding={false}
                  className="exam-type-card"
                  onClick={() =>
                    handleExamTypeClick(
                      exam
                    )
                  }
                >

                  <div className="exam-type-card-content">

                    {/* =================================
                        EXAM TYPE
                    ================================= */}

                    <h2>
                      {exam.examType}
                    </h2>

                    {/* =================================
                        EXAM DATES
                    ================================= */}

                    <p>

                      {exam.startDate
                        ? new Date(
                            exam.startDate
                          ).toLocaleDateString()
                        : "-"}

                      {" - "}

                      {exam.endDate
                        ? new Date(
                            exam.endDate
                          ).toLocaleDateString()
                        : "-"}

                    </p>

                    {/* =================================
                        NAVIGATION
                    ================================= */}

                    <span>
                      View Subject Schedule →
                    </span>

                  </div>

                </CommonCard>

              )
            )}

          </div>

        )}

    </div>
  );
}

export default ExamTypes;