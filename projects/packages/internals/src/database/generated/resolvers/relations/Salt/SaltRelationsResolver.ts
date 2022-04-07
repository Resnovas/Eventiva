import * as TypeGraphQL from "type-graphql";
import { Account } from "../../../models/Account";
import { Salt } from "../../../models/Salt";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Salt)
export class SaltRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => Account, {
    nullable: true
  })
  async account(@TypeGraphQL.Root() salt: Salt, @TypeGraphQL.Ctx() ctx: any): Promise<Account | null> {
    return getPrismaFromContext(ctx).salt.findUnique({
      where: {
        id: salt.id,
      },
    }).account({});
  }
}
