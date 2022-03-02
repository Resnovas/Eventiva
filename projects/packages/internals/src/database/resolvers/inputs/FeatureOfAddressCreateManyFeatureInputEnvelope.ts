import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfAddressCreateManyFeatureInput } from '../inputs/FeatureOfAddressCreateManyFeatureInput';

@TypeGraphQL.InputType('FeatureOfAddressCreateManyFeatureInputEnvelope', {
  isAbstract: true,
})
export class FeatureOfAddressCreateManyFeatureInputEnvelope {
  @TypeGraphQL.Field((_type) => [FeatureOfAddressCreateManyFeatureInput], {
    nullable: false,
  })
  data!: FeatureOfAddressCreateManyFeatureInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
