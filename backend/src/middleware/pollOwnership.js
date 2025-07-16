import PollModel from "../models/poll.js";

export const verifyPollOwnership = async (req, res, next) => {
  try {
    const pollId = req.params.id;
    const userId = req.user._id;

    const poll = await PollModel.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Access denied. You can only modify polls you created.",
      });
    }

    req.poll = poll;
    next();
  } catch (error) {
    console.error("Poll ownership verification error:", error);
    return res
      .status(500)
      .json({ message: "Server error during authorization" });
  }
};
