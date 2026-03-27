import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const exchangeWorkOSCode = action({
    args: {
        code: v.string(),
        discordId: v.string()
    },

    handler: async (ctx, args) => {
        const response = await fetch("https://api.workos.com/user_management/authenticate", {
            method: "POST",
            body: JSON.stringify({
                client_id: process.env.WORKOS_CLIENT_ID,
                client_secret: process.env.WORKOS_CLIENT_SECRET,
                code: args.code,
                grant_type: "authorization_code",
            }),
        });

        const data = await response.json();
        const workosId = data.workos_id;

        await ctx.runMutation(api.users.linkAccount, {
            workosId,
            discordId: args.discordId,
            email: data.user.email,
        });
    }
});