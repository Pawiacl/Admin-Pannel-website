import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";
import SearchBar from "../components/SearchBar";

import useSearchFilter from "../hooks/useSearchFilter";
import { sortAscending } from "../utils/classSort";

import "../Styles/Syllabus.css";

function Syllabus() {
  const [subjects, setSubjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const navigate =
    useNavigate();

  const token =
    localStorage.getItem("token");

  // =====================================================
  // GET CURRENT YEAR
  // =====================================================

  const getCurrentYear = () => {
    const today =
      new Date();

    return today.getFullYear();
  };

  // =====================================================
  // FETCH SYLLABUS SUBJECTS
  // =====================================================

  const fetchSyllabus = async () => {
    try {
      setLoading(true);

      setMessage("");

      const currentYear =
        getCurrentYear();

      // =================================================
      // GET SUBJECTS
      // =================================================

      const response =
        await fetch(
          `${API}/subjects`,
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

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result?.message ||
            "Failed to fetch syllabus"
        );
      }

      const allSubjects =
        Array.isArray(
          result?.data
        )
          ? result.data
          : [];

      // =================================================
      // GET CURRENT YEAR SUBJECTS
      // =================================================

      const currentYearSubjects =
        allSubjects
          .map(
            (subject) => {
              const academicYears =
                Array.isArray(
                  subject?.academicYears
                )
                  ? subject.academicYears
                  : [];

              // =========================================
              // FIND CURRENT ACADEMIC YEAR
              // =========================================

              const currentAcademicYear =
                academicYears.find(
                  (academicYear) => {
                    const yearText =
                      String(
                        academicYear?.academicYear ||
                          ""
                      ).trim();

                    if (!yearText) {
                      return false;
                    }

                    const yearParts =
                      yearText.split(
                        "-"
                      );

                    if (
                      yearParts.length !==
                      2
                    ) {
                      return false;
                    }

                    const startYear =
                      Number(
                        yearParts[0]
                      );

                    const endYear =
                      Number(
                        yearParts[1]
                      );

                    return (
                      startYear ===
                        currentYear ||
                      endYear ===
                        currentYear
                    );
                  }
                );

              // =========================================
              // IF NO CURRENT YEAR
              // =========================================

              if (
                !currentAcademicYear
              ) {
                return null;
              }

              return {
                ...subject,

                currentAcademicYear,
              };
            }
          )
          .filter(Boolean);

      setSubjects(
        currentYearSubjects
      );
    } catch (error) {
      console.error(
        "Syllabus Error:",
        error
      );

      setMessage(
        error?.message ||
          "Failed to load syllabus"
      );

      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PAGE LOAD
  // =====================================================

  useEffect(() => {
    fetchSyllabus();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredSubjects =
    useSearchFilter(
      subjects,
      searchTerm,
      [
        "subjectName",
        "subjectCode",
        "academicYear",
      ]
    );

  // =====================================================
  // SORTING
  // =====================================================

  const sortedSubjects =
    sortAscending(
      filteredSubjects,
      "subjectName"
    );

  // =====================================================
  // OPEN SYLLABUS TOPICS
  // =====================================================

  const handleSubjectClick = (
    subject
  ) => {
    const academicYear =
      subject?.currentAcademicYear;

    if (
      !subject?._id ||
      !academicYear?._id
    ) {
      setMessage(
        "Academic year information not found"
      );

      return;
    }

    navigate(
      `/dashboard/syllabus/${subject._id}/${academicYear._id}`,
      {
        state: {
          subjectName:
            subject?.subjectName ||
            "Subject",

          academicYear:
            academicYear?.academicYear ||
            "",
        },
      }
    );
  };

  // =====================================================
  // CURRENT YEAR
  // =====================================================

  const currentYear =
    getCurrentYear();

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="syllabus-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="syllabus-header">

        <div>

          <h1>
            Syllabus
          </h1>

          <p>
            View subject-wise syllabus
            for the current academic year
          </p>

        </div>

      </div>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div className="syllabus-message">
          {message}
        </div>
      )}

      {/* =================================================
          CURRENT YEAR
      ================================================= */}

      <div className="syllabus-year">

        Academic Year:{" "}

        <strong>
          {currentYear}
        </strong>

      </div>

      {/* =================================================
          SEARCH BAR
      ================================================= */}

      {!loading &&
        subjects.length > 0 && (
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search subject..."
          />
        )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <div className="syllabus-loading">
          Loading subjects...
        </div>
      ) : sortedSubjects.length === 0 ? (
        <div className="syllabus-empty">
          {searchTerm
            ? `No subjects found matching "${searchTerm}".`
            : "No subjects found for the current academic year."}
        </div>
      ) : (
        <div className="syllabus-card-grid">

          {/* =============================================
              SUBJECT CARDS
          ============================================= */}

          {sortedSubjects.map(
            (subject) => {
              const academicYear =
                subject?.currentAcademicYear;

              const topics =
                Array.isArray(
                  academicYear?.topics
                )
                  ? academicYear.topics
                  : [];

              return (
                <CommonCard
                  key={subject._id}
                  className="syllabus-subject-card"
                  clickable={true}
                  hover={true}
                  onClick={() =>
                    handleSubjectClick(
                      subject
                    )
                  }
                  padding={false}
                >

                  <div className="syllabus-subject-card-content">

                    {/* =================================
                        SUBJECT NAME
                    ================================= */}

                    <h2>
                      {subject?.subjectName ||
                        "Subject"}
                    </h2>

                    <p className="syllabus-subject-code">

                      Subject Code:{" "}

                      {subject?.subjectCode ||
                        "-"}

                    </p>

                    {/* =================================
                        ACADEMIC YEAR
                    ================================= */}

                    <p className="syllabus-academic-year">

                      Academic Year:{" "}

                      {academicYear?.academicYear ||
                        "-"}

                    </p>

                    {/* =================================
                        TOPIC COUNT
                    ================================= */}

                    <p className="syllabus-topic-count">

                      {topics.length}{" "}

                      {topics.length ===
                      1
                        ? "Topic"
                        : "Topics"}

                    </p>

                  </div>

                </CommonCard>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}

export default Syllabus;