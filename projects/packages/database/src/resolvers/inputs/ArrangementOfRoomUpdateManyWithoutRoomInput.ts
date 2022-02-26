import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementOfRoomCreateManyRoomInputEnvelope } from '../inputs/ArrangementOfRoomCreateManyRoomInputEnvelope';
import { ArrangementOfRoomCreateOrConnectWithoutRoomInput } from '../inputs/ArrangementOfRoomCreateOrConnectWithoutRoomInput';
import { ArrangementOfRoomCreateWithoutRoomInput } from '../inputs/ArrangementOfRoomCreateWithoutRoomInput';
import { ArrangementOfRoomScalarWhereInput } from '../inputs/ArrangementOfRoomScalarWhereInput';
import { ArrangementOfRoomUpdateManyWithWhereWithoutRoomInput } from '../inputs/ArrangementOfRoomUpdateManyWithWhereWithoutRoomInput';
import { ArrangementOfRoomUpdateWithWhereUniqueWithoutRoomInput } from '../inputs/ArrangementOfRoomUpdateWithWhereUniqueWithoutRoomInput';
import { ArrangementOfRoomUpsertWithWhereUniqueWithoutRoomInput } from '../inputs/ArrangementOfRoomUpsertWithWhereUniqueWithoutRoomInput';
import { ArrangementOfRoomWhereUniqueInput } from '../inputs/ArrangementOfRoomWhereUniqueInput';

@TypeGraphQL.InputType('ArrangementOfRoomUpdateManyWithoutRoomInput', {
  isAbstract: true,
})
export class ArrangementOfRoomUpdateManyWithoutRoomInput {
  @TypeGraphQL.Field((_type) => [ArrangementOfRoomCreateWithoutRoomInput], {
    nullable: true,
  })
  create?: ArrangementOfRoomCreateWithoutRoomInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ArrangementOfRoomCreateOrConnectWithoutRoomInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | ArrangementOfRoomCreateOrConnectWithoutRoomInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [ArrangementOfRoomUpsertWithWhereUniqueWithoutRoomInput],
    {
      nullable: true,
    }
  )
  upsert?: ArrangementOfRoomUpsertWithWhereUniqueWithoutRoomInput[] | undefined;

  @TypeGraphQL.Field((_type) => ArrangementOfRoomCreateManyRoomInputEnvelope, {
    nullable: true,
  })
  createMany?: ArrangementOfRoomCreateManyRoomInputEnvelope | undefined;

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
    (_type) => [ArrangementOfRoomUpdateWithWhereUniqueWithoutRoomInput],
    {
      nullable: true,
    }
  )
  update?: ArrangementOfRoomUpdateWithWhereUniqueWithoutRoomInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ArrangementOfRoomUpdateManyWithWhereWithoutRoomInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | ArrangementOfRoomUpdateManyWithWhereWithoutRoomInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [ArrangementOfRoomScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: ArrangementOfRoomScalarWhereInput[] | undefined;
}
