import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregateArrangementArgs } from "./args/AggregateArrangementArgs";
import { Arrangement } from "../../../models/Arrangement";
import { AggregateArrangement } from "../../outputs/AggregateArrangement";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Arrangement)
export class AggregateArrangementResolver {
  @TypeGraphQL.Query(_returns => AggregateArrangement, {
    nullable: false
  })
  async aggregateArrangement(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateArrangementArgs): Promise<AggregateArrangement> {
    return getPrismaFromContext(ctx).arrangement.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
