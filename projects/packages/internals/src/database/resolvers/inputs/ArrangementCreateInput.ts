import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementOfRoomCreateNestedManyWithoutArrangementInput } from "../inputs/ArrangementOfRoomCreateNestedManyWithoutArrangementInput";

@TypeGraphQL.InputType("ArrangementCreateInput", {
  isAbstract: true
})
export class ArrangementCreateInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  id?: string | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field(_type => ArrangementOfRoomCreateNestedManyWithoutArrangementInput, {
    nullable: true
  })
  room?: ArrangementOfRoomCreateNestedManyWithoutArrangementInput | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  icon?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  details?: string | undefined;
}
