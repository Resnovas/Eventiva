import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusOnAccountCreateManyStatusInputEnvelope } from '../inputs/StatusOnAccountCreateManyStatusInputEnvelope';
import { StatusOnAccountCreateOrConnectWithoutStatusInput } from '../inputs/StatusOnAccountCreateOrConnectWithoutStatusInput';
import { StatusOnAccountCreateWithoutStatusInput } from '../inputs/StatusOnAccountCreateWithoutStatusInput';
import { StatusOnAccountWhereUniqueInput } from '../inputs/StatusOnAccountWhereUniqueInput';

@TypeGraphQL.InputType('StatusOnAccountCreateNestedManyWithoutStatusInput', {
  isAbstract: true,
})
export class StatusOnAccountCreateNestedManyWithoutStatusInput {
  @TypeGraphQL.Field((_type) => [StatusOnAccountCreateWithoutStatusInput], {
    nullable: true,
  })
  create?: StatusOnAccountCreateWithoutStatusInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [StatusOnAccountCreateOrConnectWithoutStatusInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | StatusOnAccountCreateOrConnectWithoutStatusInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => StatusOnAccountCreateManyStatusInputEnvelope, {
    nullable: true,
  })
  createMany?: StatusOnAccountCreateManyStatusInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [StatusOnAccountWhereUniqueInput], {
    nullable: true,
  })
  connect?: StatusOnAccountWhereUniqueInput[] | undefined;
}
