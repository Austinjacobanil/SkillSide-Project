import User from "../models/User.js";
import axios from "axios";

export const generateMatches = async (req, res) => {
  const currentUserId = req.query.userId;
  const currentUser = await User.findById(currentUserId);

  if (!currentUser || !currentUser.matchProfileSummary) {
    return res.status(400).json({ message: "Onboarding incomplete" });
  }

  const excludeIds = [
    ...currentUser.friends.map(friend => friend._id.toString()),
    currentUserId
  ];

  const otherUsers = await User.find({
    _id: { $nin: excludeIds },
    matchProfileSummary: { $exists: true, $ne: "" },
  });

  const prompt = `
You are a study partner matchmaker.

Given the following user and potential partners, rank the best matches by compatibility.

Target User:
"${currentUser.matchProfileSummary}"

Other users:
${otherUsers.map((u, i) => `${i + 1}. ${u.matchProfileSummary}`).join("\n")}

Rank the top 5 most compatible users by number only.
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

    const topIndices = response.data.choices[0].message.content.match(/\d+/g)?.map(Number);

    if (!topIndices || topIndices.length === 0) {
      console.warn("Groq returned no valid match indices");
      return res.status(200).json({ matches: [] });
    }

    const seen = new Set();

    const matchedUsers = topIndices
      .map((i, idx) => {
        const user = otherUsers[i - 1];
        if (!user || seen.has(user._id.toString())) return null;
        seen.add(user._id.toString());
        return { ...user.toObject(), matchScore: 1 - idx * 0.2 };
      })
      .filter(Boolean);


    res.status(200).json({ matches: matchedUsers });

  } catch (err) {
    console.error("Groq Error:", err.message);
    res.status(500).json({ message: "Failed to generate matches." });
  }
};

