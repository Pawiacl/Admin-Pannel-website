// ============================================================
// CLASS ORDER CONFIGURATION
// ============================================================

const CLASS_ORDER = {
  LKG: 1,
  UKG: 2,
};

// ============================================================
// GET CLASS SORTING VALUE
//
// Order:
// LKG → UKG → 1 → 2 → 3 → ... → A → B → C...
// ============================================================

export const getClassOrder = (className) => {
  const value = className?.toString().trim() || "";
  const upperValue = value.toUpperCase();

  // 1. LKG
  if (upperValue === "LKG") {
    return CLASS_ORDER.LKG;
  }

  // 2. UKG
  if (upperValue === "UKG") {
    return CLASS_ORDER.UKG;
  }

  // 3. Numeric classes
  // Example: 1, 2, 3, 4, 5, 10
  const number = Number(value);

  if (!isNaN(number) && value !== "") {
    return number + 2;
  }

  // 4. Alphabetical classes
  // Example: A, B, C, D
  if (/^[A-Za-z]+$/.test(value)) {
    return 100 + upperValue.charCodeAt(0);
  }

  // 5. Unknown class names
  return 9999;
};

// ============================================================
// SORT BY CLASS
//
// Order:
// LKG → UKG → 1 → 2 → 3 → ... → A → B → C...
//
// Same class:
// Roll Number → Ascending
// ============================================================

export const sortByClass = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return [...items].sort((a, b) => {
    const classA = getClassOrder(a.className);
    const classB = getClassOrder(b.className);

    // Different classes
    if (classA !== classB) {
      return classA - classB;
    }

    // Same class → Roll Number
    const rollA = Number(a.rollNumber);
    const rollB = Number(b.rollNumber);

    if (!isNaN(rollA) && !isNaN(rollB)) {
      return rollA - rollB;
    }

    return 0;
  });
};

// ============================================================
// SORT BY SECTION
//
// Alphabetical Ascending:
// A → B → C → D...
// ============================================================

export const sortBySection = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return [...items].sort((a, b) => {
    const sectionA =
      a.section?.toString().trim().toUpperCase() || "";

    const sectionB =
      b.section?.toString().trim().toUpperCase() || "";

    return sectionA.localeCompare(sectionB);
  });
};

// ============================================================
// SORT BY ACADEMIC YEAR
//
// Example:
// 2024-2025
// 2025-2026
// 2026-2027
// ============================================================

export const sortByAcademicYear = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return [...items].sort((a, b) => {
    const yearA = Number(
      a.academicYear?.toString().split("-")[0]
    );

    const yearB = Number(
      b.academicYear?.toString().split("-")[0]
    );

    if (isNaN(yearA)) {
      return 1;
    }

    if (isNaN(yearB)) {
      return -1;
    }

    return yearA - yearB;
  });
};

// ============================================================
// SORT BY ROLL NUMBER
//
// Numeric Ascending:
// 1 → 2 → 3 → 10
// ============================================================

export const sortByRollNumber = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return [...items].sort((a, b) => {
    const rollA = Number(a.rollNumber);
    const rollB = Number(b.rollNumber);

    if (isNaN(rollA)) {
      return 1;
    }

    if (isNaN(rollB)) {
      return -1;
    }

    return rollA - rollB;
  });
};

// ============================================================
// COMMON ASCENDING SORT
//
// Supports:
// Numbers  → 1, 2, 3, 10
// Alphabets → A, B, C
// Mixed     → Class 1, Class 2, Class 10
// Case      → Case insensitive
// ============================================================

export const sortAscending = (items, field) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return [...items].sort((a, b) => {
    const valueA =
      a?.[field]?.toString().trim() || "";

    const valueB =
      b?.[field]?.toString().trim() || "";

    return valueA.localeCompare(valueB, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
};

// ============================================================
// SORT STUDENTS
//
// Class → Section → Academic Year → Roll Number
//
// Class order:
// LKG → UKG → 1 → 2 → 3 → ... → A → B → C...
// ============================================================

export const sortStudents = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return [...items].sort((a, b) => {
    // --------------------------------------------------------
    // 1. Class
    // --------------------------------------------------------

    const classA = getClassOrder(a.className);
    const classB = getClassOrder(b.className);

    if (classA !== classB) {
      return classA - classB;
    }

    // --------------------------------------------------------
    // 2. Section
    // --------------------------------------------------------

    const sectionA =
      a.section?.toString().trim().toUpperCase() || "";

    const sectionB =
      b.section?.toString().trim().toUpperCase() || "";

    if (sectionA !== sectionB) {
      return sectionA.localeCompare(sectionB);
    }

    // --------------------------------------------------------
    // 3. Academic Year
    // --------------------------------------------------------

    const yearA = Number(
      a.academicYear?.toString().split("-")[0]
    );

    const yearB = Number(
      b.academicYear?.toString().split("-")[0]
    );

    if (
      !isNaN(yearA) &&
      !isNaN(yearB) &&
      yearA !== yearB
    ) {
      return yearA - yearB;
    }

    // --------------------------------------------------------
    // 4. Roll Number
    // --------------------------------------------------------

    const rollA = Number(a.rollNumber);
    const rollB = Number(b.rollNumber);

    if (!isNaN(rollA) && !isNaN(rollB)) {
      return rollA - rollB;
    }

    return 0;
  });
};

// ============================================================
// COMMON CLASS TEACHER ASSIGNMENT SORTING
//
// Class → Section → Academic Year
//
// Class order:
// LKG → UKG → 1 → 2 → 3 → ... → A → B → C...
// ============================================================

export const sortByClassSectionYear = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return [...items].sort((a, b) => {
    // --------------------------------------------------------
    // 1. Class
    // --------------------------------------------------------

    const classA = getClassOrder(a.className);
    const classB = getClassOrder(b.className);

    if (classA !== classB) {
      return classA - classB;
    }

    // --------------------------------------------------------
    // 2. Section
    // --------------------------------------------------------

    const sectionA =
      a.section?.toString().trim().toUpperCase() || "";

    const sectionB =
      b.section?.toString().trim().toUpperCase() || "";

    if (sectionA !== sectionB) {
      return sectionA.localeCompare(sectionB);
    }

    // --------------------------------------------------------
    // 3. Academic Year
    // --------------------------------------------------------

    const yearA = Number(
      a.academicYear?.toString().split("-")[0]
    );

    const yearB = Number(
      b.academicYear?.toString().split("-")[0]
    );

    if (
      !isNaN(yearA) &&
      !isNaN(yearB) &&
      yearA !== yearB
    ) {
      return yearA - yearB;
    }

    return 0;
  });
};