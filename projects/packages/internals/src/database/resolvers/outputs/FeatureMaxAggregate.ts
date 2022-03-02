import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureType } from '../../enums/FeatureType';

@TypeGraphQL.ObjectType('FeatureMaxAggregate', {
  isAbstract: true,
})
export class FeatureMaxAggregate {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  name!: string | null;

  @TypeGraphQL.Field((_type) => FeatureType, {
    nullable: true,
  })
  type!: 'STRING' | 'BOOLEAN' | 'NUMBER' | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted!: Date | null;
}
