import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { CreateAddressArgs } from './args/CreateAddressArgs';
import { Address } from '../../../models/Address';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Address)
export class CreateAddressResolver {
  @TypeGraphQL.Mutation((_returns) => Address, {
    nullable: false,
  })
  async createAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateAddressArgs
  ): Promise<Address> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).address.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
