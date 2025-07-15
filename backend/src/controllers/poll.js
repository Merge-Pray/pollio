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
    const tokenEntry = await db.collection("tokens").findOne({ token });

    if (!tokenEntry || tokenEntry.used) {
      return res
        .status(400)
        .json({ message: "Token ungültig oder bereits verwendet" });
    }

    const poll = await db
      .collection("polls")
      .findOne({ id: tokenEntry.pollId });
    if (!poll) {
      return res.status(404).json({ message: "Umfrage nicht gefunden" });
    }

    const index = parseInt(optionIndex);
    if (!poll.options[index]) {
      return res.status(400).json({ message: "Ungültige Option" });
    }

    // Stimme speichern
    poll.options[index].voteCount += 1;
    poll.options[index].voterNames.push(voterName);

    await db
      .collection("polls")
      .updateOne({ id: poll.id }, { $set: { options: poll.options } });

    // Token als benutzt markieren
    await db
      .collection("tokens")
      .updateOne({ token }, { $set: { used: true } });

    res.status(200).json({ message: "Abstimmung erfolgreich" });
  } catch (error) {
    console.error("Fehler beim Abstimmen:", error);
    res.status(500).json({ message: "Abstimmung fehlgeschlagen" });
  }
};

export const editCustomPoll = async (req, res) => {
  const pollId = req.params.id;
  const { question, options } = req.body;

  const poll = await db.polls.findOne({ id: pollId });
  if (!poll) return res.status(404).json({ message: "Poll not found" });

  await db.polls.updateOne({ id: pollId }, { $set: { question, options } });

  res.json({ message: "Poll updated" });
};

export const deleteCustomPoll = async (req, res) => {
  const pollId = req.params.id;

  const poll = await db.polls.findOne({ id: pollId });

  if (!poll) return res.status(404).json({ message: "Poll not found" });

  await db.polls.deleteOne({ id: pollId });

  res.json({ message: "Poll deleted" });
};
