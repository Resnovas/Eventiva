import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RoomWhereUniqueInput } from "../../../inputs/RoomWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteRoomArgs {
  @TypeGraphQL.Field(_type => RoomWhereUniqueInput, {
    nullable: false
  })
  where!: RoomWhereUniqueInput;
}
