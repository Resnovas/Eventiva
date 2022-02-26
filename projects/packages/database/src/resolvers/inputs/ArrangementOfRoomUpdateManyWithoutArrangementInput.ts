import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementOfRoomCreateManyArrangementInputEnvelope } from '../inputs/ArrangementOfRoomCreateManyArrangementInputEnvelope';
import { ArrangementOfRoomCreateOrConnectWithoutArrangementInput } from '../inputs/ArrangementOfRoomCreateOrConnectWithoutArrangementInput';
import { ArrangementOfRoomCreateWithoutArrangementInput } from '../inputs/ArrangementOfRoomCreateWithoutArrangementInput';
import { ArrangementOfRoomScalarWhereInput } from '../inputs/ArrangementOfRoomScalarWhereInput';
import { ArrangementOfRoomUpdateManyWithWhereWithoutArrangementInput } from '../inputs/ArrangementOfRoomUpdateManyWithWhereWithoutArrangementInput';
import { ArrangementOfRoomUpdateWithWhereUniqueWithoutArrangementInput } from '../inputs/ArrangementOfRoomUpdateWithWhereUniqueWithoutArrangementInput';
import { ArrangementOfRoomUpsertWithWhereUniqueWithoutArrangementInput } from '../inputs/ArrangementOfRoomUpsertWithWhereUniqueWithoutArrangementInput';
import { ArrangementOfRoomWhereUniqueInput } from '../inputs/ArrangementOfRoomWhereUniqueInput';

@TypeGraphQL.InputType('ArrangementOfRoomUpdateManyWithoutArrangementInput', {
  isAbstract: true,
})
export class ArrangementOfRoomUpdateManyWithoutArrangementInput {
  @TypeGraphQL.Field(
    (_type) => [ArrangementOfRoomCreateWithoutArrangementInput],
    {
      nullable: true,
    }
  )
  create?: ArrangementOfRoomCreateWithoutArrangementInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ArrangementOfRoomCreateOrConnectWithoutArrangementInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | ArrangementOfRoomCreateOrConnectWithoutArrangementInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [ArrangementOfRoomUpsertWithWhereUniqueWithoutArrangementInput],
    {
      nullable: true,
    }
  )
  upsert?:
    | ArrangementOfRoomUpsertWithWhereUniqueWithoutArrangementInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => ArrangementOfRoomCreateManyArrangementInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?: ArrangementOfRoomCreateManyArrangementInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [ArrangementOfRoomWhereUniqueInput], {
    nullable: true,
  })
  connect?: ArrangementOfRoomWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ArrangementOfRoomWhereUniqueInput], {
    nullable: true,
  })
  set?: ArrangementOfRoomWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ArrangementOfRoomWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: ArrangementOfRoomWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ArrangementOfRoomWhereUniqueInput], {
    nullable: true,
  })
  delete?: ArrangementOfRoomWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ArrangementOfRoomUpdateWithWhereUniqueWithoutArrangementInput],
    {
      nullable: true,
    }
  )
  update?:
    | ArrangementOfRoomUpdateWithWhereUniqueWithoutArrangementInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [ArrangementOfRoomUpdateManyWithWhereWithoutArrangementInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | ArrangementOfRoomUpdateManyWithWhereWithoutArrangementInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [ArrangementOfRoomScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: ArrangementOfRoomScalarWhereInput[] | undefined;
}
