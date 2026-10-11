
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/campaigns`)
      .then((response) => setCampaigns(response.data))
      .catch(() => setError("Could not load campaigns. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app">
      <nav className="navbar">
        <a className="logo" href="/">KindFund</a>
        <div className="nav-links">
          <a href="#campaigns">Campaigns</a>
          <a href="#about">About</a>
          <button onClick={() => alert("Campaign creation is coming soon!")}>
            Start a Campaign
          </button>
        </div>
      </nav>

      <header className="hero">
        <p className="eyebrow">GIVING WITH TRANSPARENCY</p>
        <h1>Small acts. <span>Big impact.</span></h1>
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
            <p>No campaigns yet. Check back soon!</p>
          )}

          <div className="campaign-grid">
            {campaigns.map((campaign) => {
              const goal = Number(campaign.goal_amount);
              const raised = Number(campaign.amount_raised);
              const progress = goal > 0
                ? Math.min((raised / goal) * 100, 100)
                : 0;

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
                      <strong>₹{raised.toLocaleString("en-IN")}</strong>
                      <span>of ₹{goal.toLocaleString("en-IN")}</span>
                    </div>

                    <button
                      className="donate-button"
                      onClick={() =>
                        alert("Donation processing will be added in a later step.")
                      }
                    >
                      Support this cause
                    </button>
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

      <footer>
        <p>KindFund · Built for transparent giving</p>
      </footer>
    </div>
  );
}

export default App;