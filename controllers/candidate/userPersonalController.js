export const test = async (req, res) => {
  try {
    res.status(200).json({ message: "Test route is working!" });
  } catch (error) {
    console.error("Error in test route:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
