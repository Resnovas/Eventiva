import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { UpdateArrangementArgs } from "./args/UpdateArrangementArgs";
import { Arrangement } from "../../../models/Arrangement";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Arrangement)
export class UpdateArrangementResolver {
  @TypeGraphQL.Mutation(_returns => Arrangement, {
    nullable: true
  })
  async updateArrangement(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateArrangementArgs): Promise<Arrangement | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).arrangement.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
