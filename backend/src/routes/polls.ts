import { Router } from 'express';
import { db } from '../db';
import { answerTable, optionTable, pollTable, questionTable, responseTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '../middleware/auth';


const router = Router();

router.post("/", verifyToken, async (req: any, res) => {

    const userId = req.user.userId;
    const { title, isAnonymous, expireTime, questions } = req.body;
    try {
        const newPollId = await db.transaction(async (tx) => {

            const [newPoll] = await tx.insert(pollTable).values({
                userId: userId,
                title,
                isAnonymous,
                expireTime: new Date(expireTime),
            }).returning({ id: pollTable.id });

            if (!newPoll) throw new Error("Failed to insert poll");

            for (const q of questions) {
                const [newQuestion] = await tx.insert(questionTable).values({
                    pollId: newPoll.id,
                    question: q.question,
                    type: q.type,
                    isMandatory: q.isMandatory,
                }).returning({ id: questionTable.id });

                if (!newQuestion) throw new Error("Failed to insert question");

                const optionValues = q.options.map((optText: string) => ({
                    questionId: newQuestion.id,
                    option: optText,
                }));

                if (optionValues.length > 0) {
                    await tx.insert(optionTable).values(optionValues);
                }
            }

            return newPoll.id;
        });

        res.status(201).json({ success: true, pollId: newPollId });
    } catch (error) {
        console.error("Failed to create poll:", error);
        res.status(500).json({ error: "Failed to create poll. Transaction rolled back." });
    }
});

router.patch("/:pollId/close", verifyToken, async (req: any, res) => {
    try {
        const { pollId } = req.params;
        const { isClosed } = req.body;
        const userId = req.user.userId;

        const poll = await db.select().from(pollTable).where(
            and(eq(pollTable.id, pollId), eq(pollTable.userId, userId))
        );

        if (poll.length === 0) return res.status(404).json({ error: "Poll not found" });

        if (!poll[0]) {
            return res.status(404).json({ error: "Poll not found" });
        }

        // CRITICAL: If already published, prevent reopening (isClosed must stay true)
        if (poll[0].isPublish && isClosed === false) {
            return res.status(400).json({
                error: "Published polls are archived and cannot be reopened."
            });
        }

        await db.update(pollTable).set({ isClosed }).where(eq(pollTable.id, pollId));
        res.status(200).json({ success: true, isClosed });
    } catch (error) {
        res.status(500).json({ error: "Failed" });
    }
});

router.post("/:pollId/vote", async (req, res) => {
    const { pollId } = req.params;
    const { userId, answers } = req.body;

    try {
        const existingPolls = await db.select().from(pollTable).where(eq(pollTable.id, pollId));
        const currentPoll = existingPolls[0];
        if (!currentPoll) return res.status(404).json({ error: "Poll not found" });

        // STRICT CHECK: Reject if manually closed OR expired OR published
        const isExpired = currentPoll.expireTime && new Date() > new Date(currentPoll.expireTime);
        if (currentPoll.isClosed || isExpired || currentPoll.isPublish) {
            return res.status(403).json({ error: "This poll is no longer accepting responses." });
        }

        if (!currentPoll.isAnonymous && !userId) {
            return res.status(401).json({ error: "Login required." });
        }

        // ... rest of your validation and transaction logic ...
        await db.transaction(async (tx) => {
            const [newResponse] = await tx.insert(responseTable).values({
                pollId,
                userId: currentPoll.isAnonymous ? null : userId,
            }).returning({ id: responseTable.id });

            if (!newResponse) throw new Error("Failed");

            await tx.insert(answerTable).values(answers.map((a: any) => ({
                responseId: newResponse.id,
                questionId: a.questionId,
                optionId: a.optionId || null,
                textAnswer: a.textAnswer || null,
            })));
        });

        const io = req.app.get("io");
        io.to(pollId).emit("new_vote");
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Vote failed" });
    }
});

// --- GET A POLL (Public Route) ---
router.get("/:pollId", async (req, res) => {
    try {
        const { pollId } = req.params;

        // Fetch the poll
        const polls = await db.select().from(pollTable).where(eq(pollTable.id, pollId));
        if (polls.length === 0) return res.status(404).json({ error: "Poll not found" });

        // Fetch the questions for this poll
        const questions = await db.select().from(questionTable).where(eq(questionTable.pollId, pollId));

        // Fetch the options for these questions
        const options = await db.select().from(optionTable); // Note: In production, filter by questionIds for performance

        // Structure the data for the frontend
        const pollData = {
            ...polls[0],
            questions: questions.map(q => ({
                ...q,
                options: options.filter(o => o.questionId === q.id)
            }))
        };

        res.status(200).json(pollData);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch poll" });
    }
});


router.get("/:pollId/stats", async (req, res) => {
    try {
        const { pollId } = req.params;

        const questions = await db.select().from(questionTable).where(eq(questionTable.pollId, pollId));
        const responses = await db.select().from(responseTable).where(eq(responseTable.pollId, pollId));
        const totalVotes = responses.length;

        const stats = await Promise.all(questions.map(async (q) => {
            // FIX: If it's a text question, fetch the raw text answers
            if (q.type === "text") {
                const answers = await db.select().from(answerTable).where(eq(answerTable.questionId, q.id));
                // Extract only valid text strings
                const textResponses = answers
                    .map(a => a.textAnswer)
                    .filter(text => text && text.trim() !== "");

                return { ...q, textResponses };
            }

            // OTHERWISE: Handle standard single/multiple choice options
            const options = await db.select().from(optionTable).where(eq(optionTable.questionId, q.id));
            const optionsWithCounts = await Promise.all(options.map(async (opt) => {
                const answers = await db.select().from(answerTable).where(eq(answerTable.optionId, opt.id));
                const count = answers.length;
                const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

                return { ...opt, count, percentage };
            }));

            return { ...q, options: optionsWithCounts };
        }));

        res.status(200).json({ totalVotes, questions: stats });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

router.get("/user/my-polls", verifyToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;
        const myPolls = await db.select().from(pollTable).where(eq(pollTable.userId, userId));
        res.status(200).json(myPolls);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch your polls" });
    }
});

router.delete("/:pollId", verifyToken, async (req: any, res) => {
    try {
        const { pollId } = req.params;
        const userId = req.user.userId;

        // Ensure the person deleting it actually owns it
        const poll = await db.select().from(pollTable).where(
            and(eq(pollTable.id, pollId), eq(pollTable.userId, userId))
        );

        if (poll.length === 0) {
            return res.status(404).json({ error: "Poll not found or unauthorized" });
        }

        await db.delete(pollTable).where(eq(pollTable.id, pollId));

        res.status(200).json({ message: "Poll deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete poll" });
    }
});


// --- TOGGLE PUBLISH STATUS (Creator Only) ---
router.patch("/:pollId/publish", verifyToken, async (req: any, res) => {
    try {
        const { pollId } = req.params;
        const { isPublished } = req.body;
        const userId = req.user.userId;

        const poll = await db.select().from(pollTable).where(
            and(eq(pollTable.id, pollId), eq(pollTable.userId, userId))
        );

        if (poll.length === 0) return res.status(404).json({ error: "Poll not found" });

        await db.update(pollTable)
            .set({ isPublish: isPublished }) // FIX: Changed 'isPublished' to 'isPublish' to match your schema
            .where(eq(pollTable.id, pollId));

        res.status(200).json({ success: true, isPublished });
    } catch (error) {
        res.status(500).json({ error: "Failed to update publish status" });
    }
});

export default router;