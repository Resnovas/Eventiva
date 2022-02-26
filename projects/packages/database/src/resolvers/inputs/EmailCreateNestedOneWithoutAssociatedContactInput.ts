import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmailCreateOrConnectWithoutAssociatedContactInput } from '../inputs/EmailCreateOrConnectWithoutAssociatedContactInput';
import { EmailCreateWithoutAssociatedContactInput } from '../inputs/EmailCreateWithoutAssociatedContactInput';
import { EmailWhereUniqueInput } from '../inputs/EmailWhereUniqueInput';

@TypeGraphQL.InputType('EmailCreateNestedOneWithoutAssociatedContactInput', {
  isAbstract: true,
})
export class EmailCreateNestedOneWithoutAssociatedContactInput {
  @TypeGraphQL.Field((_type) => EmailCreateWithoutAssociatedContactInput, {
    nullable: true,
  })
  create?: EmailCreateWithoutAssociatedContactInput | undefined;

  @TypeGraphQL.Field(
    (_type) => EmailCreateOrConnectWithoutAssociatedContactInput,
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | EmailCreateOrConnectWithoutAssociatedContactInput
    | undefined;

  @TypeGraphQL.Field((_type) => EmailWhereUniqueInput, {
    nullable: true,
  })
  connect?: EmailWhereUniqueInput | undefined;
}
