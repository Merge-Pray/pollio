import QuickPollModel from "../models/quickPoll.js";

export const createQuickPoll = async (req, res, next) => {
  try {
    const { question, options, isPublic } = req.body;

    const formattedOptions = options.map((optionText) => ({
      text: optionText,
      voters: [],
    }));

    const newQuickPoll = new QuickPollModel({
      question,
      type: "text",
      options: formattedOptions,
      expired: false,
      isPublic: isPublic || false,
    });

    await newQuickPoll.save();

    return res.status(201).json({
      message: "Quick poll created successfully",
      poll: {
        id: newQuickPoll._id,
        question: newQuickPoll.question,
        options: newQuickPoll.options,
        isPublic: newQuickPoll.isPublic,
        createdAt: newQuickPoll.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getQuickPoll = async (req, res, next) => {
  try {
    const { id } = req.params;

    const poll = await QuickPollModel.findById(id);

    if (!poll) {
      const error = new Error("Poll not found");
      error.statusCode = 404;
      return next(error);
    }

    if (poll.expired) {
      const error = new Error("This poll has expired");
      error.statusCode = 410;
      return next(error);
    }

    return res.status(200).json({
      poll: {
        id: poll._id,
        question: poll.question,
        options: poll.options.map((option) => ({
          text: option.text,
          voterNames: option.voters.map((voter) => voter.name),
          voteCount: option.voters.length,
        })),
        isPublic: poll.isPublic,
        createdAt: poll.createdAt,
        type: poll.type,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const voteOnQuickPoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { optionIndex, voterName, fingerprint } = req.body;

    const poll = await QuickPollModel.findById(id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const clientIP = req.ip || req.connection.remoteAddress || "unknown";

    // Für die spezielle 404-Poll: Erlaube mehrfaches Voting
    const is404Poll = id === "6876bc27e378a4d6cf2f38ba";

    if (!is404Poll) {
      // Normale Duplicate-Checks für andere Polls
      const isDuplicateVote = poll.options.some((option) =>
        option.voters.some(
          (voter) =>
            voter.ipAddress === clientIP && voter.fingerprint === fingerprint
        )
      );

      if (isDuplicateVote) {
        return res
          .status(400)
          .json({ message: "You have already voted on this poll" });
      }
    }

    // Für 404-Poll: Verwende zufälligen Fingerprint wenn keiner gegeben
    const finalFingerprint =
      is404Poll && !fingerprint
        ? Math.random().toString(36).substring(2, 15)
        : fingerprint;

    const newVoter = {
      name: voterName,
      ipAddress: clientIP,
      fingerprint: finalFingerprint,
      votedAt: new Date(),
    };

    poll.options[optionIndex].voters.push(newVoter);
    await poll.save();

    res.status(200).json({ message: "Vote recorded successfully" });
  } catch (error) {
    console.error("Error voting on quick poll:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPublicQuick = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPolls = await QuickPollModel.countDocuments({ isPublic: true });
    const totalPages = Math.ceil(totalPolls / limit);

    const publicPolls = await QuickPollModel.find(
      { isPublic: true },
      { question: 1, _id: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      message: "Public quick polls retrieved successfully",
      polls: publicPolls.map((poll) => ({
        id: poll._id,
        question: poll.question,
        createdAt: poll.createdAt,
      })),
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalPolls: totalPolls,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};
