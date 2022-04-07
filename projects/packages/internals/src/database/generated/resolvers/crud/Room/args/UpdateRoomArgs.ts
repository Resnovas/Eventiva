import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RoomUpdateInput } from "../../../inputs/RoomUpdateInput";
import { RoomWhereUniqueInput } from "../../../inputs/RoomWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateRoomArgs {
  @TypeGraphQL.Field(_type => RoomUpdateInput, {
    nullable: false
  })
  data!: RoomUpdateInput;

  @TypeGraphQL.Field(_type => RoomWhereUniqueInput, {
    nullable: false
  })
  where!: RoomWhereUniqueInput;
}
