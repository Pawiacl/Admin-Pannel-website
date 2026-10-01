import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";

import "../Styles/AddSubject.css";

function AddSubject() {
  const navigate = useNavigate();

  const location = useLocation();

  // =====================================================
  // EDIT MODE
  // =====================================================

  const editMode =
    location.state?.editMode === true;

  const editingSubject =
    location.state?.subject || null;

  // =====================================================
  // SUBJECT STATE
  // =====================================================

  const [subjectName, setSubjectName] =
    useState("");

  const [subjectCode, setSubjectCode] =
    useState("");

  const [startingYear, setStartingYear] =
    useState("");

  const [endingYear, setEndingYear] =
    useState("");

  const [status, setStatus] =
    useState(true);

  // =====================================================
  // TOPIC STATE
  // =====================================================

  const [topics, setTopics] =
    useState([]);

  const [topicAcademicYear, setTopicAcademicYear] =
    useState("");

  const [topicName, setTopicName] =
    useState("");

  const [topicDescription, setTopicDescription] =
    useState("");

  const [topicFile, setTopicFile] =
    useState(null);

  // =====================================================
  // UI STATE
  // =====================================================

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // LOAD EDIT DATA
  // =====================================================

  useEffect(() => {
    if (
      !editMode ||
      !editingSubject
    ) {
      return;
    }

    setSubjectName(
      editingSubject.subjectName || ""
    );

    setSubjectCode(
      editingSubject.subjectCode || ""
    );

    // Backend stores only year.
    // January is used for edit display.

    if (
      editingSubject.startingYear
    ) {
      setStartingYear(
        `${editingSubject.startingYear}-01`
      );
    } else {
      setStartingYear("");
    }

    if (
      editingSubject.endingYear
    ) {
      setEndingYear(
        `${editingSubject.endingYear}-01`
      );
    } else {
      setEndingYear("");
    }

    setStatus(
      editingSubject.status !== false
    );

    setError("");

    setMessage("");
  }, [
    editMode,
    editingSubject,
  ]);

  // =====================================================
  // GET ACADEMIC YEARS
  // =====================================================

  const getAcademicYears = () => {
    if (
      !startingYear ||
      !endingYear
    ) {
      return [];
    }

    const start =
      Number(
        startingYear.split("-")[0]
      );

    const end =
      Number(
        endingYear.split("-")[0]
      );

    if (
      !start ||
      !end ||
      start >= end
    ) {
      return [];
    }

    return Array.from(
      {
        length:
          end - start,
      },
      (_, index) =>
        `${start + index}-${start + index + 1}`
    );
  };

  // =====================================================
  // RESET TOPIC FORM
  // =====================================================

  const resetTopicForm = () => {
    setTopicAcademicYear("");

    setTopicName("");

    setTopicDescription("");

    setTopicFile(null);
  };

  // =====================================================
  // ADD TOPIC
  // =====================================================

  const handleAddTopic = () => {
    setError("");

    setMessage("");

    if (!topicAcademicYear) {
      setError(
        "Please select academic year for the topic."
      );

      return;
    }

    if (!topicName.trim()) {
      setError(
        "Please enter topic name."
      );

      return;
    }

    const newTopic = {
      id:
        Date.now() +
        Math.random(),

      academicYear:
        topicAcademicYear,

      topicName:
        topicName.trim(),

      description:
        topicDescription.trim(),

      file:
        topicFile,
    };

    setTopics(
      (previousTopics) => [
        ...previousTopics,
        newTopic,
      ]
    );

    resetTopicForm();
  };

  // =====================================================
  // REMOVE TOPIC
  // =====================================================

  const handleRemoveTopic = (
    topicIndex
  ) => {
    setTopics(
      (previousTopics) =>
        previousTopics.filter(
          (_, index) =>
            index !== topicIndex
        )
    );
  };

  // =====================================================
  // UPLOAD TOPIC FILE
  // =====================================================

  const uploadTopicFile = async (
    file
  ) => {
    if (!file) {
      return null;
    }

    const token =
      getToken();

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const response =
      await fetch(
        `${API}/files/upload`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
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
        "Failed to upload topic file"
      );
    }

    return (
      result.data ||
      result.file ||
      null
    );
  };

  // =====================================================
  // BUILD ACADEMIC YEARS
  // =====================================================

  const buildAcademicYears =
    async () => {
      const academicYears =
        getAcademicYears();

      const result =
        academicYears.map(
          (academicYear) => ({
            academicYear,
            topics: [],
          })
        );

      const preparedTopics =
        [];

      for (
        const topic of topics
      ) {
        let uploadedFile =
          topic.file;

        if (
          topic.file instanceof File
        ) {
          uploadedFile =
            await uploadTopicFile(
              topic.file
            );
        }

        preparedTopics.push({
          academicYear:
            topic.academicYear,

          topicName:
            topic.topicName,

          description:
            topic.description,

          file:
            uploadedFile ||
            null,
        });
      }

      preparedTopics.forEach(
        (topic) => {
          const academicYear =
            result.find(
              (item) =>
                item.academicYear ===
                topic.academicYear
            );

          if (academicYear) {
            academicYear.topics.push({
              topicName:
                topic.topicName,

              description:
                topic.description,

              file:
                topic.file,
            });
          }
        }
      );

      return result;
    };

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validateForm = () => {
    if (!subjectName.trim()) {
      setError(
        "Please enter subject name."
      );

      return false;
    }

    if (!subjectCode.trim()) {
      setError(
        "Please enter subject code."
      );

      return false;
    }

    if (!startingYear) {
      setError(
        "Please select starting month and year."
      );

      return false;
    }

    if (!endingYear) {
      setError(
        "Please select ending month and year."
      );

      return false;
    }

    // ==========================================
    // COMPARE ACTUAL MONTH + YEAR
    // ==========================================

    const startDate =
      new Date(
        `${startingYear}-01`
      );

    const endDate =
      new Date(
        `${endingYear}-01`
      );

    if (
      Number.isNaN(
        startDate.getTime()
      ) ||
      Number.isNaN(
        endDate.getTime()
      )
    ) {
      setError(
        "Please select valid starting and ending dates."
      );

      return false;
    }

    if (
      startDate >= endDate
    ) {
      setError(
        "Ending month and year must be after starting month and year."
      );

      return false;
    }

    return true;
  };

  // =====================================================
  // ADD SUBJECT
  // =====================================================

  const handleAddSubject =
    async () => {
      try {
        setSaving(true);

        setError("");

        setMessage("");

        if (!validateForm()) {
          return;
        }

        const token =
          getToken();

        const academicYears =
          await buildAcademicYears();

        // Backend continues to receive
        // year values only.

        const requestBody = {
          subjectName:
            subjectName.trim(),

          subjectCode:
            subjectCode
              .trim()
              .toUpperCase(),

          startingYear:
            Number(
              startingYear.split("-")[0]
            ),

          endingYear:
            Number(
              endingYear.split("-")[0]
            ),

          academicYears,

          status,
        };

        console.log(
          "Create Subject Request:",
          requestBody
        );

        const response =
          await fetch(
            `${API}/subjects`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  requestBody
                ),
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
            "Failed to create subject"
          );
        }

        setMessage(
          "Subject created successfully."
        );

        setTimeout(() => {
          navigate(
            "/dashboard/subjects"
          );
        }, 800);
      } catch (error) {
        console.error(
          "Create Subject Error:",
          error
        );

        setError(
          error.message ||
          "Failed to create subject"
        );
      } finally {
        setSaving(false);
      }
    };

  // =====================================================
  // UPDATE SUBJECT
  // =====================================================

  const handleUpdateSubject =
    async () => {
      try {
        setSaving(true);

        setError("");

        setMessage("");

        if (!validateForm()) {
          return;
        }

        if (
          !editingSubject?._id
        ) {
          setError(
            "Subject ID not found."
          );

          return;
        }

        const token =
          getToken();

        const response =
          await fetch(
            `${API}/subjects/${editingSubject._id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                subjectName:
                  subjectName.trim(),

                subjectCode:
                  subjectCode
                    .trim()
                    .toUpperCase(),

                startingYear:
                  Number(
                    startingYear.split("-")[0]
                  ),

                endingYear:
                  Number(
                    endingYear.split("-")[0]
                  ),

                status,
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
            "Failed to update subject"
          );
        }

        setMessage(
          "Subject updated successfully."
        );

        setTimeout(() => {
          navigate(
            "/dashboard/subjects"
          );
        }, 800);
      } catch (error) {
        console.error(
          "Update Subject Error:",
          error
        );

        setError(
          error.message ||
          "Failed to update subject"
        );
      } finally {
        setSaving(false);
      }
    };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (editMode) {
      await handleUpdateSubject();
    } else {
      await handleAddSubject();
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    navigate(
      "/dashboard/subjects"
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="add-subject-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="add-subject-header">

        <div>

          <button
            type="button"
            className="add-subject-back-button"
            onClick={
              handleCancel
            }
          >
            ← Back
          </button>

          <h1>
            {editMode
              ? "Edit Subject"
              : "Add Subject"}
          </h1>

          <p>
            {editMode
              ? "Update subject details"
              : "Add subject and syllabus details"}
          </p>

        </div>

      </div>

      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {message && (
        <div className="add-subject-success-message">
          {message}
        </div>
      )}

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="add-subject-error-message">
          {error}
        </div>
      )}

      {/* =================================================
          SUBJECT FORM
      ================================================= */}

      <CommonCard
        className="add-subject-form-card"
        title={
          editMode
            ? "Edit Subject"
            : "Subject Details"
        }
        subtitle={
          editMode
            ? "Update subject information."
            : "Enter subject information and academic year details."
        }
      >

        <form
          className="add-subject-form"
          onSubmit={
            handleSubmit
          }
        >

          {/* SUBJECT NAME */}

          <div className="add-subject-field">

            <label>
              Subject Name
            </label>

            <input
              type="text"
              placeholder="Enter subject name"
              value={
                subjectName
              }
              onChange={(event) =>
                setSubjectName(
                  event.target.value
                )
              }
            />

          </div>

          {/* SUBJECT CODE */}

          <div className="add-subject-field">

            <label>
              Subject Code
            </label>

            <input
              type="text"
              placeholder="Enter subject code"
              value={
                subjectCode
              }
              onChange={(event) =>
                setSubjectCode(
                  event.target.value
                )
              }
            />

          </div>

          {/* STARTING MONTH & YEAR */}

          <div className="add-subject-field">

            <label>
              Starting Month & Year
            </label>

            <input
              type="month"
              value={
                startingYear
              }
              onChange={(event) => {
                setStartingYear(
                  event.target.value
                );

                setEndingYear("");
              }}
            />

          </div>

          {/* ENDING MONTH & YEAR */}

          <div className="add-subject-field">

            <label>
              Ending Month & Year
            </label>

            <input
              type="month"
              value={
                endingYear
              }
              min={
                startingYear || undefined
              }
              onChange={(event) =>
                setEndingYear(
                  event.target.value
                )
              }
              disabled={
                !startingYear
              }
            />

          </div>

          {/* STATUS */}

          <div className="add-subject-field">

            <label>
              Status
            </label>

            <select
              value={
                status
                  ? "active"
                  : "inactive"
              }
              onChange={(event) =>
                setStatus(
                  event.target.value ===
                  "active"
                )
              }
            >

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

          </div>

          {/* ACADEMIC YEARS */}

          {!editMode &&
            getAcademicYears().length >
              0 && (

            <div className="add-subject-academic-years">

              <div className="add-subject-section-title">

                <h3>
                  Academic Years
                </h3>

                <p>
                  Academic years will be
                  created automatically.
                </p>

              </div>

              <div className="add-subject-year-preview">

                {getAcademicYears().map(
                  (academicYear) => (

                    <div
                      key={
                        academicYear
                      }
                      className="add-subject-year-card"
                    >

                      <span>
                        {academicYear}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

          {/* TOPICS */}

          {!editMode &&
            getAcademicYears().length >
              0 && (

            <div className="add-subject-topics-section">

              <div className="add-subject-section-title">

                <h3>
                  Topics
                </h3>

                <p>
                  Add topics for each
                  academic year.
                </p>

              </div>

              {/* TOPIC FORM */}

              <div className="add-subject-topic-form">

                {/* ACADEMIC YEAR */}

                <div className="add-subject-field">

                  <label>
                    Academic Year
                  </label>

                  <select
                    value={
                      topicAcademicYear
                    }
                    onChange={(event) =>
                      setTopicAcademicYear(
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      Select academic year
                    </option>

                    {getAcademicYears().map(
                      (academicYear) => (

                        <option
                          key={
                            academicYear
                          }
                          value={
                            academicYear
                          }
                        >
                          {academicYear}
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* TOPIC NAME */}

                <div className="add-subject-field">

                  <label>
                    Topic Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter topic name"
                    value={
                      topicName
                    }
                    onChange={(event) =>
                      setTopicName(
                        event.target.value
                      )
                    }
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="add-subject-field">

                  <label>
                    Description
                  </label>

                  <textarea
                    placeholder="Enter topic description"
                    value={
                      topicDescription
                    }
                    onChange={(event) =>
                      setTopicDescription(
                        event.target.value
                      )
                    }
                  />

                </div>

                {/* FILE */}

                <div className="add-subject-field">

                  <label>
                    Topic File
                  </label>

                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(event) =>
                      setTopicFile(
                        event.target.files?.[0] ||
                        null
                      )
                    }
                  />

                  {topicFile && (
                    <small className="add-subject-file-name">
                      {topicFile.name}
                    </small>
                  )}

                </div>

                {/* ADD TOPIC BUTTON */}

                <div className="add-subject-topic-action">

                  <button
                    type="button"
                    className="add-subject-add-topic-button"
                    onClick={
                      handleAddTopic
                    }
                  >
                    + Add Topic
                  </button>

                </div>

              </div>

              {/* ADDED TOPICS */}

              {topics.length >
                0 && (

                <div className="add-subject-added-topics">

                  <h4>
                    Added Topics
                  </h4>

                  <div className="add-subject-topic-list">

                    {topics.map(
                      (
                        topic,
                        index
                      ) => (

                        <div
                          key={
                            topic.id ||
                            index
                          }
                          className="add-subject-topic-card"
                        >

                          <div className="add-subject-topic-content">

                            <span className="add-subject-topic-year">
                              {
                                topic.academicYear
                              }
                            </span>

                            <h4>
                              {
                                topic.topicName
                              }
                            </h4>

                            {topic.description && (
                              <p>
                                {
                                  topic.description
                                }
                              </p>
                            )}

                            {topic.file && (
                              <small>
                                📎{" "}
                                {
                                  topic.file.name
                                }
                              </small>
                            )}

                          </div>

                          <button
                            type="button"
                            className="add-subject-remove-topic-button"
                            onClick={() =>
                              handleRemoveTopic(
                                index
                              )
                            }
                          >
                            Remove
                          </button>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            </div>

          )}

          {/* FORM ACTIONS */}

          <div className="add-subject-form-actions">

            <button
              type="button"
              className="add-subject-cancel-button"
              onClick={
                handleCancel
              }
              disabled={
                saving
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-subject-save-button"
              disabled={
                saving
              }
            >
              {saving
                ? "Saving..."
                : editMode
                  ? "Save Changes"
                  : "Submit"}
            </button>

          </div>

        </form>

      </CommonCard>

    </div>
  );
}

export default AddSubject;