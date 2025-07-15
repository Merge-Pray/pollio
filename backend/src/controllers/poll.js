import PollModel from "../models/poll.js";
import UserModel from "../models/user.js";
import crypto from "crypto";

export const createTextPoll = async (req, res, next) => {
  try {
    const { title, question, options, multipleChoice, expirationDate } =
      req.body;

    const userId = req.user._id;

    const formattedOptions = options.map((option) => ({
      text: option.text,
      voters: [],
    }));

    const voteTokens = [];

    const newPoll = new PollModel({
      title,
      question,
      type: "text",
      options: formattedOptions,
      multipleChoice: multipleChoice || false,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      expired: false,
      creatorId: userId,
      voteTokens: voteTokens,
    });

    await newPoll.save();

    await UserModel.findByIdAndUpdate(userId, {
      $push: {
        polls: {
          poll: newPoll._id,
          pollModel: "polls",
        },
      },
    });

    return res.status(201).json({
      message: "Text poll created successfully",
      poll: {
        id: newPoll._id,
        title: newPoll.title,
        question: newPoll.question,
        type: newPoll.type,
        options: newPoll.options,
        multipleChoice: newPoll.multipleChoice,
        expirationDate: newPoll.expirationDate,
        createdAt: newPoll.createdAt,
        tokenCount: voteTokens.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getTextPoll = async (req, res, next) => {
  try {
    const { id } = req.params;

    const poll = await PollModel.findById(id);

    if (!poll) {
      const error = new Error("Poll not found");
      error.statusCode = 404;
      return next(error);
    }

    if (poll.type !== "text") {
      const error = new Error("Invalid poll type");
      error.statusCode = 400;
      return next(error);
    }

    return res.status(200).json({
      poll: {
        id: poll._id,
        title: poll.title,
        question: poll.question,
        type: poll.type,
        options: poll.options,
        multipleChoice: poll.multipleChoice,
        expirationDate: poll.expirationDate,
        expired: poll.expired,
        createdAt: poll.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};
