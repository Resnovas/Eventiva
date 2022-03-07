import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpdateContactAtAddressArgs } from './args/UpdateContactAtAddressArgs';
import { ContactAtAddress } from '../../../models/ContactAtAddress';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => ContactAtAddress)
export class UpdateContactAtAddressResolver {
  @TypeGraphQL.Mutation((_returns) => ContactAtAddress, {
    nullable: true,
  })
  async updateContactAtAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateContactAtAddressArgs
  ): Promise<ContactAtAddress | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).contactAtAddress.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
