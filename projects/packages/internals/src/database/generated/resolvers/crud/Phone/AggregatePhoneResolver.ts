import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregatePhoneArgs } from "./args/AggregatePhoneArgs";
import { Phone } from "../../../models/Phone";
import { AggregatePhone } from "../../outputs/AggregatePhone";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Phone)
export class AggregatePhoneResolver {
  @TypeGraphQL.Query(_returns => AggregatePhone, {
    nullable: false
  })
  async aggregatePhone(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregatePhoneArgs): Promise<AggregatePhone> {
    return getPrismaFromContext(ctx).phone.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
