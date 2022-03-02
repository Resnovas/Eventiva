import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpdateFeatureOfAddressArgs } from './args/UpdateFeatureOfAddressArgs';
import { FeatureOfAddress } from '../../../models/FeatureOfAddress';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => FeatureOfAddress)
export class UpdateFeatureOfAddressResolver {
  @TypeGraphQL.Mutation((_returns) => FeatureOfAddress, {
    nullable: true,
  })
  async updateFeatureOfAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateFeatureOfAddressArgs
  ): Promise<FeatureOfAddress | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfAddress.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
