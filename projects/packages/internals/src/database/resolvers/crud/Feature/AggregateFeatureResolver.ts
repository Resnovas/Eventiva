import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregateFeatureArgs } from "./args/AggregateFeatureArgs";
import { Feature } from "../../../models/Feature";
import { AggregateFeature } from "../../outputs/AggregateFeature";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Feature)
export class AggregateFeatureResolver {
  @TypeGraphQL.Query(_returns => AggregateFeature, {
    nullable: false
  })
  async aggregateFeature(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateFeatureArgs): Promise<AggregateFeature> {
    return getPrismaFromContext(ctx).feature.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
