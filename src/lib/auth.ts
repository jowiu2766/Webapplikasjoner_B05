import { betterAuth } from "better-auth";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },

  user: { 
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "tenant",
        input: false,
    },

     address: {
        type: "string",
        required: false,
      },
    },
  },
});