import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RoomCreateInput } from "../../../inputs/RoomCreateInput";

@TypeGraphQL.ArgsType()
export class CreateRoomArgs {
  @TypeGraphQL.Field(_type => RoomCreateInput, {
    nullable: false
  })
  data!: RoomCreateInput;
}
