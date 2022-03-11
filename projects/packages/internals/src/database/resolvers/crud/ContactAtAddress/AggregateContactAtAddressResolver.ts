import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregateContactAtAddressArgs } from "./args/AggregateContactAtAddressArgs";
import { ContactAtAddress } from "../../../models/ContactAtAddress";
import { AggregateContactAtAddress } from "../../outputs/AggregateContactAtAddress";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ContactAtAddress)
export class AggregateContactAtAddressResolver {
  @TypeGraphQL.Query(_returns => AggregateContactAtAddress, {
    nullable: false
  })
  async aggregateContactAtAddress(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateContactAtAddressArgs): Promise<AggregateContactAtAddress> {
    return getPrismaFromContext(ctx).contactAtAddress.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
