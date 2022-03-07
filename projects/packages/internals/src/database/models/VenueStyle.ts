import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../scalars';
import { Address } from '../models/Address';
import { VenueStyleCount } from '../resolvers/outputs/VenueStyleCount';

@TypeGraphQL.ObjectType('VenueStyle', {
  isAbstract: true,
})
export class VenueStyle {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;

  address?: Address[];

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  name!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  details?: string | null;

  @TypeGraphQL.Field((_type) => VenueStyleCount, {
    nullable: true,
  })
  _count?: VenueStyleCount | null;
}
