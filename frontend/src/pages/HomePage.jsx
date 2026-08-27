import React, { useState } from "react";
import Nav from "../components/Nav";
import CheckInPage from "./CheckInPage";
import WellbeingPage from "./WellbeingPage";
import AlertsPage from "./AlertsPage";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  const isOfficer = user?.role === "welfare_officer" || user?.role === "admin";
  const [view, setView] = useState(isOfficer ? "alerts" : "checkin");

  return (
    <>
      <Nav view={view} setView={setView} roleView={isOfficer ? "officer" : "soldier"} />
      {isOfficer ? (
        <AlertsPage />
      ) : view === "checkin" ? (
        <CheckInPage />
      ) : (
        <WellbeingPage />
      )}
    </>
  );
}
