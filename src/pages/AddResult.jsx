import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";

import "../Styles/AddResult.css";

function AddResult() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [existingResults, setExistingResults] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [selectedExamData, setSelectedExamData] = useState(null);

  const [marks, setMarks] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchExams();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API}/classes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch classes"
        );
      }

      let classData = [];

      if (Array.isArray(data)) {
        classData = data;
      } else if (Array.isArray(data?.classes)) {
        classData = data.classes;
      } else if (Array.isArray(data?.data)) {
        classData = data.data;
      }

      setClasses(classData);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await fetch(`${API}/exams`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch exams"
        );
      }

      let examData = [];

      if (Array.isArray(data)) {
        examData = data;
      } else if (Array.isArray(data?.exams)) {
        examData = data.exams;
      } else if (Array.isArray(data?.data)) {
        examData = data.data;
      }

      setExams(examData);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setExams([]);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API}/data-grid/users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch students"
        );
      }

      let userData = [];

      if (Array.isArray(data)) {
        userData = data;
      } else if (Array.isArray(data?.users)) {
        userData = data.users;
      } else if (Array.isArray(data?.data)) {
        userData = data.data;
      }

      const studentData = userData.filter(
        (user) =>
          user?.userType?.toLowerCase() === "student"
      );

      setStudents(studentData);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingResults = async (examId) => {
    try {
      const response = await fetch(
        `${API}/results?examId=${encodeURIComponent(
          examId
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to fetch existing results"
        );
      }

      let resultData = [];

      if (Array.isArray(data)) {
        resultData = data;
      } else if (Array.isArray(data?.results)) {
        resultData = data.results;
      } else if (Array.isArray(data?.data)) {
        resultData = data.data;
      }

      setExistingResults(resultData);

      return resultData;
    } catch (error) {
      console.error(
        "Error fetching existing results:",
        error
      );

      setExistingResults([]);

      return [];
    }
  };

  const getClassName = (classItem) => {
    return (
      classItem?.className ||
      classItem?.name ||
      classItem?.class ||
      ""
    );
  };

  const handleClassChange = (event) => {
    const className = event.target.value;

    setSelectedClass(className);

    setSelectedExam("");
    setSelectedSubject("");
    setSelectedExamData(null);

    setExistingResults([]);
    setMarks({});
  };

  const handleExamChange = async (event) => {
    const examId = event.target.value;

    const exam = exams.find(
      (item) =>
        item?._id?.toString() ===
        examId?.toString()
    );

    setSelectedExam(examId);
    setSelectedExamData(exam || null);

    setSelectedSubject("");
    setMarks({});

    if (examId) {
      await fetchExistingResults(examId);
    } else {
      setExistingResults([]);
    }
  };

  const handleSubjectChange = (event) => {
    const subjectName = event.target.value;

    setSelectedSubject(subjectName);
    setMarks({});
  };

  const filteredExams = exams.filter((exam) => {
    const examClass = (
      exam?.className || ""
    )
      .toString()
      .trim()
      .toLowerCase();

    return (
      !selectedClass ||
      examClass ===
        selectedClass
          .toString()
          .trim()
          .toLowerCase()
    );
  });

  const subjects =
    selectedExamData?.schedule || [];

  const selectedSubjectData = subjects.find(
    (subject) =>
      subject?.subject === selectedSubject
  );

  const filteredStudents = students.filter(
    (student) => {
      const studentClass =
        student?.className ||
        student?.class ||
        "";

      return (
        !selectedClass ||
        studentClass
          .toString()
          .trim()
          .toLowerCase() ===
          selectedClass
            .toString()
            .trim()
            .toLowerCase()
      );
    }
  );

  const getStudentName = (student) => {
    const fullName =
      `${student?.firstName || ""} ${
        student?.lastName || ""
      }`.trim();

    return (
      fullName ||
      student?.name ||
      student?.studentName ||
      "-"
    );
  };

  const getRollNumber = (student, index) => {
    return (
      student?.rollNumber ||
      student?.rollNo ||
      index + 1
    );
  };

  const getStudentSection = (student) => {
    return student?.section || "";
  };

  const getStudentId = (student) => {
    return (
      student?.userId ||
      student?._id ||
      student?.id ||
      student?.email
    );
  };

  const handleMarkChange = (
    studentId,
    value
  ) => {
    setMarks((previous) => ({
      ...previous,
      [studentId]: value,
    }));
  };

  const getStudentMark = (studentId) => {
    return marks?.[studentId] ?? "";
  };

  const findExistingResult = (student) => {
    const studentId = getStudentId(student);

    const studentName =
      getStudentName(student)
        .trim()
        .toLowerCase();

    return existingResults.find(
      (result) => {
        if (
          result?.studentId &&
          studentId
        ) {
          return (
            result.studentId.toString() ===
            studentId.toString()
          );
        }

        return (
          result?.studentName
            ?.trim()
            .toLowerCase() === studentName
        );
      }
    );
  };

  const handleSaveResults = async () => {
    if (!selectedClass) {
      alert("Please select a class.");
      return;
    }

    if (!selectedExam) {
      alert("Please select an exam.");
      return;
    }

    if (!selectedSubject) {
      alert("Please select a subject.");
      return;
    }

    if (filteredStudents.length === 0) {
      alert("No students found.");
      return;
    }

    if (!selectedSubjectData) {
      alert("Selected subject details not found.");
      return;
    }

    try {
      setSaving(true);

      for (
        let index = 0;
        index < filteredStudents.length;
        index++
      ) {
        const student =
          filteredStudents[index];

        const studentId =
          getStudentId(student);

        if (!studentId) {
          alert(
            `Student ID not found for ${getStudentName(
              student
            )}.`
          );

          return;
        }

        const studentMark =
          marks?.[studentId];

        if (
          studentMark === undefined ||
          studentMark === ""
        ) {
          continue;
        }

        const numericMarks =
          Number(studentMark);

        if (
          Number.isNaN(numericMarks) ||
          numericMarks < 0 ||
          numericMarks > 100
        ) {
          alert(
            `Invalid marks for ${getStudentName(
              student
            )}. Marks must be between 0 and 100.`
          );

          return;
        }

        const existingResult =
          findExistingResult(student);

        if (existingResult) {
          const existingSubjects =
            Array.isArray(
              existingResult.subjects
            )
              ? [
                  ...existingResult.subjects,
                ]
              : [];

          const subjectIndex =
            existingSubjects.findIndex(
              (item) =>
                item?.subject
                  ?.trim()
                  .toLowerCase() ===
                selectedSubject
                  .trim()
                  .toLowerCase()
            );

          if (subjectIndex !== -1) {
            existingSubjects[
              subjectIndex
            ] = {
              ...existingSubjects[
                subjectIndex
              ],
              subject: selectedSubject,
              marks: numericMarks,
            };
          } else {
            existingSubjects.push({
              subject: selectedSubject,
              marks: numericMarks,
            });
          }

          const payload = {
            studentId,
            studentName:
              existingResult.studentName,
            examId: selectedExam,
            subjects: existingSubjects,
          };

          console.log(
            "Update Result Payload:",
            payload
          );

          const response = await fetch(
            `${API}/results/${existingResult._id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            }
          );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result?.message ||
                `Failed to update result for ${getStudentName(
                  student
                )}`
            );
          }
        } else {
          const payload = {
            studentId,
            studentName:
              getStudentName(student),
            examId: selectedExam,
            subjects: [
              {
                subject: selectedSubject,
                marks: numericMarks,
              },
            ],
          };

          console.log(
            "Create Result Payload:",
            payload
          );

          const response = await fetch(
            `${API}/results`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            }
          );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result?.message ||
                `Failed to create result for ${getStudentName(
                  student
                )}`
            );
          }
        }
      }

      alert(
        `${selectedSubject} results saved successfully.`
      );

      navigate("/dashboard/results");
    } catch (error) {
      console.error(
        "Error saving results:",
        error
      );

      alert(
        error.message ||
          "Failed to save results."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-result-page">
      <div className="add-result-header">
        <div>
          <h1>
            Add Result
          </h1>

          <p>
            Enter student examination marks
          </p>
        </div>

        <button
          type="button"
          className="add-result-back-button"
          onClick={() =>
            navigate(
              "/dashboard/results"
            )
          }
        >
          ← Back
        </button>
      </div>

      <CommonCard
        className="add-result-selection-card"
      >
        <div className="add-result-selection">
          <div className="add-result-field">
            <label>
              Class
            </label>

            <select
              value={selectedClass}
              onChange={
                handleClassChange
              }
            >
              <option value="">
                Select Class
              </option>

              {classes.map(
                (classItem, index) => {
                  const className =
                    getClassName(
                      classItem
                    );

                  return (
                    <option
                      key={
                        classItem?._id ||
                        index
                      }
                      value={className}
                    >
                      {className}
                    </option>
                  );
                }
              )}
            </select>
          </div>

          <div className="add-result-field">
            <label>
              Exam
            </label>

            <select
              value={selectedExam}
              onChange={
                handleExamChange
              }
              disabled={
                !selectedClass
              }
            >
              <option value="">
                Select Exam
              </option>

              {filteredExams.map(
                (exam) => (
                  <option
                    key={exam?._id}
                    value={exam?._id}
                  >
                    {exam?.examType}
                    {" - "}
                    {exam?.academicYear}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="add-result-field">
            <label>
              Subject
            </label>

            <select
              value={selectedSubject}
              onChange={
                handleSubjectChange
              }
              disabled={
                !selectedExam
              }
            >
              <option value="">
                Select Subject
              </option>

              {subjects.map(
                (subject, index) => (
                  <option
                    key={
                      subject?._id ||
                      subject?.subject ||
                      index
                    }
                    value={
                      subject?.subject
                    }
                  >
                    {subject?.subject}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </CommonCard>

      {selectedSubject && (
        <CommonCard
          className="add-result-students-card"
        >
          <div className="add-result-students-header">
            <div>
              <h2>
                Student Marks
              </h2>

              <p>
                {selectedClass}
                {" • "}
                {
                  selectedExamData?.examType
                }
                {" • "}
                {selectedSubject}
              </p>
            </div>

            <div className="add-result-max-marks">
              Max Marks:{" "}
              <strong>
                100
              </strong>
            </div>
          </div>

          {loading ? (
            <div className="add-result-loading">
              Loading students...
            </div>
          ) : filteredStudents.length ===
            0 ? (
            <div className="add-result-empty">
              No students found for this
              class.
            </div>
          ) : (
            <div className="add-result-table-wrapper">
              <table className="add-result-table">
                <thead>
                  <tr>
                    <th>
                      Roll No
                    </th>

                    <th>
                      Student Name
                    </th>

                    <th>
                      Section
                    </th>

                    <th>
                      Marks
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map(
                    (
                      student,
                      index
                    ) => {
                      const studentId =
                        getStudentId(
                          student
                        );

                      return (
                        <tr
                          key={
                            studentId
                          }
                        >
                          <td>
                            {getRollNumber(
                              student,
                              index
                            )}
                          </td>

                          <td>
                            {getStudentName(
                              student
                            )}
                          </td>

                          <td>
                            {getStudentSection(
                              student
                            )}
                          </td>

                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="Enter marks"
                              value={getStudentMark(
                                studentId
                              )}
                              onChange={(
                                event
                              ) =>
                                handleMarkChange(
                                  studentId,
                                  event.target
                                    .value
                                )
                              }
                            />
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}

          {filteredStudents.length >
            0 && (
            <div className="add-result-actions">
              <button
                type="button"
                className="add-result-cancel-button"
                onClick={() =>
                  navigate(
                    "/dashboard/results"
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="add-result-save-button"
                onClick={
                  handleSaveResults
                }
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Results"}
              </button>
            </div>
          )}
        </CommonCard>
      )}
    </div>
  );
}

export default AddResult;