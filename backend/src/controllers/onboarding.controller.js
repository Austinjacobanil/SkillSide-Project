import User from "../models/User.js";
import axios from "axios";

export const submitOnboarding = async (req, res) => {
  const {
    fullName, bio, location, profilePic,
    subjects, availability, goals,
    learningStyle, personality
  } = req.body;

  const userId = req.user._id;

  const prompt = `
You are a matchmaking assistant for a study app.

Summarize this student's study style and goals in 3 sentences for matching:

Name: ${fullName}
Bio: ${bio}
Location: ${location}
Subjects: ${subjects.join(", ")}
Availability: ${availability}
Goals: ${goals}
Learning Style: ${learningStyle}
Personality: ${personality}

Write a short summary (2–3 lines) that describes this user as a potential study partner.
`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const summary = response.data.choices[0].message.content;

    const updatedUser = await User.findByIdAndUpdate(userId, {
      fullName,
      bio,
      location,
      profilePic,
      isOnboarded: true,
      matchProfileSummary: summary,
      onboarding: {
        subjects,
        availability,
        goals,
        learningStyle,
        personality
      },
    }, { new: true });

    res.status(200).json({ user: updatedUser });

  } catch (err) {
    console.error("Groq Error:", err.message);
    res.status(500).json({ message: "Failed to generate match summary." });
  }
};
