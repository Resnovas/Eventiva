import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';

@TypeGraphQL.ObjectType('EmployersOnAccountMinAggregate', {
  isAbstract: true,
})
export class EmployersOnAccountMinAggregate {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  accountId!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  employerId!: string | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt!: Date | null;
}
