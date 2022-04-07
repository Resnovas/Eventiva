import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RoomCreateInput } from "../../../inputs/RoomCreateInput";
import { RoomUpdateInput } from "../../../inputs/RoomUpdateInput";
import { RoomWhereUniqueInput } from "../../../inputs/RoomWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertRoomArgs {
  @TypeGraphQL.Field(_type => RoomWhereUniqueInput, {
    nullable: false
  })
  where!: RoomWhereUniqueInput;

  @TypeGraphQL.Field(_type => RoomCreateInput, {
    nullable: false
  })
  create!: RoomCreateInput;

  @TypeGraphQL.Field(_type => RoomUpdateInput, {
    nullable: false
  })
  update!: RoomUpdateInput;
}
