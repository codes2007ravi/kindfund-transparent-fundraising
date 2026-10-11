
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function Navbar() {
  return (
    <nav className="navbar">
      <Link className="logo" to="/">
        KindFund
      </Link>

      <div className="nav-links">
        <Link to="/#campaigns">Campaigns</Link>
        <Link to="/#about">About</Link>
        <Link className="nav-button" to="/create-campaign">
          Start a Campaign
        </Link>
      </div>
    </nav>
  );
}

function HomePage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Donation form state
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [donorName, setDonorName] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [donationError, setDonationError] = useState("");
  const [donationSubmitting, setDonationSubmitting] = useState(false);

  // Fetch campaigns from the backend
  useEffect(() => {
    axios
      .get(`${API_URL}/campaigns`)
      .then((response) => setCampaigns(response.data))
      .catch(() =>
        setError("Could not load campaigns. Is the backend running?")
      )
      .finally(() => setLoading(false));
  }, []);

  // Submit a test donation
  async function handleDonationSubmit(event, campaignId) {
    event.preventDefault();
    setDonationError("");

    if (
      !donorName.trim() ||
      !Number.isFinite(Number(donationAmount)) ||
      Number(donationAmount) <= 0
    ) {
      setDonationError("Enter your name and a valid donation amount.");
      return;
    }

    setDonationSubmitting(true);

    try {
      await axios.post(`${API_URL}/donations`, {
        campaign_id: Number(campaignId),
        donor_name: donorName.trim(),
        amount: Number(donationAmount),
      });

      alert("Test donation recorded successfully!");

      setDonorName("");
      setDonationAmount("");
      setSelectedCampaignId(null);
      setDonationError("");
    } catch (err) {
      setDonationError(
        err.response?.data?.error ||
          "Could not record donation. Check your backend."
      );
    } finally {
      setDonationSubmitting(false);
    }
  }

  return (
    <>
      <header className="hero">
        <p className="eyebrow">GIVING WITH TRANSPARENCY</p>

        <h1>
          Small acts. <span>Big impact.</span>
        </h1>

        <p>
          Discover meaningful causes, support communities, and follow
          the progress your generosity helps create.
        </p>

        <a className="primary-button" href="#campaigns">
          Explore Campaigns
        </a>
      </header>

      <main>
        <section id="campaigns" className="campaign-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MAKE A DIFFERENCE</p>
              <h2>Campaigns that matter</h2>
            </div>

            <span>{campaigns.length} campaigns</span>
          </div>

          {loading && <p>Loading campaigns...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && campaigns.length === 0 && (
            <p>No campaigns yet. Be the first to create one!</p>
          )}

          <div className="campaign-grid">
            {campaigns.map((campaign) => {
              const goal = Number(campaign.goal_amount);
              const raised = Number(campaign.amount_raised || 0);

              const progress =
                goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

              return (
                <article className="campaign-card" key={campaign.id}>
                  <div className="campaign-image">
                    {campaign.category || "Community"}
                  </div>

                  <div className="campaign-content">
                    <h3>{campaign.title}</h3>
                    <p>{campaign.description}</p>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="funding-info">
                      <strong>
                        ₹{raised.toLocaleString("en-IN")}
                      </strong>

                      <span>
                        of ₹{goal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {selectedCampaignId === campaign.id ? (
                      <form
                        onSubmit={(event) =>
                          handleDonationSubmit(event, campaign.id)
                        }
                      >
                        <label htmlFor={`donor-${campaign.id}`}>
                          Donor name
                        </label>

                        <input
                          id={`donor-${campaign.id}`}
                          type="text"
                          placeholder="Enter your name"
                          value={donorName}
                          onChange={(event) =>
                            setDonorName(event.target.value)
                          }
                          maxLength={100}
                          required
                        />

                        <label htmlFor={`amount-${campaign.id}`}>
                          Donation amount (₹)
                        </label>

                        <input
                          id={`amount-${campaign.id}`}
                          type="number"
                          placeholder="Enter amount"
                          min="0.01"
                          step="0.01"
                          value={donationAmount}
                          onChange={(event) =>
                            setDonationAmount(event.target.value)
                          }
                          required
                        />

                        {donationError && (
                          <p className="error">{donationError}</p>
                        )}

                        <button
                          className="donate-button"
                          type="submit"
                          disabled={donationSubmitting}
                        >
                          {donationSubmitting
                            ? "Submitting..."
                            : "Submit Donation"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCampaignId(null);
                            setDonorName("");
                            setDonationAmount("");
                            setDonationError("");
                          }}
                          disabled={donationSubmitting}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <button
                        className="donate-button"
                        onClick={() => {
                          setSelectedCampaignId(campaign.id);
                          setDonorName("");
                          setDonationAmount("");
                          setDonationError("");
                        }}
                      >
                        Support this cause
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="about" className="about-section">
          <p className="eyebrow">OUR PROMISE</p>
          <h2>Every contribution deserves clarity.</h2>

          <p>
            Our goal is to make campaign progress and fundraising
            information easy to understand.
          </p>
        </section>
      </main>
    </>
  );
}

function CreateCampaign() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    goal_amount: "",
    category: "Community",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !Number.isFinite(Number(form.goal_amount)) ||
      Number(form.goal_amount) <= 0
    ) {
      setError("Please enter valid campaign details and a positive goal.");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(`${API_URL}/campaigns`, {
        title: form.title.trim(),
        description: form.description.trim(),
        goal_amount: Number(form.goal_amount),
        category: form.category,
      });

      alert("Campaign created successfully!");
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Could not create campaign. Check that your backend is running."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="create-page">
      <Link className="back-link" to="/">
        ← Back to Home
      </Link>

      <div className="form-card">
        <p className="eyebrow">MAKE A DIFFERENCE</p>
        <h1>Create a Campaign</h1>

        <p className="form-intro">
          Explain your cause and set a fundraising goal for your community.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Campaign title</label>

          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g. Clean Water for Rural Communities"
            value={form.title}
            onChange={handleChange}
            maxLength={200}
            required
          />

          <label htmlFor="description">Campaign description</label>

          <textarea
            id="description"
            name="description"
            placeholder="Explain why this cause matters and how the funds will be used."
            value={form.description}
            onChange={handleChange}
            rows={5}
            required
          />

          <label htmlFor="goal_amount">Fundraising goal (₹)</label>

          <input
            id="goal_amount"
            name="goal_amount"
            type="number"
            placeholder="e.g. 50000"
            min="0.01"
            step="0.01"
            value={form.goal_amount}
            onChange={handleChange}
            required
          />

          <label htmlFor="category">Campaign category</label>

          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="Community">Community</option>
            <option value="Education">Education</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Environment">Environment</option>
            <option value="Animal Welfare">Animal Welfare</option>
            <option value="Emergency Relief">Emergency Relief</option>
            <option value="Other">Other</option>
          </select>

          {error && <p className="error">{error}</p>}

          <button
            className="submit-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Creating campaign..." : "Create Campaign"}
          </button>
        </form>

        <p className="form-note">
          This demo does not verify campaign ownership or collect payments.
          Add authentication and campaign verification before public launch.
        </p>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-campaign" element={<CreateCampaign />} />

        <Route
          path="*"
          element={
            <main className="create-page">
              <h1>Page not found</h1>
              <Link to="/">Return home</Link>
            </main>
          }
        />
      </Routes>

      <footer>
        <p>KindFund · Built for transparent giving</p>
      </footer>
    </BrowserRouter>
  );
}

export default App;