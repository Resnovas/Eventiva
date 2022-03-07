import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfAddressWhereInput } from '../inputs/FeatureOfAddressWhereInput';

@TypeGraphQL.InputType('FeatureOfAddressListRelationFilter', {
  isAbstract: true,
})
export class FeatureOfAddressListRelationFilter {
  @TypeGraphQL.Field((_type) => FeatureOfAddressWhereInput, {
    nullable: true,
  })
  every?: FeatureOfAddressWhereInput | undefined;

  @TypeGraphQL.Field((_type) => FeatureOfAddressWhereInput, {
    nullable: true,
  })
  some?: FeatureOfAddressWhereInput | undefined;

  @TypeGraphQL.Field((_type) => FeatureOfAddressWhereInput, {
    nullable: true,
  })
  none?: FeatureOfAddressWhereInput | undefined;
}
