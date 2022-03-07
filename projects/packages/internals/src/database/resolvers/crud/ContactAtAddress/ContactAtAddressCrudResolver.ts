import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateContactAtAddressArgs } from './args/AggregateContactAtAddressArgs';
import { CreateContactAtAddressArgs } from './args/CreateContactAtAddressArgs';
import { CreateManyContactAtAddressArgs } from './args/CreateManyContactAtAddressArgs';
import { DeleteContactAtAddressArgs } from './args/DeleteContactAtAddressArgs';
import { DeleteManyContactAtAddressArgs } from './args/DeleteManyContactAtAddressArgs';
import { FindFirstContactAtAddressArgs } from './args/FindFirstContactAtAddressArgs';
import { FindManyContactAtAddressArgs } from './args/FindManyContactAtAddressArgs';
import { FindUniqueContactAtAddressArgs } from './args/FindUniqueContactAtAddressArgs';
import { GroupByContactAtAddressArgs } from './args/GroupByContactAtAddressArgs';
import { UpdateContactAtAddressArgs } from './args/UpdateContactAtAddressArgs';
import { UpdateManyContactAtAddressArgs } from './args/UpdateManyContactAtAddressArgs';
import { UpsertContactAtAddressArgs } from './args/UpsertContactAtAddressArgs';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';
import { ContactAtAddress } from '../../../models/ContactAtAddress';
import { AffectedRowsOutput } from '../../outputs/AffectedRowsOutput';
import { AggregateContactAtAddress } from '../../outputs/AggregateContactAtAddress';
import { ContactAtAddressGroupBy } from '../../outputs/ContactAtAddressGroupBy';

@TypeGraphQL.Resolver((_of) => ContactAtAddress)
export class ContactAtAddressCrudResolver {
  @TypeGraphQL.Query((_returns) => ContactAtAddress, {
    nullable: true,
  })
  async contactAtAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindUniqueContactAtAddressArgs
  ): Promise<ContactAtAddress | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).contactAtAddress.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => ContactAtAddress, {
    nullable: true,
  })
  async findFirstContactAtAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindFirstContactAtAddressArgs
  ): Promise<ContactAtAddress | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).contactAtAddress.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

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

  @TypeGraphQL.Mutation((_returns) => ContactAtAddress, {
    nullable: false,
  })
  async createContactAtAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateContactAtAddressArgs
  ): Promise<ContactAtAddress> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).contactAtAddress.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async createManyContactAtAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateManyContactAtAddressArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).contactAtAddress.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

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

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async deleteManyContactAtAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteManyContactAtAddressArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).contactAtAddress.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async updateManyContactAtAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateManyContactAtAddressArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).contactAtAddress.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => ContactAtAddress, {
    nullable: false,
  })
  async upsertContactAtAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertContactAtAddressArgs
  ): Promise<ContactAtAddress> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).contactAtAddress.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => AggregateContactAtAddress, {
    nullable: false,
  })
  async aggregateContactAtAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateContactAtAddressArgs
  ): Promise<AggregateContactAtAddress> {
    return getPrismaFromContext(ctx).contactAtAddress.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }

  @TypeGraphQL.Query((_returns) => [ContactAtAddressGroupBy], {
    nullable: false,
  })
  async groupByContactAtAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: GroupByContactAtAddressArgs
  ): Promise<ContactAtAddressGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).contactAtAddress.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(
          ([_, v]) => v != null
        )
      ),
    });
  }
}
