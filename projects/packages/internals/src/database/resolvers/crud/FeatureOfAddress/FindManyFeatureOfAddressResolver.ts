import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { FindManyFeatureOfAddressArgs } from './args/FindManyFeatureOfAddressArgs';
import { FeatureOfAddress } from '../../../models/FeatureOfAddress';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => FeatureOfAddress)
export class FindManyFeatureOfAddressResolver {
  @TypeGraphQL.Query((_returns) => [FeatureOfAddress], {
    nullable: false,
  })
  async featureOfAddresses(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindManyFeatureOfAddressArgs
  ): Promise<FeatureOfAddress[]> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfAddress.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
