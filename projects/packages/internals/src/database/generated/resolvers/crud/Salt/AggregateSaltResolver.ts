import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregateSaltArgs } from "./args/AggregateSaltArgs";
import { Salt } from "../../../models/Salt";
import { AggregateSalt } from "../../outputs/AggregateSalt";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Salt)
export class AggregateSaltResolver {
  @TypeGraphQL.Query(_returns => AggregateSalt, {
    nullable: false
  })
  async aggregateSalt(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateSaltArgs): Promise<AggregateSalt> {
    return getPrismaFromContext(ctx).salt.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
