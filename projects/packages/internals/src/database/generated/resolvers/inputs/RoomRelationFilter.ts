import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomWhereInput } from "../inputs/RoomWhereInput";

@TypeGraphQL.InputType("RoomRelationFilter", {
  isAbstract: true
})
export class RoomRelationFilter {
  @TypeGraphQL.Field(_type => RoomWhereInput, {
    nullable: true
  })
  is?: RoomWhereInput | undefined;

  @TypeGraphQL.Field(_type => RoomWhereInput, {
    nullable: true
  })
  isNot?: RoomWhereInput | undefined;
}
