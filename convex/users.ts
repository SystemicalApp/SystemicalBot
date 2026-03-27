import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBotUserInfo = query({
    args: {
        discordId: v.string(),
        botSecret: v.string()
    },
    handler: async (ctx, args) => {
        if (args.botSecret !== process.env.BOT_SECRET) {
            throw new Error("Unauthorized: Invalid bot secret");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_discordId", (q) => q.eq("discordId", args.discordId))
            .unique();

        return user;
    }
});


export const linkAccount = mutation({
    args: {
        workosId: v.string(),
        discordId: v.string(),
        email: v.string(),
        botSecret: v.string()
    },
    handler: async (ctx, args) => {
        if (args.botSecret !== process.env.BOT_SECRET) {
            throw new Error("Unauthorized: Invalid bot secret");
        }

        const existing_user = await ctx.db.query("users")
            .withIndex("by_discordId", (q) => q.eq("discordId", args.discordId))
            .unique();

        if (existing_user) {
            await ctx.db.patch(existing_user._id, {
                workosId: args.workosId,
            });
        } else {
            await ctx.db.insert("users", {
                workosId: args.workosId,
                discordId: args.discordId,
                email: args.email,
            });
        }
    }
})