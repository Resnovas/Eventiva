import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusOnAccountCreateManyAccountInputEnvelope } from '../inputs/StatusOnAccountCreateManyAccountInputEnvelope';
import { StatusOnAccountCreateOrConnectWithoutAccountInput } from '../inputs/StatusOnAccountCreateOrConnectWithoutAccountInput';
import { StatusOnAccountCreateWithoutAccountInput } from '../inputs/StatusOnAccountCreateWithoutAccountInput';
import { StatusOnAccountWhereUniqueInput } from '../inputs/StatusOnAccountWhereUniqueInput';

@TypeGraphQL.InputType('StatusOnAccountCreateNestedManyWithoutAccountInput', {
  isAbstract: true,
})
export class StatusOnAccountCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field((_type) => [StatusOnAccountCreateWithoutAccountInput], {
    nullable: true,
  })
  create?: StatusOnAccountCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [StatusOnAccountCreateOrConnectWithoutAccountInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | StatusOnAccountCreateOrConnectWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => StatusOnAccountCreateManyAccountInputEnvelope, {
    nullable: true,
  })
  createMany?: StatusOnAccountCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [StatusOnAccountWhereUniqueInput], {
    nullable: true,
  })
  connect?: StatusOnAccountWhereUniqueInput[] | undefined;
}
