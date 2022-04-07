import * as TypeGraphQL from "type-graphql";
import { SIABadge } from "../../../models/SIABadge";
import { SIACheck } from "../../../models/SIACheck";
import { Transaction } from "../../../models/Transaction";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => SIACheck)
export class SIACheckRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => SIABadge, {
    nullable: true
  })
  async badge(@TypeGraphQL.Root() sIACheck: SIACheck, @TypeGraphQL.Ctx() ctx: any): Promise<SIABadge | null> {
    return getPrismaFromContext(ctx).sIACheck.findUnique({
      where: {
        id: sIACheck.id,
      },
    }).badge({});
  }

  @TypeGraphQL.FieldResolver(_type => Transaction, {
    nullable: true
  })
  async transactions(@TypeGraphQL.Root() sIACheck: SIACheck, @TypeGraphQL.Ctx() ctx: any): Promise<Transaction | null> {
    return getPrismaFromContext(ctx).sIACheck.findUnique({
      where: {
        id: sIACheck.id,
      },
    }).transactions({});
  }
}
