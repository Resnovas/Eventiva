import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { FindManyArrangementArgs } from "./args/FindManyArrangementArgs";
import { Arrangement } from "../../../models/Arrangement";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Arrangement)
export class FindManyArrangementResolver {
  @TypeGraphQL.Query(_returns => [Arrangement], {
    nullable: false
  })
  async arrangements(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManyArrangementArgs): Promise<Arrangement[]> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).arrangement.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
