import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmployersOnAccountCreateManyAccountInputEnvelope } from '../inputs/EmployersOnAccountCreateManyAccountInputEnvelope';
import { EmployersOnAccountCreateOrConnectWithoutAccountInput } from '../inputs/EmployersOnAccountCreateOrConnectWithoutAccountInput';
import { EmployersOnAccountCreateWithoutAccountInput } from '../inputs/EmployersOnAccountCreateWithoutAccountInput';
import { EmployersOnAccountWhereUniqueInput } from '../inputs/EmployersOnAccountWhereUniqueInput';

@TypeGraphQL.InputType(
  'EmployersOnAccountCreateNestedManyWithoutAccountInput',
  {
    isAbstract: true,
  }
)
export class EmployersOnAccountCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field((_type) => [EmployersOnAccountCreateWithoutAccountInput], {
    nullable: true,
  })
  create?: EmployersOnAccountCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountCreateOrConnectWithoutAccountInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | EmployersOnAccountCreateOrConnectWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => EmployersOnAccountCreateManyAccountInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?: EmployersOnAccountCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [EmployersOnAccountWhereUniqueInput], {
    nullable: true,
  })
  connect?: EmployersOnAccountWhereUniqueInput[] | undefined;
}
