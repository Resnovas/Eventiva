import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregateAddressArgs } from "./args/AggregateAddressArgs";
import { Address } from "../../../models/Address";
import { AggregateAddress } from "../../outputs/AggregateAddress";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Address)
export class AggregateAddressResolver {
  @TypeGraphQL.Query(_returns => AggregateAddress, {
    nullable: false
  })
  async aggregateAddress(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateAddressArgs): Promise<AggregateAddress> {
    return getPrismaFromContext(ctx).address.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
