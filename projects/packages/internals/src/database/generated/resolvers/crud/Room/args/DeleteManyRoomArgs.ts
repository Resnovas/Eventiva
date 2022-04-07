import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RoomWhereInput } from "../../../inputs/RoomWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyRoomArgs {
  @TypeGraphQL.Field(_type => RoomWhereInput, {
    nullable: true
  })
  where?: RoomWhereInput | undefined;
}
