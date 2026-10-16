import { route } from "rwsdk/router";
import { ErrorResponse } from "rwsdk/worker";

export const postsRoutes = [
  route("saker/ny", {
    post: async ({ request, ctx }) => {
      //  if (!ctx.session.isAuthenticated)
      //  throw new ErrorResponse(401, "Unauthorized");
    },
  }),
];
