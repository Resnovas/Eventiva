import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmailCreateWithoutAssociatedContactInput } from '../inputs/EmailCreateWithoutAssociatedContactInput';
import { EmailUpdateWithoutAssociatedContactInput } from '../inputs/EmailUpdateWithoutAssociatedContactInput';

@TypeGraphQL.InputType('EmailUpsertWithoutAssociatedContactInput', {
  isAbstract: true,
})
export class EmailUpsertWithoutAssociatedContactInput {
  @TypeGraphQL.Field((_type) => EmailUpdateWithoutAssociatedContactInput, {
    nullable: false,
  })
  update!: EmailUpdateWithoutAssociatedContactInput;

  @TypeGraphQL.Field((_type) => EmailCreateWithoutAssociatedContactInput, {
    nullable: false,
  })
  create!: EmailCreateWithoutAssociatedContactInput;
}
