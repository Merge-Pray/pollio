import PollModel from "../models/poll.js";
import UserModel from "../models/user.js";
import { v4 as uuidv4 } from "uuid";

export const createTextPoll = async (req, res, next) => {
  try {
    const {
      title,
      question,
      options,
      multipleChoice,
      expirationDate,
      isAnonymous,
    } = req.body;

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
      isAnonymous: isAnonymous || false,
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
        isAnonymous: newPoll.isAnonymous,
        expirationDate: newPoll.expirationDate,
        createdAt: newPoll.createdAt,
        tokenCount: voteTokens.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getPoll = async (req, res, next) => {
  try {
    const { id } = req.params;

    const poll = await PollModel.findById(id);

    if (!poll) {
      const error = new Error("Poll not found");
      error.statusCode = 404;
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
        isAnonymous: poll.isAnonymous,
        expirationDate: poll.expirationDate,
        expired: poll.expired,
        createdAt: poll.createdAt,
        creatorId: poll.creatorId,
        voteTokens: poll.voteTokens,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createImagePoll = async (req, res, next) => {
  try {
    const {
      title,
      question,
      options,
      multipleChoice,
      expirationDate,
      isAnonymous,
    } = req.body;

    const userId = req.user._id;

    if (!options || options.length < 2) {
      const error = new Error("At least 2 image options are required");
      error.statusCode = 400;
      return next(error);
    }

    if (options.length > 10) {
      const error = new Error("Maximum 10 image options allowed");
      error.statusCode = 400;
      return next(error);
    }

    const formattedOptions = options.map((option) => ({
      imageUrl: option.imageUrl,
      text: option.text || "",
      voters: [],
    }));

    const voteTokens = [];

    const newPoll = new PollModel({
      title,
      question,
      type: "image",
      options: formattedOptions,
      multipleChoice: multipleChoice || false,
      isAnonymous: isAnonymous || false,
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
      message: "Image poll created successfully",
      poll: {
        id: newPoll._id,
        title: newPoll.title,
        question: newPoll.question,
        type: newPoll.type,
        options: newPoll.options,
        multipleChoice: newPoll.multipleChoice,
        isAnonymous: newPoll.isAnonymous,
        expirationDate: newPoll.expirationDate,
        createdAt: newPoll.createdAt,
        tokenCount: voteTokens.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createDatePoll = async (req, res, next) => {
  try {
    const {
      title,
      question,
      options,
      multipleChoice,
      expirationDate,
      isAnonymous,
    } = req.body;

    const userId = req.user._id;

    if (!options || options.length < 2) {
      const error = new Error("At least 2 date options are required");
      error.statusCode = 400;
      return next(error);
    }

    if (options.length > 10) {
      const error = new Error("Maximum 10 date options allowed");
      error.statusCode = 400;
      return next(error);
    }

    const formattedOptions = options.map((option) => ({
      dateTime: new Date(option.dateTime),
      text: option.text || "",
      yes: [],
      no: [],
      maybe: [],
      voters: [],
    }));

    const voteTokens = [];

    const newPoll = new PollModel({
      title,
      question,
      type: "date",
      options: formattedOptions,
      multipleChoice: multipleChoice || false,
      isAnonymous: isAnonymous || false,
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
      message: "Date poll created successfully",
      poll: {
        id: newPoll._id,
        title: newPoll.title,
        question: newPoll.question,
        type: newPoll.type,
        options: newPoll.options,
        multipleChoice: newPoll.multipleChoice,
        isAnonymous: newPoll.isAnonymous,
        expirationDate: newPoll.expirationDate,
        createdAt: newPoll.createdAt,
        creatorId: newPoll.creatorId,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const generateVoteToken = async (req, res) => {
  const pollId = req.params.id;

  try {
    const token = uuidv4();

    const poll = await PollModel.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    poll.voteTokens.push({
      token,
      used: false,
      createdAt: new Date(),
    });

    await poll.save();

    res.status(200).json({ token });
  } catch (error) {
    console.error("Token creation failed:", error);
    res.status(500).json({ message: "Failed to generate token" });
  }
};

export const getPollByToken = async (req, res) => {
  const { token } = req.params;

  try {
    const poll = await PollModel.findOne({
      "voteTokens.token": token,
    });

    if (!poll) {
      return res.status(404).json({ message: "Invalid vote token" });
    }

    const tokenEntry = poll.voteTokens.find((t) => t.token === token);

    if (tokenEntry.used) {
      return res.status(400).json({
        message: "Vote token already used",
        pollId: poll._id,
      });
    }

    const isExpiredByDate =
      poll.expirationDate && new Date() > new Date(poll.expirationDate);
    const isManuallyExpired = poll.expired === true;

    if (isExpiredByDate || isManuallyExpired) {
      if (isExpiredByDate && !poll.expired) {
        poll.expired = true;
        await poll.save();
      }

      return res.status(400).json({
        message: "Poll has expired",
        pollId: poll._id,
      });
    }

    return res.status(200).json({
      poll: {
        id: poll._id,
        title: poll.title,
        question: poll.question,
        type: poll.type,
        options: poll.options,
        multipleChoice: poll.multipleChoice,
        isAnonymous: poll.isAnonymous,
        expirationDate: poll.expirationDate,
        expired: poll.expired,
        createdAt: poll.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching poll by token:", error);
    res.status(500).json({ message: "Failed to fetch poll" });
  }
};

export const voteWithToken = async (req, res) => {
  const { token } = req.params;
  const { voterName, optionIndexes, dateAvailability } = req.body;

  try {
    const poll = await PollModel.findOne({
      "voteTokens.token": token,
    });

    if (!poll) {
      return res.status(404).json({ message: "Invalid vote token" });
    }

    const tokenEntry = poll.voteTokens.find((t) => t.token === token);

    if (!tokenEntry || tokenEntry.used) {
      return res.status(400).json({
        message: "Token invalid or already used",
        pollId: poll._id,
      });
    }

    const isExpiredByDate =
      poll.expirationDate && new Date() > new Date(poll.expirationDate);
    const isManuallyExpired = poll.expired === true;

    if (isExpiredByDate || isManuallyExpired) {
      if (isExpiredByDate && !poll.expired) {
        poll.expired = true;
        await poll.save();
      }

      return res.status(400).json({
        message: "Poll has expired",
        pollId: poll._id,
      });
    }

    // Handle date polls with availability voting (yes/no/maybe)
    if (poll.type === "date" && poll.multipleChoice && dateAvailability) {
      // Validate that all options have availability responses
      const requiredResponses = poll.options.length;
      const providedResponses = Object.keys(dateAvailability).length;

      if (providedResponses !== requiredResponses) {
        return res.status(400).json({
          message: "Please provide availability for all date options",
        });
      }

      // Validate availability values and update poll options
      for (const [optionIndex, availability] of Object.entries(
        dateAvailability
      )) {
        const index = parseInt(optionIndex);

        if (index < 0 || index >= poll.options.length) {
          return res.status(400).json({ message: "Invalid option index" });
        }

        if (!["yes", "no", "maybe"].includes(availability)) {
          return res.status(400).json({
            message: "Availability must be 'yes', 'no', or 'maybe'",
          });
        }

        // Add voter to the appropriate availability array
        poll.options[index][availability].push(voterName);

        // Also add to general voters array for tracking
        poll.options[index].voters.push(voterName);
      }
    } else {
      // Handle regular voting (text, image, or single-choice date polls)
      if (!Array.isArray(optionIndexes) || optionIndexes.length === 0) {
        return res.status(400).json({ message: "No options selected" });
      }

      if (!poll.multipleChoice && optionIndexes.length > 1) {
        return res
          .status(400)
          .json({ message: "Multiple choices not allowed for this poll" });
      }

      for (const index of optionIndexes) {
        if (index < 0 || index >= poll.options.length) {
          return res.status(400).json({ message: "Invalid option selected" });
        }
      }

      for (const index of optionIndexes) {
        poll.options[index].voters.push(voterName);
      }
    }

    tokenEntry.used = true;
    tokenEntry.usedAt = new Date();
    tokenEntry.voterName = voterName;

    await poll.save();

    res.status(200).json({
      message: "Vote submitted successfully",
      pollId: poll._id,
    });
  } catch (error) {
    console.error("Error voting with token:", error);
    res.status(500).json({ message: "Voting failed" });
  }
};

export const editCustomPoll = async (req, res) => {
  const {
    title,
    question,
    options,
    multipleChoice,
    expirationDate,
    expired,
    isAnonymous,
  } = req.body;

  try {
    const poll = req.poll;

    if (title !== undefined) poll.title = title;
    if (question !== undefined) poll.question = question;

    // Handle options based on poll type
    if (options !== undefined) {
      if (poll.type === "date") {
        // Validate date options
        if (options.length < 2) {
          return res.status(400).json({
            message: "At least 2 date options are required",
          });
        }

        if (options.length > 10) {
          return res.status(400).json({
            message: "Maximum 10 date options allowed",
          });
        }

        // Format date options properly
        const formattedOptions = options.map((option) => ({
          dateTime: option.dateTime ? new Date(option.dateTime) : null,
          text: option.text || "",
          yes: option.yes || [],
          no: option.no || [],
          maybe: option.maybe || [],
          voters: option.voters || [],
        }));

        poll.options = formattedOptions;
      } else if (poll.type === "text") {
        // Validate text options
        const validOptions = options.filter(
          (option) => option.text && option.text.trim()
        );

        if (validOptions.length < 2) {
          return res.status(400).json({
            message: "At least 2 text options are required",
          });
        }

        const formattedOptions = validOptions.map((option) => ({
          text: option.text.trim(),
          voters: option.voters || [],
        }));

        poll.options = formattedOptions;
      } else if (poll.type === "image") {
        // Validate image options
        const validOptions = options.filter((option) => option.imageUrl);

        if (validOptions.length < 2) {
          return res.status(400).json({
            message: "At least 2 image options are required",
          });
        }

        if (validOptions.length > 10) {
          return res.status(400).json({
            message: "Maximum 10 image options allowed",
          });
        }

        const formattedOptions = validOptions.map((option) => ({
          imageUrl: option.imageUrl,
          text: option.text || "",
          voters: option.voters || [],
        }));

        poll.options = formattedOptions;
      } else {
        // Fallback for unknown types
        poll.options = options;
      }
    }

    if (multipleChoice !== undefined) poll.multipleChoice = multipleChoice;
    if (isAnonymous !== undefined) poll.isAnonymous = isAnonymous;
    if (expirationDate !== undefined)
      poll.expirationDate = expirationDate ? new Date(expirationDate) : null;
    if (expired !== undefined) poll.expired = expired;

    await poll.save();

    res.status(200).json({
      message: "Poll updated successfully",
      poll: {
        id: poll._id,
        title: poll.title,
        question: poll.question,
        type: poll.type,
        options: poll.options,
        multipleChoice: poll.multipleChoice,
        isAnonymous: poll.isAnonymous,
        expirationDate: poll.expirationDate,
        expired: poll.expired,
        createdAt: poll.createdAt,
      },
    });
  } catch (error) {
    console.error("Error updating poll:", error);
    res.status(500).json({ message: "Failed to update poll" });
  }
};

export const resetPoll = async (req, res) => {
  try {
    const poll = req.poll;

    poll.options.forEach((option) => {
      option.voters = [];
      option.yes = [];
      option.no = [];
      option.maybe = [];
    });

    poll.voteTokens.forEach((tokenEntry) => {
      tokenEntry.used = false;
      tokenEntry.usedAt = undefined;
      tokenEntry.voterName = undefined;
    });

    await poll.save();

    res.status(200).json({
      message: "Poll reset successfully",
      poll: {
        id: poll._id,
        title: poll.title,
        question: poll.question,
        type: poll.type,
        options: poll.options,
        multipleChoice: poll.multipleChoice,
        isAnonymous: poll.isAnonymous,
        expirationDate: poll.expirationDate,
        expired: poll.expired,
        createdAt: poll.createdAt,
        voteTokens: poll.voteTokens,
      },
    });
  } catch (error) {
    console.error("Error resetting poll:", error);
    res.status(500).json({ message: "Failed to reset poll" });
  }
};

export const deleteCustomPoll = async (req, res) => {
  try {
    const poll = req.poll;
    const pollId = poll._id;

    await PollModel.findByIdAndDelete(pollId);

    await UserModel.updateMany(
      { "polls.poll": pollId },
      { $pull: { polls: { poll: pollId } } }
    );

    res.status(200).json({ message: "Poll deleted successfully" });
  } catch (error) {
    console.error("Error deleting poll:", error);
    res.status(500).json({ message: "Failed to delete poll" });
  }
};
