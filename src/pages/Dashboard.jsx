import CommonCard from "../components/CommonCard";
import "../Styles/Dashboard.css";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      <h1>Bluejay Academic Perf Track Dashboard</h1>

      {user && (
        <CommonCard
          className="user-card"
          variant="rounded"
          padding={false}
        >
          <h2>
            Welcome, {user.firstName} {user.lastName}
          </h2>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>User Type:</strong>{" "}
            <span className="user-type">
              {user.userType}
            </span>
          </p>

        </CommonCard>
      )}
    </>
  );
}

export default Dashboard;