import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregateApplicationArgs } from "./args/AggregateApplicationArgs";
import { Application } from "../../../models/Application";
import { AggregateApplication } from "../../outputs/AggregateApplication";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Application)
export class AggregateApplicationResolver {
  @TypeGraphQL.Query(_returns => AggregateApplication, {
    nullable: false
  })
  async aggregateApplication(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateApplicationArgs): Promise<AggregateApplication> {
    return getPrismaFromContext(ctx).application.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
