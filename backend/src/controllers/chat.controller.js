import { generateStreamToken, upsertStreamUser } from "../lib/stream.js";


export async function getStreamToken(req, res) {
    try {
        const token = generateStreamToken(req.user.id);

        res.status(200).json({ token });
    } catch (error) {
        console.error("Error in getStreamToken controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const upsertStreamUserHandler = async (req, res) => {
  try {
    const { id, name, image } = req.body;

    if (!id || !name) {
      return res.status(400).json({ message: "Missing user info" });
    }

    await upsertStreamUser({ id, name, image });
    res.status(200).json({ message: "Stream user upserted" });
  } catch (error) {
    console.error("Error in upsertStreamUserHandler:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
