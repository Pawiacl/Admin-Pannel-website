import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";
import SearchBar from "../components/SearchBar";

import useSearchFilter from "../hooks/useSearchFilter";
import { sortAscending } from "../utils/classSort";

import "../Styles/SubjectTopics.css";

function SubjectTopics() {
  const navigate = useNavigate();

  const {
    subjectId,
    academicYearId,
  } = useParams();

  const location = useLocation();

  const subjectName =
    location.state?.subjectName ||
    "Subject";

  const academicYear =
    location.state?.academicYear ||
    "Academic Year";

  const [topics, setTopics] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  // =====================================================
  // SEARCH
  // =====================================================

  const [searchTerm, setSearchTerm] =
    useState("");

  // =====================================================
  // ADD TOPIC
  // =====================================================

  const [showAddTopic, setShowAddTopic] =
    useState(false);

  const [topicName, setTopicName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  // =====================================================
  // EDIT TOPIC
  // =====================================================

  const [editingTopic, setEditingTopic] =
    useState(null);

  const [editTopicName, setEditTopicName] =
    useState("");

  const [editDescription, setEditDescription] =
    useState("");

  const [editFile, setEditFile] =
    useState(null);

  const token =
    localStorage.getItem("token");

  // =====================================================
  // FETCH TOPICS
  // =====================================================

  const fetchTopics = async () => {
    try {
      setLoading(true);

      setError("");

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

      const result =
        await response.json();

      console.log(
        "Subject Details:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to fetch subject"
        );
      }

      const subject =
        result?.data;

      const selectedAcademicYear =
        Array.isArray(
          subject?.academicYears
        )
          ? subject.academicYears.find(
              (year) =>
                String(year?._id) ===
                String(academicYearId)
            )
          : null;

      setTopics(
        Array.isArray(
          selectedAcademicYear?.topics
        )
          ? selectedAcademicYear.topics
          : []
      );
    } catch (error) {
      console.error(
        "Fetch Topics Error:",
        error
      );

      setError(
        error.message ||
          "Failed to fetch topics"
      );

      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH ON PAGE LOAD
  // =====================================================

  useEffect(() => {
    if (
      subjectId &&
      academicYearId
    ) {
      fetchTopics();
    }
  }, [
    subjectId,
    academicYearId,
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
  // UPLOAD FILE
  // =====================================================

  const uploadFile = async (
    file
  ) => {
    if (!file) {
      return null;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "folder",
      "syllabus"
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

    if (!response.ok) {
      throw new Error(
        result?.message ||
          "File upload failed"
      );
    }

    return result?.data;
  };

  // =====================================================
  // OPEN ADD TOPIC
  // =====================================================

  const handleOpenAddTopic = () => {
    setShowAddTopic(true);

    setEditingTopic(null);

    setTopicName("");

    setDescription("");

    setSelectedFile(null);

    setError("");

    setMessage("");
  };

  // =====================================================
  // CLOSE ADD TOPIC
  // =====================================================

  const handleCloseAddTopic = () => {
    setShowAddTopic(false);

    setTopicName("");

    setDescription("");

    setSelectedFile(null);

    setError("");
  };

  // =====================================================
  // ADD TOPIC
  // =====================================================

  const handleAddTopic = async () => {
    try {
      setError("");

      setMessage("");

      if (!topicName.trim()) {
        setError(
          "Topic name is required."
        );

        return;
      }

      setSaving(true);

      let uploadedFile = null;

      if (selectedFile) {
        uploadedFile =
          await uploadFile(
            selectedFile
          );
      }

      const response =
        await fetch(
          `${API}/subjects/${subjectId}/academic-years/${academicYearId}/topics`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              topicName:
                topicName.trim(),

              description:
                description.trim(),

              file:
                uploadedFile,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to add topic"
        );
      }

      setMessage(
        "Topic added successfully."
      );

      setTopicName("");

      setDescription("");

      setSelectedFile(null);

      setShowAddTopic(false);

      await fetchTopics();
    } catch (error) {
      console.error(
        "Add Topic Error:",
        error
      );

      setError(
        error.message ||
          "Failed to add topic"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT TOPIC
  // =====================================================

  const handleEdit = (topic) => {
    setEditingTopic(topic);

    setEditTopicName(
      topic?.topicName || ""
    );

    setEditDescription(
      topic?.description || ""
    );

    setEditFile(null);

    setShowAddTopic(false);

    setError("");

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // UPDATE TOPIC
  // =====================================================

  const handleUpdateTopic =
    async () => {
      try {
        setError("");

        setMessage("");

        if (!editingTopic?._id) {
          setError(
            "Topic ID is missing."
          );

          return;
        }

        if (!editTopicName.trim()) {
          setError(
            "Topic name is required."
          );

          return;
        }

        setSaving(true);

        let uploadedFile = null;

        if (editFile) {
          uploadedFile =
            await uploadFile(
              editFile
            );
        }

        const response =
          await fetch(
            `${API}/subjects/${subjectId}/academic-years/${academicYearId}/topics/${editingTopic._id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                topicName:
                  editTopicName.trim(),

                description:
                  editDescription.trim(),

                file:
                  uploadedFile,
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Failed to update topic"
          );
        }

        setMessage(
          "Topic updated successfully."
        );

        setEditingTopic(null);

        setEditTopicName("");

        setEditDescription("");

        setEditFile(null);

        await fetchTopics();
      } catch (error) {
        console.error(
          "Update Topic Error:",
          error
        );

        setError(
          error.message ||
            "Failed to update topic"
        );
      } finally {
        setSaving(false);
      }
    };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancelEdit = () => {
    setEditingTopic(null);

    setEditTopicName("");

    setEditDescription("");

    setEditFile(null);

    setError("");
  };

  // =====================================================
  // DELETE TOPIC
  // =====================================================

  const handleDeleteTopic =
    async (topic) => {
      if (!topic?._id) {
        setError(
          "Topic ID is missing."
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${topic.topicName}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");

        setMessage("");

        const response =
          await fetch(
            `${API}/subjects/${subjectId}/academic-years/${academicYearId}/topics/${topic._id}`,
            {
              method: "DELETE",

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
              "Failed to delete topic"
          );
        }

        setMessage(
          "Topic deleted successfully."
        );

        setTopics(
          (previousTopics) =>
            previousTopics.filter(
              (item) =>
                item._id !==
                topic._id
            )
        );
      } catch (error) {
        console.error(
          "Delete Topic Error:",
          error
        );

        setError(
          error.message ||
            "Failed to delete topic"
        );
      }
    };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    navigate(
      `/dashboard/subjects/${subjectId}/academic-years`,
      {
        state: {
          subjectName,
        },
      }
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="subjects-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="subjects-header">

        <div>

          <button
            type="button"
            className="subject-back-button"
            onClick={handleBack}
          >
            ← Back
          </button>

          <h1>
            {subjectName}
          </h1>

          <p>
            {academicYear}
          </p>

        </div>

        {!showAddTopic &&
          !editingTopic && (
            <button
              type="button"
              className="subject-add-button"
              onClick={
                handleOpenAddTopic
              }
            >
              + Add Topic
            </button>
          )}

      </div>

      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {message && (
        <div className="subject-success-message">
          {message}
        </div>
      )}

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="subject-error-message">
          {error}
        </div>
      )}

      {/* =================================================
          ADD TOPIC
      ================================================= */}

      {showAddTopic && (
        <CommonCard
          title="Add Topic"
          className="subject-topic-form-card"
        >

          <div className="subject-form">

            <div className="subject-form-group">

              <label>
                Topic Name
              </label>

              <input
                type="text"
                value={topicName}
                onChange={(event) =>
                  setTopicName(
                    event.target.value
                  )
                }
                placeholder="Enter topic name"
              />

            </div>

            <div className="subject-form-group">

              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Enter topic description"
                rows="4"
              />

            </div>

            <div className="subject-form-group">

              <label>
                File
              </label>

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) =>
                  setSelectedFile(
                    event.target.files?.[0] ||
                      null
                  )
                }
              />

            </div>

            <div className="subject-form-actions">

              <button
                type="button"
                className="subject-cancel-button"
                onClick={
                  handleCloseAddTopic
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="subject-submit-button"
                onClick={
                  handleAddTopic
                }
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Add Topic"}
              </button>

            </div>

          </div>

        </CommonCard>
      )}

      {/* =================================================
          EDIT TOPIC
      ================================================= */}

      {editingTopic && (
        <CommonCard
          title="Edit Topic"
          className="subject-topic-form-card"
        >

          <div className="subject-form">

            <div className="subject-form-group">

              <label>
                Topic Name
              </label>

              <input
                type="text"
                value={editTopicName}
                onChange={(event) =>
                  setEditTopicName(
                    event.target.value
                  )
                }
                placeholder="Enter topic name"
              />

            </div>

            <div className="subject-form-group">

              <label>
                Description
              </label>

              <textarea
                value={editDescription}
                onChange={(event) =>
                  setEditDescription(
                    event.target.value
                  )
                }
                placeholder="Enter topic description"
                rows="4"
              />

            </div>

            <div className="subject-form-group">

              <label>
                Replace File
              </label>

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) =>
                  setEditFile(
                    event.target.files?.[0] ||
                      null
                  )
                }
              />

            </div>

            {editingTopic?.file?.fileName && (
              <div className="subject-current-file">

                <strong>
                  Current File:
                </strong>{" "}

                {editingTopic.file.fileName}

              </div>
            )}

            <div className="subject-form-actions">

              <button
                type="button"
                className="subject-cancel-button"
                onClick={
                  handleCancelEdit
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="subject-submit-button"
                onClick={
                  handleUpdateTopic
                }
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </CommonCard>
      )}

      {/* =================================================
          TOPIC SEARCH
      ================================================= */}

      {!loading &&
        topics.length > 0 &&
        !showAddTopic &&
        !editingTopic && (
          <div className="subject-topic-search">

            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search topics..."
            />

          </div>
        )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <div className="subjects-loading">
          Loading topics...
        </div>
      ) : topics.length === 0 ? (
        <div className="subjects-empty">
          No topics available.
        </div>
      ) : sortedTopics.length === 0 ? (
        <div className="subjects-empty">
          No topics found matching
          "{searchTerm}".
        </div>
      ) : (
        <div className="subjects-card-grid">

          {sortedTopics.map(
            (topic, index) => (
              <CommonCard
                key={
                  topic?._id ||
                  index
                }
                className="subject-card"
              >

                <div className="subject-card-content">

                  <h3>
                    {topic?.topicName ||
                      "Untitled Topic"}
                  </h3>

                  {topic?.description && (
                    <p>
                      {topic.description}
                    </p>
                  )}

                  {topic?.file?.fileName && (
                    <div className="subject-file-name">

                      <strong>
                        File:
                      </strong>{" "}

                      {topic.file.fileName}

                    </div>
                  )}

                  <div className="subject-card-actions">

                    <button
                      type="button"
                      className="subject-edit-button"
                      onClick={() =>
                        handleEdit(topic)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="subject-delete-button"
                      onClick={() =>
                        handleDeleteTopic(
                          topic
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </CommonCard>
            )
          )}

        </div>
      )}

    </div>
  );
}

export default SubjectTopics;