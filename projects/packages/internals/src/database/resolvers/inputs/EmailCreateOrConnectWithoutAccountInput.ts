import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmailCreateWithoutAccountInput } from '../inputs/EmailCreateWithoutAccountInput';
import { EmailWhereUniqueInput } from '../inputs/EmailWhereUniqueInput';

@TypeGraphQL.InputType('EmailCreateOrConnectWithoutAccountInput', {
  isAbstract: true,
})
export class EmailCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field((_type) => EmailWhereUniqueInput, {
    nullable: false,
  })
  where!: EmailWhereUniqueInput;

  @TypeGraphQL.Field((_type) => EmailCreateWithoutAccountInput, {
    nullable: false,
  })
  create!: EmailCreateWithoutAccountInput;
}
