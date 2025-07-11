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
