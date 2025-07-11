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

export const voteOnQuickPoll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { optionIndex, voterName, fingerprint } = req.body;

    const ipAddress =
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      "unknown";

    if (typeof optionIndex !== "number" || optionIndex < 0) {
      const error = new Error("Invalid option selected");
      error.statusCode = 400;
      return next(error);
    }

    if (!voterName || voterName.trim().length === 0) {
      const error = new Error("Voter name is required");
      error.statusCode = 400;
      return next(error);
    }

    if (!fingerprint) {
      const error = new Error("Browser fingerprint is required");
      error.statusCode = 400;
      return next(error);
    }

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

    if (optionIndex >= poll.options.length) {
      const error = new Error("Invalid option selected");
      error.statusCode = 400;
      return next(error);
    }

    const hasVoted = poll.options.some((option) =>
      option.voters.some(
        (voter) =>
          voter.ipAddress === ipAddress && voter.fingerprint === fingerprint
      )
    );

    if (hasVoted) {
      const error = new Error("You have already voted on this poll");
      error.statusCode = 409;
      return next(error);
    }

    const voterData = {
      name: voterName.trim(),
      ipAddress: ipAddress,
      fingerprint: fingerprint,
      votedAt: new Date(),
    };

    poll.options[optionIndex].voters.push(voterData);
    await poll.save();

    return res.status(200).json({
      message: "Vote recorded successfully",
      poll: {
        id: poll._id,
        question: poll.question,
        options: poll.options.map((option) => ({
          text: option.text,
          voterNames: option.voters.map((voter) => voter.name),
          voteCount: option.voters.length,
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
};
