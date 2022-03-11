import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { GroupByContactAtAddressArgs } from "./args/GroupByContactAtAddressArgs";
import { ContactAtAddress } from "../../../models/ContactAtAddress";
import { ContactAtAddressGroupBy } from "../../outputs/ContactAtAddressGroupBy";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ContactAtAddress)
export class GroupByContactAtAddressResolver {
  @TypeGraphQL.Query(_returns => [ContactAtAddressGroupBy], {
    nullable: false
  })
  async groupByContactAtAddress(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByContactAtAddressArgs): Promise<ContactAtAddressGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).contactAtAddress.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
