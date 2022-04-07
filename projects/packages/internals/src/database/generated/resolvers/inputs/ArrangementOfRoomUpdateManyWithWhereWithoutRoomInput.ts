import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementOfRoomScalarWhereInput } from "../inputs/ArrangementOfRoomScalarWhereInput";
import { ArrangementOfRoomUpdateManyMutationInput } from "../inputs/ArrangementOfRoomUpdateManyMutationInput";

@TypeGraphQL.InputType("ArrangementOfRoomUpdateManyWithWhereWithoutRoomInput", {
  isAbstract: true
})
export class ArrangementOfRoomUpdateManyWithWhereWithoutRoomInput {
  @TypeGraphQL.Field(_type => ArrangementOfRoomScalarWhereInput, {
    nullable: false
  })
  where!: ArrangementOfRoomScalarWhereInput;

  @TypeGraphQL.Field(_type => ArrangementOfRoomUpdateManyMutationInput, {
    nullable: false
  })
  data!: ArrangementOfRoomUpdateManyMutationInput;
}
