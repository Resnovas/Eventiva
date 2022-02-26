import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DomainCreateWithoutLinkedEmailsInput } from '../inputs/DomainCreateWithoutLinkedEmailsInput';
import { DomainWhereUniqueInput } from '../inputs/DomainWhereUniqueInput';

@TypeGraphQL.InputType('DomainCreateOrConnectWithoutLinkedEmailsInput', {
  isAbstract: true,
})
export class DomainCreateOrConnectWithoutLinkedEmailsInput {
  @TypeGraphQL.Field((_type) => DomainWhereUniqueInput, {
    nullable: false,
  })
  where!: DomainWhereUniqueInput;

  @TypeGraphQL.Field((_type) => DomainCreateWithoutLinkedEmailsInput, {
    nullable: false,
  })
  create!: DomainCreateWithoutLinkedEmailsInput;
}
