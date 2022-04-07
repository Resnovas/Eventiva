import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { CreateFeatureOfAddressArgs } from "./args/CreateFeatureOfAddressArgs";
import { FeatureOfAddress } from "../../../models/FeatureOfAddress";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => FeatureOfAddress)
export class CreateFeatureOfAddressResolver {
  @TypeGraphQL.Mutation(_returns => FeatureOfAddress, {
    nullable: false
  })
  async createFeatureOfAddress(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateFeatureOfAddressArgs): Promise<FeatureOfAddress> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).featureOfAddress.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
