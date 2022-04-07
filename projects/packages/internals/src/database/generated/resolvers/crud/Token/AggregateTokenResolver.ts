import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregateTokenArgs } from "./args/AggregateTokenArgs";
import { Token } from "../../../models/Token";
import { AggregateToken } from "../../outputs/AggregateToken";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Token)
export class AggregateTokenResolver {
  @TypeGraphQL.Query(_returns => AggregateToken, {
    nullable: false
  })
  async aggregateToken(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateTokenArgs): Promise<AggregateToken> {
    return getPrismaFromContext(ctx).token.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
