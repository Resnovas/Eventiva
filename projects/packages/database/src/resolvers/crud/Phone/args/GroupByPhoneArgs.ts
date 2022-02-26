import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { PhoneOrderByWithAggregationInput } from '../../../inputs/PhoneOrderByWithAggregationInput';
import { PhoneScalarWhereWithAggregatesInput } from '../../../inputs/PhoneScalarWhereWithAggregatesInput';
import { PhoneWhereInput } from '../../../inputs/PhoneWhereInput';
import { PhoneScalarFieldEnum } from '../../../../enums/PhoneScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class GroupByPhoneArgs {
  @TypeGraphQL.Field((_type) => PhoneWhereInput, {
    nullable: true,
  })
  where?: PhoneWhereInput | undefined;

  @TypeGraphQL.Field((_type) => [PhoneOrderByWithAggregationInput], {
    nullable: true,
  })
  orderBy?: PhoneOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field((_type) => [PhoneScalarFieldEnum], {
    nullable: false,
  })
  by!: Array<
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'deleted'
    | 'accountId'
    | 'addressId'
    | 'phone'
    | 'public'
  >;

  @TypeGraphQL.Field((_type) => PhoneScalarWhereWithAggregatesInput, {
    nullable: true,
  })
  having?: PhoneScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
