import * as TypeGraphQL from "type-graphql";
import { Status } from "../../../models/Status";
import { StatusOnAccount } from "../../../models/StatusOnAccount";
import { StatusAccountArgs } from "./args/StatusAccountArgs";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Status)
export class StatusRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => [StatusOnAccount], {
    nullable: false
  })
  async account(@TypeGraphQL.Root() status: Status, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: StatusAccountArgs): Promise<StatusOnAccount[]> {
    return getPrismaFromContext(ctx).status.findUnique({
      where: {
        id: status.id,
      },
    }).account(args);
  }
}
