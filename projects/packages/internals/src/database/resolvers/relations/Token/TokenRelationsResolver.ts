import * as TypeGraphQL from "type-graphql";
import { Account } from "../../../models/Account";
import { Token } from "../../../models/Token";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Token)
export class TokenRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => Account, {
    nullable: false
  })
  async account(@TypeGraphQL.Root() token: Token, @TypeGraphQL.Ctx() ctx: any): Promise<Account> {
    return getPrismaFromContext(ctx).token.findUnique({
      where: {
        id: token.id,
      },
    }).account({});
  }
}
