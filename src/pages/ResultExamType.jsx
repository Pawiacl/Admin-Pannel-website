import { useEffect, useMemo, useState } from "react";
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

import "../Styles/ResultExamType.css";

function ResultExamType() {
  const navigate = useNavigate();

  const { className } = useParams();

  const [searchParams] = useSearchParams();

  const academicYear =
    searchParams.get("academicYear") || "";

  const [exams, setExams] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const token =
    localStorage.getItem("token");

  useEffect(() => {
    fetchExams();
  }, [className, academicYear]);

  const fetchExams = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API}/exams`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to fetch exams"
        );
      }

      let examData = [];

      if (Array.isArray(data)) {
        examData = data;
      } else if (
        Array.isArray(data?.exams)
      ) {
        examData = data.exams;
      } else if (
        Array.isArray(data?.data)
      ) {
        examData = data.data;
      }

      const selectedClass =
        decodeURIComponent(
          className || ""
        )
          .trim()
          .toLowerCase();

      let filteredExams =
        examData.filter((exam) => {
          const examClass = (
            exam?.className || ""
          )
            .toString()
            .trim()
            .toLowerCase();

          return (
            examClass === selectedClass
          );
        });

      if (academicYear) {
        filteredExams =
          filteredExams.filter(
            (exam) =>
              exam?.academicYear
                ?.toString()
                .trim() ===
              academicYear
                .toString()
                .trim()
          );
      }

      setExams(filteredExams);
    } catch (error) {
      console.error(
        "Exam Fetch Error:",
        error
      );

      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Create unique exam type cards
   */

  const uniqueExamTypes =
    useMemo(() => {
      const examMap = new Map();

      exams.forEach((exam) => {
        const examType =
          exam?.examType
            ?.toString()
            .trim();

        if (!examType) {
          return;
        }

        const key =
          examType.toLowerCase();

        if (!examMap.has(key)) {
          examMap.set(key, {
            examType,
            examId: exam?._id,
            academicYear:
              exam?.academicYear,
          });
        }
      });

      return Array.from(
        examMap.values()
      );
    }, [exams]);

  /*
   * Search exam types
   */

  const filteredExamTypes =
    useSearchFilter(
      uniqueExamTypes,
      searchTerm,
      ["examType", "academicYear"]
    );

  /*
   * Sort exam types alphabetically
   */

  const sortedExamTypes =
    sortAscending(
      filteredExamTypes,
      "examType"
    );

  /*
   * Exam Type click
   *
   * Student logic is NOT here.
   */

  const handleExamTypeClick =
    (exam) => {
      navigate(
        `/dashboard/results/class/${encodeURIComponent(
          className
        )}/exam/${exam.examId}`
      );
    };

  const handleBack = () => {
    navigate(
      "/dashboard/results"
    );
  };

  if (loading) {
    return (
      <div className="result-exam-type-page">
        <div className="result-exam-type-header">
          <div>
            <h1>Exam Types</h1>

            <p>
              {decodeURIComponent(
                className || ""
              )}
              {" • "}
              {academicYear}
            </p>
          </div>
        </div>

        <CommonCard>
          <div className="result-exam-type-loading">
            Loading exam types...
          </div>
        </CommonCard>
      </div>
    );
  }

  return (
    <div className="result-exam-type-page">
      <div className="result-exam-type-header">
        <div>
          <h1>Exam Types</h1>

          <p>
            {decodeURIComponent(
              className || ""
            )}
            {" • "}
            {academicYear}
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

      {/* Search */}
      <div className="result-exam-type-search">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search exam type..."
        />
      </div>

      <div className="result-exam-type-cards">
        {sortedExamTypes.length === 0 ? (
          <CommonCard>
            <div className="result-exam-type-empty">
              {searchTerm
                ? "No matching exam types found."
                : "No exam types found for this class."}
            </div>
          </CommonCard>
        ) : (
          sortedExamTypes.map(
            (exam, index) => (
              <CommonCard
                key={`${exam.examType}-${index}`}
                className="result-exam-type-card"
                clickable
                hover
                onClick={() =>
                  handleExamTypeClick(
                    exam
                  )
                }
              >
                <div className="result-exam-type-card-content">
                  <h2>
                    {exam.examType}
                  </h2>

                  <p>
                    {decodeURIComponent(
                      className || ""
                    )}
                  </p>

                  <span>
                    View Students →
                  </span>
                </div>
              </CommonCard>
            )
          )
        )}
      </div>
    </div>
  );
}

export default ResultExamType;