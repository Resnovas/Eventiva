import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateFeatureOfAddressArgs } from './args/AggregateFeatureOfAddressArgs';
import { FeatureOfAddress } from '../../../models/FeatureOfAddress';
import { AggregateFeatureOfAddress } from '../../outputs/AggregateFeatureOfAddress';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => FeatureOfAddress)
export class AggregateFeatureOfAddressResolver {
  @TypeGraphQL.Query((_returns) => AggregateFeatureOfAddress, {
    nullable: false,
  })
  async aggregateFeatureOfAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateFeatureOfAddressArgs
  ): Promise<AggregateFeatureOfAddress> {
    return getPrismaFromContext(ctx).featureOfAddress.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
