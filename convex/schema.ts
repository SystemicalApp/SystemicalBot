import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        workosId: v.string(),
        discordId: v.string(),
        email: v.string(),
    }).index("by_discordId", ["discordId"])
});
