import * as TypeGraphQL from "type-graphql";
import { Account } from "../../../models/Account";
import { Files } from "../../../models/Files";
import { RTW } from "../../../models/RTW";
import { FilesAccountArgs } from "./args/FilesAccountArgs";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Files)
export class FilesRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => RTW, {
    nullable: true
  })
  async rtw(@TypeGraphQL.Root() files: Files, @TypeGraphQL.Ctx() ctx: any): Promise<RTW | null> {
    return getPrismaFromContext(ctx).files.findUnique({
      where: {
        id: files.id,
      },
    }).rtw({});
  }

  @TypeGraphQL.FieldResolver(_type => [Account], {
    nullable: false
  })
  async account(@TypeGraphQL.Root() files: Files, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: FilesAccountArgs): Promise<Account[]> {
    return getPrismaFromContext(ctx).files.findUnique({
      where: {
        id: files.id,
      },
    }).account(args);
  }
}
