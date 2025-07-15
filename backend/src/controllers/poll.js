import PollModel from "../models/poll.js";
import UserModel from "../models/user.js";
import { v4 as uuidv4 } from "uuid";

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
        expirationDate: poll.expirationDate,
        expired: poll.expired,
        createdAt: poll.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createImagePoll = async (req, res, next) => {
  try {
    const { title, question, options, multipleChoice, expirationDate } =
      req.body;

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
        expirationDate: newPoll.expirationDate,
        createdAt: newPoll.createdAt,
        tokenCount: voteTokens.length,
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

export const voteWithToken = async (req, res) => {
  const { token } = req.params;
  const { voterName, optionIndex } = req.body;

  try {
    // Token in der Poll-Collection finden
    const poll = await PollModel.findOne({
      "voteTokens.token": token,
    });

    if (!poll) {
      return res.status(404).json({ message: "Token not found" });
    }

    // Spezifischen Token aus dem Array finden
    const tokenEntry = poll.voteTokens.find((t) => t.token === token);

    if (!tokenEntry || tokenEntry.used) {
      return res.status(400).json({ message: "Token invalid or already used" });
    }

    const index = parseInt(optionIndex);
    if (!poll.options[index]) {
      return res.status(400).json({ message: "Invalid option" });
    }

    // Stimme speichern
    poll.options[index].voters.push(voterName);

    // Token als benutzt markieren
    tokenEntry.used = true;
    tokenEntry.usedAt = new Date();
    tokenEntry.voterName = voterName;

    await poll.save();

    res.status(200).json({ message: "Vote successful" });
  } catch (error) {
    console.error("Error voting:", error);
    res.status(500).json({ message: "Voting failed" });
  }
};

export const editCustomPoll = async (req, res) => {
  const pollId = req.params.id;
  const { title, question, options, multipleChoice, expirationDate } = req.body;

  try {
    const poll = await PollModel.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Update poll fields
    if (title !== undefined) poll.title = title;
    if (question !== undefined) poll.question = question;
    if (options !== undefined) poll.options = options;
    if (multipleChoice !== undefined) poll.multipleChoice = multipleChoice;
    if (expirationDate !== undefined)
      poll.expirationDate = expirationDate ? new Date(expirationDate) : null;

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

export const deleteCustomPoll = async (req, res) => {
  const pollId = req.params.id;

  try {
    const poll = await PollModel.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    await PollModel.findByIdAndDelete(pollId);

    // Entferne auch die Referenz aus dem User-Dokument
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
