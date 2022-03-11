import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { UpsertFeatureOfAddressArgs } from "./args/UpsertFeatureOfAddressArgs";
import { FeatureOfAddress } from "../../../models/FeatureOfAddress";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => FeatureOfAddress)
export class UpsertFeatureOfAddressResolver {
  @TypeGraphQL.Mutation(_returns => FeatureOfAddress, {
    nullable: false
  })
  async upsertFeatureOfAddress(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpsertFeatureOfAddressArgs): Promise<FeatureOfAddress> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).featureOfAddress.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
