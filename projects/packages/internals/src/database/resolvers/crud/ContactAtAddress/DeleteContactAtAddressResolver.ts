import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { DeleteContactAtAddressArgs } from './args/DeleteContactAtAddressArgs';
import { ContactAtAddress } from '../../../models/ContactAtAddress';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => ContactAtAddress)
export class DeleteContactAtAddressResolver {
  @TypeGraphQL.Mutation((_returns) => ContactAtAddress, {
    nullable: true,
  })
  async deleteContactAtAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteContactAtAddressArgs
  ): Promise<ContactAtAddress | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).contactAtAddress.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
