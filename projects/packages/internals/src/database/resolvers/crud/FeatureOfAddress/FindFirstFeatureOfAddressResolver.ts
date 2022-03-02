import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { FindFirstFeatureOfAddressArgs } from './args/FindFirstFeatureOfAddressArgs';
import { FeatureOfAddress } from '../../../models/FeatureOfAddress';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => FeatureOfAddress)
export class FindFirstFeatureOfAddressResolver {
  @TypeGraphQL.Query((_returns) => FeatureOfAddress, {
    nullable: true,
  })
  async findFirstFeatureOfAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindFirstFeatureOfAddressArgs
  ): Promise<FeatureOfAddress | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfAddress.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
