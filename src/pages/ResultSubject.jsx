// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// import API from "../services/api";
// import CommonCard from "../components/CommonCard";

// import "../Styles/ResultSubject.css";

// function ResultSubject() {
//   const navigate = useNavigate();

//   const { examId } = useParams();

//   const [exam, setExam] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const token = localStorage.getItem("token");

//   // ==========================================
//   // FETCH EXAM
//   // ==========================================

//   useEffect(() => {
//     if (examId) {
//       fetchExam();
//     }
//   }, [examId]);

//   const fetchExam = async () => {
//     try {
//       setLoading(true);

//       const response = await fetch(
//         `${API}/exams/${examId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch exam");
//       }

//       const data = await response.json();

//       console.log("Result Selected Exam:", data);

//       const examData =
//         data?.exam ||
//         data?.data ||
//         data;

//       setExam(examData);

//     } catch (error) {
//       console.error(
//         "Error fetching exam:",
//         error
//       );

//       setExam(null);

//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================================
//   // SUBJECTS FROM EXAM SCHEDULE
//   // ==========================================

//   const subjects = Array.isArray(exam?.schedule)
//     ? exam.schedule
//     : [];

//   // ==========================================
//   // REMOVE DUPLICATE SUBJECTS
//   // ==========================================

//   const uniqueSubjects = subjects.filter(
//     (subjectItem, index, array) => {

//       const currentSubject =
//         subjectItem?.subject
//           ?.toString()
//           .trim()
//           .toLowerCase();

//       return (
//         array.findIndex(
//           (item) =>
//             item?.subject
//               ?.toString()
//               .trim()
//               .toLowerCase() === currentSubject
//         ) === index
//       );
//     }
//   );

//   // ==========================================
//   // SUBJECT CLICK
//   // ==========================================

//   const handleSubjectClick = (subjectItem) => {
//     const subjectName =
//       subjectItem?.subject || "";

//     const subjectId =
//       subjectItem?.subjectId || "";

//     navigate(
//       `/dashboard/results/${examId}/subject/${encodeURIComponent(
//         subjectName
//       )}?subjectId=${encodeURIComponent(
//         subjectId
//       )}`
//     );
//   };

//   // ==========================================
//   // BACK
//   // ==========================================

//   const handleBack = () => {
//     if (exam?.className) {
//       navigate(
//         `/dashboard/results/class/${encodeURIComponent(
//           exam.className
//         )}?academicYear=${encodeURIComponent(
//           exam.academicYear || ""
//         )}`
//       );

//       return;
//     }

//     navigate("/dashboard/results");
//   };

//   // ==========================================
//   // LOADING
//   // ==========================================

//   if (loading) {
//     return (
//       <div className="result-subject-page">

//         <div className="result-subject-loading">
//           Loading subjects...
//         </div>

//       </div>
//     );
//   }

//   // ==========================================
//   // EXAM NOT FOUND
//   // ==========================================

//   if (!exam) {
//     return (
//       <div className="result-subject-page">

//         <div className="result-subject-empty">

//           <h2>Exam not found</h2>

//           <button
//             type="button"
//             className="result-subject-back-button"
//             onClick={() =>
//               navigate("/dashboard/results")
//             }
//           >
//             ← Back to Results
//           </button>

//         </div>

//       </div>
//     );
//   }

//   // ==========================================
//   // UI
//   // ==========================================

//   return (
//     <div className="result-subject-page">

//       {/* ======================================
//           HEADER
//       ====================================== */}

//       <div className="result-subject-header">

//         <div>

//           <h1>Subjects</h1>

//           <p>
//             {exam.className}
//             {" • "}
//             {exam.examType}
//             {" • "}
//             {exam.academicYear}
//           </p>

//         </div>

//         <button
//           type="button"
//           className="result-subject-back-button"
//           onClick={handleBack}
//         >
//           ← Back
//         </button>

//       </div>

//       {/* ======================================
//           SUBJECT CARDS
//       ====================================== */}

//       <div className="result-subject-cards">

//         {uniqueSubjects.length === 0 ? (

//           <div className="result-subject-empty">

//             <p>
//               No subjects found for this exam.
//             </p>

//           </div>

//         ) : (

//           uniqueSubjects.map(
//             (subjectItem, index) => (

//               <div
//                 key={
//                   subjectItem?._id ||
//                   subjectItem?.subjectId ||
//                   `${subjectItem?.subject}-${index}`
//                 }
//                 className="result-subject-card-wrapper"
//               >

//                 <CommonCard className="result-subject-card">

//                   <div className="result-subject-card-content">

//                     <h2>
//                       {subjectItem?.subject || "-"}
//                     </h2>

//                     <p>
//                       {subjectItem?.subjectCode ||
//                         "Subject"}
//                     </p>

//                     <button
//                       type="button"
//                       className="result-subject-view-button"
//                       onClick={() =>
//                         handleSubjectClick(
//                           subjectItem
//                         )
//                       }
//                     >
//                       View Students →
//                     </button>

//                   </div>

//                 </CommonCard>

//               </div>

//             )
//           )

//         )}

//       </div>

//     </div>
//   );
// }

// export default ResultSubject;