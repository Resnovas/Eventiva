import { AuthChecker } from "type-graphql";
import { Context } from "./Context";

export const customAuthChecker: AuthChecker<Context> = (
  { context: { token, user } },
  roles,
  ) => {
  if (token) return false
  if (user) {
    if (user.roles == roles) return false
  }
  // here we can read the user from context
  // and check his permission in the db against the `roles` argument
  // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]

  return false; // or false if access is denied
}