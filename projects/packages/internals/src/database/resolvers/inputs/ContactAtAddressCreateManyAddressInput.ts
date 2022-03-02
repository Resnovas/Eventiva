import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';

@TypeGraphQL.InputType('ContactAtAddressCreateManyAddressInput', {
  isAbstract: true,
})
export class ContactAtAddressCreateManyAddressInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  accountId!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  jobTitle?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  phone?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  emailId?: string | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted?: Date | undefined;
}
