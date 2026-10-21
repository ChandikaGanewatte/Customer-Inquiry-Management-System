
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Coffee,
  Eye,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import {
  apiRequest,
  createInquiry,
  getCurrentUser,
  getInquiry,
  getInquiries,
  login,
  logout,
  updateInquiryStatus,
} from "./services/api";

import "./App.css";

const STATUSES = ["New", "In Progress", "Resolved"];

const TRANSITIONS = {
  New: ["In Progress"],
  "In Progress": ["New", "Resolved"],
  Resolved: ["In Progress"],
};

const EMPTY_FORM = {
  customer_name: "",
  contact_details: "",
  subject: "",
  description: "",
};

function StatusBadge({ status }) {
  const className = status.toLowerCase().replaceAll(" ", "-");

  return (
    <span className={`status-badge status-${className}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark">
          <Coffee size={30} />
        </div>

        <p className="eyebrow">COFFEE NINJA (PVT) LTD</p>
        <h1>Welcome back</h1>
        <p className="muted">
          Sign in to manage your customer inquiries.
        </p>

        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-stack">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button className="button button-primary button-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="login-footnote">
          <ShieldCheck size={15} />
          Secure staff authentication
        </p>
      </section>
    </main>
  );
}

function InquiryModal({ inquiry, onClose }) {
  if (!inquiry) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">INQUIRY DETAILS</p>
            <h2 id="detail-title">{inquiry.subject}</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span>Inquiry ID</span>
            <strong>#{inquiry.id}</strong>
          </div>
          <div className="detail-item">
            <span>Status</span>
            <StatusBadge status={inquiry.status} />
          </div>
          <div className="detail-item">
            <span>Customer</span>
            <strong>{inquiry.customer_name}</strong>
          </div>
          <div className="detail-item">
            <span>Contact details</span>
            <strong>{inquiry.contact_details}</strong>
          </div>
          <div className="detail-item detail-wide">
            <span>Description</span>
            <p className="description-text">{inquiry.description}</p>
          </div>
          <div className="detail-item">
            <span>Created</span>
            <strong>
              {inquiry.created_at
                ? new Date(inquiry.created_at).toLocaleString()
                : "Not available"}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadInquiries = useCallback(async () => {
    setLoadingList(true);
    setError("");

    try {
      const data = await getInquiries(search, statusFilter);
      setInquiries(data.inquiries || []);
    } catch (err) {
      setError(err.message || "Unable to load inquiries.");

      if (!localStorage.getItem("token")) {
        setUser(null);
      }
    } finally {
      setLoadingList(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      if (!localStorage.getItem("token")) {
        if (active) setAuthChecking(false);
        return;
      }

      try {
        const data = await getCurrentUser();
        if (active) setUser(data.user);
      } catch {
        logout();
        if (active) setUser(null);
      } finally {
        if (active) setAuthChecking(false);
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (user) loadInquiries();
  }, [user, loadInquiries]);

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    setNotice(`Welcome, ${loggedInUser.name}.`);
    setError("");
  }

  function handleLogout() {
    logout();
    setUser(null);
    setInquiries([]);
    setSelectedInquiry(null);
    setNotice("");
    setError("");
  }

  async function handleCreateInquiry(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      await createInquiry(form);
      setForm(EMPTY_FORM);
      setShowCreateForm(false);
      setSearch("");
      setStatusFilter("");
      setNotice("Inquiry created successfully.");
      await loadInquiries();
    } catch (err) {
      setError(err.message || "Unable to create inquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleViewInquiry(id) {
    setError("");

    try {
      const data = await getInquiry(id);
      setSelectedInquiry(data.inquiry);
    } catch (err) {
      setError(err.message || "Unable to retrieve inquiry.");
    }
  }

  async function handleStatusChange(inquiry, nextStatus) {
    if (!nextStatus || nextStatus === inquiry.status) return;

    setUpdatingId(inquiry.id);
    setError("");
    setNotice("");

    try {
      const data = await updateInquiryStatus(
        inquiry.id,
        nextStatus,
        inquiry.status
      );

      setInquiries((current) =>
        current.map((item) =>
          item.id === inquiry.id ? data.inquiry : item
        )
      );

      if (
        selectedInquiry &&
        String(selectedInquiry.id) === String(inquiry.id)
      ) {
        setSelectedInquiry(data.inquiry);
      }

      setNotice(data.message || "Status updated successfully.");
      await loadInquiries();
    } catch (err) {
      setError(err.message || "Unable to update inquiry status.");
      await loadInquiries();
    } finally {
      setUpdatingId(null);
    }
  }

  if (authChecking) {
    return (
      <main className="loading-screen">
        <RefreshCw className="spin" size={28} />
        <p>Checking your session...</p>
      </main>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const newCount = inquiries.filter((item) => item.status === "New").length;
  const progressCount = inquiries.filter(
    (item) => item.status === "In Progress"
  ).length;
  const resolvedCount = inquiries.filter(
    (item) => item.status === "Resolved"
  ).length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark brand-mark-small">
            <Coffee size={23} />
          </div>
          <div>
            <strong>Coffee Ninja</strong>
            <span>Inquiry Portal</span>
          </div>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>
        <div className="nav-item nav-item-active">
          <ClipboardList size={19} />
          <span>Inquiries</span>
        </div>

        <div className="sidebar-bottom">
          <div className="profile-card">
            <div className="avatar">
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="profile-text">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">CUSTOMER SUPPORT</p>
            <h1>Inquiry Dashboard</h1>
            <p className="muted">
              Manage, track, and resolve customer inquiries.
            </p>
          </div>

          <button
            className="button button-primary"
            onClick={() => {
              setShowCreateForm((current) => !current);
              setError("");
              setNotice("");
            }}
          >
            {showCreateForm ? <X size={18} /> : <Plus size={18} />}
            {showCreateForm ? "Close form" : "New inquiry"}
          </button>
        </header>

        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button
              className="alert-close"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {notice && (
          <div className="alert alert-success" role="status">
            <CheckCircle2 size={18} />
            <span>{notice}</span>
            <button
              className="alert-close"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon stat-icon-purple">
              <ClipboardList size={21} />
            </div>
            <p>Total matching inquiries</p>
            <strong>{inquiries.length}</strong>
            <span>Based on current filters</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon stat-icon-blue">
              <Activity size={21} />
            </div>
            <p>New</p>
            <strong>{newCount}</strong>
            <span>Awaiting progress</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon stat-icon-orange">
              <Users size={21} />
            </div>
            <p>In progress</p>
            <strong>{progressCount}</strong>
            <span>Being handled</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon stat-icon-green">
              <CheckCircle2 size={21} />
            </div>
            <p>Resolved</p>
            <strong>{resolvedCount}</strong>
            <span>Marked as resolved</span>
          </article>
        </section>

        {showCreateForm && (
          <section className="panel create-panel">
            <div className="panel-heading">
              <div>
                <h2>Create inquiry</h2>
                <p className="muted">
                  Enter the customer information below.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateInquiry}>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="customer_name">Customer name</label>
                  <input
                    id="customer_name"
                    minLength={2}
                    maxLength={100}
                    value={form.customer_name}
                    onChange={(event) =>
                      setForm({ ...form, customer_name: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="contact_details">Contact details</label>
                  <input
                    id="contact_details"
                    minLength={3}
                    maxLength={150}
                    placeholder="Email or phone number"
                    value={form.contact_details}
                    onChange={(event) =>
                      setForm({ ...form, contact_details: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="field field-full">
                  <label htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    minLength={3}
                    maxLength={150}
                    value={form.subject}
                    onChange={(event) =>
                      setForm({ ...form, subject: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="field field-full">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    minLength={5}
                    maxLength={2000}
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    required
                  />
                  <span className="field-hint">
                    {form.description.length}/2000 characters
                  </span>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setForm(EMPTY_FORM);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create inquiry"}
                  {!submitting && <Plus size={17} />}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="panel inquiry-panel">
          <div className="panel-heading inquiry-heading">
            <div>
              <h2>Customer inquiries</h2>
              <p className="muted">
                Search and manage your inquiry records.
              </p>
            </div>
            <button
              className="button button-secondary button-refresh"
              onClick={loadInquiries}
              disabled={loadingList}
            >
              <RefreshCw size={16} className={loadingList ? "spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="filters">
            <div className="search-box">
              <Search size={18} />
              <input
                aria-label="Search inquiries"
                placeholder="Search customer, contact, or subject..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  className="search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer / subject</th>
                  <th>Contact details</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Update status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>

              <tbody>
                {loadingList && inquiries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-message">
                      <RefreshCw size={20} className="spin" />
                      Loading inquiries...
                    </td>
                  </tr>
                ) : inquiries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-message">
                      <ClipboardList size={26} />
                      <strong>No inquiries found</strong>
                      <span>
                        Try changing the search or status filter, or create a
                        new inquiry.
                      </span>
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inquiry) => {
                    const nextStatuses = TRANSITIONS[inquiry.status] || [];

                    return (
                      <tr key={inquiry.id}>
                        <td>
                          <div className="customer-cell">
                            <strong>{inquiry.customer_name}</strong>
                            <span>{inquiry.subject}</span>
                            <small>Inquiry #{inquiry.id}</small>
                          </div>
                        </td>
                        <td className="contact-cell">
                          {inquiry.contact_details}
                        </td>
                        <td>
                          <StatusBadge status={inquiry.status} />
                        </td>
                        <td className="date-cell">
                          {inquiry.created_at
                            ? new Date(inquiry.created_at).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>
                          <select
                            className="status-select"
                            aria-label={`Update status for inquiry ${inquiry.id}`}
                            value=""
                            disabled={updatingId === inquiry.id}
                            onChange={(event) =>
                              handleStatusChange(inquiry, event.target.value)
                            }
                          >
                            <option value="">
                              {updatingId === inquiry.id
                                ? "Updating..."
                                : "Change to..."}
                            </option>
                            {nextStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            className="icon-button view-button"
                            aria-label={`View inquiry ${inquiry.id}`}
                            title="View inquiry details"
                            onClick={() => handleViewInquiry(inquiry.id)}
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              Showing {inquiries.length} inquiry
              {inquiries.length === 1 ? "" : "ies"}
            </span>
            <span>
              <ShieldCheck size={15} />
              Protected staff workspace
            </span>
          </div>
        </section>

        <footer className="app-footer">
          Coffee Ninja Inquiry Portal <span>•</span> Customer support workspace
        </footer>
      </main>

      <InquiryModal
        inquiry={selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
      />
    </div>
  );
}

export default App;
