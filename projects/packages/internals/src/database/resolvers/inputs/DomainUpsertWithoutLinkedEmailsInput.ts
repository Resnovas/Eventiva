import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DomainCreateWithoutLinkedEmailsInput } from '../inputs/DomainCreateWithoutLinkedEmailsInput';
import { DomainUpdateWithoutLinkedEmailsInput } from '../inputs/DomainUpdateWithoutLinkedEmailsInput';

@TypeGraphQL.InputType('DomainUpsertWithoutLinkedEmailsInput', {
  isAbstract: true,
})
export class DomainUpsertWithoutLinkedEmailsInput {
  @TypeGraphQL.Field((_type) => DomainUpdateWithoutLinkedEmailsInput, {
    nullable: false,
  })
  update!: DomainUpdateWithoutLinkedEmailsInput;

  @TypeGraphQL.Field((_type) => DomainCreateWithoutLinkedEmailsInput, {
    nullable: false,
  })
  create!: DomainCreateWithoutLinkedEmailsInput;
}
