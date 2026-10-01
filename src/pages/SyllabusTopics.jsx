import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import API from "../services/api";

import CommonCard from "../components/CommonCard";
import SearchBar from "../components/SearchBar";

import useSearchFilter from "../hooks/useSearchFilter";
import { sortAscending } from "../utils/classSort";

import "../Styles/SyllabusTopics.css";

function SyllabusTopics() {
  const {
    subjectId,
    academicYearId,
  } = useParams();

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const [subjectName, setSubjectName] =
    useState(
      location.state?.subjectName ||
        "Subject"
    );

  const [subjectCode, setSubjectCode] =
    useState(
      location.state?.subjectCode ||
        ""
    );

  const [academicYear, setAcademicYear] =
    useState(
      location.state?.academicYear ||
        ""
    );

  const [topics, setTopics] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const token =
    localStorage.getItem("token");

  // =====================================================
  // GET PDF URL
  // =====================================================

  const getFileUrl = (topic) => {
    // =================================================
    // DIRECT FILE URL
    // =================================================

    if (
      topic?.fileUrl &&
      typeof topic.fileUrl === "string"
    ) {
      return topic.fileUrl;
    }

    // =================================================
    // FILE STORED DIRECTLY AS URL
    // =================================================

    if (
      topic?.file &&
      typeof topic.file === "string" &&
      topic.file.startsWith("http")
    ) {
      return topic.file;
    }

    // =================================================
    // FILE OBJECT URL
    // =================================================

    if (
      topic?.file?.url &&
      typeof topic.file.url === "string"
    ) {
      return topic.file.url;
    }

    // =================================================
    // FILE OBJECT FILE URL
    // =================================================

    if (
      topic?.file?.fileUrl &&
      typeof topic.file.fileUrl === "string"
    ) {
      return topic.file.fileUrl;
    }

    // =================================================
    // GET STORED FILE NAME
    // =================================================

    const storedFileName =
      topic?.storedFileName ||
      topic?.file?.storedFileName ||
      topic?.file?.filename ||
      topic?.fileName ||
      topic?.file?.fileName;

    if (!storedFileName) {
      return "";
    }

    return (
      `http://localhost:5014/uploads/syllabus/${encodeURIComponent(
        storedFileName
      )}`
    );
  };

  // =====================================================
  // FETCH SUBJECT DETAILS
  // =====================================================

  useEffect(() => {
    const fetchSubject =
      async () => {
        try {
          setLoading(true);

          setMessage("");

          const response =
            await fetch(
              `${API}/subjects/${subjectId}`,
              {
                method: "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          if (!response.ok) {
            throw new Error(
              "Failed to fetch subject"
            );
          }

          const data =
            await response.json();

          const subject =
            data?.data || data;

          // =================================================
          // SET SUBJECT NAME
          // =================================================

          setSubjectName(
            subject?.subjectName ||
              location.state?.subjectName ||
              "Subject"
          );

          // =================================================
          // SET SUBJECT CODE
          // =================================================

          setSubjectCode(
            subject?.subjectCode ||
              location.state?.subjectCode ||
              ""
          );

          // =================================================
          // FIND SELECTED ACADEMIC YEAR
          // =================================================

          const selectedAcademicYear =
            subject?.academicYears?.find(
              (year) =>
                String(year?._id) ===
                String(academicYearId)
            );

          if (!selectedAcademicYear) {
            setMessage(
              "Academic year not found"
            );

            setTopics([]);

            return;
          }

          // =================================================
          // SET ACADEMIC YEAR
          // =================================================

          setAcademicYear(
            selectedAcademicYear?.academicYear ||
              (
                selectedAcademicYear?.startingYear
                  ? `${selectedAcademicYear.startingYear} - ${
                      selectedAcademicYear.endingYear ||
                      ""
                    }`
                  : location.state?.academicYear ||
                    ""
              )
          );

          // =================================================
          // SET TOPICS
          // =================================================

          setTopics(
            Array.isArray(
              selectedAcademicYear?.topics
            )
              ? selectedAcademicYear.topics
              : []
          );
        } catch (error) {
          console.error(
            "Syllabus Topics Error:",
            error
          );

          setMessage(
            "Failed to load syllabus topics"
          );
        } finally {
          setLoading(false);
        }
      };

    if (
      subjectId &&
      academicYearId
    ) {
      fetchSubject();
    }
  }, [
    subjectId,
    academicYearId,
    token,
    location.state,
  ]);

  // =====================================================
  // COMMON SEARCH
  // =====================================================

  const filteredTopics =
    useSearchFilter(
      topics,
      searchTerm,
      [
        "topicName",
        "description",
      ]
    );

  // =====================================================
  // COMMON SORTING
  // =====================================================

  const sortedTopics =
    sortAscending(
      filteredTopics,
      "topicName"
    );

  // =====================================================
  // VIEW PDF
  // =====================================================

  const handleViewPdf = (topic) => {
    const fileUrl =
      getFileUrl(topic);

    if (!fileUrl) {
      setMessage(
        "PDF file is not available"
      );

      return;
    }

    window.open(
      fileUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // BACK TO SYLLABUS
  // =====================================================

  const handleBack = () => {
    navigate(
      "/dashboard/syllabus"
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="syllabus-topics-page">

        <div className="syllabus-topics-loading">
          Loading syllabus topics...
        </div>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="syllabus-topics-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="syllabus-topics-header">

        <button
          type="button"
          className="syllabus-topics-back-button"
          onClick={handleBack}
        >
          ← Back to Syllabus
        </button>

        <h1>
          {subjectName}
        </h1>

        {/* =================================================
            SUBJECT CODE
        ================================================= */}

        <p className="syllabus-topics-subject-code">
          Subject Code:{" "}
          {subjectCode || "-"}
        </p>

        {/* =================================================
            ACADEMIC YEAR
        ================================================= */}

        <p>
          Academic Year:{" "}
          {academicYear || "-"}
        </p>

      </div>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div className="syllabus-topics-message">
          {message}
        </div>
      )}

      {/* =================================================
          COMMON SEARCH BAR
      ================================================= */}

      {topics.length > 0 && (
        <div className="subject-topic-search">

          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search topics..."
          />

        </div>
      )}

      {/* =================================================
          NO TOPICS
      ================================================= */}

      {topics.length === 0 ? (

        <div className="syllabus-topics-empty">
          No syllabus topics available.
        </div>

      ) : sortedTopics.length === 0 ? (

        <div className="syllabus-topics-empty">

          No topics found for{" "}

          <strong>
            "{searchTerm}"
          </strong>

        </div>

      ) : (

        /* =================================================
           TOPIC CARDS
        ================================================= */

        <div className="syllabus-topics-card-grid">

          {sortedTopics.map(
            (topic, index) => {

              const fileUrl =
                getFileUrl(topic);

              return (
                <CommonCard
                  key={
                    topic?._id ||
                    `${topic?.topicName}-${index}`
                  }
                  className="syllabus-topic-card"
                  padding={false}
                >

                  <div className="syllabus-topic-card-content">

                    {/* =================================
                        TOPIC NUMBER
                    ================================= */}

                    <div className="syllabus-topic-number">
                      Topic {index + 1}
                    </div>

                    {/* =================================
                        TOPIC NAME
                    ================================= */}

                    <h2>
                      {
                        topic?.topicName ||
                        "Untitled Topic"
                      }
                    </h2>

                    {/* =================================
                        DESCRIPTION
                    ================================= */}

                    <p className="syllabus-topic-description">
                      {
                        topic?.description ||
                        "No description available."
                      }
                    </p>

                    {/* =================================
                        PDF STATUS
                    ================================= */}

                    <div className="syllabus-topic-file">

                      {fileUrl
                        ? "PDF Available"
                        : "PDF Not Available"}

                    </div>

                    {/* =================================
                        VIEW PDF
                    ================================= */}

                    <div className="syllabus-topic-actions">

                      <button
                        type="button"
                        className="syllabus-view-pdf-button"
                        onClick={() =>
                          handleViewPdf(
                            topic
                          )
                        }
                        disabled={!fileUrl}
                      >
                        View PDF
                      </button>

                    </div>

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

export default SyllabusTopics;