import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RoomUpdateManyMutationInput } from "../../../inputs/RoomUpdateManyMutationInput";
import { RoomWhereInput } from "../../../inputs/RoomWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyRoomArgs {
  @TypeGraphQL.Field(_type => RoomUpdateManyMutationInput, {
    nullable: false
  })
  data!: RoomUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => RoomWhereInput, {
    nullable: true
  })
  where?: RoomWhereInput | undefined;
}
