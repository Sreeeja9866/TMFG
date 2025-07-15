const { createVolunteer } = require("../models/volunteerModel");

const registerVolunteer = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and Email are required." });
  }

  try {
    const volunteer = await createVolunteer(name, email, message);
    res.status(201).json({ message: "Volunteer registered!", volunteer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = { registerVolunteer };
