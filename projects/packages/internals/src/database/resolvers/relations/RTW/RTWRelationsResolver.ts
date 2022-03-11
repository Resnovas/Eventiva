import * as TypeGraphQL from "type-graphql";
import { Account } from "../../../models/Account";
import { Files } from "../../../models/Files";
import { RTW } from "../../../models/RTW";
import { RTWFilesArgs } from "./args/RTWFilesArgs";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => RTW)
export class RTWRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => [Files], {
    nullable: false
  })
  async files(@TypeGraphQL.Root() rTW: RTW, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: RTWFilesArgs): Promise<Files[]> {
    return getPrismaFromContext(ctx).rTW.findUnique({
      where: {
        id: rTW.id,
      },
    }).files(args);
  }

  @TypeGraphQL.FieldResolver(_type => Account, {
    nullable: false
  })
  async account(@TypeGraphQL.Root() rTW: RTW, @TypeGraphQL.Ctx() ctx: any): Promise<Account> {
    return getPrismaFromContext(ctx).rTW.findUnique({
      where: {
        id: rTW.id,
      },
    }).account({});
  }
}
