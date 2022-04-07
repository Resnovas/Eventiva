import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { FindUniqueArrangementArgs } from "./args/FindUniqueArrangementArgs";
import { Arrangement } from "../../../models/Arrangement";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Arrangement)
export class FindUniqueArrangementResolver {
  @TypeGraphQL.Query(_returns => Arrangement, {
    nullable: true
  })
  async arrangement(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueArrangementArgs): Promise<Arrangement | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).arrangement.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
