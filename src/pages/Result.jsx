import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";
import SearchBar from "../components/SearchBar";

import { sortByClass } from "../utils/classSort";
import useSearchFilter from "../hooks/useSearchFilter";

import "../Styles/Result.css";

function Result() {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchResultData();
  }, []);

  const fetchResultData = async () => {
    try {
      setLoading(true);

      /*
       * Fetch saved results
       */

      const resultsResponse = await fetch(
        `${API}/results`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const resultsData =
        await resultsResponse.json();

      if (!resultsResponse.ok) {
        throw new Error(
          resultsData?.message ||
            "Failed to fetch results"
        );
      }

      let resultData = [];

      if (Array.isArray(resultsData)) {
        resultData = resultsData;
      } else if (
        Array.isArray(resultsData?.results)
      ) {
        resultData = resultsData.results;
      } else if (
        Array.isArray(resultsData?.data)
      ) {
        resultData = resultsData.data;
      }

      /*
       * Fetch exams
       *
       * Result model contains examId.
       * Class and academic year come from Exam.
       */

      const examsResponse = await fetch(
        `${API}/exams`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const examsData =
        await examsResponse.json();

      if (!examsResponse.ok) {
        throw new Error(
          examsData?.message ||
            "Failed to fetch exams"
        );
      }

      let examData = [];

      if (Array.isArray(examsData)) {
        examData = examsData;
      } else if (
        Array.isArray(examsData?.exams)
      ) {
        examData = examsData.exams;
      } else if (
        Array.isArray(examsData?.data)
      ) {
        examData = examsData.data;
      }

      setResults(resultData);
      setExams(examData);
    } catch (error) {
      console.error(
        "Result Fetch Error:",
        error
      );

      setResults([]);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Find exam for saved result
   */

  const getExamForResult = (result) => {
    const resultExamId =
      result?.examId?.toString();

    if (!resultExamId) {
      return null;
    }

    return (
      exams.find(
        (exam) =>
          exam?._id?.toString() ===
          resultExamId
      ) || null
    );
  };

  /*
   * Get class name from result -> exam
   */

  const getClassName = (result) => {
    if (result?.className) {
      return result.className;
    }

    const exam =
      getExamForResult(result);

    return exam?.className || "";
  };

  /*
   * Get academic year from result -> exam
   */

  const getAcademicYear = (result) => {
    if (result?.academicYear) {
      return result.academicYear;
    }

    const exam =
      getExamForResult(result);

    if (exam?.academicYear) {
      return exam.academicYear;
    }

    return "";
  };

  /*
   * Create unique class cards
   *
   * One card per:
   * Class + Academic Year
   */

  const uniqueResultClasses =
    Array.from(
      new Map(
        results
          .map((result) => {
            const className =
              getClassName(result)
                .toString()
                .trim();

            const academicYear =
              getAcademicYear(result);

            if (!className) {
              return null;
            }

            return [
              `${className}-${academicYear}`,
              {
                className,
                academicYear,
              },
            ];
          })
          .filter(Boolean)
      ).values()
    );

  /*
   * Search class cards
   *
   * Search by:
   * - Class Name
   * - Academic Year
   */

  const filteredResultClasses =
    useSearchFilter(
      uniqueResultClasses,
      searchTerm,
      [
        "className",
        "academicYear",
      ]
    );

  /*
   * Sort class cards
   *
   * LKG -> UKG -> 1 -> 2 -> 3...
   */

  const sortedResultClasses =
    sortByClass(
      filteredResultClasses
    );

  /*
   * Navigate to Exam Type page
   */

  const handleClassClick = (
    className,
    academicYear
  ) => {
    navigate(
      `/dashboard/results/class/${encodeURIComponent(
        className
      )}?academicYear=${encodeURIComponent(
        academicYear
      )}`
    );
  };

  /*
   * Navigate to Add Result
   */

  const handleAddResult = () => {
    navigate(
      "/dashboard/results/add"
    );
  };

  if (loading) {
    return (
      <div className="result-page">
        <div className="result-header">
          <div>
            <h1>Results</h1>

            <p>
              Manage student examination results
            </p>
          </div>
        </div>

        <CommonCard>
          <div className="result-loading">
            Loading results...
          </div>
        </CommonCard>
      </div>
    );
  }

  return (
    <div className="result-page">
      <div className="result-header">
        <div>
          <h1>Results</h1>

          <p>
            Manage student examination results
          </p>
        </div>

        <button
          type="button"
          className="result-add-button"
          onClick={handleAddResult}
        >
          + Add Result
        </button>
      </div>

      {/* Search */}
      <div className="result-search">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search class or academic year..."
        />
      </div>

      <div className="result-class-cards">
        {sortedResultClasses.length === 0 ? (
          <CommonCard>
            <div className="result-empty">
              {searchTerm
                ? "No matching results found."
                : "No results found."}
            </div>
          </CommonCard>
        ) : (
          sortedResultClasses.map(
            (item, index) => (
              <CommonCard
                key={`${item.className}-${item.academicYear}-${index}`}
                className="result-class-card"
                clickable
                hover
                onClick={() =>
                  handleClassClick(
                    item.className,
                    item.academicYear
                  )
                }
              >
                <div className="result-class-card-content">
                  <h2>
                    {item.className}
                  </h2>

                  <p>
                    Academic Year:{" "}
                    {item.academicYear}
                  </p>

                  <span>
                    View Exam Types →
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

export default Result;