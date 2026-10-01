import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

import CommonCard from "../components/CommonCard";
import SearchBar from "../components/SearchBar";

import useSearchFilter from "../hooks/useSearchFilter";

import { sortByClass } from "../utils/classSort";

import "../Styles/Exam.css";

function Exam() {
  const navigate = useNavigate();

  // =====================================================
  // DATA
  // =====================================================

  const [exams, setExams] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  // =====================================================
  // TOKEN
  // =====================================================

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

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to fetch exams"
        );
      }

      setExams(
        result.data || []
      );
    } catch (error) {
      console.error(
        "Fetch Exams Error:",
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
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchExams();
  }, []);

  // =====================================================
  // CREATE CLASS CARDS
  // =====================================================

  const classCards =
    Array.from(
      new Map(
        exams
          .filter(
            (exam) =>
              exam.className &&
              exam.academicYear
          )
          .map(
            (exam) => [
              `${exam.className}-${exam.academicYear}`,

              {
                className:
                  exam.className,

                academicYear:
                  exam.academicYear,
              },
            ]
          )
      ).values()
    );

  // =====================================================
  // COMMON SEARCH
  // =====================================================

  const filteredClassCards =
    useSearchFilter(
      classCards,
      searchTerm,
      [
        "className",
        "academicYear",
      ]
    );

  // =====================================================
  // CLASS-WISE SORT
  // =====================================================

  const sortedClassCards =
    sortByClass(
      filteredClassCards
    );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="exam-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="exam-header">

        <div>

          <h1>
            Exams
          </h1>

          <p>
            Manage school examinations
          </p>

        </div>

        {/* =================================================
            ADD EXAM
        ================================================= */}

        <button
          type="button"
          className="exam-add-button"
          onClick={() =>
            navigate(
              "/dashboard/exams/add"
            )
          }
        >
          + Add Exam
        </button>

      </div>

      {/* =================================================
          SEARCH BAR
      ================================================= */}

      {!loading &&
        classCards.length > 0 && (
          <div className="exam-search">

            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search class or academic year..."
            />

          </div>
        )}

      {/* =================================================
          CLASS CARDS
      ================================================= */}

      <div className="exam-class-cards">

        {loading ? (

          <div className="exam-loading">
            Loading classes...
          </div>

        ) : sortedClassCards.length === 0 ? (

          <div className="exam-empty">

            {searchTerm
              ? `No classes found matching "${searchTerm}".`
              : "No exams found."}

          </div>

        ) : (

          sortedClassCards.map(
            (item) => (

              <div
                key={
                  `${item.className}-${item.academicYear}`
                }

                className="exam-class-card-wrapper"

                onClick={() =>
                  navigate(
                    `/dashboard/exams/class/${encodeURIComponent(
                      item.className
                    )}?academicYear=${encodeURIComponent(
                      item.academicYear
                    )}`
                  )
                }
              >

                <CommonCard
                  className="exam-class-card"
                >

                  <div className="exam-class-card-content">

                    {/* =================================
                        CLASS NAME
                    ================================= */}

                    <h2>
                      {item.className}
                    </h2>

                    {/* =================================
                        ACADEMIC YEAR
                    ================================= */}

                    <p>
                      Academic Year:{" "}
                      {item.academicYear}
                    </p>

                    {/* =================================
                        VIEW EXAM TYPES
                    ================================= */}

                    <span>
                      View Exam Types →
                    </span>

                  </div>

                </CommonCard>

              </div>

            )
          )

        )}

      </div>

    </div>
  );
}

export default Exam;