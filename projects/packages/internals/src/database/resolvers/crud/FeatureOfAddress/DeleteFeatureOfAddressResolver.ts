import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { DeleteFeatureOfAddressArgs } from "./args/DeleteFeatureOfAddressArgs";
import { FeatureOfAddress } from "../../../models/FeatureOfAddress";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => FeatureOfAddress)
export class DeleteFeatureOfAddressResolver {
  @TypeGraphQL.Mutation(_returns => FeatureOfAddress, {
    nullable: true
  })
  async deleteFeatureOfAddress(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteFeatureOfAddressArgs): Promise<FeatureOfAddress | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).featureOfAddress.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
