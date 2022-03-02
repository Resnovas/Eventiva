import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { FindManyContactAtAddressArgs } from './args/FindManyContactAtAddressArgs';
import { ContactAtAddress } from '../../../models/ContactAtAddress';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => ContactAtAddress)
export class FindManyContactAtAddressResolver {
  @TypeGraphQL.Query((_returns) => [ContactAtAddress], {
    nullable: false,
  })
  async contactAtAddresses(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindManyContactAtAddressArgs
  ): Promise<ContactAtAddress[]> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).contactAtAddress.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
