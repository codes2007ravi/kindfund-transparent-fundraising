

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.use(cors());
app.use(express.json());

// Test backend
app.get("/", (req, res) => {
  res.json({ message: "Fundraising backend is running!" });
});

// Test database connection
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database"
    );

    res.json({
      status: "Connected to PostgreSQL",
      database: result.rows[0].database,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Database connection failed",
    });
  }
});

// Get all campaigns with total donations
app.get("/api/campaigns", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.*,
        COALESCE(SUM(d.amount), 0) AS amount_raised
      FROM campaigns c
      LEFT JOIN donations d
        ON c.id = d.campaign_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Could not fetch campaigns",
    });
  }
});

// Create a campaign
app.post("/api/campaigns", async (req, res) => {
  try {
    const {
      title,
      description,
      goal_amount,
      category,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      !Number.isFinite(Number(goal_amount)) ||
      Number(goal_amount) <= 0
    ) {
      return res.status(400).json({
        error: "Provide a title, description, and positive goal_amount.",
      });
    }

    const result = await pool.query(
      `INSERT INTO campaigns
       (title, description, goal_amount, category)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        title.trim(),
        description.trim(),
        Number(goal_amount),
        typeof category === "string"
          ? category.trim() || null
          : null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Could not create campaign",
    });
  }
});

// Create a donation
app.post("/api/donations", async (req, res) => {
  try {
    const { campaign_id, donor_name, amount } = req.body;

    // Validate donation details
    if (
      !Number.isInteger(Number(campaign_id)) ||
      Number(campaign_id) <= 0 ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      typeof donor_name !== "string" ||
      !donor_name.trim()
    ) {
      return res.status(400).json({
        error: "Please provide a valid campaign, donor name, and amount.",
      });
    }

    // Check whether the campaign exists
    const campaign = await pool.query(
      "SELECT id FROM campaigns WHERE id = $1",
      [Number(campaign_id)]
    );

    if (campaign.rows.length === 0) {
      return res.status(404).json({
        error: "Campaign not found.",
      });
    }

    // Save the donation
    const result = await pool.query(
      `INSERT INTO donations (campaign_id, donor_name, amount)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        Number(campaign_id),
        donor_name.trim(),
        Number(amount),
      ]
    );

    res.status(201).json({
      message: "Donation recorded successfully!",
      donation: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Could not record donation.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});