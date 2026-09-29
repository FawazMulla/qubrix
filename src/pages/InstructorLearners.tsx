import { Search, SlidersHorizontal, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
  Select,
} from "../components/ui";
import {
  daysSince,
  getInstructorLearners,
  getLearnerSummary,
} from "../services/mockInstructorAnalytics";
import { InstructorNav } from "./Instructor";
import "./Instructor.css";

export function InstructorLearners() {
  const [q, setQ] = useState("");
  const [p, setP] = useState("all");
  const [a, setA] = useState("all");
  const [s, setS] = useState("all");
  const ls = getInstructorLearners();

  const f = useMemo(
    () =>
      ls
        .map(getLearnerSummary)
        .filter((learner) => {
          const x = q.toLowerCase();
          const d = daysSince(learner.lastActive);

          const matchesSearch =
            !x ||
            learner.name.toLowerCase().includes(x) ||
            learner.id.includes(x);

          const matchesProgress =
            p === "all" ||
            (p === "early"
              ? learner.overallProgress <= 40
              : p === "middle"
                ? learner.overallProgress > 40 && learner.overallProgress < 76
                : learner.overallProgress >= 76);

          const matchesActivity =
            a === "all" || (a === "recent" ? d <= 7 : d > 7);

          const matchesAssessment =
            s === "all" ||
            (s === "review"
              ? learner.assessmentAverage !== null &&
                learner.assessmentAverage < 70
              : s === "completed"
                ? learner.assessmentAverage !== null
                : learner.assessmentAverage === null);

          return (
            matchesSearch &&
            matchesProgress &&
            matchesActivity &&
            matchesAssessment
          );
        }),
    [q, p, a, s, ls],
  );

  return (
    <div className="instructor-page">
      <PageHeader
        eyebrow="Instructor workspace"
        title="Learners"
        description="Search and review individual learner progress."
      />
      <InstructorNav active="learners" />

      <Card className="learner-toolbar">
        <label className="search-field">
          <Search size={17} />
          <span className="sr-only">Search learners</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or ID"
          />
        </label>

        <Select
          aria-label="Progress filter"
          value={p}
          onChange={(e) => setP(e.target.value)}
        >
          <option value="all">All progress</option>
          <option value="early">0–40%</option>
          <option value="middle">41–75%</option>
          <option value="complete">76–100%</option>
        </Select>

        <Select
          aria-label="Activity filter"
          value={a}
          onChange={(e) => setA(e.target.value)}
        >
          <option value="all">All activity</option>
          <option value="recent">Active in 7 days</option>
          <option value="inactive">No recent activity</option>
        </Select>

        <Select
          aria-label="Assessment filter"
          value={s}
          onChange={(e) => setS(e.target.value)}
        >
          <option value="all">All assessment</option>
          <option value="completed">Submitted</option>
          <option value="review">Review recommended</option>
          <option value="pending">No assessment</option>
        </Select>
      </Card>

      <div className="learner-result-count">
        <span>
          <SlidersHorizontal size={15} /> {f.length} learners
        </span>
      </div>

      {f.length ? (
        <Card className="learner-table-card">
          <div className="learner-table-wrap">
            <table className="learner-table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Progress</th>
                  <th>Current module</th>
                  <th>Assessment avg.</th>
                  <th>Last active</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {f.map((learner) => (
                  <tr key={learner.id}>
                    <td>
                      <Link
                        className="learner-cell"
                        to={"/instructor/learners/" + learner.id}
                      >
                        <Avatar
                          initials={learner.initials}
                          name={learner.name}
                          size="sm"
                        />
                        <span>
                          <strong>{learner.name}</strong>
                          <small>{learner.id}</small>
                        </span>
                      </Link>
                    </td>
                    <td>
                      <div className="table-progress">
                        <ProgressBar
                          value={learner.overallProgress}
                          showValue={false}
                        />
                        <strong>{learner.overallProgress}%</strong>
                      </div>
                    </td>
                    <td>{learner.currentModule}</td>
                    <td>
                      {learner.assessmentAverage === null
                        ? "—"
                        : learner.assessmentAverage + "%"}
                    </td>
                    <td>
                      {new Date(learner.lastActive).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </td>
                    <td>
                      <Badge
                        tone={
                          learner.overallProgress === 100
                            ? "success"
                            : daysSince(learner.lastActive) > 7
                              ? "neutral"
                              : learner.assessmentAverage !== null &&
                                  learner.assessmentAverage < 70
                                ? "danger"
                                : "purple"
                        }
                      >
                        {learner.overallProgress === 100
                          ? "Complete"
                          : daysSince(learner.lastActive) > 7
                            ? "Inactive"
                            : "Active"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="learner-mobile-list">
            {f.map((learner) => (
              <Link
                className="learner-mobile-card"
                key={learner.id}
                to={"/instructor/learners/" + learner.id}
              >
                <div className="learner-mobile-top">
                  <Avatar initials={learner.initials} name={learner.name} />
                  <div>
                    <strong>{learner.name}</strong>
                    <small>{learner.currentModule}</small>
                  </div>
                  <UserRound size={17} />
                </div>
                <ProgressBar
                  value={learner.overallProgress}
                  label="Overall progress"
                />
                <div className="learner-mobile-meta">
                  <span>
                    Assessment{" "}
                    <strong>
                      {learner.assessmentAverage === null
                        ? "—"
                        : learner.assessmentAverage + "%"}
                    </strong>
                  </span>
                  <span>
                    Last active{" "}
                    <strong>
                      {new Date(learner.lastActive).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </strong>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState
          title="No learners found"
          description="Try another search or remove a filter."
        />
      )}
    </div>
  );
}
